'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { ref, onValue } from 'firebase/database';
import { auth, db } from '@/lib/firebase';
import Sidebar from './Slidebar';

interface UserProfile {
  name: string;
  plan: string;
}

export default function Header() {
  const [showSidebar, setShowSidebar] = useState(false);
  const [uid, setUid] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  // ── Auth ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      if (user) setUid(user.uid);
    });
  }, []);

  // ── Profile ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!uid) return;
    return onValue(ref(db, `users/${uid}/profile`), (snap) => {
      if (snap.val()) setProfile(snap.val());
    });
  }, [uid]);

  // ── Lucide ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).lucide) {
      (window as any).lucide.createIcons();
    }
  }, [profile]);

  const initials = profile?.name
    ? profile.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
    : '??';

  return (
    <>
      <Sidebar showSidebar={showSidebar} setShowSidebar={setShowSidebar} />

      <header className="border-b border-neutral-700 bg-[#1c1c1c]/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex justify-between items-center">

            {/* Left: menu + brand */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowSidebar(true)}
                className="w-9 h-9 rounded-full bg-[#2a2a2a] hover:bg-[#333333] transition-all flex items-center justify-center"
              >
                <i data-lucide="menu" className="w-4 h-4" />
              </button>
              <div className="text-lg font-semibold">Green Yield</div>
            </div>

            {/* Right: avatar with real initials */}
            <button
              onClick={() => setShowSidebar(true)}
              className="w-9 h-9 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-sm font-semibold transition-all hover:ring-2 hover:ring-green-500/50 hover:ring-offset-1 hover:ring-offset-[#1c1c1c]"
              title={profile?.name}
            >
              {initials}
            </button>

          </div>
        </div>
      </header>
    </>
  );
}
