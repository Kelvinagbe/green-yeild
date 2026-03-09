import { NextRequest, NextResponse } from 'next/server';

const SECRET     = process.env.PAYSTACK_SECRET_KEY!;
const MAX_TRIES  = 3;
const LOCK_MS    = 5 * 60 * 60 * 1000; // 5 hours

// In-memory attempt store per uid (resets on server restart, good enough)
// For production persistence swap with Redis/Upstash KV
const attempts = new Map<string, { count: number; lockedUntil: number }>();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const account_number   = searchParams.get('account_number')?.trim();
  const bank_code        = searchParams.get('bank_code')?.trim();
  const uid              = searchParams.get('uid')?.trim();

  if (!account_number || !bank_code || !uid)
    return NextResponse.json({ error: 'Missing params' }, { status: 400 });

  const now  = Date.now();
  const rec  = attempts.get(uid) ?? { count: 0, lockedUntil: 0 };

  // ── Locked? ────────────────────────────────────────────────────────────────
  if (rec.lockedUntil > now) {
    const hrs = Math.ceil((rec.lockedUntil - now) / 3_600_000);
    return NextResponse.json({
      error: `Locked. Try again in ${hrs} hour${hrs !== 1 ? 's' : ''}.`,
      locked: true, lockedUntil: rec.lockedUntil,
    }, { status: 429 });
  }

  // ── Lock expired — reset ───────────────────────────────────────────────────
  if (rec.lockedUntil > 0 && rec.lockedUntil <= now) {
    attempts.set(uid, { count: 0, lockedUntil: 0 });
    rec.count = 0;
  }

  // ── Validate format ────────────────────────────────────────────────────────
  if (!/^\d{10}$/.test(account_number))
    return NextResponse.json({ error: 'Account number must be exactly 10 digits.' }, { status: 400 });

  // ── Call Paystack ──────────────────────────────────────────────────────────
  let paystackRes: Response;
  try {
    paystackRes = await fetch(
      `https://api.paystack.co/bank/resolve?account_number=${account_number}&bank_code=${bank_code}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${SECRET}`,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (err) {
    console.error('[resolve-account] fetch error:', err);
    return NextResponse.json({ error: 'Network error reaching Paystack. Try again.' }, { status: 502 });
  }

  let json: any;
  try {
    json = await paystackRes.json();
  } catch {
    return NextResponse.json({ error: 'Invalid response from Paystack.' }, { status: 502 });
  }

  console.log('[resolve-account] Paystack status:', paystackRes.status, '| body:', JSON.stringify(json));

  // ── Success ────────────────────────────────────────────────────────────────
  if (json.status === true && json.data?.account_name) {
    attempts.set(uid, { count: 0, lockedUntil: 0 });
    return NextResponse.json({ status: true, data: json.data });
  }

  // ── Paystack rate limited us ───────────────────────────────────────────────
  if (paystackRes.status === 429) {
    return NextResponse.json({ error: 'Too many requests to Paystack. Wait a moment and try again.' }, { status: 429 });
  }

  // ── Account not found — increment user attempt counter ────────────────────
  const newCount = rec.count + 1;
  const lock     = newCount >= MAX_TRIES;
  attempts.set(uid, { count: newCount, lockedUntil: lock ? now + LOCK_MS : 0 });

  if (lock) {
    return NextResponse.json({
      error: 'Too many failed attempts. Locked for 5 hours.',
      locked: true, lockedUntil: now + LOCK_MS, attemptsLeft: 0,
    }, { status: 429 });
  }

  const left = MAX_TRIES - newCount;
  return NextResponse.json({
    error: `Account not found. ${left} attempt${left !== 1 ? 's' : ''} left.`,
    locked: false, attemptsLeft: left,
  }, { status: 404 });
}
