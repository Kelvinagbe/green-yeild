'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ref, onValue } from 'firebase/database';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';

interface Tx {
  id: string;
  icon: string;
  title: string;
  date: string;
  amount: string;
  positive: boolean;
  reference?: string;
  status?: string;
  category?: string;
  note?: string;
}

const SK = ({ className = '' }: { className?: string }) => (
  <div className={`animate-pulse rounded-lg bg-white/[0.06] ${className}`} />
);

const FILTERS = ['All', 'Credit', 'Debit'] as const;
type Filter = typeof FILTERS[number];

/* ── Icons ── */
const ChevronLeft = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
  </svg>
);
const SearchIcon = () => (
  <svg className="w-4 h-4 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
  </svg>
);
const ReceiptIcon = () => (
  <svg className="w-5 h-5 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
);
const CloseIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);
const ArrowDownIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);
const ArrowUpIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
  </svg>
);
const CopyIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);
const CheckIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

/* ── Transaction Detail Modal ── */
function TxDetailSheet({ tx, onClose }: { tx: Tx; onClose: () => void }) {
  const [copied, setCopied] = useState(false);

  const ref_id = tx.reference ?? `TXN${tx.id.slice(0, 8).toUpperCase()}`;
  const status = tx.status ?? 'Successful';
  const category = tx.category ?? (tx.positive ? 'Credit' : 'Debit');

  const handleCopy = () => {
    navigator.clipboard.writeText(ref_id).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Parse amount to plain number
  const rawAmount = parseFloat(tx.amount.replace(/[^0-9.]/g, ''));
  const formattedAmount = `₦${rawAmount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        onClick={onClose}
        style={{ animation: 'fadeIn 0.2s ease' }}
      />

      {/* Sheet */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 max-w-2xl mx-auto"
        style={{ animation: 'slideUp 0.3s cubic-bezier(0.32, 0.72, 0, 1)' }}
      >
        <div className="bg-[#1a1a1a] border border-neutral-800 border-b-0 rounded-t-3xl overflow-hidden">

          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 bg-neutral-700 rounded-full" />
          </div>

          {/* Close */}
          <div className="flex items-center justify-between px-5 pt-2 pb-4">
            <p className="text-sm font-medium text-neutral-400">Transaction Details</p>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center transition-colors"
            >
              <CloseIcon />
            </button>
          </div>

          {/* Amount hero */}
          <div className="flex flex-col items-center px-5 pb-6 border-b border-neutral-800">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 ${
              tx.positive ? 'bg-green-500/15' : 'bg-red-500/15'
            }`}>
              {tx.positive ? (
                <span className="text-green-400"><ArrowDownIcon /></span>
              ) : (
                <span className="text-red-400"><ArrowUpIcon /></span>
              )}
            </div>

            <p className={`text-4xl font-bold tracking-tight mb-1 ${
              tx.positive ? 'text-green-400' : 'text-white'
            }`}>
              {tx.positive ? '+' : '-'}{formattedAmount}
            </p>

            <p className="text-sm text-neutral-500 mb-3">{tx.title}</p>

            {/* Status badge */}
            <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full ${
              status === 'Successful' || status === 'Completed'
                ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                : status === 'Pending'
                ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                : 'bg-red-500/10 text-red-400 border border-red-500/20'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${
                status === 'Successful' || status === 'Completed' ? 'bg-green-400' :
                status === 'Pending' ? 'bg-yellow-400' : 'bg-red-400'
              }`} />
              {status}
            </span>
          </div>

          {/* Details rows */}
          <div className="px-5 py-5 space-y-0 divide-y divide-neutral-800/60">

            <DetailRow label="Date & Time" value={tx.date} />
            <DetailRow label="Type" value={tx.positive ? 'Credit' : 'Debit'} />
            <DetailRow label="Category" value={category} />

            {/* Reference with copy */}
            <div className="flex items-center justify-between py-4">
              <span className="text-xs text-neutral-500 uppercase tracking-wider font-medium">Reference</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-white font-mono">{ref_id}</span>
                <button
                  onClick={handleCopy}
                  className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-all ${
                    copied
                      ? 'bg-green-500/15 text-green-400'
                      : 'bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700'
                  }`}
                >
                  {copied ? <><CheckIcon /> Copied</> : <><CopyIcon /> Copy</>}
                </button>
              </div>
            </div>

            {tx.note && <DetailRow label="Note" value={tx.note} />}
          </div>

          {/* Share / Report row */}
          <div className="px-5 pb-8 pt-2 grid grid-cols-2 gap-3">
            <button className="h-11 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-sm font-medium text-neutral-300 transition-colors">
              Share Receipt
            </button>
            <button className="h-11 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-sm font-medium text-neutral-300 transition-colors">
              Report Issue
            </button>
          </div>

        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { transform: translateY(100%) } to { transform: translateY(0) } }
      `}</style>
    </>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-4">
      <span className="text-xs text-neutral-500 uppercase tracking-wider font-medium">{label}</span>
      <span className="text-sm text-white">{value}</span>
    </div>
  );
}

/* ── Main Page ── */
export default function Transactions() {
  const [uid, setUid]       = useState<string | null>(null);
  const [txs, setTxs]       = useState<Tx[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState<Filter>('All');
  const [search, setSearch]   = useState('');
  const [selected, setSelected] = useState<Tx | null>(null);

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
    <div className="min-h-screen bg-[#111111] text-white">

      {/* Header */}
      <div className="border-b border-neutral-800/60 sticky top-0 bg-[#111111]/90 backdrop-blur-xl z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link
            href="/dashboard"
            className="w-9 h-9 rounded-full bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center transition-all shrink-0"
          >
            <ChevronLeft />
          </Link>
          <h1 className="font-semibold text-base tracking-tight">Transactions</h1>
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-4 py-5 space-y-4">

        {/* Summary */}
        {!loading && txs.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#1a1a1a] border border-neutral-800/60 rounded-2xl p-4">
              <p className="text-[10px] uppercase tracking-widest text-neutral-600 mb-2 font-medium">Money In</p>
              <p className="text-xl font-bold text-green-400">
                +₦{totalIn.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="bg-[#1a1a1a] border border-neutral-800/60 rounded-2xl p-4">
              <p className="text-[10px] uppercase tracking-widest text-neutral-600 mb-2 font-medium">Money Out</p>
              <p className="text-xl font-bold text-neutral-200">
                -₦{totalOut.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
            <SearchIcon />
          </span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search transactions…"
            className="w-full h-11 bg-[#1a1a1a] border border-neutral-800/60 focus:border-neutral-600 rounded-xl pl-10 pr-4 text-sm focus:outline-none transition-colors placeholder:text-neutral-600"
          />
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-2">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`h-8 px-4 rounded-full text-xs font-medium transition-all ${
                filter === f
                  ? 'bg-white text-black'
                  : 'bg-[#1a1a1a] border border-neutral-800 text-neutral-500 hover:text-neutral-300 hover:border-neutral-600'
              }`}
            >
              {f}
            </button>
          ))}
          <span className="ml-auto text-xs text-neutral-700">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
        </div>

        {/* List */}
        <div className="bg-[#1a1a1a] border border-neutral-800/60 rounded-2xl overflow-hidden">
          {loading ? (
            <div className="divide-y divide-neutral-800/60">
              {[0, 1, 2, 3, 4, 5].map(i => (
                <div key={i} className="px-5 py-4 flex items-center gap-4">
                  <SK className="w-10 h-10 rounded-full shrink-0" />
                  <div className="flex-1 space-y-2">
                    <SK className="h-3.5 w-36" />
                    <SK className="h-3 w-20" />
                  </div>
                  <SK className="h-3.5 w-16" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-12 h-12 bg-neutral-800/60 rounded-full flex items-center justify-center mx-auto mb-3">
                <ReceiptIcon />
              </div>
              <p className="text-sm text-neutral-500">{search ? 'No results found' : 'No transactions yet'}</p>
              {!search && <p className="text-xs text-neutral-700 mt-1">Your activity will appear here</p>}
            </div>
          ) : (
            <div className="divide-y divide-neutral-800/40">
              {filtered.map((tx, i) => (
                <button
                  key={tx.id}
                  onClick={() => setSelected(tx)}
                  className="w-full px-5 py-4 flex items-center gap-4 hover:bg-white/[0.03] active:bg-white/[0.05] transition-colors text-left"
                >
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    tx.positive ? 'bg-green-500/10' : 'bg-neutral-800'
                  }`}>
                    {tx.positive ? (
                      <span className="text-green-400"><ArrowDownIcon /></span>
                    ) : (
                      <span className="text-neutral-400"><ArrowUpIcon /></span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{tx.title}</p>
                    <p className="text-xs text-neutral-600 mt-0.5">{tx.date}</p>
                  </div>

                  {/* Amount + chevron */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-sm font-semibold tabular-nums ${
                      tx.positive ? 'text-green-400' : 'text-white'
                    }`}>
                      {tx.positive ? '+' : ''}{tx.amount}
                    </span>
                    <svg className="w-3.5 h-3.5 text-neutral-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="h-6" />
      </main>

      {/* Detail Sheet */}
      {selected && (
        <TxDetailSheet tx={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
