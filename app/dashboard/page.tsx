'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ref, onValue, set, push } from 'firebase/database';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { db } from '@/lib/firebase';

// ─── Types ───────────────────────────────────────────────────────────────────
interface UserProfile {
  name: string;
  plan: string;
  balance: number;
  growth: number;
  streak: number;
  checkedDays: number[];
}

interface Transaction {
  id: string;
  icon: string;
  title: string;
  date: string;
  amount: string;
  positive: boolean;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-lg bg-white/[0.06] ${className ?? ''}`} />
  );
}

export default function Dashboard() {
  const [uid, setUid] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [transactions, setTransactions] = useState<Transaction[] | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingTx, setLoadingTx] = useState(true);

  const [showCheckIn, setShowCheckIn] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [openingGateway, setOpeningGateway] = useState(false);

  const quickDepositAmounts = [5000, 10000, 20000, 50000, 100000];

  // ─── Auth ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) setUid(user.uid);
    });
    return () => unsub();
  }, []);

  // ─── Realtime: profile ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!uid) return;
    const profileRef = ref(db, `users/${uid}/profile`);
    const unsub = onValue(profileRef, (snap) => {
      const data = snap.val();
      if (data) {
        setProfile(data);
      } else {
        // Seed default profile on first login
        const defaultProfile: UserProfile = {
          name: auth.currentUser?.displayName ?? 'User',
          plan: 'Premium Member',
          balance: 0,
          growth: 0,
          streak: 0,
          checkedDays: [],
        };
        set(profileRef, defaultProfile);
        setProfile(defaultProfile);
      }
      setLoadingProfile(false);
    });
    return () => unsub();
  }, [uid]);

  // ─── Realtime: transactions ────────────────────────────────────────────────
  useEffect(() => {
    if (!uid) return;
    const txRef = ref(db, `users/${uid}/transactions`);
    const unsub = onValue(txRef, (snap) => {
      const data = snap.val();
      if (data) {
        const list: Transaction[] = Object.entries(data)
          .map(([id, val]: any) => ({ id, ...val }))
          .reverse()
          .slice(0, 5);
        setTransactions(list);
      } else {
        setTransactions([]);
      }
      setLoadingTx(false);
    });
    return () => unsub();
  }, [uid]);

  // ─── Check-in ──────────────────────────────────────────────────────────────
  const handleCheckIn = () => {
    if (!uid || !profile) return;
    setIsChecking(true);
    const nextDay = profile.checkedDays.length + 1;
    const updated = {
      ...profile,
      checkedDays: [...profile.checkedDays, nextDay],
      streak: nextDay,
    };
    setTimeout(() => {
      set(ref(db, `users/${uid}/profile`), updated);
      setIsChecking(false);
      setTimeout(() => setShowCheckIn(false), 1200);
    }, 800);
  };

  // ─── Deposit ───────────────────────────────────────────────────────────────
  const handleDeposit = () => {
    if (!uid || !profile) return;
    setOpeningGateway(true);
    setTimeout(() => {
      const amount = parseFloat(depositAmount);
      // Record transaction
      push(ref(db, `users/${uid}/transactions`), {
        icon: 'arrow-down-left',
        title: 'Deposit',
        date: new Date().toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' }),
        amount: `+₦${amount.toLocaleString()}`,
        positive: true,
      });
      // Update balance
      set(ref(db, `users/${uid}/profile`), {
        ...profile,
        balance: profile.balance + amount,
      });
      setOpeningGateway(false);
      setShowDepositModal(false);
      setDepositAmount('');
    }, 2000);
  };

  // ─── Lucide icons ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).lucide) {
      (window as any).lucide.createIcons();
    }
  }, [showCheckIn, showDepositModal, transactions, profile]);

  const checkedDays = profile?.checkedDays ?? [];

  return (
    <div className="min-h-screen bg-[#1c1c1c] text-white">
      <style jsx>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0)   scale(1);    }
        }
      `}</style>

      {/* ── Check-in Modal ── */}
      {showCheckIn && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => !isChecking && setShowCheckIn(false)}
        >
          <div
            className="bg-[#2a2a2a] border border-neutral-700 rounded-2xl p-6 max-w-md w-full"
            style={{ animation: 'slideUp 0.3s ease-out' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <i data-lucide="calendar-check" className="w-8 h-8 text-green-500" />
              </div>
              <h2 className="text-2xl font-semibold mb-2">Daily Check-in</h2>
              <p className="text-neutral-400 text-sm">Keep your streak going!</p>
            </div>

            <div className="grid grid-cols-7 gap-2 mb-6">
              {[1,2,3,4,5,6,7].map((day) => {
                const isChecked = checkedDays.includes(day);
                return (
                  <div
                    key={day}
                    className={`aspect-square rounded-lg flex flex-col items-center justify-center transition-all duration-300 ${
                      isChecked ? 'bg-green-500 text-white' : 'bg-[#3a3a3a] text-neutral-400'
                    }`}
                  >
                    <div className="text-[10px] opacity-60">Day</div>
                    <div className="text-base font-semibold">{day}</div>
                  </div>
                );
              })}
            </div>

            <div className="bg-[#333333] rounded-xl p-4 mb-6 flex items-center justify-between">
              <div>
                <div className="text-sm text-neutral-400">Current Streak</div>
                <div className="text-2xl font-semibold text-green-500">{checkedDays.length} days</div>
              </div>
              <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center">
                <i data-lucide="flame" className="w-6 h-6 text-green-500" />
              </div>
            </div>

            {checkedDays.length < 7 ? (
              <button
                onClick={handleCheckIn}
                disabled={isChecking}
                className="w-full h-12 bg-green-500 hover:bg-green-600 rounded-xl font-medium transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isChecking ? (
                  <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Checking in...</>
                ) : (
                  <><i data-lucide="check-circle" className="w-5 h-5" />Check In • Day {checkedDays.length + 1}</>
                )}
              </button>
            ) : (
              <div className="text-center">
                <div className="text-green-500 font-medium mb-2">🎉 Week Complete!</div>
                <button onClick={() => setShowCheckIn(false)} className="w-full h-12 bg-[#333333] hover:bg-[#3a3a3a] rounded-xl font-medium transition-all">Close</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Deposit Modal ── */}
      {showDepositModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => !openingGateway && setShowDepositModal(false)}
        >
          <div
            className="bg-[#2a2a2a] border border-neutral-700 rounded-2xl p-6 max-w-md w-full"
            style={{ animation: 'slideUp 0.3s ease-out' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Deposit Funds</h2>
              <button
                onClick={() => !openingGateway && setShowDepositModal(false)}
                className="w-8 h-8 rounded-full bg-[#333333] hover:bg-[#3a3a3a] flex items-center justify-center transition-all"
              >
                <i data-lucide="x" className="w-4 h-4" />
              </button>
            </div>

            <div className="mb-4">
              <label className="text-sm text-neutral-400 mb-2 block">Amount</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-neutral-400">₦</span>
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full h-14 bg-[#333333] border border-neutral-700 rounded-xl pl-10 pr-4 text-xl font-semibold focus:outline-none focus:border-green-500 transition-all"
                />
              </div>
            </div>

            <div className="mb-6">
              <div className="text-xs text-neutral-400 mb-2">Quick Select</div>
              <div className="grid grid-cols-3 gap-2">
                {quickDepositAmounts.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setDepositAmount(amount.toString())}
                    className="h-10 bg-[#333333] hover:bg-[#3a3a3a] border border-neutral-700 hover:border-green-500 rounded-lg text-sm font-medium transition-all"
                  >
                    ₦{amount / 1000}K
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowDepositModal(false)}
                disabled={openingGateway}
                className="h-12 bg-[#333333] hover:bg-[#3a3a3a] rounded-xl font-medium transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeposit}
                disabled={!depositAmount || parseFloat(depositAmount) <= 0 || openingGateway}
                className="h-12 bg-green-500 hover:bg-green-600 rounded-xl font-medium transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {openingGateway ? (
                  <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Opening...</>
                ) : 'Continue'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Main ── */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">

        {/* Name & plan */}
        {loadingProfile ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-28" />
          </div>
        ) : (
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-medium">{profile?.name}</h1>
            <p className="text-sm text-neutral-400">{profile?.plan}</p>
          </div>
        )}

        {/* Balance Card */}
        <div className="relative">
          <div className="absolute -inset-[2px] bg-gradient-to-br from-green-500 to-green-600 rounded-2xl sm:rounded-3xl" />
          <div className="relative bg-[#1c1c1c] rounded-2xl sm:rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="space-y-2">
              <div className="text-sm text-neutral-400">Total Balance</div>
              {loadingProfile ? (
                <>
                  <Skeleton className="h-12 w-56" />
                  <Skeleton className="h-4 w-32" />
                </>
              ) : (
                <>
                  <div className="text-4xl sm:text-5xl font-semibold tracking-tight">
                    ₦{(profile?.balance ?? 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="flex items-center gap-1 text-green-500">
                      <i data-lucide="trending-up" className="w-4 h-4" />
                      <span className="font-medium">+{profile?.growth ?? 0}%</span>
                    </div>
                    <span className="text-neutral-500">this month</span>
                  </div>
                </>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowDepositModal(true)}
                className="h-12 bg-green-500 hover:bg-green-600 rounded-xl font-medium transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <i data-lucide="arrow-down-left" className="w-4 h-4" />Deposit
              </button>
              <Link
                href="/withdraw"
                className="h-12 bg-[#2a2a2a] hover:bg-[#333333] rounded-xl font-medium transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <i data-lucide="arrow-up-right" className="w-4 h-4" />Withdraw
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: 'user',          title: 'Profile',  subtitle: 'Manage account', href: '/profile'  },
            { icon: 'credit-card',   title: 'Plans',    subtitle: 'View subscriptions', href: '/plans' },
            { icon: 'arrow-up-right',title: 'Withdraw', subtitle: 'Cash out funds', href: '/withdraw' },
          ].map((action, i) => (
            <Link
              key={i}
              href={action.href}
              className="bg-[#262626] border border-neutral-700 hover:border-neutral-600 hover:bg-[#2a2a2a] rounded-xl p-4 transition-all active:scale-95 text-center"
            >
              <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center mb-3 mx-auto">
                <i data-lucide={action.icon} className="w-5 h-5 text-green-500" />
              </div>
              <div className="text-sm font-medium mb-1">{action.title}</div>
              <div className="text-xs text-neutral-400">{action.subtitle}</div>
            </Link>
          ))}
        </div>

        {/* Invest */}
        <button className="w-full h-14 bg-[#262626] hover:bg-[#2a2a2a] border border-neutral-700 hover:border-neutral-600 rounded-xl font-medium transition-all active:scale-[0.98] flex items-center justify-center gap-2">
          <i data-lucide="trending-up" className="w-5 h-5" />Start Investing
        </button>

        {/* Daily Check-in */}
        <div className="bg-[#262626] border border-neutral-700 rounded-xl sm:rounded-2xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-medium mb-1">Daily Check-in</h3>
              <p className="text-sm text-neutral-400">Earn rewards every day</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
              <i data-lucide="gift" className="w-6 h-6 text-green-500" />
            </div>
          </div>

          {loadingProfile ? (
            <div className="flex gap-2 mb-4">
              {[...Array(7)].map((_, i) => <Skeleton key={i} className="flex-1 h-2" />)}
            </div>
          ) : (
            <div className="flex gap-2 mb-4">
              {[1,2,3,4,5,6,7].map((day) => (
                <div
                  key={day}
                  className={`flex-1 h-2 rounded-full transition-all ${
                    checkedDays.includes(day) ? 'bg-green-500' : 'bg-[#3a3a3a]'
                  }`}
                />
              ))}
            </div>
          )}

          <button
            onClick={() => setShowCheckIn(true)}
            className="w-full h-11 bg-green-500 hover:bg-green-600 rounded-lg font-medium transition-all active:scale-95"
          >
            Check In • Day {checkedDays.length + 1}
          </button>
        </div>

        {/* Transactions */}
        <div className="bg-[#262626] border border-neutral-700 rounded-xl sm:rounded-2xl overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-neutral-700">
            <h3 className="font-medium">Recent Transactions</h3>
          </div>

          {loadingTx ? (
            <div className="divide-y divide-neutral-700">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="p-4 sm:px-6 sm:py-4 flex items-center gap-4">
                  <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          ) : transactions && transactions.length > 0 ? (
            <div className="divide-y divide-neutral-700">
              {transactions.map((tx) => (
                <div key={tx.id} className="p-4 sm:px-6 sm:py-4 flex items-center gap-4 hover:bg-[#2a2a2a] transition-colors">
                  <div className="w-10 h-10 rounded-full bg-[#2a2a2a] flex items-center justify-center flex-shrink-0">
                    <i data-lucide={tx.icon} className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm sm:text-base truncate">{tx.title}</div>
                    <div className="text-xs sm:text-sm text-neutral-400">{tx.date}</div>
                  </div>
                  <div className={`font-medium text-sm sm:text-base flex-shrink-0 ${
                    tx.positive ? 'text-green-500' : tx.amount.startsWith('-') ? 'text-red-500' : 'text-neutral-400'
                  }`}>
                    {tx.amount}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-neutral-500 text-sm">No transactions yet</div>
          )}

          <button className="w-full p-4 text-sm text-neutral-400 hover:text-white hover:bg-[#2a2a2a] transition-colors">
            View All Transactions
          </button>
        </div>

        <div className="h-8" />
      </main>
    </div>
  );
}