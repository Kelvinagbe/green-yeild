'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { ref, onValue } from 'firebase/database';
import { auth, db } from '@/lib/firebase';

interface SidebarProps {
  showSidebar: boolean;
  setShowSidebar: (show: boolean) => void;
}

interface UserProfile {
  name: string;
  plan: string;
}

// ── Logout portal modal ────────────────────────────────────────────────────────
function LogoutModal() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ animation: 'fadeIn 0.2s ease-out both' }}
    >
      {/* Full-screen backdrop — truly above everything */}
      <div className="absolute inset-0 bg-black/85 backdrop-blur-lg" />

      {/* Card */}
      <div
        className="relative z-10 flex flex-col items-center gap-5 bg-[#1e1e1e] border border-neutral-800 rounded-2xl px-10 py-10 shadow-2xl"
        style={{ animation: 'popIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both' }}
      >
        {/* Pulsing ring + spinner */}
        <div className="relative w-20 h-20 flex items-center justify-center">
          <div
            className="absolute inset-0 rounded-full border-2 border-red-500/30"
            style={{ animation: 'pulseRing 1.3s ease-in-out infinite' }}
          />
          <div
            className="absolute inset-[6px] rounded-full border-2 border-red-500/15"
            style={{ animation: 'pulseRing 1.3s ease-in-out 0.3s infinite' }}
          />
          <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/25 flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-red-500/25 border-t-red-400 rounded-full animate-spin" />
          </div>
        </div>

        <div className="text-center">
          <p className="text-white font-semibold text-base">Logging out…</p>
          <p className="text-neutral-500 text-sm mt-1">See you soon 👋</p>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ── Sidebar ────────────────────────────────────────────────────────────────────
export default function Sidebar({ showSidebar, setShowSidebar }: SidebarProps) {
  const router = useRouter();

  const [uid, setUid] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

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

  // ── Lucide icons ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).lucide) {
      (window as any).lucide.createIcons();
    }
  }, [showSidebar]);

  // ── Logout ────────────────────────────────────────────────────────────────
  const handleLogout = () => {
    setLoggingOut(true);
    setTimeout(async () => {
      await signOut(auth);
      router.replace('/login');
    }, 1800);
  };

  const initials = profile?.name
    ? profile.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
    : '??';

  const sidebarItems = [
    { icon: 'house',          label: 'Dashboard', href: '/dashboard' },
    { icon: 'user',           label: 'Profile',   href: '/profile'   },
    { icon: 'credit-card',    label: 'Plans',     href: '/plans'     },
    { icon: 'arrow-up-right', label: 'Withdraw',  href: '/withdraw'  },
  ];

  return (
    <>
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(-100%); }
          to   { transform: translateX(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.85); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes pulseRing {
          0%   { transform: scale(0.92); opacity: 0.7; }
          50%  { transform: scale(1.08); opacity: 0.2; }
          100% { transform: scale(0.92); opacity: 0.7; }
        }
      `}</style>

      {/* Logout modal — rendered into document.body via portal */}
      {loggingOut && <LogoutModal />}

      {/* Sidebar overlay */}
      {showSidebar && (
        <div
          className="fixed inset-0 z-50"
          onClick={() => !loggingOut && setShowSidebar(false)}
          style={{ animation: 'fadeIn 0.2s ease-out' }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60" />

          {/* Drawer — solid, fully opaque */}
          <div
            className="absolute left-0 top-0 bottom-0 w-72 bg-[#1a1a1a] border-r border-neutral-800 flex flex-col"
            style={{ animation: 'slideIn 0.28s ease-out' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-neutral-800 flex items-center justify-between">
              <span className="text-lg font-semibold tracking-tight">Green Yield</span>
              <button
                onClick={() => setShowSidebar(false)}
                className="w-8 h-8 rounded-full bg-[#2a2a2a] hover:bg-[#333] flex items-center justify-center transition-all"
              >
                <i data-lucide="x" className="w-4 h-4" />
              </button>
            </div>

            {/* User profile */}
            <div className="px-5 py-4 border-b border-neutral-800">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center font-semibold text-sm shrink-0">
                  {initials}
                </div>
                <div className="min-w-0">
                  <div className="font-medium text-sm truncate">{profile?.name ?? '…'}</div>
                  <div className="text-xs text-neutral-400 truncate">{profile?.plan ?? 'Member'}</div>
                </div>
              </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
              {sidebarItems.map((item, i) => (
                <Link
                  key={i}
                  href={item.href}
                  onClick={() => setShowSidebar(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/[0.06] text-neutral-300 hover:text-white transition-all"
                >
                  <i data-lucide={item.icon} className="w-4 h-4 shrink-0" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              ))}
            </nav>

            {/* Logout */}
            <div className="p-3 border-t border-neutral-800">
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-all disabled:opacity-40"
              >
                <i data-lucide="log-out" className="w-4 h-4 shrink-0" />
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
