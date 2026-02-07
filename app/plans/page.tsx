'use client';

import { useEffect, useState } from 'react';

export default function InvestmentPlans() {
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);
  const [showInvestModal, setShowInvestModal] = useState(false);
  const [investAmount, setInvestAmount] = useState('');
  const [duration, setDuration] = useState('3');

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).lucide) {
      (window as any).lucide.createIcons();
    }
  }, [selectedPlan, showInvestModal]);

  const plans = [
    {
      id: 1,
      name: 'Starter',
      minAmount: 10000,
      maxAmount: 100000,
      returnRate: 8,
      duration: '3-6 months',
      risk: 'Low',
      features: [
        'Low risk investment',
        'Flexible withdrawal',
        'Monthly returns',
        '24/7 support'
      ]
    },
    {
      id: 2,
      name: 'Growth',
      minAmount: 100000,
      maxAmount: 500000,
      returnRate: 12,
      duration: '6-12 months',
      risk: 'Medium',
      features: [
        'Balanced portfolio',
        'Quarterly bonus',
        'Priority support',
        'Financial advisor access'
      ],
      popular: true
    },
    {
      id: 3,
      name: 'Premium',
      minAmount: 500000,
      maxAmount: 2000000,
      returnRate: 15,
      duration: '12-24 months',
      risk: 'Medium',
      features: [
        'High returns',
        'Diversified assets',
        'Dedicated advisor',
        'Exclusive opportunities'
      ]
    },
    {
      id: 4,
      name: 'Elite',
      minAmount: 2000000,
      maxAmount: 10000000,
      returnRate: 20,
      duration: '24+ months',
      risk: 'High',
      features: [
        'Maximum returns',
        'Custom portfolio',
        'VIP support',
        'Early access to deals'
      ]
    }
  ];

  const handleInvest = (planId: number) => {
    setSelectedPlan(planId);
    setShowInvestModal(true);
  };

  const calculateReturns = () => {
    if (!investAmount || !selectedPlan) return 0;
    const plan = plans.find(p => p.id === selectedPlan);
    const amount = parseFloat(investAmount);
    const months = parseInt(duration);
    return (amount * (plan!.returnRate / 100) * (months / 12)).toFixed(2);
  };

  return (
    <div className="min-h-screen bg-[#1c1c1c] text-white">
      <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>

      {/* Investment Modal */}
      {showInvestModal && selectedPlan && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowInvestModal(false)}
        >
          <div 
            className="bg-[#2a2a2a] border border-neutral-700 rounded-2xl p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
            style={{
              animation: 'slideUp 0.3s ease-out'
            }}
          >
            <style jsx>{`
              @keyframes slideUp {
                from {
                  opacity: 0;
                  transform: translateY(20px) scale(0.95);
                }
                to {
                  opacity: 1;
                  transform: translateY(0) scale(1);
                }
              }
            `}</style>

            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">
                Invest in {plans.find(p => p.id === selectedPlan)?.name}
              </h2>
              <button 
                onClick={() => setShowInvestModal(false)}
                className="w-8 h-8 rounded-full bg-[#333333] hover:bg-[#3a3a3a] flex items-center justify-center transition-all"
              >
                <i data-lucide="x" className="w-4 h-4"></i>
              </button>
            </div>

            {/* Amount Input */}
            <div className="mb-4">
              <label className="text-sm text-neutral-400 mb-2 block">Investment Amount</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">₦</span>
                <input
                  type="number"
                  value={investAmount}
                  onChange={(e) => setInvestAmount(e.target.value)}
                  placeholder="50,000"
                  className="w-full h-12 bg-[#333333] border border-neutral-700 rounded-xl pl-8 pr-4 focus:outline-none focus:border-green-500 transition-all"
                />
              </div>
              <div className="text-xs text-neutral-500 mt-1">
                Min: ₦{plans.find(p => p.id === selectedPlan)?.minAmount.toLocaleString()} • 
                Max: ₦{plans.find(p => p.id === selectedPlan)?.maxAmount.toLocaleString()}
              </div>
            </div>

            {/* Duration Selection */}
            <div className="mb-6">
              <label className="text-sm text-neutral-400 mb-2 block">Duration (Months)</label>
              <div className="grid grid-cols-4 gap-2">
                {['3', '6', '12', '24'].map((months) => (
                  <button
                    key={months}
                    onClick={() => setDuration(months)}
                    className={`h-10 rounded-lg font-medium transition-all ${
                      duration === months
                        ? 'bg-green-500 text-white'
                        : 'bg-[#333333] text-neutral-400 hover:bg-[#3a3a3a]'
                    }`}
                  >
                    {months}M
                  </button>
                ))}
              </div>
            </div>

            {/* Returns Calculation */}
            {investAmount && (
              <div className="bg-[#333333] rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-neutral-400">Estimated Returns</span>
                  <span className="text-lg font-semibold text-green-500">
                    +₦{calculateReturns()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-400">Total Value</span>
                  <span className="text-lg font-semibold">
                    ₦{(parseFloat(investAmount) + parseFloat(calculateReturns())).toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowInvestModal(false)}
                className="h-12 bg-[#333333] hover:bg-[#3a3a3a] rounded-xl font-medium transition-all"
              >
                Cancel
              </button>
              <button
                className="h-12 bg-green-500 hover:bg-green-600 rounded-xl font-medium transition-all active:scale-95"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="border-b border-neutral-700 bg-[#1c1c1c]/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <button className="w-9 h-9 rounded-full bg-[#2a2a2a] hover:bg-[#333333] transition-all flex items-center justify-center">
                <i data-lucide="arrow-left" className="w-4 h-4"></i>
              </button>
              <div className="text-lg font-semibold">Investment Plans</div>
            </div>
            
            <div className="flex items-center gap-4">
              <button className="w-9 h-9 rounded-full bg-[#2a2a2a] hover:bg-[#333333] transition-all flex items-center justify-center">
                <i data-lucide="bell" className="w-4 h-4"></i>
              </button>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-sm font-medium">
                JD
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        
        {/* Header Section */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-semibold">Choose Your Plan</h1>
          <p className="text-neutral-400">Select an investment plan that matches your financial goals</p>
        </div>

        {/* Current Portfolio Summary */}
        <div className="bg-[#262626] border border-neutral-700 rounded-xl sm:rounded-2xl p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <div className="text-sm text-neutral-400 mb-1">Total Invested</div>
              <div className="text-2xl font-semibold">₦361,910</div>
            </div>
            <div>
              <div className="text-sm text-neutral-400 mb-1">Active Plans</div>
              <div className="text-2xl font-semibold">3</div>
            </div>
            <div>
              <div className="text-sm text-neutral-400 mb-1">Total Returns</div>
              <div className="text-2xl font-semibold text-green-500">+₦54,320</div>
            </div>
          </div>
        </div>

        {/* Investment Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-[#262626] border rounded-xl sm:rounded-2xl p-6 hover:border-green-500/50 transition-all ${
                plan.popular ? 'border-green-500' : 'border-neutral-700'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-6">
                  <div className="bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    Most Popular
                  </div>
                </div>
              )}

              {/* Plan Header */}
              <div className="mb-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-xl font-semibold mb-1">{plan.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-neutral-400">{plan.duration}</span>
                      <span className="w-1 h-1 rounded-full bg-neutral-600"></span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        plan.risk === 'Low' ? 'bg-green-500/10 text-green-500' :
                        plan.risk === 'Medium' ? 'bg-yellow-500/10 text-yellow-500' :
                        'bg-red-500/10 text-red-500'
                      }`}>
                        {plan.risk} Risk
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-green-500">{plan.returnRate}%</div>
                    <div className="text-xs text-neutral-400">Annual Return</div>
                  </div>
                </div>

                <div className="bg-[#2a2a2a] rounded-lg p-3">
                  <div className="text-xs text-neutral-400 mb-1">Investment Range</div>
                  <div className="text-sm font-medium">
                    ₦{plan.minAmount.toLocaleString()} - ₦{plan.maxAmount.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="mb-6 space-y-3">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                      <i data-lucide="check" className="w-3 h-3 text-green-500"></i>
                    </div>
                    <span className="text-sm text-neutral-300">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Action Button */}
              <button
                onClick={() => handleInvest(plan.id)}
                className="w-full h-12 bg-green-500 hover:bg-green-600 rounded-xl font-medium transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <i data-lucide="trending-up" className="w-4 h-4"></i>
                Invest Now
              </button>
            </div>
          ))}
        </div>

        {/* Active Investments */}
        <div className="bg-[#262626] border border-neutral-700 rounded-xl sm:rounded-2xl overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-neutral-700">
            <h3 className="font-medium">Active Investments</h3>
          </div>
          
          <div className="divide-y divide-neutral-700">
            {[
              {
                plan: 'Growth Plan',
                amount: 150000,
                startDate: 'Jan 15, 2026',
                maturityDate: 'Jul 15, 2026',
                returns: 18000,
                progress: 25
              },
              {
                plan: 'Premium Plan',
                amount: 800000,
                startDate: 'Dec 01, 2025',
                maturityDate: 'Dec 01, 2026',
                returns: 120000,
                progress: 18
              },
              {
                plan: 'Starter Plan',
                amount: 50000,
                startDate: 'Feb 01, 2026',
                maturityDate: 'May 01, 2026',
                returns: 4000,
                progress: 8
              }
            ].map((investment, index) => (
              <div key={index} className="p-4 sm:p-6 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium mb-1">{investment.plan}</div>
                    <div className="text-sm text-neutral-400">
                      Started: {investment.startDate}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">₦{investment.amount.toLocaleString()}</div>
                    <div className="text-sm text-green-500">+₦{investment.returns.toLocaleString()}</div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div>
                  <div className="flex items-center justify-between mb-2 text-xs text-neutral-400">
                    <span>Progress</span>
                    <span>{investment.progress}% Complete</span>
                  </div>
                  <div className="w-full bg-[#2a2a2a] rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all" 
                      style={{ width: `${investment.progress}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-neutral-500 mt-1">
                    Matures: {investment.maturityDate}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button className="h-9 bg-[#2a2a2a] hover:bg-[#333333] rounded-lg text-sm font-medium transition-all">
                    View Details
                  </button>
                  <button className="h-9 bg-[#2a2a2a] hover:bg-[#333333] rounded-lg text-sm font-medium transition-all">
                    Add Funds
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
              <i data-lucide="info" className="w-6 h-6 text-green-500"></i>
            </div>
            <div>
              <h3 className="font-medium mb-2">Investment Protection</h3>
              <p className="text-sm text-neutral-300 mb-3">
                All investments are protected by our secure platform and backed by regulated financial institutions. 
                Your capital is safe and returns are guaranteed based on the selected plan.
              </p>
              <button className="text-sm text-green-500 hover:text-green-400 font-medium flex items-center gap-1">
                Learn More
                <i data-lucide="arrow-right" className="w-4 h-4"></i>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Spacing */}
        <div className="h-8"></div>
      </main>
    </div>
  );
}
