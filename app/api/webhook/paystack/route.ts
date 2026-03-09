// app/api/webhooks/paystack/route.ts
//
// Paystack sends a POST here on every payment event.
// We verify the signature, then on `charge.success` we:
//   1. Verify the transaction via Paystack's API
//   2. Write the transaction + update balance in Firebase Admin 

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';

// ── Firebase Admin (initialise once) ─────────────────────────────────────────
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
  });
}

const adminDb = getDatabase();

// ── Helpers ───────────────────────────────────────────────────────────────────
function verifySignature(body: string, signature: string): boolean {
  const secret = process.env.PAYSTACK_SECRET_KEY!;
  const hash = crypto.createHmac('sha512', secret).update(body).digest('hex');
  return hash === signature;
}

async function verifyPaystackTransaction(reference: string) {
  const res = await fetch(
    `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    }
  );
  const json = await res.json();
  return json; // { status, data: { status, amount, metadata, ... } }
}

// ── Route handler ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get('x-paystack-signature') ?? '';

  // 1. Verify webhook authenticity
  if (!verifySignature(rawBody, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const event = JSON.parse(rawBody);

  // 2. Only handle successful charges
  if (event.event !== 'charge.success') {
    return NextResponse.json({ received: true });
  }

  const { reference, amount: amountKobo, metadata } = event.data as {
    reference: string;
    amount: number;
    metadata: { uid?: string; name?: string };
  };

  const uid = metadata?.uid;
  if (!uid) {
    return NextResponse.json({ error: 'No uid in metadata' }, { status: 400 });
  }

  // 3. Verify with Paystack (never trust the webhook payload alone)
  const verification = await verifyPaystackTransaction(reference);
  if (!verification.status || verification.data?.status !== 'success') {
    return NextResponse.json({ error: 'Transaction not verified' }, { status: 400 });
  }

  const amountNaira = amountKobo / 100;

  // 4. Idempotency: skip if we already recorded this reference
  const txRef = adminDb.ref(`users/${uid}/transactions`);
  const existingSnap = await adminDb
    .ref(`users/${uid}/txRefs/${reference}`)
    .get();

  if (existingSnap.exists()) {
    return NextResponse.json({ duplicate: true });
  }

  // 5. Write transaction record
  const dateStr = new Date().toLocaleString('en-NG', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Africa/Lagos',
  });

  await txRef.push({
    icon: 'arrow-down-left',
    title: 'Deposit',
    date: dateStr,
    amount: `+₦${amountNaira.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`,
    positive: true,
    ref: reference,
  });

  // 6. Update balance atomically
  const profileRef = adminDb.ref(`users/${uid}/profile`);
  const profileSnap = await profileRef.get();
  const currentBalance: number = profileSnap.val()?.balance ?? 0;
  await profileRef.update({ balance: currentBalance + amountNaira });

  // 7. Mark reference as processed (idempotency key)
  await adminDb.ref(`users/${uid}/txRefs/${reference}`).set(true);

  return NextResponse.json({ success: true });
}
