'use client';

import { useState, useEffect } from 'react';
import Sidebar from './Slidebar';

export default function Header() {
  const [showSidebar, setShowSidebar] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).lucide) {
      (window as any).lucide.createIcons();
    }
  }, []);

  return (
    <>
      <Sidebar showSidebar={showSidebar} setShowSidebar={setShowSidebar} />
      
      <header className="border-b border-neutral-700 bg-[#1c1c1c]/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setShowSidebar(true)} 
                className="w-9 h-9 rounded-full bg-[#2a2a2a] hover:bg-[#333333] transition-all flex items-center justify-center"
              >
                <i data-lucide="menu" className="w-4 h-4"></i>
              </button>
              <div className="text-lg font-semibold">Green Yield</div>
            </div>

            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-sm font-medium">
              JD
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
