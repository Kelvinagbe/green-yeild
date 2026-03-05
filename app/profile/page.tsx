'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, updatePassword, reauthenticateWithCredential, EmailAuthProvider, deleteUser, signOut } from 'firebase/auth';
import { ref, onValue, update } from 'firebase/database';
import { auth, db } from '@/lib/firebase';

// ── Tiny reusable components ──────────────────────────────────────────────────

const Toggle = ({ value, onChange }: { value: boolean; onChange: () => void }) => (
  <button onClick={onChange} className={`w-12 h-6 rounded-full transition-all ${value ? 'bg-green-500' : 'bg-[#3a3a3a]'}`}>
    <div className={`w-5 h-5 bg-white rounded-full transition-all ${value ? 'translate-x-6' : 'translate-x-0.5'}`} />
  </button>
);

const Row = ({ icon, title, subtitle, action, onClick }: any) => (
  <div onClick={onClick} className={`flex items-center justify-between py-3 border-b border-neutral-700 last:border-0 ${onClick ? 'hover:bg-[#2a2a2a] px-3 -mx-3 rounded-lg cursor-pointer transition-all' : ''}`}>
    <div className="flex items-center gap-3">
      <i data-lucide={icon} className="w-5 h-5 text-neutral-400" />
      <div><div className="font-medium">{title}</div><div className="text-sm text-neutral-400">{subtitle}</div></div>
    </div>
    {action ?? (onClick && <i data-lucide="chevron-right" className="w-5 h-5 text-neutral-400" />)}
  </div>
);

