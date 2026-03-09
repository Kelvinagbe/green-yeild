'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ref, onValue, set, push } from 'firebase/database';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';

interface UserProfile { name: string; plan: string; balance: number; growth: number; streak: number; checkedDays: number[]; }
interface Transaction { id: string; icon: string; title: string; date: string; amount: string; positive: boolean; }

const SK = ({ className = '' }: { className?: string }) => <div className={`animate-pulse rounded-lg bg-white/[0.06] ${className}`} />;
const DAY_REWARD = (day: number) => day * 100; // ₦100 × day number

export default function Dashboard() {
  const [uid, setUid]         = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [txs, setTxs]         = useState<Transaction[] | null>(null);
  const [loadingP, setLoadingP] = useState(true);
  const [loadingT, setLoadingT] = useState(true);
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [checking, setChecking]       = useState(false);
  const [checkSuccess, setCheckSuccess] = useState<number | null>(null); // reward amount

  useEffect(() => onAuthStateChanged(auth, u => { if (u) setUid(u.uid); }), []);

  useEffect(() => {
    if (!uid) return;
    const pRef = ref(db, `users/${uid}/profile`);
    return onValue(pRef, snap => {
      const d = snap.val();
      if (d) { setProfile(d); }
      else {
        const def: UserProfile = { name: auth.currentUser?.displayName ?? 'User', plan: 'Premium Member', balance: 0, growth: 0, streak: 0, checkedDays: [] };
        set(pRef, def); setProfile(def);
      }
      setLoadingP(false);
    });
  }, [uid]);

  useEffect(() => {
    if (!uid) return;
    return onValue(ref(db, `users/${uid}/transactions`), snap => {
      const d = snap.val();
      setTxs(d ? (Object.entries(d).map(([id, v]: any) => ({ id, ...v })) as Transaction[]).reverse().slice(0, 5) : []);
      setLoadingT(false);
    });
  }, [uid]);

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).lucide) (window as any).lucide.createIcons();
  }, [showCheckIn, txs, profile, checkSuccess]);

  const checkedDays = profile?.checkedDays ?? [];
  const nextDay = checkedDays.length + 1;
  const alreadyChecked = checkedDays.includes(nextDay) || nextDay > 7;

  const handleCheckIn = async () => {
    if (!uid || !profile || checking || alreadyChecked) return;
    setChecking(true);

    const reward = DAY_REWARD(nextDay);
    const updated: UserProfile = {
      ...profile,
      checkedDays: [...checkedDays, nextDay],
      streak: nextDay,
      balance: profile.balance + reward,
    };

    await set(ref(db, `users/${uid}/profile`), updated);
    await push(ref(db, `users/${uid}/transactions`), {
      icon: 'gift',
      title: `Day ${nextDay} Check-in Reward`,
      date: new Date().toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' }),
      amount: `+₦${reward.toLocaleString()}`,
      positive: true,
    });

    setChecking(false);
    setCheckSuccess(reward);
  };

  return (
    <div className="min-h-screen bg-[#1c1c1c] text-white">
      <style>{`
        @keyframes slideUp { from { opacity:0; transform:translateY(20px) scale(0.95) } to { opacity:1; transform:translateY(0) scale(1) } }
        @keyframes drawRing { from { stroke-dashoffset:163 } to { stroke-dashoffset:0 } }
        @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes checkIn { from { opacity:0; transform:scale(0.3) } to { opacity:1; transform:scale(1) } }
      `}</style>

      {/* ── Check-in Success Modal ── */}
      {checkSuccess !== null && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" style={{ animation: 'fadeIn .2s ease-out' }} onClick={() => { setCheckSuccess(null); setShowCheckIn(false); }}>
          <div className="bg-[#1e1e1e] border border-neutral-800 rounded-2xl p-8 max-w-sm w-full text-center space-y-4" style={{ animation: 'slideUp .35s ease-out' }} onClick={e => e.stopPropagation()}>
            <div className="relative w-20 h-20 mx-auto">
              <svg className="w-20 h-20 -rotate-90" viewBox="0 0 60 60">
                <circle cx="30" cy="30" r="26" fill="none" stroke="#262626" strokeWidth="4" />
                <circle cx="30" cy="30" r="26" fill="none" stroke="#22c55e" strokeWidth="4" strokeLinecap="round" strokeDasharray="163" strokeDashoffset="163" style={{ animation: 'drawRing .6s ease-out .1s forwards' }} />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center" style={{ animation: 'checkIn .3s ease-out .6s both' }}>
                <svg className="w-9 h-9 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              </div>
            </div>
            <div>
              <p className="text-lg font-semibold">Day {nextDay - 1} Claimed!</p>
              <p className="text-sm text-neutral-400 mt-1">You earned <span className="text-green-400 font-semibold">+₦{checkSuccess.toLocaleString()}</span> today</p>
            </div>
            <p className="text-xs text-neutral-600">Credited to your wallet instantly</p>
            <button onClick={() => { setCheckSuccess(null); setShowCheckIn(false); }} className="w-full h-11 bg-[#2a2a2a] hover:bg-[#333] rounded-xl text-sm font-medium transition-all">Done</button>
          </div>
        </div>
      )}

      {/* ── Check-in Modal ── */}
      {showCheckIn && checkSuccess === null && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => !checking && setShowCheckIn(false)}>
          <div className="bg-[#2a2a2a] border border-neutral-700 rounded-2xl p-6 max-w-md w-full" style={{ animation: 'slideUp 0.3s ease-out' }} onClick={e => e.stopPropagation()}>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <i data-lucide="calendar-check" className="w-8 h-8 text-green-500" />
              </div>
              <h2 className="text-2xl font-semibold mb-1">Daily Check-in</h2>
              <p className="text-neutral-400 text-sm">Keep your streak going!</p>
            </div>

            {/* Day grid */}
            <div className="grid grid-cols-7 gap-2 mb-6">
              {[1,2,3,4,5,6,7].map(day => (
                <div key={day} className={`aspect-square rounded-lg flex flex-col items-center justify-center transition-all ${checkedDays.includes(day) ? 'bg-green-500 text-white' : 'bg-[#3a3a3a] text-neutral-400'}`}>
                  <div className="text-[10px] opacity-60">Day</div>
                  <div className="text-base font-semibold">{day}</div>
                  <div className="text-[9px] opacity-70">₦{(day * 100).toLocaleString()}</div>
                </div>
              ))}
            </div>

            {/* Streak */}
            <div className="bg-[#333] rounded-xl p-4 mb-6 flex items-center justify-between">
              <div>
                <div className="text-sm text-neutral-400">Current Streak</div>
                <div className="text-2xl font-semibold text-green-500">{checkedDays.length} days</div>
              </div>
              <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center">
                <i data-lucide="flame" className="w-6 h-6 text-green-500" />
              </div>
            </div>

            {nextDay > 7 ? (
              <div className="text-center">
                <div className="text-green-500 font-medium mb-2">🎉 Week Complete!</div>
                <button onClick={() => setShowCheckIn(false)} className="w-full h-12 bg-[#333] hover:bg-[#3a3a3a] rounded-xl font-medium transition-all">Close</button>
              </div>
            ) : (
              <button onClick={handleCheckIn} disabled={checking || alreadyChecked} className="w-full h-12 bg-green-500 hover:bg-green-600 rounded-xl font-medium transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50">
                {checking
                  ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Claiming...</>
                  : alreadyChecked
                  ? 'Already claimed today'
                  : <><i data-lucide="check-circle" className="w-5 h-5" />Claim ₦{DAY_REWARD(nextDay).toLocaleString()} • Day {nextDay}</>
                }
              </button>
            )}
          </div>
        </div>
      )}

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">

        {/* Name */}
        {loadingP
          ? <div className="space-y-2"><SK className="h-8 w-48" /><SK className="h-4 w-28" /></div>
          : <div className="space-y-1"><h1 className="text-2xl sm:text-3xl font-medium">{profile?.name}</h1><p className="text-sm text-neutral-400">{profile?.plan}</p></div>
        }

        {/* Balance Card */}
        <div className="relative">
          <div className="absolute -inset-[2px] bg-gradient-to-br from-green-500 to-green-600 rounded-2xl sm:rounded-3xl" />
          <div className="relative bg-[#1c1c1c] rounded-2xl sm:rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="space-y-2">
              <div className="text-sm text-neutral-400">Total Balance</div>
              {loadingP ? <><SK className="h-12 w-56" /><SK className="h-4 w-32" /></> : (
                <>
                  <div className="text-4xl sm:text-5xl font-semibold tracking-tight">₦{(profile?.balance ?? 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}</div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="flex items-center gap-1 text-green-500"><i data-lucide="trending-up" className="w-4 h-4" /><span className="font-medium">+{profile?.growth ?? 0}%</span></div>
                    <span className="text-neutral-500">this month</span>
                  </div>
                </>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/payment" className="h-12 bg-green-500 hover:bg-green-600 rounded-xl font-medium transition-all active:scale-95 flex items-center justify-center gap-2">
                <i data-lucide="arrow-down-left" className="w-4 h-4" />Deposit
              </Link>
              <Link href="/withdraw" className="h-12 bg-[#2a2a2a] hover:bg-[#333] rounded-xl font-medium transition-all active:scale-95 flex items-center justify-center gap-2">
                <i data-lucide="arrow-up-right" className="w-4 h-4" />Withdraw
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: 'user',           title: 'Profile',  subtitle: 'Manage account',    href: '/profile'  },
            { icon: 'credit-card',    title: 'Plans',    subtitle: 'View subscriptions', href: '/plans'    },
            { icon: 'arrow-up-right', title: 'Withdraw', subtitle: 'Cash out funds',     href: '/withdraw' },
          ].map((a, i) => (
            <Link key={i} href={a.href} className="bg-[#262626] border border-neutral-700 hover:border-neutral-600 hover:bg-[#2a2a2a] rounded-xl p-4 transition-all active:scale-95 text-center">
              <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center mb-3 mx-auto"><i data-lucide={a.icon} className="w-5 h-5 text-green-500" /></div>
              <div className="text-sm font-medium mb-1">{a.title}</div>
              <div className="text-xs text-neutral-400">{a.subtitle}</div>
            </Link>
          ))}
        </div>

        {/* Invest */}
        <Link href="/plans" className="w-full h-14 bg-[#262626] hover:bg-[#2a2a2a] border border-neutral-700 hover:border-neutral-600 rounded-xl font-medium transition-all active:scale-[0.98] flex items-center justify-center gap-2">
          <i data-lucide="trending-up" className="w-5 h-5" />Start Investing
        </Link>

        {/* Daily Check-in */}
        <div className="bg-[#262626] border border-neutral-700 rounded-xl sm:rounded-2xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div><h3 className="font-medium mb-1">Daily Check-in</h3><p className="text-sm text-neutral-400">Earn ₦{DAY_REWARD(nextDay > 7 ? 7 : nextDay).toLocaleString()} today</p></div>
            <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center"><i data-lucide="gift" className="w-6 h-6 text-green-500" /></div>
          </div>

          {loadingP
            ? <div className="flex gap-2 mb-4">{[0,1,2,3,4,5,6].map(i => <SK key={i} className="flex-1 h-2" />)}</div>
            : <div className="flex gap-2 mb-4">{[1,2,3,4,5,6,7].map(d => <div key={d} className={`flex-1 h-2 rounded-full transition-all ${checkedDays.includes(d) ? 'bg-green-500' : 'bg-[#3a3a3a]'}`} />)}</div>
          }

          <button onClick={() => setShowCheckIn(true)} disabled={alreadyChecked && checkSuccess === null} className="w-full h-11 bg-green-500 hover:bg-green-600 rounded-lg font-medium transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
            {alreadyChecked ? 'All Days Claimed 🎉' : `Claim ₦${DAY_REWARD(nextDay).toLocaleString()} • Day ${nextDay}`}
          </button>
        </div>

        {/* Transactions */}
        <div className="bg-[#262626] border border-neutral-700 rounded-xl sm:rounded-2xl overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-neutral-700"><h3 className="font-medium">Recent Transactions</h3></div>

          {loadingT ? (
            <div className="divide-y divide-neutral-700">
              {[0,1,2,3].map(i => (
                <div key={i} className="p-4 sm:px-6 sm:py-4 flex items-center gap-4">
                  <SK className="w-10 h-10 rounded-full shrink-0" />
                  <div className="flex-1 space-y-2"><SK className="h-4 w-32" /><SK className="h-3 w-24" /></div>
                  <SK className="h-4 w-16" />
                </div>
              ))}
            </div>
          ) : txs && txs.length > 0 ? (
            <div className="divide-y divide-neutral-700">
              {txs.map(tx => (
                <div key={tx.id} className="p-4 sm:px-6 sm:py-4 flex items-center gap-4 hover:bg-[#2a2a2a] transition-colors">
                  <div className="w-10 h-10 rounded-full bg-[#2a2a2a] flex items-center justify-center flex-shrink-0"><i data-lucide={tx.icon} className="w-4 h-4" /></div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm sm:text-base truncate">{tx.title}</div>
                    <div className="text-xs sm:text-sm text-neutral-400">{tx.date}</div>
                  </div>
                  <div className={`font-medium text-sm sm:text-base flex-shrink-0 ${tx.positive ? 'text-green-500' : tx.amount.startsWith('-') ? 'text-red-500' : 'text-neutral-400'}`}>{tx.amount}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-neutral-500 text-sm">No transactions yet</div>
          )}

          <button className="w-full p-4 text-sm text-neutral-400 hover:text-white hover:bg-[#2a2a2a] transition-colors">View All Transactions</button>
        </div>

        <div className="h-8" />
      </main>
    </div>
  );
}
