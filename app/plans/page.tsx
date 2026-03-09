'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ref, onValue, push, set, get } from 'firebase/database';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';

interface Plan {
  id: number; name: string; minAmount: number; maxAmount: number;
  returnRate: number; durationMonths: number[]; risk: 'Low'|'Medium'|'High';
  popular?: boolean; features: string[];
}
interface Investment {
  id: string; planName: string; principal: number; returnRate: number;
  durationMonths: number; startDate: number; maturityDate: number;
  expectedReturn: number; status: 'active'|'matured';
}

const fmt = (n: number) => n.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtDate = (ms: number) => new Date(ms).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
const calcReturn = (p: number, r: number, m: number) => parseFloat((p * (r / 100) * (m / 12)).toFixed(2));
const pct = (s: number, e: number) => Date.now() >= e ? 100 : Math.min(100, Math.round(((Date.now() - s) / (e - s)) * 100));
const SK = ({ className = '' }: { className?: string }) => <div className={`animate-pulse rounded-lg bg-white/[0.05] ${className}`} />;

const PLANS: Plan[] = [
  { id: 1, name: 'Starter',  minAmount: 10_000,    maxAmount: 100_000,    returnRate: 8,  durationMonths: [3,6],    risk: 'Low',    features: ['Low risk', 'Flexible withdrawal', 'Monthly returns', '24/7 support'] },
  { id: 2, name: 'Growth',   minAmount: 100_000,   maxAmount: 500_000,    returnRate: 12, durationMonths: [6,12],   risk: 'Medium', popular: true, features: ['Balanced portfolio', 'Quarterly bonus', 'Priority support', 'Financial advisor'] },
  { id: 3, name: 'Premium',  minAmount: 500_000,   maxAmount: 2_000_000,  returnRate: 15, durationMonths: [12,24],  risk: 'Medium', features: ['High returns', 'Diversified assets', 'Dedicated advisor', 'Exclusive deals'] },
  { id: 4, name: 'Elite',    minAmount: 2_000_000, maxAmount: 10_000_000, returnRate: 20, durationMonths: [24],     risk: 'High',   features: ['Maximum returns', 'Custom portfolio', 'VIP support', 'Early deal access'] },
];

const RISK: Record<string, string> = { Low: 'bg-green-500/10 text-green-400', Medium: 'bg-yellow-500/10 text-yellow-400', High: 'bg-red-500/10 text-red-400' };

const Check = () => (
  <span className="w-4 h-4 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
    <svg className="w-2.5 h-2.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
  </span>
);

