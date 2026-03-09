// app/api/cron/mature-investments/route.ts
//
// Run this daily via a cron job (Vercel Cron, GitHub Actions, etc.)
// It scans all users' active investments, finds any past maturityDate,
// and credits principal + returns back to their balance.
//
// Add to vercel.json:
// {
//   "crons": [{ "path": "/api/cron/mature-investments", "schedule": "0 1 * * *" }]
// }
//
// Secure with a shared secret in the Authorization header.

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
    databaseURL: process.env.FIREBASE_DATABASE_URL,
  });
}

const adminDb = getDatabase();

export async function GET(req: NextRequest) {
  // Simple bearer-token guard
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = Date.now();
  let credited = 0;

  try {
    // Scan all users
    const usersSnap = await adminDb.ref('users').get();
    if (!usersSnap.exists()) return NextResponse.json({ credited });

    const users = usersSnap.val() as Record<string, any>;

    for (const uid of Object.keys(users)) {
      const investments = users[uid]?.investments;
      if (!investments) continue;

      for (const [invId, inv] of Object.entries(investments) as [string, any][]) {
        // Skip already matured
        if (inv.status !== 'active') continue;
        // Skip not yet due
        if (inv.maturityDate > now) continue;

        const payout = inv.principal + inv.expectedReturn;

        // 1. Credit balance
        const balSnap = await adminDb.ref(`users/${uid}/profile/balance`).get();
        const currentBal: number = balSnap.val() ?? 0;
        await adminDb.ref(`users/${uid}/profile/balance`).set(currentBal + payout);

        // 2. Mark investment matured
        await adminDb.ref(`users/${uid}/investments/${invId}/status`).set('matured');

        // 3. Record credit transaction
        const dateStr = new Date(now).toLocaleString('en-NG', {
          dateStyle: 'medium', timeStyle: 'short', timeZone: 'Africa/Lagos',
        });
        await adminDb.ref(`users/${uid}/transactions`).push({
          icon:     'landmark',
          title:    `${inv.planName} — Matured`,
          date:     dateStr,
          amount:   `+₦${payout.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`,
          positive: true,
        });

        credited++;
      }
    }

    return NextResponse.json({ ok: true, credited });
  } catch (err: any) {
    console.error('Maturity cron error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
