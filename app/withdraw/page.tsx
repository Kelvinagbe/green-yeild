'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { ref, onValue, set, push, get } from 'firebase/database';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';

interface Bank { id: string; bankName: string; bankCode: string; accountNumber: string; accountName: string; isPrimary?: boolean; }
interface UserProfile { balance: number; name: string; }

const SK = ({ className = '' }: { className?: string }) => <div className={`animate-pulse rounded-lg bg-white/[0.06] ${className}`} />;
const fmt = (n: number) => n.toLocaleString('en-NG', { minimumFractionDigits: 2 });
const calcFee = (n: number) => parseFloat(Math.min(n * 0.015, 100).toFixed(2));

const QUICK = [5000, 10000, 25000, 50000, 100000];

function Portal({ children }: { children: React.ReactNode }) {
  const [ok, setOk] = useState(false);
  useEffect(() => setOk(true), []);
  return ok ? createPortal(children, document.body) : null;
}

export default function Withdraw() {
  const [uid, setUid]         = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [banks, setBanks]     = useState<Bank[]>([]);
  const [loadP, setLoadP]     = useState(true);
  const [loadB, setLoadB]     = useState(true);

  const [amount, setAmount]             = useState('');
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [showAdd, setShowAdd]           = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);
  const [processing, setProcessing]     = useState(false);
  const [done, setDone]                 = useState(false);

  // ── Add bank form ──────────────────────────────────────────────────────────
  const [bankOptions, setBankOptions]   = useState<{ name: string; code: string }[]>([]);
  const [newBankCode, setNewBankCode]   = useState('');
  const [newAccNo, setNewAccNo]         = useState('');
  const [newAccName, setNewAccName]     = useState('');
  const [resolving, setResolving]       = useState(false);
  const [resolveErr, setResolveErr]     = useState('');
  const [addingBank, setAddingBank]     = useState(false);

  useEffect(() => onAuthStateChanged(auth, u => { if (u) setUid(u.uid); }), []);

  // ── Fetch bank list via our API route (keeps secret key server-side) ───────
  useEffect(() => {
    fetch('/api/paystack-banks')
      .then(r => r.json())
      .then(d => { if (d.data) setBankOptions(d.data.map((b: any) => ({ name: b.name, code: b.code }))); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!uid) return;
    const u1 = onValue(ref(db, `users/${uid}/profile`), s => { if (s.val()) setProfile(s.val()); setLoadP(false); });
    const u2 = onValue(ref(db, `users/${uid}/banks`), s => {
      const d = s.val();
      setBanks(d ? Object.entries(d).map(([id, v]: any) => ({ id, ...v })) : []);
      setLoadB(false);
    });
    return () => { u1(); u2(); };
  }, [uid]);

  // ── Auto-resolve account name when 10 digits + bank selected ──────────────
  useEffect(() => {
    if (newAccNo.length !== 10 || !newBankCode) {
      setNewAccName('');
      setResolveErr('');
      return;
    }

    let cancelled = false;
    setResolving(true);
    setNewAccName('');
    setResolveErr('');

    fetch(`/api/resolve-account?account_number=${newAccNo}&bank_code=${newBankCode}`)
      .then(r => r.json())
      .then(d => {
        if (cancelled) return;
        if (d.status && d.data?.account_name) {
          setNewAccName(d.data.account_name);
        } else {
          setResolveErr('Account not found. Check the number and bank.');
        }
      })
      .catch(() => { if (!cancelled) setResolveErr('Could not verify account.'); })
      .finally(() => { if (!cancelled) setResolving(false); });

    return () => { cancelled = true; };
  }, [newAccNo, newBankCode]);

  const parsed   = parseFloat(amount) || 0;
  const txFee    = calcFee(parsed);
  const canSubmit = parsed > 0 && !!selectedBank && parsed <= (profile?.balance ?? 0);
  const bank     = banks.find(b => b.id === selectedBank);
  const newBankName = bankOptions.find(b => b.code === newBankCode)?.name ?? '';

  const handleWithdraw = async () => {
    if (!uid || !profile || !bank) return;
    setProcessing(true);
    try {
      const snap = await get(ref(db, `users/${uid}/profile`));
      const bal: number = snap.val()?.balance ?? 0;
      await set(ref(db, `users/${uid}/profile/balance`), bal - parsed);
      await push(ref(db, `users/${uid}/transactions`), {
        icon: 'arrow-up-right',
        title: `Withdrawal — ${bank.bankName}`,
        date: new Date().toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' }),
        amount: `-₦${fmt(parsed)}`,
        positive: false,
      });
      setDone(true); setShowConfirm(false);
    } catch (e) { console.error(e); }
    finally { setProcessing(false); }
  };

  const handleAddBank = async () => {
    if (!uid || !newBankCode || newAccNo.length !== 10 || !newAccName) return;
    setAddingBank(true);
    await push(ref(db, `users/${uid}/banks`), {
      bankName: newBankName,
      bankCode: newBankCode,
      accountNumber: newAccNo,
      accountName: newAccName,
      isPrimary: banks.length === 0,
    });
    setNewBankCode(''); setNewAccNo(''); setNewAccName(''); setResolveErr('');
    setAddingBank(false); setShowAdd(false);
  };

  const resetAdd = () => { setNewBankCode(''); setNewAccNo(''); setNewAccName(''); setResolveErr(''); setShowAdd(false); };

  return (
    <div className="min-h-screen bg-[#111111] text-white">
      <style>{`
        @keyframes up  { from{opacity:0;transform:translateY(14px) scale(.97)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes fd  { from{opacity:0} to{opacity:1} }
        @keyframes ring{ from{stroke-dashoffset:251} to{stroke-dashoffset:0} }
        @keyframes ck  { from{opacity:0;transform:scale(.4)} to{opacity:1;transform:scale(1)} }
      `}</style>

      {/* ── Success portal ── */}
      {done && (
        <Portal>
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-lg"
            style={{ animation: 'fd .2s ease-out' }}
            onClick={() => { setDone(false); setAmount(''); setSelectedBank(null); }}>
            <div className="bg-[#1a1a1a] border border-neutral-800 rounded-2xl p-8 max-w-sm w-full text-center space-y-4"
              style={{ animation: 'up .4s cubic-bezier(.34,1.56,.64,1) both' }}
              onClick={e => e.stopPropagation()}>
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
              <div>
                <p className="text-xl font-semibold">Withdrawal Submitted</p>
                <p className="text-sm text-neutral-400 mt-1">₦{fmt(parsed)} will arrive within 24 hrs</p>
              </div>
              <p className="text-xs text-neutral-600">{bank?.bankName} · {bank?.accountNumber}</p>
              <button onClick={() => { setDone(false); setAmount(''); setSelectedBank(null); }}
                className="w-full h-11 bg-green-500 hover:bg-green-600 rounded-xl font-medium transition-all active:scale-95">
                Done
              </button>
            </div>
          </div>
        </Portal>
      )}

      {/* ── Confirm modal ── */}
      {showConfirm && (
        <Portal>
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm"
            style={{ animation: 'fd .2s ease-out' }}
            onClick={() => !processing && setShowConfirm(false)}>
            <div className="w-full sm:max-w-md bg-[#1a1a1a] border border-neutral-800 rounded-t-2xl sm:rounded-2xl p-6 space-y-5"
              style={{ animation: 'up .3s ease-out' }}
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-lg">Confirm Withdrawal</h2>
                <button onClick={() => setShowConfirm(false)}
                  className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center transition-all">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="bg-[#222] border border-neutral-800 rounded-xl p-4 space-y-3">
                {[['Amount', `₦${fmt(parsed)}`], ['Fee (1.5%)', `₦${fmt(txFee)}`]].map(([k, v]) => (
                  <div key={k} className="flex justify-between text-sm">
                    <span className="text-neutral-500">{k}</span><span>{v}</span>
                  </div>
                ))}
                <div className="h-px bg-neutral-800" />
                <div className="flex justify-between">
                  <span className="text-sm text-neutral-500">You receive</span>
                  <span className="font-semibold text-green-400">₦{fmt(parsed - txFee)}</span>
                </div>
              </div>
              {bank && (
                <div className="bg-[#222] border border-neutral-800 rounded-xl p-4">
                  <p className="text-[10px] uppercase tracking-wider text-neutral-600 mb-2">To Account</p>
                  <p className="font-medium text-sm">{bank.accountName}</p>
                  <p className="text-xs text-neutral-500 mt-0.5">{bank.bankName} · {bank.accountNumber}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setShowConfirm(false)} disabled={processing}
                  className="h-12 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-xl text-sm font-medium transition-all disabled:opacity-40">
                  Cancel
                </button>
                <button onClick={handleWithdraw} disabled={processing}
                  className="h-12 bg-green-500 hover:bg-green-600 rounded-xl text-sm font-semibold transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-40">
                  {processing
                    ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Processing…</>
                    : 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        </Portal>
      )}

      {/* ── Add bank modal ── */}
      {showAdd && (
        <Portal>
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm"
            style={{ animation: 'fd .2s ease-out' }}
            onClick={resetAdd}>
            <div className="w-full sm:max-w-md bg-[#1a1a1a] border border-neutral-800 rounded-t-2xl sm:rounded-2xl p-6 space-y-4"
              style={{ animation: 'up .3s ease-out' }}
              onClick={e => e.stopPropagation()}>

              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-lg">Add Bank Account</h2>
                <button onClick={resetAdd}
                  className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center transition-all">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Bank select */}
              <div>
                <label className="text-xs text-neutral-600 uppercase tracking-wider mb-1.5 block">Bank</label>
                <select value={newBankCode} onChange={e => setNewBankCode(e.target.value)}
                  className="w-full h-12 bg-[#222] border border-neutral-800 focus:border-green-500/60 rounded-xl px-4 text-sm focus:outline-none transition-colors appearance-none">
                  <option value="">Select bank…</option>
                  {bankOptions.map(b => <option key={b.code} value={b.code}>{b.name}</option>)}
                </select>
              </div>

              {/* Account number */}
              <div>
                <label className="text-xs text-neutral-600 uppercase tracking-wider mb-1.5 block">Account Number</label>
                <input
                  value={newAccNo}
                  onChange={e => setNewAccNo(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="10-digit NUBAN"
                  className="w-full h-12 bg-[#222] border border-neutral-800 focus:border-green-500/60 rounded-xl px-4 text-sm focus:outline-none transition-colors font-mono tracking-widest"
                />
              </div>

              {/* Account name — auto-resolved */}
              <div>
                <label className="text-xs text-neutral-600 uppercase tracking-wider mb-1.5 block">Account Name</label>
                <div className={`w-full h-12 rounded-xl border px-4 flex items-center transition-all
                  ${newAccName
                    ? 'border-green-500/40 bg-green-500/5'
                    : resolveErr
                    ? 'border-red-500/40 bg-red-500/5'
                    : 'border-neutral-800 bg-[#222]'}`}>
                  {resolving ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-neutral-600 border-t-neutral-300 rounded-full animate-spin shrink-0" />
                      <span className="text-sm text-neutral-500">Verifying account…</span>
                    </div>
                  ) : newAccName ? (
                    <div className="flex items-center gap-2 w-full">
                      <svg className="w-4 h-4 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm font-semibold text-green-400 truncate">{newAccName}</span>
                    </div>
                  ) : resolveErr ? (
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span className="text-sm text-red-400">{resolveErr}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-neutral-600">
                      {newBankCode && newAccNo.length < 10
                        ? `Enter ${10 - newAccNo.length} more digit${10 - newAccNo.length !== 1 ? 's' : ''}…`
                        : 'Select bank and enter account number'}
                    </span>
                  )}
                </div>
              </div>

              <button onClick={handleAddBank}
                disabled={addingBank || !newBankCode || newAccNo.length !== 10 || !newAccName || !!resolveErr}
                className="w-full h-12 bg-green-500 hover:bg-green-600 rounded-xl font-semibold text-sm transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed mt-1">
                {addingBank
                  ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving…</>
                  : 'Save Account'}
              </button>
            </div>
          </div>
        </Portal>
      )}

      <main className="max-w-lg mx-auto px-4 py-6 space-y-4">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold">Withdraw</h1>
          <p className="text-sm text-neutral-500 mt-0.5">Transfer to your bank account</p>
        </div>

        {/* Balance */}
        <div className="bg-[#1a1a1a] border border-neutral-800/60 rounded-2xl p-5 flex items-center justify-between">
          {loadP ? <><SK className="h-5 w-28" /><SK className="h-8 w-36" /></> : (
            <>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-neutral-600 mb-1">Available Balance</p>
                <p className="text-2xl font-semibold">₦{fmt(profile?.balance ?? 0)}</p>
              </div>
              <div className="w-11 h-11 bg-green-500/10 rounded-full flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
            </>
          )}
        </div>

      {/* Amount input */}
        <div className="bg-[#1a1a1a] border border-neutral-800/60 rounded-2xl p-5 space-y-4">
          <p className="text-[10px] uppercase tracking-wider text-neutral-600 font-medium">Amount</p>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 text-xl select-none">₦</span>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00"
              className="w-full h-14 bg-[#111111] border border-neutral-800 focus:border-green-500/60 rounded-xl pl-10 pr-4 text-xl font-semibold focus:outline-none transition-colors" />
          </div>
          <div className="grid grid-cols-5 gap-2">
            {QUICK.map(q => (
              <button key={q} onClick={() => setAmount(q.toString())}
                className={`h-9 rounded-lg text-xs font-medium border transition-all
                  ${parsed === q ? 'bg-green-500 border-green-500 text-white' : 'bg-[#111111] border-neutral-800 hover:border-neutral-600 text-neutral-500'}`}>
                {q >= 1000 ? `${q/1000}K` : q}
              </button>
            ))}
          </div>
          {parsed > 0 && (
            <div className="bg-[#111111] border border-neutral-800 rounded-xl p-3.5 space-y-2.5">
              {[['Amount', `₦${fmt(parsed)}`], ['Fee (1.5%)', `₦${fmt(txFee)}`]].map(([k, v]) => (
                <div key={k} className="flex justify-between text-xs">
                  <span className="text-neutral-600">{k}</span><span className="text-neutral-400">{v}</span>
                </div>
              ))}
              <div className="h-px bg-neutral-800" />
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">You receive</span>
                <span className="font-semibold text-green-400">₦{fmt(parsed - txFee)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Bank accounts */}
        <div className="bg-[#1a1a1a] border border-neutral-800/60 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-[10px] uppercase tracking-wider text-neutral-600 font-medium">Bank Account</p>
            <button onClick={() => setShowAdd(true)}
              className="text-xs text-green-400 hover:text-green-300 font-medium flex items-center gap-1 transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Add New
            </button>
          </div>
          {loadB ? (
            <div className="space-y-2">{[0,1].map(i => <SK key={i} className="h-16 rounded-xl" />)}</div>
          ) : banks.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-sm text-neutral-600">No bank accounts yet</p>
              <button onClick={() => setShowAdd(true)} className="text-xs text-green-400 hover:text-green-300 mt-1.5 transition-colors">
                Add one now
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {banks.map(b => (
                <button key={b.id} onClick={() => setSelectedBank(b.id)}
                  className={`w-full p-4 rounded-xl border text-left transition-all
                    ${selectedBank === b.id ? 'border-green-500/50 bg-green-500/5' : 'border-neutral-800 hover:border-neutral-700'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0
                        ${selectedBank === b.id ? 'bg-green-500' : 'bg-neutral-800'}`}>
                        <svg className={`w-4 h-4 ${selectedBank === b.id ? 'text-white' : 'text-neutral-500'}`}
                          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                        </svg>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">{b.accountName}</p>
                          {b.isPrimary && (
                            <span className="text-[10px] px-1.5 py-0.5 bg-green-500/15 text-green-400 rounded-full">Primary</span>
                          )}
                        </div>
                        <p className="text-xs text-neutral-600 mt-0.5">{b.bankName} · {b.accountNumber}</p>
                      </div>
                    </div>
                    {selectedBank === b.id && (
                      <svg className="w-4 h-4 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="bg-green-500/5 border border-green-500/10 rounded-xl p-4 flex gap-3">
          <svg className="w-4 h-4 text-green-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-xs text-neutral-500">Withdrawals process within 24 hrs on business days. A fee of 1.5% (max ₦100) applies.</p>
        </div>

        {/* Submit */}
        <button onClick={() => setShowConfirm(true)} disabled={!canSubmit}
          className="w-full h-14 bg-green-500 hover:bg-green-600 rounded-xl font-semibold transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
          </svg>
          Withdraw{parsed > 0 ? ` ₦${fmt(parsed)}` : ''}
        </button>

        <div className="h-6" />
      </main>
    </div>
  );
}