'use client';

import { useEffect } from 'react';
import Link from 'next/link';

interface SidebarProps {
  showSidebar: boolean;
  setShowSidebar: (show: boolean) => void;
}

export default function Sidebar({ showSidebar, setShowSidebar }: SidebarProps) {
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).lucide) {
      (window as any).lucide.createIcons();
    }
  }, [showSidebar]);

  const sidebarItems = [
    { icon: 'user', label: 'Profile', href: '/profile' },
    { icon: 'credit-card', label: 'Plans', href: '/plans' },
    { icon: 'arrow-up-right', label: 'Withdraw', href: '/withdraw' },
  ];

  if (!showSidebar) return null;

  return (
    <div className="fixed inset-0 z-50" onClick={() => setShowSidebar(false)}>
      <style jsx>{`
        @keyframes slideIn {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
      `}</style>
      
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
      <div 
        className="absolute left-0 top-0 bottom-0 w-72 bg-[#262626] border-r border-neutral-700"
        style={{ animation: 'slideIn 0.3s ease-out' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-neutral-700 flex items-center justify-between">
          <div className="text-lg font-semibold">Green Yield</div>
          <button 
            onClick={() => setShowSidebar(false)} 
            className="w-8 h-8 rounded-full bg-[#2a2a2a] hover:bg-[#333333] flex items-center justify-center"
          >
            <i data-lucide="x" className="w-4 h-4"></i>
          </button>
        </div>

        <div className="p-6 border-b border-neutral-700">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center font-medium">
              JD
            </div>
            <div>
              <div className="font-medium">John Doe</div>
              <div className="text-sm text-neutral-400">Premium Member</div>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-2">
          {sidebarItems.map((item, i) => (
            <Link 
              key={i} 
              href={item.href}
              onClick={() => setShowSidebar(false)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#2a2a2a] text-neutral-300 transition-all"
            >
              <i data-lucide={item.icon} className="w-5 h-5"></i>
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-neutral-700">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 text-red-500 transition-all">
            <i data-lucide="log-out" className="w-5 h-5"></i>
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
}
