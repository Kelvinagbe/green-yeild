'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ref, onValue } from 'firebase/database';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';

interface UserProfile { name: string; balance: number; }
declare global {
  interface Window {
    PaystackPop: { setup: (o: PaystackOpts) => { openIframe: () => void } };
  }
}
interface PaystackOpts {
  key: string; email: string; amount: number; currency: string; ref: string;
  metadata?: Record<string, unknown>;
  onSuccess: (tx: { reference: string }) => void;
  onCancel: () => void;
}

const QUICK = [5000, 10000, 20000, 50000, 100000];
const PKEY  = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!;

/** Paystack fee: 1.5% + ₦100 flat (capped ₦2000, waived < ₦2500) */
function calcFee(amount: number) {
  if (amount <= 0) return 0;
  if (amount < 2500) return 0;
  return Math.min(Math.round(amount * 0.015 + 100), 2000);
}

export default function PaymentPage() {
  const router = useRouter();
  const [uid, setUid]         = useState<string | null>(null);
  const [email, setEmail]     = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [amount, setAmount]   = useState('');
  const [status, setStatus]   = useState<'idle' | 'processing' | 'success' | 'cancelled'>('idle');
  const [txRef, setTxRef]     = useState<string | null>(null);
  const scriptLoaded = useRef(false);

  useEffect(() => onAuthStateChanged(auth, u => {
    if (u) { setUid(u.uid); setEmail(u.email); }
    else router.replace('/login');
  }), [router]);

  useEffect(() => {
    if (!uid) return;
    return onValue(ref(db, `users/${uid}/profile`), s => { if (s.val()) setProfile(s.val()); });
  }, [uid]);

  useEffect(() => {
    if (scriptLoaded.current) return;
    scriptLoaded.current = true;
    const s = document.createElement('script');
    s.src = 'https://js.paystack.co/v1/inline.js';
    s.async = true;
    document.body.appendChild(s);
    return () => { if (document.body.contains(s)) document.body.removeChild(s); };
  }, []);

  const parsed  = parseFloat(amount) || 0;
  const fee     = calcFee(parsed);
  const total   = parsed + fee;
  const isValid = parsed > 0;

  const openPaystack = () => {
    if (!isValid || !email || !uid) return;
    setStatus('processing');
    const handler = window.PaystackPop.setup({
      key: PKEY, email,
      amount: Math.round(total * 100),
      currency: 'NGN',
      ref: `dep_${uid}_${Date.now()}`,
      metadata: { uid, name: profile?.name ?? '' },
      onSuccess: tx => { setTxRef(tx.reference); setStatus('success'); },
      onCancel:  () => setStatus('cancelled'),
    });
    handler.openIframe();
  };

  const fmt = (n: number) => `₦${n.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;

  return (
    <div className="min-h-screen bg-[#111111] text-white">
      <style>{`
        @keyframes fadeIn   { from{opacity:0}                      to{opacity:1} }
        @keyframes popIn    { from{opacity:0;transform:scale(.85)} to{opacity:1;transform:scale(1)} }
        @keyframes drawRing { from{stroke-dashoffset:251}          to{stroke-dashoffset:0} }
        @keyframes fadeScl  { from{opacity:0;transform:scale(.4)}  to{opacity:1;transform:scale(1)} }
        @keyframes slideUp  { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      {/* ── Success overlay ── */}
      {status === 'success' && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          style={{ animation: 'fadeIn .2s ease both' }}>
          <div className="bg-[#1a1a1a] border border-neutral-800 rounded-2xl p-8 max-w-sm w-full text-center space-y-5"
            style={{ animation: 'popIn .4s cubic-bezier(.34,1.56,.64,1) both' }}>
            {/* Ring + check */}
            <div className="relative w-24 h-24 mx-auto">
              <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
                <circle cx="48" cy="48" r="40" fill="none" stroke="#262626" strokeWidth="5" />
                <circle cx="48" cy="48" r="40" fill="none" stroke="#22c55e" strokeWidth="5"
                  strokeLinecap="round" strokeDasharray="251" strokeDashoffset="251"
                  style={{ animation: 'drawRing .65s ease-out .15s forwards' }} />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center"
                style={{ animation: 'fadeScl .35s ease-out .6s both' }}>
                <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>

            <div style={{ animation: 'fadeIn .3s ease .7s both' }}>
              <h2 className="text-xl font-semibold mb-1">Payment Successful</h2>
              <p className="text-neutral-400 text-sm">
                <span className="text-green-400 font-medium">{fmt(parsed)}</span> deposited
              </p>
            </div>

            {txRef && (
              <div className="bg-[#262626] border border-neutral-800 rounded-xl p-3 text-left"
                style={{ animation: 'fadeIn .3s ease .85s both' }}>
                <p className="text-[10px] text-neutral-600 uppercase tracking-wider mb-1">Reference</p>
                <p className="font-mono text-xs text-neutral-400 break-all">{txRef}</p>
              </div>
            )}

            <p className="text-xs text-neutral-600" style={{ animation: 'fadeIn .3s ease .9s both' }}>
              Balance updates after server confirmation.
            </p>

            <div className="grid grid-cols-2 gap-3" style={{ animation: 'fadeIn .3s ease 1s both' }}>
              <button onClick={() => { setStatus('idle'); setAmount(''); setTxRef(null); }}
                className="h-11 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-xl text-sm font-medium transition-all active:scale-95">
                New Deposit
              </button>
              <Link href="/dashboard"
                className="h-11 bg-green-500 hover:bg-green-600 rounded-xl text-sm font-medium flex items-center justify-center transition-all active:scale-95">
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <div className="border-b border-neutral-800/60 sticky top-0 bg-[#111111]/90 backdrop-blur-xl z-10">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/dashboard"
            className="w-9 h-9 rounded-full bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center transition-all shrink-0">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="font-semibold text-base tracking-tight">Deposit Funds</h1>
        </div>
      </div>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-4"
        style={{ animation: 'slideUp .35s ease both' }}>

        {/* Balance */}
        {profile && (
          <p className="text-sm text-neutral-500">
            Balance: <span className="text-white font-medium">{fmt(profile.balance ?? 0)}</span>
          </p>
        )}

        {/* Amount input */}
        <div className="bg-[#1a1a1a] border border-neutral-800/60 rounded-2xl p-5 space-y-4">
          <p className="text-xs text-neutral-600 uppercase tracking-wider font-medium">Amount</p>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-neutral-500 select-none">₦</span>
            <input
              type="number" inputMode="decimal" value={amount}
              onChange={e => { setAmount(e.target.value); setStatus('idle'); }}
              placeholder="0.00"
              className="w-full h-14 bg-[#111111] border border-neutral-800 focus:border-green-500/60 rounded-xl pl-10 pr-4 text-2xl font-semibold focus:outline-none transition-colors"
            />
          </div>

          {/* Quick amounts */}
          <div className="grid grid-cols-5 gap-2">
            {QUICK.map(q => (
              <button key={q} onClick={() => { setAmount(q.toString()); setStatus('idle'); }}
                className={`h-9 rounded-lg text-xs font-medium border transition-all ${
                  parsed === q
                    ? 'bg-green-500 border-green-500 text-white'
                    : 'bg-[#111111] border-neutral-800 hover:border-neutral-600 text-neutral-400'
                }`}>
                {q >= 1000 ? `${q/1000}K` : q}
              </button>
            ))}
          </div>
        </div>

        {/* Fee breakdown — only show when amount entered */}
        {parsed > 0 && (
          <div className="bg-[#1a1a1a] border border-neutral-800/60 rounded-2xl p-5 space-y-3">
            <p className="text-xs text-neutral-600 uppercase tracking-wider font-medium">Summary</p>
            <div className="space-y-2.5">
              <Row label="Amount" value={fmt(parsed)} />
              <Row
                label={fee === 0 ? 'Paystack fee' : 'Paystack fee (1.5% + ₦100)'}
                value={fee === 0 ? 'Free' : fmt(fee)}
                muted={fee === 0}
              />
              <div className="border-t border-neutral-800 pt-2.5">
                <Row label="You'll be charged" value={fmt(total)} bold />
              </div>
            </div>
            <p className="text-[10px] text-neutral-700">Fee waived for amounts under ₦2,500 · capped at ₦2,000</p>
          </div>
        )}

        {/* Payment method */}
        <div className="bg-[#1a1a1a] border border-neutral-800/60 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#00C3A0]/10 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-[#00C3A0]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Card · Bank Transfer · USSD</p>
            <p className="text-xs text-neutral-600">Secured by Paystack</p>
          </div>
          <svg className="w-4 h-4 text-green-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </div>

        {/* Cancelled notice */}
        {status === 'cancelled' && (
          <div className="bg-yellow-500/8 border border-yellow-500/25 rounded-xl p-3.5 text-sm text-yellow-400">
            Payment cancelled — you can try again.
          </div>
        )}

        {/* CTA */}
        <button onClick={openPaystack} disabled={!isValid || status === 'processing'}
          className="w-full h-13 py-3.5 bg-green-500 hover:bg-green-600 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl font-semibold text-base transition-all active:scale-[0.98] flex items-center justify-center gap-2">
          {status === 'processing' ? (
            <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Opening Paystack…</>
          ) : isValid ? (
            `Pay ${fmt(total)}`
          ) : (
            'Enter an amount'
          )}
        </button>

        <p className="text-center text-xs text-neutral-700">
          Balance updates automatically after server confirmation.
        </p>
      </main>
    </div>
  );
}

function Row({ label, value, muted, bold }: { label: string; value: string; muted?: boolean; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-neutral-500">{label}</span>
      <span className={`text-sm ${bold ? 'font-semibold text-white' : muted ? 'text-neutral-600' : 'text-neutral-300'}`}>
        {value}
      </span>
    </div>
  );
}
