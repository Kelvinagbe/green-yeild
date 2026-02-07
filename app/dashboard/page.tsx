'use client';

import { useState, useEffect } from 'react';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('1M');

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).lucide) {
      (window as any).lucide.createIcons();
    }
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-black text-white">
      <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>

      {/* Header - Minimal */}
      <header className="border-b border-neutral-900 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="text-lg font-semibold">Green Yield</div>
            
            <div className="flex items-center gap-4">
              <button className="w-9 h-9 rounded-full bg-neutral-900 hover:bg-neutral-800 transition-all flex items-center justify-center">
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
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        
        {/* User Greeting */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-medium">John Doe</h1>
          <p className="text-sm text-neutral-400">Premium Member</p>
        </div>

        {/* Balance Card - Thick Green Border */}
        <div className="relative group">
          <div className="absolute -inset-[2px] bg-gradient-to-br from-green-500 to-green-600 rounded-2xl sm:rounded-3xl opacity-100"></div>
          <div className="relative bg-black rounded-2xl sm:rounded-3xl p-6 sm:p-8 space-y-6">
            
            {/* Balance */}
            <div className="space-y-2">
              <div className="text-sm text-neutral-400">Total Balance</div>
              <div className="text-4xl sm:text-5xl font-semibold tracking-tight">
                $487,250.00
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="flex items-center gap-1 text-green-500">
                  <i data-lucide="trending-up" className="w-4 h-4"></i>
                  <span className="font-medium">+12.5%</span>
                </div>
                <span className="text-neutral-500">this month</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button className="h-12 bg-green-500 hover:bg-green-600 rounded-xl font-medium transition-all active:scale-95 flex items-center justify-center gap-2">
                <i data-lucide="arrow-down-left" className="w-4 h-4"></i>
                Deposit
              </button>
              <button className="h-12 bg-neutral-900 hover:bg-neutral-800 rounded-xl font-medium transition-all active:scale-95 flex items-center justify-center gap-2">
                <i data-lucide="arrow-up-right" className="w-4 h-4"></i>
                Withdraw
              </button>
            </div>
          </div>
        </div>

        {/* Invest Button */}
        <button className="w-full h-14 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 rounded-xl font-medium transition-all active:scale-[0.98] flex items-center justify-center gap-2">
          <i data-lucide="trending-up" className="w-5 h-5"></i>
          Start Investing
        </button>

        {/* Daily Check-in */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl sm:rounded-2xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-medium mb-1">Daily Check-in</h3>
              <p className="text-sm text-neutral-400">Earn rewards every day</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
              <i data-lucide="gift" className="w-6 h-6 text-green-500"></i>
            </div>
          </div>
          
          <div className="flex gap-2 mb-4">
            {[1, 2, 3, 4, 5, 6, 7].map((day) => (
              <div
                key={day}
                className={`flex-1 h-2 rounded-full transition-all ${
                  day <= 3
                    ? 'bg-green-500'
                    : 'bg-neutral-800'
                }`}
              ></div>
            ))}
          </div>
          
          <button className="w-full h-11 bg-green-500 hover:bg-green-600 rounded-lg font-medium transition-all active:scale-95">
            Check In • Day 3
          </button>
        </div>

        {/* Transaction History */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl sm:rounded-2xl overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-neutral-800">
            <h3 className="font-medium">Recent Transactions</h3>
          </div>
          
          <div className="divide-y divide-neutral-800">
            {[
              {
                icon: 'arrow-down-left',
                title: 'Deposit',
                date: 'Today, 2:30 PM',
                amount: '+$5,000',
                positive: true,
              },
              {
                icon: 'trending-up',
                title: 'Buy AAPL',
                date: 'Yesterday, 10:15 AM',
                amount: '$2,450',
                positive: false,
              },
              {
                icon: 'repeat',
                title: 'Auto Rebalance',
                date: '2 days ago',
                amount: 'Completed',
                positive: false,
              },
              {
                icon: 'dollar-sign',
                title: 'Dividend Received',
                date: '3 days ago',
                amount: '+$324',
                positive: true,
              },
              {
                icon: 'arrow-up-right',
                title: 'Withdrawal',
                date: '5 days ago',
                amount: '-$1,500',
                positive: false,
              },
            ].map((transaction, index) => (
              <div
                key={index}
                className="p-4 sm:px-6 sm:py-4 flex items-center gap-4 hover:bg-neutral-800/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center flex-shrink-0">
                  <i data-lucide={transaction.icon} className="w-4 h-4"></i>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm sm:text-base truncate">
                    {transaction.title}
                  </div>
                  <div className="text-xs sm:text-sm text-neutral-400">
                    {transaction.date}
                  </div>
                </div>
                
                <div
                  className={`font-medium text-sm sm:text-base flex-shrink-0 ${
                    transaction.positive
                      ? 'text-green-500'
                      : transaction.amount.startsWith('-')
                      ? 'text-red-500'
                      : 'text-neutral-400'
                  }`}
                >
                  {transaction.amount}
                </div>
              </div>
            ))}
          </div>
          
          <button className="w-full p-4 text-sm text-neutral-400 hover:text-white hover:bg-neutral-800/50 transition-colors">
            View All Transactions
          </button>
        </div>

        {/* Performance Chart */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Performance</h3>
            <div className="flex gap-1 bg-neutral-800 rounded-lg p-1">
              {['1W', '1M', '3M', '1Y'].map((period) => (
                <button
                  key={period}
                  onClick={() => setActiveTab(period)}
                  className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
                    activeTab === period
                      ? 'bg-neutral-700 text-white'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>

          {/* Chart */}
          <div className="relative h-48 sm:h-64">
            <svg viewBox="0 0 800 200" className="w-full h-full">
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#22c55e', stopOpacity: 0.2 }} />
                  <stop offset="100%" style={{ stopColor: '#22c55e', stopOpacity: 0 }} />
                </linearGradient>
              </defs>
              
              {/* Grid lines */}
              {[0, 50, 100, 150, 200].map((y) => (
                <line
                  key={y}
                  x1="0"
                  y1={y}
                  x2="800"
                  y2={y}
                  stroke="#262626"
                  strokeWidth="1"
                />
              ))}
              
              {/* Area under curve */}
              <path
                d="M 0 180 L 100 160 L 200 140 L 300 150 L 400 110 L 500 80 L 600 90 L 700 50 L 800 60 L 800 200 L 0 200 Z"
                fill="url(#gradient)"
              />
              
              {/* Line */}
              <path
                d="M 0 180 L 100 160 L 200 140 L 300 150 L 400 110 L 500 80 L 600 90 L 700 50 L 800 60"
                fill="none"
                stroke="#22c55e"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-neutral-800">
            <div>
              <div className="text-xs text-neutral-400 mb-1">Invested</div>
              <div className="font-medium">$361,910</div>
            </div>
            <div>
              <div className="text-xs text-neutral-400 mb-1">Returns</div>
              <div className="font-medium text-green-500">+$54,320</div>
            </div>
            <div>
              <div className="text-xs text-neutral-400 mb-1">Growth</div>
              <div className="font-medium text-green-500">+15.3%</div>
            </div>
          </div>
        </div>

        {/* Bottom Spacing */}
        <div className="h-8"></div>
      </main>
    </div>
  );
}
