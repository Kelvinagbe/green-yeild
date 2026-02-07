'use client';

import { useState, useEffect } from 'react';

const features = [
  { icon: 'TrendingUp', title: 'AI-Powered Analytics', desc: 'Leverage cutting-edge artificial intelligence to analyze market trends and optimize your portfolio in real-time.' },
  { icon: 'Shield', title: 'Bank-Level Security', desc: 'Your investments are protected with military-grade encryption and multi-factor authentication protocols.' },
  { icon: 'Target', title: 'Personalized Strategy', desc: 'Custom investment plans tailored to your risk tolerance, financial goals, and timeline.' },
  { icon: 'Smartphone', title: 'Mobile Trading', desc: 'Manage your portfolio on-the-go with our intuitive mobile app. Trade anytime, anywhere.' },
  { icon: 'Gem', title: 'Diversified Assets', desc: 'Access stocks, bonds, ETFs, crypto, and alternative investments all in one platform.' },
  { icon: 'Users', title: 'Expert Advisors', desc: 'Get personalized guidance from certified financial advisors with decades of experience.' }
];

const stats = [
  { value: '$2.4B+', label: 'Assets Under Management' },
  { value: '150K+', label: 'Active Investors' },
  { value: '12.8%', label: 'Average Annual Return' },
  { value: '24/7', label: 'Market Monitoring' }
];

const plans = [
  { name: 'Conservative Growth', apy: '5-7%', risk: 'Low Risk', items: ['Bonds & blue-chip stocks', 'Stable returns', 'Capital preservation', 'Ideal for beginners'] },
  { name: 'Balanced Portfolio', apy: '8-12%', risk: 'Medium Risk', items: ['Mixed asset allocation', 'Growth & stability', 'Diversified strategy', 'Most popular choice'] },
  { name: 'Aggressive Growth', apy: '15-20%', risk: 'High Risk', items: ['Tech & emerging markets', 'Active management', 'Maximum returns', 'For experienced investors'] },
  { name: 'Crypto Frontier', apy: '20-35%', risk: 'Very High Risk', items: ['DeFi & Web3 assets', 'High volatility', 'Cutting-edge tech', 'Maximum growth potential'] }
];

const testimonials = [
  { name: 'Sarah Mitchell', role: 'Tech Entrepreneur', text: 'Green Yield transformed my investment strategy. Their AI-driven insights helped me achieve 18% returns last year.' },
  { name: 'James Rodriguez', role: 'Retired Executive', text: 'The personalized approach and expert advisors gave me confidence in my retirement planning. Highly recommend!' },
  { name: 'Emily Chen', role: 'Small Business Owner', text: 'Easy to use platform with transparent fees. The mobile app makes managing my portfolio incredibly convenient.' }
];

