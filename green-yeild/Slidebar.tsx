'use client';

import { useEffect, useState } from 'react';
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

export default function Sidebar({ showSidebar, setShowSidebar }: SidebarProps) {
  const router = useRouter();

  const [uid, setUid] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  // ── Auth ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      if (user) setUid(user.uid);
    });
  }, []);

  // ── Profile ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!uid) return;
    return onValue(ref(db, `users/${uid}/profile`), (snap) => {
      if (snap.val()) setProfile(snap.val());
    });
  }, [uid]);

  // ── Lucide icons ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).lucide) {
      (window as any).lucide.createIcons();
    }
  }, [showSidebar, loggingOut]);

  // ── Logout ──────────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    setLoggingOut(true);
    // Let the animation play for a moment, then sign out
    setTimeout(async () => {
      await signOut(auth);
      router.replace('/login');
    }, 1800);
  };

  // ── Initials ─────────────────────────────────────────────────────────────────
  const initials = profile?.name
    ? profile.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
    : '??';

  const sidebarItems = [
    { icon: 'house',          label: 'Dashboard', href: '/dashboard' },
    { icon: 'user',           label: 'Profile',   href: '/profile'   },
    { icon: 'credit-card',    label: 'Plans',     href: '/plans'     },
    { icon: 'arrow-up-right', label: 'Withdraw',  href: '/withdraw'  },
  ];

  if (!showSidebar) return null;

  return (
    <div className="fixed inset-0 z-50" onClick={() => !loggingOut && setShowSidebar(false)}>
      <style jsx>{`
        @keyframes slideIn {
          from { transform: translateX(-100%); opacity: 0; }
          to   { transform: translateX(0);     opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.85); }
          to   { opacity: 1; transform: scale(1);    }
        }
        @keyframes spinOut {
          0%   { transform: rotate(0deg)   scale(1);    opacity: 1; }
          60%  { transform: rotate(200deg) scale(1.1);  opacity: 1; }
          100% { transform: rotate(360deg) scale(0.8);  opacity: 0; }
        }
        @keyframes pulse-ring {
          0%   { transform: scale(0.9); opacity: 0.6; }
          50%  { transform: scale(1.1); opacity: 0.2; }
          100% { transform: scale(0.9); opacity: 0.6; }
        }
      `}</style>

      {/* ── Logout overlay ── */}
      {loggingOut && (
        <div
          className="absolute inset-0 bg-black/80 backdrop-blur-md z-[60] flex flex-col items-center justify-center gap-6"
          style={{ animation: 'fadeIn 0.25s ease-out' }}
        >
          <div
            className="flex flex-col items-center gap-5"
            style={{ animation: 'popIn 0.35s cubic-bezier(0.34,1.56,0.64,1) both' }}
          >
            {/* Spinner with pulse ring */}
            <div className="relative w-20 h-20 flex items-center justify-center">
              <div
                className="absolute inset-0 rounded-full border-2 border-red-500/40"
                style={{ animation: 'pulse-ring 1.2s ease-in-out infinite' }}
              />
              <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                <div
                  className="w-6 h-6 border-2 border-red-500/30 border-t-red-500 rounded-full"
                  style={{ animation: 'spin 0.9s linear infinite' }}
                />
              </div>
            </div>

            <div className="text-center">
              <div className="text-base font-medium text-white mb-1">Logging out…</div>
              <div className="text-sm text-neutral-500">See you soon</div>
            </div>
          </div>
        </div>
      )}

      {/* ── Backdrop ── */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        style={{ animation: 'fadeIn 0.2s ease-out' }}
      />

      {/* ── Drawer ── */}
      <div
        className="absolute left-0 top-0 bottom-0 w-72 bg-[#1e1e1e] border-r border-neutral-800 flex flex-col"
        style={{ animation: 'slideIn 0.3s ease-out' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
          <div className="text-lg font-semibold tracking-tight">Green Yield</div>
          <button
            onClick={() => setShowSidebar(false)}
            className="w-8 h-8 rounded-full bg-[#2a2a2a] hover:bg-[#333] flex items-center justify-center transition-all"
          >
            <i data-lucide="x" className="w-4 h-4" />
          </button>
        </div>

        {/* User profile */}
        <div className="p-5 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center font-semibold text-sm shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <div className="font-medium truncate">{profile?.name ?? '…'}</div>
              <div className="text-sm text-neutral-400 truncate">{profile?.plan ?? 'Member'}</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {sidebarItems.map((item, i) => (
            <Link
              key={i}
              href={item.href}
              onClick={() => setShowSidebar(false)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#2a2a2a] text-neutral-300 hover:text-white transition-all"
            >
              <i data-lucide={item.icon} className="w-5 h-5 shrink-0" />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-neutral-800">
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 text-red-500 transition-all disabled:opacity-50"
          >
            <i data-lucide="log-out" className="w-5 h-5 shrink-0" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
}
