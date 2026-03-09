'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { ref, onValue, set, push } from 'firebase/database';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';

interface UserProfile {
  name: string; plan: string; balance: number; growth: number;
  streak: number; checkedDays: number[]; lastClaimedDate?: string;
}
interface Tx { id: string; icon: string; title: string; date: string; amount: string; positive: boolean; }

const SK = ({ className = '' }: { className?: string }) => (
  <div className={`animate-pulse rounded-lg bg-white/[0.06] ${className}`} />
);
const reward = (day: number) => day * 100;
const today  = () => new Date().toISOString().slice(0, 10);

// ── Success portal ─────────────────────────────────────────────────────────────
function SuccessPortal({ day, amount, onClose }: { day: number; amount: number; onClose: () => void }) {
  const [ok, setOk] = useState(false);
  useEffect(() => { setOk(true); }, []);
  if (!ok) return null;
  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-lg"
      style={{ animation: 'fd .2s ease-out both' }}
      onClick={onClose}
    >
      <div
        className="bg-[#1e1e1e] border border-neutral-800 rounded-2xl p-8 max-w-sm w-full text-center space-y-4"
        style={{ animation: 'pop .4s cubic-bezier(.34,1.56,.64,1) both' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="relative w-24 h-24 mx-auto">
          <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
            <circle cx="48" cy="48" r="40" fill="none" stroke="#262626" strokeWidth="5" />
            <circle cx="48" cy="48" r="40" fill="none" stroke="#22c55e" strokeWidth="5"
              strokeLinecap="round" strokeDasharray="251" strokeDashoffset="251"
              style={{ animation: 'ring .65s ease-out .1s forwards' }} />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center" style={{ animation: 'ck .3s ease-out .65s both' }}>
            <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        <div style={{ animation: 'fd .3s ease-out .7s both' }}>
          <p className="text-xl font-semibold">Day {day} Claimed! 🎉</p>
          <p className="text-sm text-neutral-400 mt-1">You earned</p>
          <p className="text-4xl font-bold text-green-400 mt-1">+₦{amount.toLocaleString()}</p>
        </div>
        <p className="text-xs text-neutral-600" style={{ animation: 'fd .3s ease-out .85s both' }}>
          Credited to your wallet instantly
        </p>
        <button
          onClick={onClose}
          className="w-full h-11 bg-green-500 hover:bg-green-600 rounded-xl font-medium transition-all active:scale-95"
          style={{ animation: 'fd .3s ease-out .95s both' }}
        >
          Awesome!
        </button>
      </div>
    </div>,
    document.body
  );
}

// ── Dashboard ──────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [uid, setUid]         = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [txs, setTxs]         = useState<Tx[] | null>(null);
  const [loadP, setLoadP]     = useState(true);
  const [loadT, setLoadT]     = useState(true);
  const [showModal, setShowModal]   = useState(false);
  const [claiming, setClaiming]     = useState(false);
  const [success, setSuccess]       = useState<{ day: number; amount: number } | null>(null);

  useEffect(() => onAuthStateChanged(auth, u => { if (u) setUid(u.uid); }), []);

  useEffect(() => {
    if (!uid) return;
    const pRef = ref(db, `users/${uid}/profile`);
    const u1 = onValue(pRef, snap => {
      const d = snap.val();
      if (d) {
        setProfile({ ...d, checkedDays: Array.isArray(d.checkedDays) ? d.checkedDays : [] });
      } else {
        const def: UserProfile = {
          name: auth.currentUser?.displayName ?? 'User',
          plan: 'Premium Member', balance: 0, growth: 0,
          streak: 0, checkedDays: [], lastClaimedDate: '',
        };
        set(pRef, def);
        setProfile(def);
      }
      setLoadP(false);
    });
    const u2 = onValue(ref(db, `users/${uid}/transactions`), snap => {
      const d = snap.val();
      setTxs(d
        ? (Object.entries(d).map(([id, v]: any) => ({ id, ...v })) as Tx[]).reverse().slice(0, 5)
        : []);
      setLoadT(false);
    });
    return () => { u1(); u2(); };
  }, [uid]);

  const checkedDays  = profile?.checkedDays ?? [];
  const nextDay      = checkedDays.length + 1;
  const weekDone     = checkedDays.length >= 7;
  const claimedToday = profile?.lastClaimedDate === today();
  const canClaim     = !weekDone && !claimedToday;

  const handleClaim = async () => {
    if (!uid || !profile || claiming || !canClaim) return;
    setClaiming(true);
    try {
      const r = reward(nextDay);
      const updated: UserProfile = {
        ...profile,
        checkedDays: [...checkedDays, nextDay],
        streak: nextDay,
        balance: (profile.balance ?? 0) + r,
        lastClaimedDate: today(),
      };
      await set(ref(db, `users/${uid}/profile`), updated);
      await push(ref(db, `users/${uid}/transactions`), {
        icon: 'gift',
        title: `Day ${nextDay} Check-in Reward`,
        date: new Date().toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' }),
        amount: `+₦${r.toLocaleString()}`,
        positive: true,
      });
      setShowModal(false);
      setSuccess({ day: nextDay, amount: r });
    } catch (e) {
      console.error('Check-in failed:', e);
    } finally {
      setClaiming(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1c1c1c] text-white">
      <style>{`
        @keyframes fd   { from{opacity:0}                              to{opacity:1} }
        @keyframes pop  { from{opacity:0;transform:scale(.85)}         to{opacity:1;transform:scale(1)} }
        @keyframes ring { from{stroke-dashoffset:251}                  to{stroke-dashoffset:0} }
        @keyframes ck   { from{opacity:0;transform:scale(.4)}          to{opacity:1;transform:scale(1)} }
        @keyframes up   { from{opacity:0;transform:translateY(18px) scale(.96)} to{opacity:1;transform:translateY(0) scale(1)} }
      `}</style>

      {success && <SuccessPortal day={success.day} amount={success.amount} onClose={() => setSuccess(null)} />}

      {/* Check-in modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          style={{ animation: 'fd .2s ease-out' }}
          onClick={() => !claiming && setShowModal(false)}
        >
          <div
            className="bg-[#1e1e1e] border border-neutral-800 rounded-2xl p-6 max-w-md w-full"
            style={{ animation: 'up .3s ease-out' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="text-center mb-5">
              <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 12v10H4V12M22 7H2v5h20V7zM12 22V7M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold">Daily Check-in</h2>
              <p className="text-sm text-neutral-500 mt-1">Check in each day to earn rewards</p>
            </div>

            <div className="grid grid-cols-7 gap-1.5 mb-5">
              {[1,2,3,4,5,6,7].map(d => {
                const done = checkedDays.includes(d);
                const cur  = d === nextDay && !weekDone;
                return (
                  <div key={d} className={`aspect-square rounded-xl flex flex-col items-center justify-center border text-center transition-all
                    ${done ? 'bg-green-500 border-green-500 text-white'
                      : cur  ? 'border-green-500/40 bg-green-500/5 text-green-400'
                             : 'border-neutral-800 bg-[#262626] text-neutral-600'}`}>
                    <span className="text-[9px] opacity-60">Day</span>
                    <span className="text-sm font-bold leading-none">{d}</span>
                    <span className="text-[8px] mt-0.5 opacity-60">₦{d * 100}</span>
                  </div>
                );
              })}
            </div>

            <div className="bg-[#262626] border border-neutral-800 rounded-xl p-4 mb-5 flex justify-between items-center">
              <div>
                <p className="text-xs text-neutral-500 mb-0.5">Streak</p>
                <p className="text-xl font-bold text-green-400">
                  {checkedDays.length}<span className="text-sm font-normal text-neutral-500"> days</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-neutral-500 mb-0.5">Today's reward</p>
                <p className="text-xl font-bold text-green-400">₦{weekDone ? 0 : reward(nextDay)}</p>
              </div>
            </div>

            {weekDone ? (
              <div className="text-center space-y-3">
                <p className="text-sm text-green-400 font-medium">🎉 Week Complete! See you next week.</p>
                <button onClick={() => setShowModal(false)}
                  className="w-full h-11 bg-[#262626] hover:bg-[#2e2e2e] border border-neutral-700 rounded-xl text-sm font-medium transition-all">
                  Close
                </button>
              </div>
            ) : claimedToday ? (
              <div className="text-center space-y-3">
                <p className="text-sm text-neutral-500">✓ Already claimed today. Come back tomorrow!</p>
                <button onClick={() => setShowModal(false)}
                  className="w-full h-11 bg-[#262626] hover:bg-[#2e2e2e] border border-neutral-700 rounded-xl text-sm font-medium transition-all">
                  Close
                </button>
              </div>
            ) : (
              <button onClick={handleClaim} disabled={claiming}
                className="w-full h-12 bg-green-500 hover:bg-green-600 rounded-xl font-semibold transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50">
                {claiming ? (
                  <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Claiming…</>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Claim Day {nextDay} · ₦{reward(nextDay).toLocaleString()}
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">

        {/* Name */}
        {loadP
          ? <div className="space-y-2"><SK className="h-8 w-48" /><SK className="h-4 w-28" /></div>
          : <div>
              <h1 className="text-2xl sm:text-3xl font-medium">{profile?.name}</h1>
              <p className="text-sm text-neutral-400 mt-0.5">{profile?.plan}</p>
            </div>
        }

        {/* Balance card */}
        <div className="relative">
          <div className="absolute -inset-[2px] bg-gradient-to-br from-green-500 to-green-600 rounded-2xl sm:rounded-3xl" />
          <div className="relative bg-[#1c1c1c] rounded-2xl sm:rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="space-y-2">
              <p className="text-sm text-neutral-400">Total Balance</p>
              {loadP ? (
                <><SK className="h-12 w-56" /><SK className="h-4 w-32" /></>
              ) : (
                <>
                  <p className="text-4xl sm:text-5xl font-semibold tracking-tight">
                    ₦{(profile?.balance ?? 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                  </p>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="flex items-center gap-1 text-green-500 font-medium">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                      +{profile?.growth ?? 0}%
                    </span>
                    <span className="text-neutral-500">this month</span>
                  </div>
                </>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/payment"
                className="h-12 bg-green-500 hover:bg-green-600 rounded-xl font-medium transition-all active:scale-95 flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
                Deposit
              </Link>
              <Link href="/withdraw"
                className="h-12 bg-[#2a2a2a] hover:bg-[#333] rounded-xl font-medium transition-all active:scale-95 flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                </svg>
                Withdraw
              </Link>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-3 gap-3">
          {([
            { label: 'Profile',  sub: 'Manage account',     href: '/profile',  path: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
            { label: 'Plans',    sub: 'View subscriptions',  href: '/plans',    path: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
            { label: 'Withdraw', sub: 'Cash out funds',      href: '/withdraw', path: 'M5 15l7-7 7 7' },
          ] as const).map(a => (
            <Link key={a.href} href={a.href}
              className="bg-[#262626] border border-neutral-800 hover:border-neutral-700 hover:bg-[#2a2a2a] rounded-xl p-4 transition-all active:scale-95 text-center">
              <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center mb-3 mx-auto">
                <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={a.path} />
                </svg>
              </div>
              <p className="text-sm font-medium mb-0.5">{a.label}</p>
              <p className="text-xs text-neutral-500">{a.sub}</p>
            </Link>
          ))}
        </div>

        {/* Invest */}
        <Link href="/plans"
          className="w-full h-14 bg-[#262626] hover:bg-[#2a2a2a] border border-neutral-800 hover:border-neutral-700 rounded-xl font-medium transition-all active:scale-[0.98] flex items-center justify-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          Start Investing
        </Link>

        {/* Check-in card */}
        <div className="bg-[#262626] border border-neutral-800 rounded-xl sm:rounded-2xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-medium">Daily Check-in</h3>
              <p className="text-sm text-neutral-500 mt-0.5">
                {loadP ? '' : weekDone ? 'Week complete 🎉' : claimedToday ? 'Come back tomorrow!' : `Earn ₦${reward(nextDay).toLocaleString()} today`}
              </p>
            </div>
            <div className="w-11 h-11 rounded-full bg-green-500/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 12v10H4V12M22 7H2v5h20V7zM12 22V7M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z" />
              </svg>
            </div>
          </div>
          {loadP
            ? <div className="flex gap-2 mb-4">{[0,1,2,3,4,5,6].map(i => <SK key={i} className="flex-1 h-2" />)}</div>
            : <div className="flex gap-1.5 mb-4">
                {[1,2,3,4,5,6,7].map(d => (
                  <div key={d} className={`flex-1 h-2 rounded-full transition-all
                    ${checkedDays.includes(d) ? 'bg-green-500'
                      : d === nextDay && !weekDone ? 'bg-green-500/20'
                      : 'bg-neutral-800'}`} />
                ))}
              </div>
          }
          <button
            onClick={() => setShowModal(true)}
            disabled={loadP || weekDone || claimedToday}
            className="w-full h-11 bg-green-500 hover:bg-green-600 disabled:bg-neutral-700 disabled:text-neutral-500 disabled:cursor-not-allowed rounded-lg text-sm font-semibold transition-all active:scale-95"
          >
            {loadP ? '…' : weekDone ? '🎉 Week Complete!' : claimedToday ? '✓ Claimed Today' : `Claim Day ${nextDay} · ₦${reward(nextDay).toLocaleString()}`}
          </button>
        </div>

      {/* Recent Transactions */}
        <div className="bg-[#262626] border border-neutral-800 rounded-xl sm:rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-800 flex items-center justify-between">
            <h3 className="font-medium text-sm">Recent Transactions</h3>
            <Link href="/transactions" className="text-xs text-neutral-500 hover:text-white transition-colors">
              See all
            </Link>
          </div>

          {loadT ? (
            <div className="divide-y divide-neutral-800">
              {[0,1,2,3].map(i => (
                <div key={i} className="px-5 py-4 flex items-center gap-4">
                  <SK className="w-9 h-9 rounded-full shrink-0" />
                  <div className="flex-1 space-y-2"><SK className="h-3.5 w-32" /><SK className="h-3 w-20" /></div>
                  <SK className="h-3.5 w-14" />
                </div>
              ))}
            </div>
          ) : txs && txs.length > 0 ? (
            <div className="divide-y divide-neutral-800/60">
              {txs.map(tx => (
                <Link
                  key={tx.id}
                  href={`/transactions?id=${tx.id}`}
                  className="px-5 py-4 flex items-center gap-4 hover:bg-white/[0.03] active:bg-white/[0.05] transition-colors"
                >
                  {/* Direction icon */}
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0
                    ${tx.positive ? 'bg-green-500/10' : 'bg-neutral-800'}`}>
                    <svg className={`w-3.5 h-3.5 ${tx.positive ? 'text-green-400' : 'text-neutral-400'}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      {tx.positive
                        ? <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        : <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />}
                    </svg>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{tx.title}</p>
                    <p className="text-xs text-neutral-600 mt-0.5">{tx.date}</p>
                  </div>

                  {/* Amount + chevron */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-sm font-semibold tabular-nums
                      ${tx.positive ? 'text-green-400' : 'text-white'}`}>
                      {tx.positive && !tx.amount.startsWith('+') ? '+' : ''}{tx.amount}
                    </span>
                    <svg className="w-3 h-3 text-neutral-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center">
              <p className="text-sm text-neutral-600">No transactions yet</p>
            </div>
          )}

          <Link
            href="/transactions"
            className="flex items-center justify-center gap-1.5 w-full py-3.5 text-xs text-neutral-600 hover:text-neutral-400 border-t border-neutral-800/60 transition-colors"
          >
            View all transactions
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div className="h-8" />
      </main>
    </div>
  );
}