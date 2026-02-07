'use client';

import { useState, useEffect } from 'react';

export default function Dashboard() {
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).lucide) {
      (window as any).lucide.createIcons();
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-gray-100">
      <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>

      {/* Header */}
      <header className="bg-[#0f0f0f] border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold bg-gradient-to-r from-green-500 to-green-400 bg-clip-text text-transparent">
            Green Yield
          </div>
          
          <div className="flex items-center gap-6">
            <button className="text-gray-400 hover:text-white transition-colors">
              <i data-lucide="bell" data-lucide-size="20"></i>
            </button>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-sm font-medium text-white">John Doe</div>
                <div className="text-xs text-gray-400">Premium Member</div>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white font-bold">
                JD
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Welcome back, John 👋
          </h1>
          <p className="text-gray-400">Here's what's happening with your investments today.</p>
        </div>

        {/* Balance Card - Minimal Design */}
        <div className="bg-gradient-to-br from-green-600 to-green-500 rounded-3xl p-8 md:p-10 mb-8 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-black/10 rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            <div className="mb-6">
              <div className="text-white/80 text-sm font-medium mb-2">Total Portfolio Value</div>
              <div className="text-white text-5xl md:text-7xl font-extrabold tracking-tight mb-4">
                $487,250.00
              </div>
              <div className="flex items-center gap-3">
                <div className="px-4 py-2 bg-white/20 backdrop-blur rounded-full text-white font-semibold flex items-center gap-2">
                  <i data-lucide="trending-up" data-lucide-size="16"></i>
                  <span>+12.5%</span>
                </div>
                <span className="text-white/80">+$54,320 this month</span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3 mt-8">
              <button className="px-6 py-3 bg-white text-green-600 rounded-full font-semibold hover:bg-white/90 transition-all flex items-center gap-2">
                <i data-lucide="plus" data-lucide-size="18"></i>
                Deposit
              </button>
              <button className="px-6 py-3 bg-white/10 backdrop-blur border border-white/30 text-white rounded-full font-semibold hover:bg-white/20 transition-all flex items-center gap-2">
                <i data-lucide="arrow-up-right" data-lucide-size="18"></i>
                Withdraw
              </button>
              <button className="px-6 py-3 bg-white/10 backdrop-blur border border-white/30 text-white rounded-full font-semibold hover:bg-white/20 transition-all flex items-center gap-2">
                <i data-lucide="repeat" data-lucide-size="18"></i>
                Transfer
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-[#0f0f0f] border border-gray-800 rounded-2xl p-6 hover:border-green-500/50 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center text-green-400">
                <i data-lucide="wallet" data-lucide-size="24"></i>
              </div>
              <div className="text-green-400 text-sm font-semibold">+8.2%</div>
            </div>
            <div className="text-gray-400 text-sm mb-1">Available Balance</div>
            <div className="text-white text-2xl font-bold">$125,340</div>
          </div>

          <div className="bg-[#0f0f0f] border border-gray-800 rounded-2xl p-6 hover:border-green-500/50 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center text-green-400">
                <i data-lucide="trending-up" data-lucide-size="24"></i>
              </div>
              <div className="text-green-400 text-sm font-semibold">+15.3%</div>
            </div>
            <div className="text-gray-400 text-sm mb-1">Invested</div>
            <div className="text-white text-2xl font-bold">$361,910</div>
          </div>

          <div className="bg-[#0f0f0f] border border-gray-800 rounded-2xl p-6 hover:border-green-500/50 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center text-green-400">
                <i data-lucide="dollar-sign" data-lucide-size="24"></i>
              </div>
              <div className="text-green-400 text-sm font-semibold">+24.1%</div>
            </div>
            <div className="text-gray-400 text-sm mb-1">Total Returns</div>
            <div className="text-white text-2xl font-bold">$54,320</div>
          </div>

          <div className="bg-[#0f0f0f] border border-gray-800 rounded-2xl p-6 hover:border-green-500/50 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center text-green-400">
                <i data-lucide="pie-chart" data-lucide-size="24"></i>
              </div>
              <div className="text-gray-400 text-sm font-semibold">Active</div>
            </div>
            <div className="text-gray-400 text-sm mb-1">Total Assets</div>
            <div className="text-white text-2xl font-bold">24</div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Portfolio Allocation */}
          <div className="lg:col-span-2 bg-[#0f0f0f] border border-gray-800 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-6">Portfolio Allocation</h2>
            
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-gray-300">Stocks</span>
                  </div>
                  <span className="text-white font-semibold">45% ($163,359)</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div className="bg-gradient-to-r from-green-600 to-green-400 h-2 rounded-full" style={{width: '45%'}}></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    <span className="text-gray-300">Bonds</span>
                  </div>
                  <span className="text-white font-semibold">30% ($108,573)</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div className="bg-gradient-to-r from-green-500 to-green-300 h-2 rounded-full" style={{width: '30%'}}></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-green-300"></div>
                    <span className="text-gray-300">Crypto</span>
                  </div>
                  <span className="text-white font-semibold">15% ($54,287)</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div className="bg-gradient-to-r from-green-400 to-green-200 h-2 rounded-full" style={{width: '15%'}}></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-green-200"></div>
                    <span className="text-gray-300">ETFs</span>
                  </div>
                  <span className="text-white font-semibold">10% ($36,191)</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div className="bg-gradient-to-r from-green-300 to-green-100 h-2 rounded-full" style={{width: '10%'}}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-[#0f0f0f] border border-gray-800 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-6">Recent Activity</h2>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-4 border-b border-gray-800">
                <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-400">
                  <i data-lucide="arrow-down-left" data-lucide-size="18"></i>
                </div>
                <div className="flex-1">
                  <div className="text-white font-medium">Deposit</div>
                  <div className="text-gray-400 text-sm">Today, 2:30 PM</div>
                </div>
                <div className="text-green-400 font-semibold">+$5,000</div>
              </div>

              <div className="flex items-center gap-3 pb-4 border-b border-gray-800">
                <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-400">
                  <i data-lucide="trending-up" data-lucide-size="18"></i>
                </div>
                <div className="flex-1">
                  <div className="text-white font-medium">Buy AAPL</div>
                  <div className="text-gray-400 text-sm">Yesterday, 10:15 AM</div>
                </div>
                <div className="text-white font-semibold">$2,450</div>
              </div>

              <div className="flex items-center gap-3 pb-4 border-b border-gray-800">
                <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-400">
                  <i data-lucide="repeat" data-lucide-size="18"></i>
                </div>
                <div className="flex-1">
                  <div className="text-white font-medium">Rebalance</div>
                  <div className="text-gray-400 text-sm">2 days ago</div>
                </div>
                <div className="text-gray-400 font-semibold">Auto</div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-400">
                  <i data-lucide="dollar-sign" data-lucide-size="18"></i>
                </div>
                <div className="flex-1">
                  <div className="text-white font-medium">Dividend</div>
                  <div className="text-gray-400 text-sm">3 days ago</div>
                </div>
                <div className="text-green-400 font-semibold">+$324</div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Chart */}
        <div className="mt-6 bg-[#0f0f0f] border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Performance</h2>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-semibold">1M</button>
              <button className="px-4 py-2 bg-[#1a1a1a] text-gray-400 rounded-lg text-sm hover:bg-gray-800">3M</button>
              <button className="px-4 py-2 bg-[#1a1a1a] text-gray-400 rounded-lg text-sm hover:bg-gray-800">1Y</button>
              <button className="px-4 py-2 bg-[#1a1a1a] text-gray-400 rounded-lg text-sm hover:bg-gray-800">ALL</button>
            </div>
          </div>
          
          {/* Chart */}
          <div className="relative h-64">
            <svg viewBox="0 0 800 200" className="w-full h-full">
              <defs>
                <linearGradient id="performanceGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style={{stopColor: '#22c55e', stopOpacity: 0.3}} />
                  <stop offset="100%" style={{stopColor: '#22c55e', stopOpacity: 0}} />
                </linearGradient>
              </defs>
              <path
                d="M 0 180 L 100 160 L 200 140 L 300 150 L 400 110 L 500 80 L 600 90 L 700 50 L 800 60"
                fill="url(#performanceGradient)"
              />
              <path
                d="M 0 180 L 100 160 L 200 140 L 300 150 L 400 110 L 500 80 L 600 90 L 700 50 L 800 60"
                fill="none"
                stroke="#22c55e"
                strokeWidth="3"
              />
              {[0, 100, 200, 300, 400, 500, 600, 700, 800].map((x, i) => {
                const y = [180, 160, 140, 150, 110, 80, 90, 50, 60][i];
                return <circle key={i} cx={x} cy={y} r="5" fill="#22c55e" />;
              })}
            </svg>
          </div>
        </div>
      </main>
    </div>
  );
}