export default function InvestmentSite() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).lucide) {
      (window as any).lucide.createIcons();
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-gray-100 overflow-x-hidden">
      <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#1a1a1a]/95 backdrop-blur-lg border-b border-gray-800">
        <nav className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold bg-gradient-to-r from-green-500 to-green-400 bg-clip-text text-transparent">
            Green Yield
          </div>
          
          <button 
            className="md:hidden text-green-500 text-2xl"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            ☰
          </button>

          <ul className={`${mobileMenuOpen ? 'flex' : 'hidden'} md:flex flex-col md:flex-row gap-8 absolute md:relative top-16 md:top-0 left-0 md:left-auto w-full md:w-auto bg-[#1a1a1a]/98 md:bg-transparent p-8 md:p-0 items-center`}>
            {['Home', 'Features', 'Plans', 'Testimonials', 'Contact'].map(link => (
              <li 
                key={link} 
                className="text-gray-300 hover:text-green-400 cursor-pointer transition-all font-medium relative group"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-green-400 group-hover:w-full transition-all duration-300"></span>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-green-500/10 rounded-full blur-3xl"></div>
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center relative z-10">
          <div className="text-center md:text-left">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 bg-gradient-to-r from-green-400 to-green-500 bg-clip-text text-transparent leading-tight">
              Invest in Your Future Today
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-10">
              Advanced portfolio management powered by AI-driven insights. Grow your wealth with confidence through data-driven investment strategies.
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center md:justify-start">
              <button className="px-10 py-4 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-full font-semibold hover:shadow-2xl hover:shadow-green-500/50 hover:-translate-y-1 transition-all duration-300">
                Start Investing
              </button>
              <button className="px-10 py-4 border-2 border-green-500 text-white rounded-full font-semibold hover:bg-green-500 hover:text-white hover:-translate-y-1 transition-all duration-300">
                View Portfolio Options
              </button>
            </div>
          </div>
          
          {/* Hero Image */}
          <div className="relative">
            <div className="relative rounded-3xl overflow-hidden border border-gray-800 bg-gradient-to-br from-[#0f0f0f] to-[#1a1a1a] p-8">
              {/* Chart Illustration */}
              <div className="space-y-4">
                {/* Growth Chart */}
                <div className="flex items-end justify-between h-48 gap-2">
                  <div className="w-full bg-gradient-to-t from-green-600 to-green-400 rounded-t-lg" style={{height: '45%'}}></div>
                  <div className="w-full bg-gradient-to-t from-green-600 to-green-400 rounded-t-lg" style={{height: '60%'}}></div>
                  <div className="w-full bg-gradient-to-t from-green-600 to-green-400 rounded-t-lg" style={{height: '75%'}}></div>
                  <div className="w-full bg-gradient-to-t from-green-600 to-green-400 rounded-t-lg" style={{height: '85%'}}></div>
                  <div className="w-full bg-gradient-to-t from-green-600 to-green-400 rounded-t-lg" style={{height: '100%'}}></div>
                </div>
                
                {/* Stats Cards */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#0f0f0f] border border-gray-800 rounded-xl p-4">
                    <div className="text-green-400 text-2xl font-bold">+24.5%</div>
                    <div className="text-gray-400 text-sm">Portfolio Growth</div>
                  </div>
                  <div className="bg-[#0f0f0f] border border-gray-800 rounded-xl p-4">
                    <div className="text-green-400 text-2xl font-bold">$125K</div>
                    <div className="text-gray-400 text-sm">Total Returns</div>
                  </div>
                </div>
              </div>
              
              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-green-500/20 rounded-full blur-xl"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-green-500/10 rounded-full blur-2xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-[#0f0f0f] border-y border-gray-800 py-16 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <div 
              key={i} 
              className="text-center p-8 bg-[#1a1a1a] rounded-2xl border border-gray-800 hover:border-green-500/50 hover:-translate-y-2 transition-all duration-300"
            >
              <div className="text-4xl md:text-5xl font-extrabold text-green-400 mb-2">{s.value}</div>
              <div className="text-gray-400 text-lg">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center text-green-400 mb-4">
            Why Choose Green Yield
          </h2>
          <p className="text-center text-gray-400 text-lg max-w-3xl mx-auto mb-12">
            Experience the power of intelligent investing with our comprehensive suite of features designed to maximize your returns.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div 
                key={i} 
                className="bg-[#0f0f0f] p-8 rounded-3xl border border-gray-800 hover:border-green-500/50 hover:-translate-y-3 hover:shadow-2xl hover:shadow-green-500/10 transition-all duration-400 relative overflow-hidden group"
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-600 to-green-400 scale-x-0 group-hover:scale-x-100 transition-transform duration-400"></div>
                <div className="text-green-400 mb-4">
                  <i data-lucide={f.icon} className="w-12 h-12" data-lucide-size="48" data-lucide-stroke-width="1.5"></i>
                </div>
                <h3 className="text-xl font-semibold text-green-400 mb-3">{f.title}</h3>
                <p className="text-gray-300 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Plans */}
      <section className="py-20 px-6 relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-green-500/10 rounded-full blur-3xl"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-center text-green-400 mb-4">
            Investment Plans
          </h2>
          <p className="text-center text-gray-400 text-lg max-w-3xl mx-auto mb-12">
            Choose the investment strategy that aligns with your financial goals and risk tolerance.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((p, i) => (
              <div 
                key={i} 
                className="bg-[#0f0f0f] p-8 rounded-3xl border border-gray-800 hover:border-green-500 hover:-translate-y-3 hover:shadow-2xl hover:shadow-green-500/20 transition-all duration-400 flex flex-col"
              >
                <div className="border-b border-gray-800 pb-6 mb-6">
                  <span className="inline-block px-4 py-1 bg-green-500/20 text-green-400 rounded-full text-sm mb-4">
                    {p.risk}
                  </span>
                  <h3 className="text-2xl font-semibold text-white mb-4">{p.name}</h3>
                  <div className="text-4xl font-extrabold text-green-400 mb-1">{p.apy}</div>
                  <div className="text-sm text-gray-400">Annual Percentage Yield</div>
                </div>
                <ul className="space-y-3 mb-6 flex-grow">
                  {p.items.map((item, idx) => (
                    <li key={idx} className="flex items-start text-gray-300">
                      <span className="text-green-400 font-bold text-lg mr-3">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
                <button className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-full font-semibold hover:shadow-xl hover:shadow-green-500/30 transition-all duration-300">
                  Get Started
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6 bg-[#0f0f0f]">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center text-green-400 mb-4">
            What Our Clients Say
          </h2>
          <p className="text-center text-gray-400 text-lg max-w-3xl mx-auto mb-12">
            Join thousands of satisfied investors who trust Green Yield with their financial future.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div 
                key={i} 
                className="bg-[#1a1a1a] p-8 rounded-3xl border border-gray-800 hover:border-gray-700 hover:-translate-y-2 transition-all duration-300"
              >
                <p className="text-gray-300 text-lg italic leading-relaxed mb-6">
                  "{t.text}"
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-600 to-green-400 flex items-center justify-center text-white font-bold text-xl">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-white font-semibold">{t.name}</h4>
                    <div className="text-gray-400 text-sm">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0f0f0f] border-t border-gray-800 py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            <div>
              <h4 className="text-green-400 font-semibold text-lg mb-4">About Green Yield</h4>
              <p className="text-gray-400">
                Leading investment platform combining traditional finance with cutting-edge technology for optimal returns.
              </p>
            </div>
            <div>
              <h4 className="text-green-400 font-semibold text-lg mb-4">Quick Links</h4>
              {['Home', 'Features', 'Investment Plans', 'About Us', 'Contact'].map(l => (
                <div key={l} className="text-gray-400 hover:text-green-400 cursor-pointer mb-2 transition-colors">
                  {l}
                </div>
              ))}
            </div>
            <div>
              <h4 className="text-green-400 font-semibold text-lg mb-4">Resources</h4>
              {['Investment Guide', 'Market Analysis', 'Research Reports', 'FAQ', 'Blog'].map(r => (
                <div key={r} className="text-gray-400 hover:text-green-400 cursor-pointer mb-2 transition-colors">
                  {r}
                </div>
              ))}
            </div>
            <div>
              <h4 className="text-green-400 font-semibold text-lg mb-4">Contact</h4>
              <p className="text-gray-400 mb-2">📧 invest@greenyield.com</p>
              <p className="text-gray-400 mb-2">📞 1-800-GREENYIELD</p>
              <p className="text-gray-400">📍 New York, NY 10004</p>
            </div>
          </div>
          <div className="text-center pt-8 border-t border-gray-800 text-gray-500">
            <p>&copy; 2026 Green Yield Investments. All rights reserved. | Securities offered through regulated entities.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}