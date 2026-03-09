'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ref, onValue } from 'firebase/database';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';

interface UserProfile {
  name: string;
  balance: number;
}

declare global {
  interface Window {
    PaystackPop: {
      setup: (opts: PaystackSetupOptions) => { openIframe: () => void };
    };
  }
}

interface PaystackSetupOptions {
  key: string;
  email: string;
  amount: number;
  currency: string;
  ref: string;
  metadata?: Record<string, unknown>;
  onSuccess: (tx: { reference: string }) => void;
  onCancel: () => void;
}

const QUICK_AMOUNTS = [5000, 10000, 20000, 50000, 100000];
const PAYSTACK_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!;

export default function PaymentPage() {
  const router = useRouter();

  const [uid, setUid] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'cancelled'>('idle');
  const [successRef, setSuccessRef] = useState<string | null>(null);

  const scriptLoaded = useRef(false);

  // ── Auth ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      if (user) {
        setUid(user.uid);
        setEmail(user.email);
      } else {
        router.replace('/login');
      }
    });
  }, [router]);

  // ── Profile ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!uid) return;
    return onValue(ref(db, `users/${uid}/profile`), (snap) => {
      if (snap.val()) setProfile(snap.val());
    });
  }, [uid]);

  // ── Load Paystack inline script once ─────────────────────────────────────
  useEffect(() => {
    if (scriptLoaded.current) return;
    scriptLoaded.current = true;
    const s = document.createElement('script');
    s.src = 'https://js.paystack.co/v1/inline.js';
    s.async = true;
    document.body.appendChild(s);
    return () => {
      if (document.body.contains(s)) document.body.removeChild(s);
    };
  }, []);

  // ── Open Paystack popup ───────────────────────────────────────────────────
  const openPaystack = () => {
    const parsed = parseFloat(amount);
    if (!parsed || parsed <= 0 || !email || !uid) return;

    setStatus('processing');

    const reference = `dep_${uid}_${Date.now()}`;

    const handler = window.PaystackPop.setup({
      key: PAYSTACK_KEY,
      email,
      amount: Math.round(parsed * 100), // naira → kobo
      currency: 'NGN',
      ref: reference,
      metadata: { uid, name: profile?.name ?? '' },
      onSuccess: (tx) => {
        // Webhook on the backend verifies + writes balance/transaction to Firebase.
        // We just show the success screen here.
        setSuccessRef(tx.reference);
        setStatus('success');
      },
      onCancel: () => setStatus('cancelled'),
    });

    handler.openIframe();
  };

  const parsedAmount = parseFloat(amount);
  const isValid = !isNaN(parsedAmount) && parsedAmount > 0;

  // ── Success screen ────────────────────────────────────────────────────────
  if (status === 'success') {
    return (
      <div className="min-h-screen bg-[#1c1c1c] text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-20 h-20 bg-green-500/15 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-semibold mb-2">Payment Received</h1>
            <p className="text-neutral-400 text-sm">
              Your deposit of{' '}
              <span className="text-white font-medium">
                ₦{parsedAmount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
              </span>{' '}
              is being confirmed.
            </p>
          </div>
          {successRef && (
            <div className="bg-[#262626] border border-neutral-700 rounded-xl p-4 text-left">
              <div className="text-xs text-neutral-500 mb-1">Reference</div>
              <div className="font-mono text-sm text-neutral-300 break-all">{successRef}</div>
            </div>
          )}
          <p className="text-xs text-neutral-500">
            Your balance will update automatically once our server confirms the payment.
          </p>
          <Link
            href="/dashboard"
            className="block w-full h-12 bg-green-500 hover:bg-green-600 rounded-xl font-medium transition-all active:scale-95 text-center leading-[3rem]"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // ── Main ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#1c1c1c] text-white">
      <style jsx>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .slide-up { animation: slideUp 0.35s ease-out both; }
      `}</style>

      {/* Header */}
      <div className="border-b border-neutral-800">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-3">
          <Link
            href="/dashboard"
            className="w-9 h-9 rounded-full bg-[#262626] hover:bg-[#2e2e2e] flex items-center justify-center transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="font-medium">Deposit Funds</h1>
        </div>
      </div>

      <main className="max-w-lg mx-auto px-4 py-8 space-y-6 slide-up">

        {/* Balance pill */}
        {profile && (
          <div className="flex items-center gap-2 text-sm text-neutral-400">
            <span>Current balance:</span>
            <span className="text-white font-medium">
              ₦{(profile.balance ?? 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
            </span>
          </div>
        )}

        {/* Amount input */}
        <div className="bg-[#262626] border border-neutral-700 rounded-2xl p-6 space-y-4">
          <label className="text-sm text-neutral-400 block">Enter amount</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl text-neutral-400 select-none">₦</span>
            <input
              type="number"
              inputMode="decimal"
              value={amount}
              onChange={(e) => { setAmount(e.target.value); setStatus('idle'); }}
              placeholder="0.00"
              className="w-full h-16 bg-[#1c1c1c] border border-neutral-700 focus:border-green-500 rounded-xl pl-12 pr-4 text-2xl font-semibold focus:outline-none transition-colors"
            />
          </div>

          {/* Quick amounts */}
          <div className="grid grid-cols-5 gap-2">
            {QUICK_AMOUNTS.map((q) => (
              <button
                key={q}
                onClick={() => { setAmount(q.toString()); setStatus('idle'); }}
                className={`h-10 rounded-lg text-sm font-medium border transition-all ${
                  parsedAmount === q
                    ? 'bg-green-500 border-green-500 text-white'
                    : 'bg-[#1c1c1c] border-neutral-700 hover:border-green-500 text-neutral-300'
                }`}
              >
                ₦{q >= 1000 ? `${q / 1000}K` : q}
              </button>
            ))}
          </div>
        </div>

        {/* Payment method badge */}
        <div className="bg-[#262626] border border-neutral-700 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-[#00C3A0]/10 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-[#00C3A0]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium">Card / Bank Transfer / USSD</div>
            <div className="text-xs text-neutral-500">Secured by Paystack</div>
          </div>
          <svg className="w-4 h-4 text-green-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </div>

        {/* Cancelled notice */}
        {status === 'cancelled' && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 text-sm text-yellow-400">
            Payment was cancelled. You can try again.
          </div>
        )}

        {/* Pay button */}
        <button
          onClick={openPaystack}
          disabled={!isValid || status === 'processing'}
          className="w-full h-14 bg-green-500 hover:bg-green-600 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl font-semibold text-base transition-all active:scale-[0.98] flex items-center justify-center gap-2"
        >
          {status === 'processing' ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Opening Paystack…
            </>
          ) : (
            `Pay${isValid ? ` ₦${parsedAmount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}` : ''}`
          )}
        </button>

        <p className="text-center text-xs text-neutral-600">
          Balance updates automatically after server confirmation.
        </p>
      </main>
    </div>
  );
}
