'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ref, onValue } from 'firebase/database';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';

interface Tx { id: string; icon: string; title: string; date: string; amount: string; positive: boolean; }

const SK = ({ className = '' }: { className?: string }) => <div className={`animate-pulse rounded-lg bg-white/[0.06] ${className}`} />;

const FILTERS = ['All', 'Credit', 'Debit'] as const;
type Filter = typeof FILTERS[number];

export default function Transactions() {
  const [uid, setUid]   = useState<string | null>(null);
  const [txs, setTxs]   = useState<Tx[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState<Filter>('All');
  const [search, setSearch]   = useState('');

  useEffect(() => onAuthStateChanged(auth, u => { if (u) setUid(u.uid); }), []);

  useEffect(() => {
    if (!uid) return;
    return onValue(ref(db, `users/${uid}/transactions`), snap => {
      const d = snap.val();
      setTxs(d ? (Object.entries(d).map(([id, v]: any) => ({ id, ...v })) as Tx[]).reverse() : []);
      setLoading(false);
    });
  }, [uid]);

  const filtered = txs.filter(tx => {
    if (filter === 'Credit' && !tx.positive) return false;
    if (filter === 'Debit'  &&  tx.positive) return false;
    if (search && !tx.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalIn  = txs.filter(t => t.positive).reduce((s, t) => s + parseFloat(t.amount.replace(/[^0-9.]/g, '')), 0);
  const totalOut = txs.filter(t => !t.positive).reduce((s, t) => s + parseFloat(t.amount.replace(/[^0-9.]/g, '')), 0);

  return (
    <div className="min-h-screen bg-[#1c1c1c] text-white">

      {/* Header */}
      <div className="border-b border-neutral-800 sticky top-0 bg-[#1c1c1c]/90 backdrop-blur-xl z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/dashboard" className="w-9 h-9 rounded-full bg-[#262626] hover:bg-[#2e2e2e] flex items-center justify-center transition-all shrink-0">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          </Link>
          <h1 className="font-semibold text-lg">Transactions</h1>
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-5">

        {/* Summary */}
        {!loading && txs.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#262626] border border-neutral-800 rounded-xl p-4">
              <p className="text-xs text-neutral-500 mb-1">Total In</p>
              <p className="text-lg font-semibold text-green-400">+₦{totalIn.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="bg-[#262626] border border-neutral-800 rounded-xl p-4">
              <p className="text-xs text-neutral-500 mb-1">Total Out</p>
              <p className="text-lg font-semibold text-red-400">-₦{totalOut.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</p>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="relative">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" /></svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search transactions…" className="w-full h-11 bg-[#262626] border border-neutral-800 focus:border-neutral-600 rounded-xl pl-10 pr-4 text-sm focus:outline-none transition-colors" />
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2">
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`h-8 px-4 rounded-full text-xs font-medium transition-all ${filter === f ? 'bg-green-500 text-white' : 'bg-[#262626] border border-neutral-800 text-neutral-400 hover:border-neutral-600'}`}>
              {f}
            </button>
          ))}
          <span className="ml-auto text-xs text-neutral-600 self-center">{filtered.length} transactions</span>
        </div>

        {/* List */}
        <div className="bg-[#262626] border border-neutral-800 rounded-2xl overflow-hidden">
          {loading ? (
            <div className="divide-y divide-neutral-800">
              {[0,1,2,3,4,5].map(i => (
                <div key={i} className="px-5 py-4 flex items-center gap-4">
                  <SK className="w-10 h-10 rounded-full shrink-0" />
                  <div className="flex-1 space-y-2"><SK className="h-4 w-36" /><SK className="h-3 w-24" /></div>
                  <SK className="h-4 w-16" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-12 h-12 bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-5 h-5 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
              </div>
              <p className="text-sm text-neutral-500">{search ? 'No results found' : 'No transactions yet'}</p>
              {!search && <p className="text-xs text-neutral-700 mt-1">Your activity will appear here</p>}
            </div>
          ) : (
            <div className="divide-y divide-neutral-800">
              {filtered.map(tx => (
                <div key={tx.id} className="px-5 py-4 flex items-center gap-4 hover:bg-[#2a2a2a] transition-colors">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${tx.positive ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                    <svg className={`w-4 h-4 ${tx.positive ? 'text-green-400' : 'text-red-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      {tx.positive
                        ? <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        : <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />}
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{tx.title}</p>
                    <p className="text-xs text-neutral-500 mt-0.5">{tx.date}</p>
                  </div>
                  <span className={`text-sm font-semibold shrink-0 ${tx.positive ? 'text-green-400' : 'text-red-400'}`}>{tx.amount}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="h-6" />
      </main>
    </div>
  );
}