const Sk = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-neutral-700 rounded ${className}`} />
);

const Modal = ({ isOpen, onClose, title, children }: any) => !isOpen ? null : (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
    <div className="bg-[#2a2a2a] border border-neutral-700 rounded-2xl p-6 max-w-md w-full" onClick={e => e.stopPropagation()} style={{ animation: 'slideUp 0.3s ease-out' }}>
      <style jsx>{`@keyframes slideUp{from{opacity:0;transform:translateY(20px) scale(.95)}to{opacity:1;transform:translateY(0) scale(1)}}`}</style>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">{title}</h2>
        <button onClick={onClose} className="w-8 h-8 rounded-full bg-[#333333] hover:bg-[#3a3a3a] flex items-center justify-center transition-all">
          <i data-lucide="x" className="w-4 h-4" />
        </button>
      </div>
      {children}
    </div>
  </div>
);

const Field = ({ label, ...props }: any) => (
  <div>
    <label className="text-sm text-neutral-400 mb-2 block">{label}</label>
    <input {...props} className="w-full h-12 bg-[#333333] border border-neutral-700 rounded-xl px-4 focus:outline-none focus:border-green-500 transition-all text-white" />
  </div>
);

const ModalBtns = ({ onCancel, label = 'Save Changes' }: { onCancel: () => void; label?: string }) => (
  <div className="grid grid-cols-2 gap-3 pt-2">
    <button onClick={onCancel} className="h-12 bg-[#333333] hover:bg-[#3a3a3a] rounded-xl font-medium transition-all">Cancel</button>
    <button type="submit" className="h-12 bg-green-500 hover:bg-green-600 rounded-xl font-medium transition-all active:scale-95">{label}</button>
  </div>
);

// ── Main ──────────────────────────────────────────────────────────────────────

export default function Profile() {
  const router = useRouter();
  const [uid, setUid] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [showEdit, setShowEdit] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', email: '', phone: '' });
  const [pwdForm, setPwdForm] = useState({ current: '', next: '', confirm: '' });
  const [pwdError, setPwdError] = useState('');
  const [notifs, setNotifs] = useState({ email: true, push: true, sms: false, marketing: true });
  const [twoFactor, setTwoFactor] = useState(false);
  const [biometric, setBiometric] = useState(true);

  // ── Auth listener ──
  useEffect(() => {
    return onAuthStateChanged(auth, user => {
      if (user) setUid(user.uid);
      else router.push('/login');
    });
  }, [router]);

  // ── Realtime DB ──
  useEffect(() => {
    if (!uid) return;
    const unsub1 = onValue(ref(db, `users/${uid}/profile`), snap => {
      const d = snap.val();
      if (d) { setProfile(d); setEditForm({ name: d.name, email: d.email ?? '', phone: d.phone ?? '' }); }
      setLoading(false);
    });
    const unsub2 = onValue(ref(db, `users/${uid}/stats`), snap => {
      setStats(snap.val() ?? { totalInvested: 0, activeInvestments: 0, totalReturns: 0 });
    });
    const unsub3 = onValue(ref(db, `users/${uid}/settings`), snap => {
      const d = snap.val();
      if (d?.notifs) setNotifs(d.notifs);
      if (d?.twoFactor !== undefined) setTwoFactor(d.twoFactor);
      if (d?.biometric !== undefined) setBiometric(d.biometric);
    });
    return () => { unsub1(); unsub2(); unsub3(); };
  }, [uid]);

  // ── Lucide ──
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).lucide) (window as any).lucide.createIcons();
  });

  // ── Helpers ──
  const initials = profile?.name?.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase() ?? 'GY';

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uid) return;
    await update(ref(db, `users/${uid}/profile`), editForm);
    setShowEdit(false);
  };

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError('');
    if (pwdForm.next !== pwdForm.confirm) return setPwdError('Passwords do not match');
    try {
      const user = auth.currentUser!;
      const cred = EmailAuthProvider.credential(user.email!, pwdForm.current);
      await reauthenticateWithCredential(user, cred);
      await updatePassword(user, pwdForm.next);
      setShowPwd(false);
      setPwdForm({ current: '', next: '', confirm: '' });
    } catch { setPwdError('Current password is incorrect'); }
  };

  const toggleSetting = (key: string, val: boolean) => {
    if (!uid) return;
    update(ref(db, `users/${uid}/settings`), { [key]: val });
  };

  const toggleNotif = (key: string) => {
    const updated = { ...notifs, [key]: !notifs[key as keyof typeof notifs] };
    setNotifs(updated);
    if (uid) update(ref(db, `users/${uid}/settings/notifs`), updated);
  };

  const handleLogout = async () => { await signOut(auth); router.push('/login'); };

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure? This cannot be undone.')) return;
    try { await deleteUser(auth.currentUser!); router.push('/login'); }
    catch { alert('Please log out and log back in before deleting your account.'); }
  };

  // ── Skeletons ──
  if (loading) return (
    <div className="min-h-screen bg-[#1c1c1c] text-white">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <div className="bg-[#262626] border border-neutral-700 rounded-2xl p-6 animate-pulse">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <Sk className="w-20 h-20 rounded-full" />
            <div className="flex-1 space-y-3 w-full">
              <Sk className="h-7 w-40" /><Sk className="h-4 w-48" />
              <div className="flex gap-2"><Sk className="h-6 w-20 rounded-full" /><Sk className="h-6 w-28 rounded-full" /></div>
            </div>
            <Sk className="h-10 w-32 rounded-lg" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[0,1,2].map(i => <div key={i} className="bg-[#262626] border border-neutral-700 rounded-xl p-4 animate-pulse space-y-2"><Sk className="h-4 w-24" /><Sk className="h-7 w-32" /></div>)}
        </div>
        <div className="bg-[#262626] border border-neutral-700 rounded-2xl overflow-hidden animate-pulse">
          <div className="flex border-b border-neutral-700">{[0,1,2].map(i => <Sk key={i} className="flex-1 h-12 rounded-none" />)}</div>
          <div className="p-6 space-y-4">{[0,1,2,3].map(i => <div key={i} className="flex items-center justify-between py-3 border-b border-neutral-700"><div className="flex items-center gap-3"><Sk className="w-5 h-5" /><div className="space-y-2"><Sk className="h-4 w-32" /><Sk className="h-3 w-48" /></div></div><Sk className="h-6 w-12 rounded-full" /></div>)}</div>
        </div>
      </main>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#1c1c1c] text-white">
      {/* Edit Profile Modal */}
      <Modal isOpen={showEdit} onClose={() => setShowEdit(false)} title="Edit Profile">
        <form onSubmit={saveProfile} className="space-y-4">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-3xl font-bold">{initials}</div>
              <button type="button" className="absolute bottom-0 right-0 w-8 h-8 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center transition-all">
                <i data-lucide="camera" className="w-4 h-4" />
              </button>
            </div>
          </div>
          <Field label="Full Name" type="text" value={editForm.name} onChange={(e: any) => setEditForm(f => ({ ...f, name: e.target.value }))} />
          <Field label="Email Address" type="email" value={editForm.email} onChange={(e: any) => setEditForm(f => ({ ...f, email: e.target.value }))} />
          <Field label="Phone Number" type="tel" value={editForm.phone} onChange={(e: any) => setEditForm(f => ({ ...f, phone: e.target.value }))} />
          <ModalBtns onCancel={() => setShowEdit(false)} />
        </form>
      </Modal>

      {/* Change Password Modal */}
      <Modal isOpen={showPwd} onClose={() => setShowPwd(false)} title="Change Password">
        <form onSubmit={savePassword} className="space-y-4">
          <Field label="Current Password" type="password" placeholder="Enter current password" value={pwdForm.current} onChange={(e: any) => setPwdForm(f => ({ ...f, current: e.target.value }))} />
          <Field label="New Password" type="password" placeholder="Enter new password" value={pwdForm.next} onChange={(e: any) => setPwdForm(f => ({ ...f, next: e.target.value }))} />
          <Field label="Confirm New Password" type="password" placeholder="Confirm new password" value={pwdForm.confirm} onChange={(e: any) => setPwdForm(f => ({ ...f, confirm: e.target.value }))} />
          {pwdError && <p className="text-red-400 text-sm">{pwdError}</p>}
          <ModalBtns onCancel={() => setShowPwd(false)} label="Update Password" />
        </form>
      </Modal>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Profile Header */}
        <div className="bg-[#262626] border border-neutral-700 rounded-xl sm:rounded-2xl p-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-2xl font-bold">{initials}</div>
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-2xl font-semibold mb-1">{profile?.name}</h2>
              <p className="text-neutral-400 mb-2">{profile?.email ?? auth.currentUser?.email}</p>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-xs font-medium flex items-center gap-1"><i data-lucide="check-circle" className="w-3 h-3" />Verified</span>
                <span className="px-3 py-1 bg-[#2a2a2a] text-neutral-300 rounded-full text-xs font-medium">{profile?.plan ?? 'Member'}</span>
              </div>
            </div>
            <button onClick={() => setShowEdit(true)} className="px-6 py-2.5 bg-green-500 hover:bg-green-600 rounded-lg font-medium transition-all active:scale-95 flex items-center gap-2">
              <i data-lucide="edit-2" className="w-4 h-4" />Edit Profile
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Total Invested',  value: `₦${(stats?.totalInvested ?? 0).toLocaleString()}` },
            { label: 'Active Plans',    value: stats?.activeInvestments ?? 0 },
            { label: 'Total Returns',   value: `+₦${(stats?.totalReturns ?? 0).toLocaleString()}`, color: 'text-green-500' },
          ].map((s, i) => (
            <div key={i} className="bg-[#262626] border border-neutral-700 rounded-xl p-4">
              <div className="text-sm text-neutral-400 mb-1">{s.label}</div>
              <div className={`text-2xl font-semibold ${s.color ?? ''}`}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="bg-[#262626] border border-neutral-700 rounded-xl sm:rounded-2xl overflow-hidden">
          <div className="flex border-b border-neutral-700">
            {['profile', 'security', 'preferences'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 px-4 py-3 font-medium transition-all capitalize ${activeTab === tab ? 'bg-green-500/10 text-green-500 border-b-2 border-green-500' : 'text-neutral-400 hover:text-white'}`}>
                {tab === 'profile' ? 'Account' : tab}
              </button>
            ))}
          </div>

          <div className="p-6 space-y-1">
            {activeTab === 'profile' && <>
              <Row icon="user"     title="Full Name"     subtitle={profile?.name} />
              <Row icon="mail"     title="Email Address" subtitle={profile?.email ?? auth.currentUser?.email} action={<span className="text-xs px-2 py-1 bg-green-500/10 text-green-500 rounded-full">Verified</span>} />
              <Row icon="phone"    title="Phone Number"  subtitle={profile?.phone ?? '—'} action={<span className="text-xs px-2 py-1 bg-green-500/10 text-green-500 rounded-full">Verified</span>} />
              <Row icon="calendar" title="Member Since"  subtitle={profile?.dateJoined ?? '—'} />
            </>}

            {activeTab === 'security' && <>
              <Row icon="lock"        title="Change Password"           subtitle="Update your account password"    onClick={() => setShowPwd(true)} />
              <Row icon="shield"      title="Two-Factor Authentication" subtitle="Add an extra layer of security"  action={<Toggle value={twoFactor} onChange={() => { setTwoFactor(v => !v); toggleSetting('twoFactor', !twoFactor); }} />} />
              <Row icon="fingerprint" title="Biometric Login"           subtitle="Use fingerprint or face ID"      action={<Toggle value={biometric} onChange={() => { setBiometric(v => !v); toggleSetting('biometric', !biometric); }} />} />
              <Row icon="smartphone"  title="Active Sessions"           subtitle="Manage your logged-in devices"  onClick={() => {}} />
            </>}

            {activeTab === 'preferences' && <>
              <h4 className="font-medium mb-2 pt-1">Notifications</h4>
              {([
                { key: 'email',     icon: 'mail',           title: 'Email Notifications', subtitle: 'Receive updates via email'       },
                { key: 'push',      icon: 'bell',           title: 'Push Notifications',  subtitle: 'Get alerts on your device'       },
                { key: 'sms',       icon: 'message-square', title: 'SMS Notifications',   subtitle: 'Receive text messages'           },
                { key: 'marketing', icon: 'megaphone',      title: 'Marketing Updates',   subtitle: 'News and promotional offers'     },
              ] as const).map(n => (
                <Row key={n.key} icon={n.icon} title={n.title} subtitle={n.subtitle} action={<Toggle value={notifs[n.key]} onChange={() => toggleNotif(n.key)} />} />
              ))}
              <h4 className="font-medium mb-2 pt-4">Other Settings</h4>
              <Row icon="globe"   title="Language" subtitle="English (US)" onClick={() => {}} />
              <Row icon="palette" title="Theme"    subtitle="Dark Mode"    onClick={() => {}} />
            </>}
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-[#262626] border border-red-500/20 rounded-xl sm:rounded-2xl p-6">
          <h3 className="font-medium text-red-500 mb-4">Danger Zone</h3>
          <Row icon="log-out"  title="Logout"         subtitle="Sign out of your account"            onClick={handleLogout} />
          <Row icon="trash-2"  title="Delete Account" subtitle="Permanently delete your account"     onClick={handleDeleteAccount} />
        </div>

        {/* App Info */}
        <div className="text-center text-sm text-neutral-500 space-y-1 pb-8">
          <div>Green Yield v2.1.0</div>
          <div className="flex items-center justify-center gap-4">
            {['Privacy Policy', 'Terms of Service', 'Support'].map((link, i, arr) => (
              <span key={link}><button className="hover:text-green-500 transition-all">{link}</button>{i < arr.length - 1 && <span className="ml-4">•</span>}</span>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}