import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId:   process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey:  process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  });
}

const MAX_ATTEMPTS = 3;
const LOCKOUT_MS   = 5 * 60 * 60 * 1000; // 5 hours

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const account_number   = searchParams.get('account_number');
  const bank_code        = searchParams.get('bank_code');
  const uid              = searchParams.get('uid');

  if (!account_number || !bank_code || !uid)
    return NextResponse.json({ error: 'Missing params' }, { status: 400 });

  const db      = getDatabase();
  const lockRef = db.ref(`users/${uid}/resolveAttempts`);
  const snap    = await lockRef.once('value');
  const stored  = snap.val() ?? { count: 0, lockedUntil: 0 };
  const now     = Date.now();

  // ── Active lockout? ────────────────────────────────────────────────────────
  if (stored.lockedUntil && now < stored.lockedUntil) {
    const hrs = Math.ceil((stored.lockedUntil - now) / 3_600_000);
    return NextResponse.json({
      error: `Too many failed attempts. Try again in ${hrs} hour${hrs !== 1 ? 's' : ''}.`,
      locked: true,
      lockedUntil: stored.lockedUntil,
    }, { status: 429 });
  }

  // ── Lock expired — reset ───────────────────────────────────────────────────
  let currentCount = stored.lockedUntil && now >= stored.lockedUntil ? 0 : (stored.count ?? 0);

  // ── Call Paystack ──────────────────────────────────────────────────────────
  try {
    const res  = await fetch(
      `https://api.paystack.co/bank/resolve?account_number=${account_number}&bank_code=${bank_code}`,
      { headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` }, cache: 'no-store' }
    );
    const json = await res.json();

    // ── Success ────────────────────────────────────────────────────────────
    if (json.status && json.data?.account_name) {
      await lockRef.set({ count: 0, lockedUntil: 0 }); // reset on success
      return NextResponse.json({ status: true, data: json.data });
    }

    // ── Failed — increment counter ─────────────────────────────────────────
    const newCount = currentCount + 1;
    const lock     = newCount >= MAX_ATTEMPTS;
    await lockRef.set({ count: newCount, lockedUntil: lock ? now + LOCKOUT_MS : 0 });

    if (lock) {
      return NextResponse.json({
        error: 'Too many failed attempts. Account lookup locked for 5 hours.',
        locked: true,
        lockedUntil: now + LOCKOUT_MS,
        attemptsLeft: 0,
      }, { status: 429 });
    }

    return NextResponse.json({
      error: `Account not found. ${MAX_ATTEMPTS - newCount} attempt${MAX_ATTEMPTS - newCount !== 1 ? 's' : ''} left.`,
      locked: false,
      attemptsLeft: MAX_ATTEMPTS - newCount,
    }, { status: 404 });

  } catch {
    return NextResponse.json({ error: 'Could not reach Paystack. Try again later.' }, { status: 500 });
  }
}
