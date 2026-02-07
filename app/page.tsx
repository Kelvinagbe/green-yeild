'use client';

import { useState, createElement } from 'react';
import { TrendingUp, Lock, Target, Smartphone, Gem, Users } from 'lucide';

const features = [
  { icon: TrendingUp, title: 'AI-Powered Analytics', desc: 'Leverage cutting-edge artificial intelligence to analyze market trends and optimize your portfolio in real-time.' },
  { icon: Lock, title: 'Bank-Level Security', desc: 'Your investments are protected with military-grade encryption and multi-factor authentication protocols.' },
  { icon: Target, title: 'Personalized Strategy', desc: 'Custom investment plans tailored to your risk tolerance, financial goals, and timeline.' },
  { icon: Smartphone, title: 'Mobile Trading', desc: 'Manage your portfolio on-the-go with our intuitive mobile app. Trade anytime, anywhere.' },
  { icon: Gem, title: 'Diversified Assets', desc: 'Access stocks, bonds, ETFs, crypto, and alternative investments all in one platform.' },
  { icon: Users, title: 'Expert Advisors', desc: 'Get personalized guidance from certified financial advisors with decades of experience.' }
];

const stats = [
  { value: '$2.4B+', label: 'Assets Under Management' },
  { value: '150K+', label: 'Active Investors' },
  { value: '12.8%', label: 'Average Annual Return' },
  { value: '24/7', label: 'Market Monitoring' }
];

const plans = [
  { name: 'Conservative Growth', apy: '5-7% APY', items: ['Low-risk portfolio', 'Bonds & blue-chip stocks', 'Stable returns', 'Ideal for beginners'] },
  { name: 'Balanced Portfolio', apy: '8-12% APY', items: ['Medium-risk approach', 'Mixed asset allocation', 'Growth & stability', 'Most popular choice'] },
  { name: 'Aggressive Growth', apy: '15-20% APY', items: ['High-growth potential', 'Tech & emerging markets', 'Active management', 'For experienced investors'] },
  { name: 'Crypto Frontier', apy: '20-35% APY', items: ['Cryptocurrency focus', 'DeFi & Web3 assets', 'High volatility', 'Maximum growth potential'] }
];