export default function InvestmentPlans() {
  const router = useRouter();
  const [uid, setUid]         = useState<string | null>(null);
  const [profile, setProfile] = useState<{ balance: number } | null>(null);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loadingP, setLoadingP] = useState(true);
  const [loadingI, setLoadingI] = useState(true);

  const [plan, setPlan]         = useState<Plan | null>(null);
  const [amount, setAmount]     = useState('');
  const [dur, setDur]           = useState(0);
  const [busy, setBusy]         = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [done, setDone]         = useState(false);

  useEffect(() => onAuthStateChanged(auth, u => u ? setUid(u.uid) : router.replace('/login')), [router]);

  useEffect(() => {
    if (!uid) return;
    const unsub1 = onValue(ref(db, `users/${uid}/profile`), s => { if (s.val()) setProfile(s.val()); setLoadingP(false); });
    const unsub2 = onValue(ref(db, `users/${uid}/investments`), s => {
      const d = s.val();
      setInvestments(d ? Object.entries(d).map(([id, v]: any) => ({ id, ...v })).sort((a: any, b: any) => b.startDate - a.startDate) : []);
      setLoadingI(false);
    });
    return () => { unsub1(); unsub2(); };
  }, [uid]);

  const openModal = (p: Plan) => { setPlan(p); setDur(p.durationMonths[0]); setAmount(''); setError(null); setDone(false); setBusy(false); };
  const closeModal = () => { if (busy) return; setPlan(null); setDone(false); setError(null); };

  const confirm = async () => {
    if (!uid || !plan || !profile) return;
    const n = parseFloat(amount);
    if (isNaN(n) || n < plan.minAmount) return setError(`Min ₦${plan.minAmount.toLocaleString()}`);
    if (n > plan.maxAmount)             return setError(`Max ₦${plan.maxAmount.toLocaleString()}`);
    if (n > profile.balance)            return setError('Insufficient balance. Deposit first.');
    setError(null); setBusy(true);
    try {
      const now = Date.now();
      const maturity = now + dur * 30 * 24 * 60 * 60 * 1000;
      const ret = calcReturn(n, plan.returnRate, dur);
      await push(ref(db, `users/${uid}/investments`), { planName: `${plan.name} Plan`, principal: n, returnRate: plan.returnRate, durationMonths: dur, startDate: now, maturityDate: maturity, expectedReturn: ret, status: 'active' });
      const bal = (await get(ref(db, `users/${uid}/profile`))).val()?.balance ?? 0;
      await set(ref(db, `users/${uid}/profile/balance`), bal - n);
      await push(ref(db, `users/${uid}/transactions`), { icon: 'trending-up', title: `${plan.name} Plan Investment`, date: new Date(now).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' }), amount: `-₦${fmt(n)}`, positive: false });
      setDone(true);
    } catch { setError('Something went wrong. Try again.'); }
    finally { setBusy(false); }
  };

  const totalInvested = investments.filter(i => i.status === 'active').reduce((s, i) => s + i.principal, 0);
  const totalReturns  = investments.filter(i => i.status === 'matured').reduce((s, i) => s + i.expectedReturn, 0);
  const estRet = plan && amount && !isNaN(parseFloat(amount)) ? calcReturn(parseFloat(amount), plan.returnRate, dur) : 0;

  return (
    <div className="min-h-screen bg-[#1c1c1c] text-white">
      <style>{`
        @keyframes slideUp { from { opacity:0; transform:translateY(18px) scale(0.97) } to { opacity:1; transform:translateY(0) scale(1) } }
        @keyframes fadeIn  { from { opacity:0 } to { opacity:1 } }
        @keyframes drawRing{ from { stroke-dashoffset:163 } to { stroke-dashoffset:0 } }
        @keyframes checkIn { from { opacity:0; transform:scale(0.3) } to { opacity:1; transform:scale(1) } }
      `}</style>

      {/* ── Modal ── */}
      {plan && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" style={{ animation: 'fadeIn .2s ease-out' }} onClick={closeModal}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div className="relative w-full sm:max-w-md bg-[#1e1e1e] border border-neutral-800 rounded-t-2xl sm:rounded-2xl p-6 space-y-5" style={{ animation: 'slideUp .3s ease-out' }} onClick={e => e.stopPropagation()}>

            {done ? (
              <div className="flex flex-col items-center text-center gap-4 py-4">
                <div className="relative w-20 h-20">
                  <svg className="w-20 h-20 -rotate-90" viewBox="0 0 60 60">
                    <circle cx="30" cy="30" r="26" fill="none" stroke="#262626" strokeWidth="4" />
                    <circle cx="30" cy="30" r="26" fill="none" stroke="#22c55e" strokeWidth="4" strokeLinecap="round" strokeDasharray="163" strokeDashoffset="163" style={{ animation: 'drawRing .6s ease-out .1s forwards' }} />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center" style={{ animation: 'checkIn .3s ease-out .55s both' }}>
                    <svg className="w-9 h-9 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  </div>
                </div>
                <div>
                  <p className="text-lg font-semibold">Investment Confirmed</p>
                  <p className="text-sm text-neutral-400 mt-1">₦{fmt(parseFloat(amount))} locked in {plan.name} Plan for {dur} months</p>
                </div>
                <p className="text-xs text-neutral-600">Expected return of <span className="text-green-400">+₦{fmt(estRet)}</span> at maturity</p>
                <button onClick={closeModal} className="w-full h-11 bg-[#2a2a2a] hover:bg-[#333] rounded-xl text-sm font-medium transition-all">Done</button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-semibold text-lg">Invest — {plan.name}</h2>
                    <p className="text-xs text-neutral-500 mt-0.5">{plan.returnRate}% p.a. · {plan.risk} risk</p>
                  </div>
                  <button onClick={closeModal} className="w-8 h-8 rounded-full bg-[#2a2a2a] hover:bg-[#333] flex items-center justify-center transition-all">
                    <svg className="w-4 h-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>

                {profile && <p className="text-xs text-neutral-500">Available: <span className="text-white font-medium">₦{fmt(profile.balance)}</span></p>}

                <div>
                  <label className="text-xs text-neutral-500 mb-1.5 block">Amount</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">₦</span>
                    <input type="number" value={amount} onChange={e => { setAmount(e.target.value); setError(null); }} placeholder={plan.minAmount.toLocaleString()} className="w-full bg-[#262626] border border-neutral-700 focus:border-green-500 rounded-xl pl-8 pr-4 py-3.5 text-lg font-semibold focus:outline-none transition-colors" />
                  </div>
                  <p className="text-xs text-neutral-600 mt-1.5">₦{plan.minAmount.toLocaleString()} – ₦{plan.maxAmount.toLocaleString()}</p>
                </div>

                <div>
                  <label className="text-xs text-neutral-500 mb-1.5 block">Duration</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[3,6,12,24].map(m => {
                      const avail = plan.durationMonths.includes(m);
                      return (
                        <button key={m} onClick={() => avail && setDur(m)} disabled={!avail} className={`h-10 rounded-lg text-sm font-medium border transition-all ${dur===m && avail ? 'bg-green-500 border-green-500 text-white' : avail ? 'bg-[#262626] border-neutral-700 hover:border-neutral-500 text-neutral-300' : 'bg-[#1e1e1e] border-neutral-800 text-neutral-700 cursor-not-allowed'}`}>
                          {m}M
                        </button>
                      );
                    })}
                  </div>
                </div>

                {amount && !isNaN(parseFloat(amount)) && parseFloat(amount) > 0 && (
                  <div className="bg-[#262626] border border-neutral-800 rounded-xl p-4 space-y-2">
                    <div className="flex justify-between text-sm"><span className="text-neutral-400">Expected return</span><span className="text-green-400 font-medium">+₦{fmt(estRet)}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-neutral-400">Total at maturity</span><span className="font-semibold">₦{fmt(parseFloat(amount) + estRet)}</span></div>
                    <div className="flex justify-between text-xs text-neutral-600"><span>Matures</span><span>{fmtDate(Date.now() + dur * 30 * 24 * 60 * 60 * 1000)}</span></div>
                  </div>
                )}

                {error && <div className="bg-red-500/10 border border-red-500/25 rounded-xl p-3 text-sm text-red-400">{error}</div>}

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <button onClick={closeModal} disabled={busy} className="h-12 bg-[#262626] hover:bg-[#2e2e2e] border border-neutral-700 rounded-xl text-sm font-medium transition-all disabled:opacity-40">Cancel</button>
                  <button onClick={confirm} disabled={busy || !amount || parseFloat(amount) <= 0} className="h-12 bg-green-500 hover:bg-green-600 rounded-xl text-sm font-semibold transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
                    {busy ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Confirming…</> : 'Confirm & Invest'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Page ── */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold">Investment Plans</h1>
          <p className="text-sm text-neutral-400 mt-1">Pick a plan, lock funds, earn fixed returns at maturity</p>
        </div>

        {/* Summary */}
        {loadingP ? (
          <div className="grid grid-cols-3 gap-4">{[0,1,2].map(i => <SK key={i} className="h-20" />)}</div>
        ) : (
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            {([
              { label: 'Total Invested', value: `₦${fmt(totalInvested)}`, sub: `${investments.filter(i=>i.status==='active').length} active` },
              { label: 'Total Returns',  value: `₦${fmt(totalReturns)}`,  sub: 'at maturity', green: true },
              { label: 'Wallet Balance', value: `₦${fmt(profile?.balance ?? 0)}`, sub: 'available' },
            ] as const).map(s => (
              <div key={s.label} className="bg-[#262626] border border-neutral-800 rounded-xl p-4">
                <div className="text-xs text-neutral-500 mb-1">{s.label}</div>
                <div className={`text-base sm:text-lg font-semibold truncate ${'green' in s && s.green ? 'text-green-400' : ''}`}>{s.value}</div>
                <div className="text-xs text-neutral-600 mt-0.5">{s.sub}</div>
              </div>
            ))}
          </div>
        )}

        {/* Plans */}
        <div>
          <h2 className="text-sm font-medium text-neutral-400 uppercase tracking-wider mb-4">Available Plans</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PLANS.map(p => (
              <div key={p.id} className={`relative bg-[#262626] border rounded-2xl p-5 transition-all hover:border-neutral-600 ${p.popular ? 'border-green-500/60' : 'border-neutral-800'}`}>
                {p.popular && <span className="absolute -top-2.5 left-5 bg-green-500 text-white text-[10px] font-semibold px-2.5 py-0.5 rounded-full">Popular</span>}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-base">{p.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${RISK[p.risk]}`}>{p.risk} Risk</span>
                      <span className="text-xs text-neutral-500">{p.durationMonths.join('–')} months</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-400">{p.returnRate}%</div>
                    <div className="text-[11px] text-neutral-500">per year</div>
                  </div>
                </div>
                <div className="bg-[#1e1e1e] rounded-lg px-3 py-2 mb-4">
                  <div className="text-[11px] text-neutral-600 mb-0.5">Investment range</div>
                  <div className="text-sm font-medium text-neutral-200">₦{p.minAmount.toLocaleString()} – ₦{p.maxAmount.toLocaleString()}</div>
                </div>
                <ul className="space-y-2 mb-5">
                  {p.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2.5 text-sm text-neutral-300"><Check />{f}</li>
                  ))}
                </ul>
                <button onClick={() => openModal(p)} className="w-full h-11 bg-green-500 hover:bg-green-600 rounded-xl text-sm font-semibold transition-all active:scale-[0.98]">Invest Now</button>
              </div>
            ))}
          </div>
        </div>

        {/* Active investments */}
        <div>
          <h2 className="text-sm font-medium text-neutral-400 uppercase tracking-wider mb-4">Active Investments</h2>
          {loadingI ? (
            <div className="space-y-3">{[0,1].map(i => <SK key={i} className="h-32 rounded-2xl" />)}</div>
          ) : investments.length === 0 ? (
            <div className="bg-[#262626] border border-neutral-800 rounded-2xl p-8 text-center">
              <p className="text-sm text-neutral-500">No active investments yet</p>
              <p className="text-xs text-neutral-600 mt-1">Choose a plan above to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {investments.map(inv => {
                const p = pct(inv.startDate, inv.maturityDate);
                const matured = inv.status === 'matured';
                return (
                  <div key={inv.id} className="bg-[#262626] border border-neutral-800 rounded-2xl p-5 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-medium text-sm">{inv.planName}</div>
                        <div className="text-xs text-neutral-500 mt-0.5">Started {fmtDate(inv.startDate)}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-sm">₦{fmt(inv.principal)}</div>
                        <div className="text-xs text-green-400 mt-0.5">+₦{fmt(inv.expectedReturn)}</div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[11px] text-neutral-600 mb-1.5">
                        <span>{matured ? '✓ Matured' : `${p}% complete`}</span>
                        <span>Matures {fmtDate(inv.maturityDate)}</span>
                      </div>
                      <div className="h-1.5 bg-[#1e1e1e] rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${matured ? 'bg-green-400' : 'bg-green-500'}`} style={{ width: `${p}%` }} />
                      </div>
                    </div>
                    {matured && <div className="bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2 text-xs text-green-400">🎉 This investment has matured. Your returns have been credited.</div>}
                  </div>
                );
              })}
            </div>
          )}
        </div>

      {/* How it works */}
        <div className="bg-[#262626] border border-neutral-800 rounded-2xl p-5">
          <h3 className="text-sm font-semibold mb-4">How It Works</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { n: '01', title: 'Choose a Plan',   body: 'Pick a plan that matches your budget and risk appetite.' },
              { n: '02', title: 'Lock Your Funds',  body: 'Funds are deducted from your wallet and locked for the chosen duration.' },
              { n: '03', title: 'Earn at Maturity', body: 'Principal + fixed returns are credited back when the plan matures.' },
            ].map(s => (
              <div key={s.n} className="flex gap-3">
                <div className="text-2xl font-bold text-neutral-800 shrink-0 leading-none mt-0.5">{s.n}</div>
                <div>
                  <div className="text-sm font-medium mb-1">{s.title}</div>
                  <div className="text-xs text-neutral-500 leading-relaxed">{s.body}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="h-8" />
      </main>
    </div>
  );
}