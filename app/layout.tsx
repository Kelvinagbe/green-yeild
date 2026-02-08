use client';

import './globals.css';
import { Inter } from 'next/font/google';
import { useState } from 'react';
import Sidebar from '@/green-yeild/Sidebar';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [showSidebar, setShowSidebar] = useState(false);

  return (
    <html lang="en">
      <head>
        <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>
      </head>
      <body className={inter.className}>
        <Sidebar showSidebar={showSidebar} setShowSidebar={setShowSidebar} />
        
        {/* Header */}
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

        {children}
      </body>
    </html>
  );
}