export default function InvestmentSite() {
  const [nav, setNav] = useState('home');

  return (
    <div className="min-h-screen bg-dark text-light">
      <style jsx global>{`
        :root {
          --dark: #1a1a1a;
          --darker: #0f0f0f;
          --card: #242424;
          --green: #00ff88;
          --gray: #b8b8b8;
          --border: #333;
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; background: var(--dark); color: var(--gray); }
        .container { max-width: 1400px; margin: 0 auto; padding: 0 2rem; }
        header { background: var(--darker); padding: 1.5rem 0; position: sticky; top: 0; z-index: 100; box-shadow: 0 2px 10px rgba(0,0,0,0.5); }
        nav { display: flex; justify-content: space-between; align-items: center; }
        .logo { font-size: 1.8rem; font-weight: 700; color: var(--green); }
        .nav-links { display: flex; gap: 2rem; list-style: none; }
        .nav-link { color: var(--gray); cursor: pointer; transition: color 0.3s; }
        .nav-link:hover { color: var(--green); }
        .hero { text-align: center; padding: 6rem 2rem; }
        h1 { font-size: 3.5rem; margin-bottom: 1.5rem; color: var(--green); }
        h2 { font-size: 2.5rem; margin-bottom: 3rem; text-align: center; color: var(--green); }
        h3 { color: var(--green); font-size: 1.4rem; margin-bottom: 1rem; }
        .hero-text { font-size: 1.2rem; color: var(--gray); margin-bottom: 2.5rem; max-width: 700px; margin-left: auto; margin-right: auto; }
        .cta { display: flex; gap: 1.5rem; justify-content: center; flex-wrap: wrap; }
        .btn { padding: 1rem 2.5rem; border: none; border-radius: 8px; font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.3s; }
        .btn-primary { background: var(--green); color: var(--darker); }
        .btn-primary:hover { background: #00dd77; transform: translateY(-2px); }
        .btn-secondary { background: #2a2a2a; color: var(--green); border: 2px solid var(--green); }
        .btn-secondary:hover { background: var(--green); color: var(--darker); }
        .stats { background: var(--darker); padding: 4rem 2rem; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 2rem; }
        .stat { text-align: center; }
        .stat-val { font-size: 3rem; color: var(--green); font-weight: 700; margin-bottom: 0.5rem; }
        section { padding: 5rem 2rem; }
        .card { background: var(--card); padding: 2rem; border-radius: 12px; border: 1px solid var(--border); transition: all 0.3s; }
        .card:hover { transform: translateY(-5px); border-color: var(--green); box-shadow: 0 10px 30px rgba(0, 255, 136, 0.1); }
        .icon { margin-bottom: 1rem; color: var(--green); }
        .apy { font-size: 2rem; color: var(--green); font-weight: 700; margin-bottom: 1.5rem; }
        ul { list-style: none; }
        li { padding: 0.5rem 0 0.5rem 1.5rem; position: relative; }
        li:before { content: "✓"; position: absolute; left: 0; color: var(--green); font-weight: bold; }
        footer { background: var(--darker); padding: 3rem 2rem; border-top: 1px solid var(--border); }
        .footer-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 2rem; margin-bottom: 2rem; }
        .f-title { color: var(--green); margin-bottom: 1rem; font-weight: 600; }
        .f-link { color: var(--gray); display: block; margin-bottom: 0.5rem; cursor: pointer; transition: color 0.3s; }
        .f-link:hover { color: var(--green); }
        .f-bottom { text-align: center; padding-top: 2rem; border-top: 1px solid var(--border); color: #777; }
        @media (max-width: 768px) {
          h1 { font-size: 2.5rem; }
          .nav-links { gap: 1rem; flex-wrap: wrap; }
          .cta { flex-direction: column; align-items: center; }
          .btn { width: 100%; max-width: 300px; }
        }
      `}</style>

      <header>
        <nav className="container">
          <div className="logo">Green Yield</div>
          <ul className="nav-links">
            {['Home', 'Features', 'Investments', 'About', 'Contact'].map(link => (
              <li key={link} className="nav-link" onClick={() => setNav(link.toLowerCase())}>{link}</li>
            ))}
          </ul>
        </nav>
      </header>

      <section className="hero">
        <h1>Invest in Your Future Today</h1>
        <p className="hero-text">Advanced portfolio management powered by AI-driven insights. Grow your wealth with confidence through data-driven investment strategies.</p>
        <div className="cta">
          <button className="btn btn-primary">Start Investing</button>
          <button className="btn btn-secondary">View Portfolio Options</button>
        </div>
      </section>

      <div className="stats">
        <div className="container grid">
          {stats.map((s, i) => (
            <div key={i} className="stat">
              <div className="stat-val">{s.value}</div>
              <div>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <section className="container">
        <h2>Why Choose Green Yield</h2>
        <div className="grid">
          {features.map((f, i) => (
            <div key={i} className="card">
              <div className="icon">{createElement(f.icon as any, { size: 48, strokeWidth: 1.5 })}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container">
        <h2>Investment Plans</h2>
        <div className="grid">
          {plans.map((p, i) => (
            <div key={i} className="card">
              <h3>{p.name}</h3>
              <div className="apy">{p.apy}</div>
              <ul>
                {p.items.map((item, idx) => <li key={idx}>{item}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <footer>
        <div className="container footer-grid">
          <div>
            <div className="f-title">About Green Yield</div>
            <p>Leading investment platform combining traditional finance with cutting-edge technology.</p>
          </div>
          <div>
            <div className="f-title">Quick Links</div>
            {['Home', 'Features', 'Investment Plans', 'Contact Us'].map(l => (
              <div key={l} className="f-link" onClick={() => setNav(l.toLowerCase())}>{l}</div>
            ))}
          </div>
          <div>
            <div className="f-title">Resources</div>
            {['Investment Guide', 'Market Analysis', 'FAQ', 'Blog'].map(r => (
              <div key={r} className="f-link">{r}</div>
            ))}
          </div>
          <div>
            <div className="f-title">Contact</div>
            <p>📧 invest@greenyield.com</p>
            <p>📞 1-800-GREENYIELD</p>
            <p>📍 New York, NY 10004</p>
          </div>
        </div>
        <div className="container f-bottom">
          <p>&copy; 2026 Green Yield Investments. All rights reserved. | Securities offered through regulated entities.</p>
        </div>
      </footer>
    </div>
  );
}