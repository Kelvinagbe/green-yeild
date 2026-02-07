'use client';

import { useEffect, useState } from 'react';

export default function Dashboard() {
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [checkedDays, setCheckedDays] = useState([1, 2, 3]);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).lucide) {
      (window as any).lucide.createIcons();
    }
  }, []);

  const handleCheckIn = () => {
    setIsChecking(true);
    setTimeout(() => {
      setCheckedDays([...checkedDays, checkedDays.length + 1]);
      setIsChecking(false);
      setTimeout(() => setShowCheckIn(false), 1500);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#1c1c1c] text-white">
      <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>

      {/* Check-in Modal */}
      {showCheckIn && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => !isChecking && setShowCheckIn(false)}
        >
          <div 
            className="bg-[#2a2a2a] border border-neutral-700 rounded-2xl p-6 max-w-md w-full transform transition-all duration-300 ease-out scale-100"
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
              @keyframes checkmark {
                0% {
                  transform: scale(0) rotate(-45deg);
                }
                50% {
                  transform: scale(1.2) rotate(-45deg);
                }
                100% {
                  transform: scale(1) rotate(-45deg);
                }
              }
              @keyframes pulse {
                0%, 100% {
                  transform: scale(1);
                }
                50% {
                  transform: scale(1.05);
                }
              }
            `}</style>

            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <i data-lucide="calendar-check" className="w-8 h-8 text-green-500"></i>
              </div>
              <h2 className="text-2xl font-semibold mb-2">Daily Check-in</h2>
              <p className="text-neutral-400 text-sm">Keep your streak going!</p>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2 mb-6">
              {[1, 2, 3, 4, 5, 6, 7].map((day) => {
                const isChecked = checkedDays.includes(day);
                const isCheckingNow = isChecking && day === checkedDays.length + 1;
                
                return (
                  <div
                    key={day}
                    className={`aspect-square rounded-lg flex flex-col items-center justify-center transition-all duration-300 ${
                      isChecked
                        ? 'bg-green-500 text-white'
                        : 'bg-[#3a3a3a] text-neutral-400'
                    }`}
                    style={isCheckingNow ? { animation: 'pulse 0.8s ease-in-out' } : {}}
                  >
                    <div className="text-xs mb-1 opacity-60">Day</div>
                    <div className="text-lg font-semibold">{day}</div>
                    {isChecked && (
                      <div 
                        className="absolute"
                        style={
                          day === checkedDays[checkedDays.length - 1] && !isChecking
                            ? { animation: 'checkmark 0.4s ease-out' }
                            : {}
                        }
                      >
                        <i data-lucide="check" className="w-4 h-4"></i>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Streak Info */}
            <div className="bg-[#333333] rounded-xl p-4 mb-6 flex items-center justify-between">
              <div>
                <div className="text-sm text-neutral-400">Current Streak</div>
                <div className="text-2xl font-semibold text-green-500">{checkedDays.length} days</div>
              </div>
              <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center">
                <i data-lucide="flame" className="w-6 h-6 text-green-500"></i>
              </div>
            </div>

            {/* Check-in Button */}
            {checkedDays.length < 7 && (
              <button
                onClick={handleCheckIn}
                disabled={isChecking}
                className={`w-full h-12 bg-green-500 hover:bg-green-600 rounded-xl font-medium transition-all active:scale-95 flex items-center justify-center gap-2 ${
                  isChecking ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isChecking ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Checking in...
                  </>
                ) : (
                  <>
                    <i data-lucide="check-circle" className="w-5 h-5"></i>
                    Check In • Day {checkedDays.length + 1}
                  </>
                )}
              </button>
            )}

            {checkedDays.length === 7 && (
              <div className="text-center">
                <div className="text-green-500 font-medium mb-2">🎉 Week Complete!</div>
                <button
                  onClick={() => setShowCheckIn(false)}
                  className="w-full h-12 bg-[#333333] hover:bg-[#3a3a3a] rounded-xl font-medium transition-all"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Header - Minimal */}
      <header className="border-b border-neutral-700 bg-[#1c1c1c]/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="text-lg font-semibold">Green Yield</div>
            
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
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        
        {/* User Greeting */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-medium">John Doe</h1>
          <p className="text-sm text-neutral-400">Premium Member</p>
        </div>

        {/* Balance Card - Thick Green Border */}
        <div className="relative group">
          <div className="absolute -inset-[2px] bg-gradient-to-br from-green-500 to-green-600 rounded-2xl sm:rounded-3xl opacity-100"></div>
          <div className="relative bg-[#1c1c1c] rounded-2xl sm:rounded-3xl p-6 sm:p-8 space-y-6">
            
            {/* Balance */}
            <div className="space-y-2">
              <div className="text-sm text-neutral-400">Total Balance</div>
              <div className="text-4xl sm:text-5xl font-semibold tracking-tight">
                ₦487,250.00
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
              <button className="h-12 bg-[#2a2a2a] hover:bg-[#333333] rounded-xl font-medium transition-all active:scale-95 flex items-center justify-center gap-2">
                <i data-lucide="arrow-up-right" className="w-4 h-4"></i>
                Withdraw
              </button>
            </div>
          </div>
        </div>

        {/* Invest Button */}
        <button className="w-full h-14 bg-[#262626] hover:bg-[#2a2a2a] border border-neutral-700 hover:border-neutral-600 rounded-xl font-medium transition-all active:scale-[0.98] flex items-center justify-center gap-2">
          <i data-lucide="trending-up" className="w-5 h-5"></i>
          Start Investing
        </button>

        {/* Daily Check-in */}
        <div className="bg-[#262626] border border-neutral-700 rounded-xl sm:rounded-2xl p-4 sm:p-6">
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
                    : 'bg-[#3a3a3a]'
                }`}
              ></div>
            ))}
          </div>
          
          <button 
            onClick={() => setShowCheckIn(true)}
            className="w-full h-11 bg-green-500 hover:bg-green-600 rounded-lg font-medium transition-all active:scale-95"
          >
            Check In • Day 3
          </button>
        </div>

        {/* Transaction History */}
        <div className="bg-[#262626] border border-neutral-700 rounded-xl sm:rounded-2xl overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-neutral-700">
            <h3 className="font-medium">Recent Transactions</h3>
          </div>
          
          <div className="divide-y divide-neutral-700">
            {[
              {
                icon: 'arrow-down-left',
                title: 'Deposit',
                date: 'Today, 2:30 PM',
                amount: '+₦5,000',
                positive: true,
              },
              {
                icon: 'trending-up',
                title: 'Buy AAPL',
                date: 'Yesterday, 10:15 AM',
                amount: '₦2,450',
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
                amount: '+₦324',
                positive: true,
              },
              {
                icon: 'arrow-up-right',
                title: 'Withdrawal',
                date: '5 days ago',
                amount: '-₦1,500',
                positive: false,
              },
            ].map((transaction, index) => (
              <div
                key={index}
                className="p-4 sm:px-6 sm:py-4 flex items-center gap-4 hover:bg-[#2a2a2a] transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-[#2a2a2a] flex items-center justify-center flex-shrink-0">
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
          
          <button className="w-full p-4 text-sm text-neutral-400 hover:text-white hover:bg-[#2a2a2a] transition-colors">
            View All Transactions
          </button>
        </div>

        {/* Bottom Spacing */}
        <div className="h-8"></div>
      </main>
    </div>
  );
}
