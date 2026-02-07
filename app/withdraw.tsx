'use client';

import { useEffect, useState } from 'react';

export default function Withdraw() {
  const [amount, setAmount] = useState('');
  const [selectedBank, setSelectedBank] = useState<number | null>(null);
  const [showAddBank, setShowAddBank] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).lucide) {
      (window as any).lucide.createIcons();
    }
  }, [showAddBank, showConfirmation, selectedBank]);

  const availableBalance = 125340;

  const bankAccounts = [
    {
      id: 1,
      bankName: 'Access Bank',
      accountNumber: '0123456789',
      accountName: 'John Doe',
      isPrimary: true
    },
    {
      id: 2,
      bankName: 'GTBank',
      accountNumber: '0987654321',
      accountName: 'John Doe',
      isPrimary: false
    },
    {
      id: 3,
      bankName: 'First Bank',
      accountNumber: '1234567890',
      accountName: 'John Doe',
      isPrimary: false
    }
  ];

  const quickAmounts = [5000, 10000, 25000, 50000, 100000];

  const handleWithdraw = () => {
    setShowConfirmation(true);
  };

  const confirmWithdraw = () => {
    setWithdrawing(true);
    setTimeout(() => {
      setWithdrawing(false);
      setShowConfirmation(false);
      setAmount('');
      setSelectedBank(null);
      // Show success message or redirect
    }, 2000);
  };

  const calculateFee = () => {
    if (!amount) return 0;
    const withdrawAmount = parseFloat(amount);
    // 1.5% fee, max ₦100
    return Math.min(withdrawAmount * 0.015, 100);
  };

  const totalAmount = () => {
    if (!amount) return 0;
    return parseFloat(amount) + calculateFee();
  };

  return (
    <div className="min-h-screen bg-[#1c1c1c] text-white">
      <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>

      {/* Add Bank Modal */}
      {showAddBank && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowAddBank(false)}
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
              <h2 className="text-xl font-semibold">Add Bank Account</h2>
              <button 
                onClick={() => setShowAddBank(false)}
                className="w-8 h-8 rounded-full bg-[#333333] hover:bg-[#3a3a3a] flex items-center justify-center transition-all"
              >
                <i data-lucide="x" className="w-4 h-4"></i>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-neutral-400 mb-2 block">Bank Name</label>
                <select className="w-full h-12 bg-[#333333] border border-neutral-700 rounded-xl px-4 focus:outline-none focus:border-green-500 transition-all">
                  <option value="">Select your bank</option>
                  <option value="access">Access Bank</option>
                  <option value="gtb">GTBank</option>
                  <option value="firstbank">First Bank</option>
                  <option value="uba">UBA</option>
                  <option value="zenith">Zenith Bank</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-neutral-400 mb-2 block">Account Number</label>
                <input
                  type="text"
                  placeholder="0123456789"
                  maxLength={10}
                  className="w-full h-12 bg-[#333333] border border-neutral-700 rounded-xl px-4 focus:outline-none focus:border-green-500 transition-all"
                />
              </div>

              <div>
                <label className="text-sm text-neutral-400 mb-2 block">Account Name</label>
                <input
                  type="text"
                  placeholder="Will be auto-filled"
                  disabled
                  className="w-full h-12 bg-[#333333] border border-neutral-700 rounded-xl px-4 text-neutral-500"
                />
              </div>

              <button className="w-full h-12 bg-green-500 hover:bg-green-600 rounded-xl font-medium transition-all active:scale-95">
                Add Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => !withdrawing && setShowConfirmation(false)}
        >
          <div 
            className="bg-[#2a2a2a] border border-neutral-700 rounded-2xl p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
            style={{
              animation: 'slideUp 0.3s ease-out'
            }}
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <i data-lucide="arrow-up-right" className="w-8 h-8 text-green-500"></i>
              </div>
              <h2 className="text-2xl font-semibold mb-2">Confirm Withdrawal</h2>
              <p className="text-neutral-400 text-sm">Please review your withdrawal details</p>
            </div>

            <div className="bg-[#333333] rounded-xl p-4 mb-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-400">Amount</span>
                <span className="font-semibold">₦{parseFloat(amount).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-400">Fee</span>
                <span className="font-semibold">₦{calculateFee().toFixed(2)}</span>
              </div>
              <div className="h-px bg-neutral-700"></div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-400">Total</span>
                <span className="text-lg font-semibold text-green-500">₦{totalAmount().toLocaleString()}</span>
              </div>
            </div>

            <div className="bg-[#333333] rounded-xl p-4 mb-6">
              <div className="text-xs text-neutral-400 mb-2">To Account</div>
              <div className="font-medium">
                {bankAccounts.find(b => b.id === selectedBank)?.bankName}
              </div>
              <div className="text-sm text-neutral-400">
                {bankAccounts.find(b => b.id === selectedBank)?.accountNumber} • {bankAccounts.find(b => b.id === selectedBank)?.accountName}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowConfirmation(false)}
                disabled={withdrawing}
                className="h-12 bg-[#333333] hover:bg-[#3a3a3a] rounded-xl font-medium transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmWithdraw}
                disabled={withdrawing}
                className="h-12 bg-green-500 hover:bg-green-600 rounded-xl font-medium transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {withdrawing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Processing...
                  </>
                ) : (
                  'Confirm'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="border-b border-neutral-700 bg-[#1c1c1c]/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <button className="w-9 h-9 rounded-full bg-[#2a2a2a] hover:bg-[#333333] transition-all flex items-center justify-center">
                <i data-lucide="arrow-left" className="w-4 h-4"></i>
              </button>
              <div className="text-lg font-semibold">Withdraw</div>
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
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        
        {/* Available Balance */}
        <div className="bg-[#262626] border border-neutral-700 rounded-xl sm:rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-neutral-400 mb-1">Available Balance</div>
              <div className="text-3xl font-semibold">₦{availableBalance.toLocaleString()}</div>
            </div>
            <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center">
              <i data-lucide="wallet" className="w-6 h-6 text-green-500"></i>
            </div>
          </div>
        </div>

        {/* Withdrawal Amount */}
        <div className="bg-[#262626] border border-neutral-700 rounded-xl sm:rounded-2xl p-6 space-y-4">
          <h3 className="font-medium">Enter Amount</h3>
          
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl text-neutral-400">₦</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full h-16 bg-[#2a2a2a] border border-neutral-700 rounded-xl pl-12 pr-4 text-2xl font-semibold focus:outline-none focus:border-green-500 transition-all"
            />
          </div>

          {/* Quick Amount Buttons */}
          <div>
            <div className="text-xs text-neutral-400 mb-2">Quick Select</div>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {quickAmounts.map((quickAmount) => (
                <button
                  key={quickAmount}
                  onClick={() => setAmount(quickAmount.toString())}
                  className="h-10 bg-[#2a2a2a] hover:bg-[#333333] border border-neutral-700 hover:border-green-500 rounded-lg text-sm font-medium transition-all"
                >
                  ₦{(quickAmount / 1000)}K
                </button>
              ))}
            </div>
          </div>

          {/* Fee Information */}
          {amount && parseFloat(amount) > 0 && (
            <div className="bg-[#2a2a2a] rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-400">Withdrawal Amount</span>
                <span>₦{parseFloat(amount).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-400">Transaction Fee (1.5%)</span>
                <span>₦{calculateFee().toFixed(2)}</span>
              </div>
              <div className="h-px bg-neutral-700"></div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-400">You'll Receive</span>
                <span className="text-lg font-semibold text-green-500">₦{parseFloat(amount).toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>

        {/* Select Bank Account */}
        <div className="bg-[#262626] border border-neutral-700 rounded-xl sm:rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Select Bank Account</h3>
            <button 
              onClick={() => setShowAddBank(true)}
              className="text-sm text-green-500 hover:text-green-400 font-medium flex items-center gap-1"
            >
              <i data-lucide="plus" className="w-4 h-4"></i>
              Add New
            </button>
          </div>

          <div className="space-y-3">
            {bankAccounts.map((bank) => (
              <button
                key={bank.id}
                onClick={() => setSelectedBank(bank.id)}
                className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                  selectedBank === bank.id
                    ? 'border-green-500 bg-green-500/5'
                    : 'border-neutral-700 bg-[#2a2a2a] hover:border-neutral-600'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      selectedBank === bank.id ? 'bg-green-500' : 'bg-[#333333]'
                    }`}>
                      <i data-lucide="building-2" className={`w-5 h-5 ${
                        selectedBank === bank.id ? 'text-white' : 'text-neutral-400'
                      }`}></i>
                    </div>
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        {bank.bankName}
                        {bank.isPrimary && (
                          <span className="text-xs px-2 py-0.5 bg-green-500/20 text-green-500 rounded-full">
                            Primary
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-neutral-400 mt-1">
                        {bank.accountNumber}
                      </div>
                      <div className="text-sm text-neutral-400">
                        {bank.accountName}
                      </div>
                    </div>
                  </div>
                  {selectedBank === bank.id && (
                    <i data-lucide="check-circle" className="w-5 h-5 text-green-500"></i>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Withdrawals */}
        <div className="bg-[#262626] border border-neutral-700 rounded-xl sm:rounded-2xl overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-neutral-700">
            <h3 className="font-medium">Recent Withdrawals</h3>
          </div>
          
          <div className="divide-y divide-neutral-700">
            {[
              {
                amount: 50000,
                bank: 'Access Bank',
                account: '0123456789',
                date: 'Jan 28, 2026',
                status: 'Completed',
                statusColor: 'green'
              },
              {
                amount: 25000,
                bank: 'GTBank',
                account: '0987654321',
                date: 'Jan 20, 2026',
                status: 'Completed',
                statusColor: 'green'
              },
              {
                amount: 15000,
                bank: 'First Bank',
                account: '1234567890',
                date: 'Jan 15, 2026',
                status: 'Completed',
                statusColor: 'green'
              }
            ].map((withdrawal, index) => (
              <div
                key={index}
                className="p-4 sm:px-6 sm:py-4 flex items-center justify-between hover:bg-[#2a2a2a] transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#2a2a2a] flex items-center justify-center flex-shrink-0">
                    <i data-lucide="arrow-up-right" className="w-4 h-4"></i>
                  </div>
                  <div>
                    <div className="font-medium text-sm sm:text-base">
                      {withdrawal.bank}
                    </div>
                    <div className="text-xs sm:text-sm text-neutral-400">
                      {withdrawal.account} • {withdrawal.date}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-sm sm:text-base">
                    ₦{withdrawal.amount.toLocaleString()}
                  </div>
                  <div className={`text-xs text-${withdrawal.statusColor}-500`}>
                    {withdrawal.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Withdraw Button */}
        <button
          onClick={handleWithdraw}
          disabled={!amount || parseFloat(amount) <= 0 || !selectedBank || parseFloat(amount) > availableBalance}
          className="w-full h-14 bg-green-500 hover:bg-green-600 rounded-xl font-medium transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-green-500"
        >
          <i data-lucide="arrow-up-right" className="w-5 h-5"></i>
          Withdraw ₦{amount ? parseFloat(amount).toLocaleString() : '0'}
        </button>

        {/* Info Banner */}
        <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <i data-lucide="info" className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5"></i>
            <div className="text-sm text-neutral-300">
              <strong>Processing Time:</strong> Withdrawals are typically processed within 24 hours on business days. A fee of 1.5% (max ₦100) applies to all withdrawals.
            </div>
          </div>
        </div>

        {/* Bottom Spacing */}
        <div className="h-8"></div>
      </main>
    </div>
  );
}
