'use client';

import { useEffect, useState } from 'react';

export default function Profile() {
  const [activeTab, setActiveTab] = useState('profile');
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [notifications, setNotifications] = useState({ email: true, push: true, sms: false, marketing: true });
  const [twoFactor, setTwoFactor] = useState(false);
  const [biometric, setBiometric] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).lucide) {
      (window as any).lucide.createIcons();
    }
  }, [activeTab, showEditProfile, showChangePassword, notifications, twoFactor, biometric]);

  const userProfile = {
    name: 'John Doe',
    email: 'johndoe@email.com',
    phone: '+234 801 234 5678',
    dateJoined: 'January 15, 2024',
    accountType: 'Premium Member',
    verificationStatus: 'Verified',
    totalInvested: 361910,
    activeInvestments: 3,
    totalReturns: 54320
  };

  // Reusable Components
  const Modal = ({ isOpen, onClose, title, children }: any) => {
    if (!isOpen) return null;
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div className="bg-[#2a2a2a] border border-neutral-700 rounded-2xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()} style={{ animation: 'slideUp 0.3s ease-out' }}>
          <style jsx>{`@keyframes slideUp { from { opacity: 0; transform: translateY(20px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); }}`}</style>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">{title}</h2>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-[#333333] hover:bg-[#3a3a3a] flex items-center justify-center transition-all">
              <i data-lucide="x" className="w-4 h-4"></i>
            </button>
          </div>
          {children}
        </div>
      </div>
    );
  };

  const InputField = ({ label, ...props }: any) => (
    <div>
      <label className="text-sm text-neutral-400 mb-2 block">{label}</label>
      <input {...props} className="w-full h-12 bg-[#333333] border border-neutral-700 rounded-xl px-4 focus:outline-none focus:border-green-500 transition-all" />
    </div>
  );

  const Toggle = ({ value, onChange }: any) => (
    <button onClick={onChange} className={`w-12 h-6 rounded-full transition-all ${value ? 'bg-green-500' : 'bg-[#3a3a3a]'}`}>
      <div className={`w-5 h-5 bg-white rounded-full transition-all ${value ? 'translate-x-6' : 'translate-x-0.5'}`}></div>
    </button>
  );

  const SettingRow = ({ icon, title, subtitle, action }: any) => (
    <div className="flex items-center justify-between py-3 border-b border-neutral-700 last:border-0">
      <div className="flex items-center gap-3">
        <i data-lucide={icon} className="w-5 h-5 text-neutral-400"></i>
        <div>
          <div className="font-medium">{title}</div>
          <div className="text-sm text-neutral-400">{subtitle}</div>
        </div>
      </div>
      {action}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#1c1c1c] text-white">
      <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>

      {/* Edit Profile Modal */}
      <Modal isOpen={showEditProfile} onClose={() => setShowEditProfile(false)} title="Edit Profile">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-3xl font-bold">JD</div>
            <button className="absolute bottom-0 right-0 w-8 h-8 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center transition-all">
              <i data-lucide="camera" className="w-4 h-4"></i>
            </button>
          </div>
        </div>
        <div className="space-y-4">
          <InputField label="Full Name" type="text" defaultValue={userProfile.name} />
          <InputField label="Email Address" type="email" defaultValue={userProfile.email} />
          <InputField label="Phone Number" type="tel" defaultValue={userProfile.phone} />
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button onClick={() => setShowEditProfile(false)} className="h-12 bg-[#333333] hover:bg-[#3a3a3a] rounded-xl font-medium transition-all">Cancel</button>
            <button className="h-12 bg-green-500 hover:bg-green-600 rounded-xl font-medium transition-all active:scale-95">Save Changes</button>
          </div>
        </div>
      </Modal>

      {/* Change Password Modal */}
      <Modal isOpen={showChangePassword} onClose={() => setShowChangePassword(false)} title="Change Password">
        <div className="space-y-4">
          <InputField label="Current Password" type="password" placeholder="Enter current password" />
          <InputField label="New Password" type="password" placeholder="Enter new password" />
          <InputField label="Confirm New Password" type="password" placeholder="Confirm new password" />
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button onClick={() => setShowChangePassword(false)} className="h-12 bg-[#333333] hover:bg-[#3a3a3a] rounded-xl font-medium transition-all">Cancel</button>
            <button className="h-12 bg-green-500 hover:bg-green-600 rounded-xl font-medium transition-all active:scale-95">Update Password</button>
          </div>
        </div>
      </Modal>

      {/* Header */}
      <header className="border-b border-neutral-700 bg-[#1c1c1c]/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <button className="w-9 h-9 rounded-full bg-[#2a2a2a] hover:bg-[#333333] transition-all flex items-center justify-center">
                <i data-lucide="arrow-left" className="w-4 h-4"></i>
              </button>
              <div className="text-lg font-semibold">Profile & Settings</div>
            </div>
            <button className="w-9 h-9 rounded-full bg-[#2a2a2a] hover:bg-[#333333] transition-all flex items-center justify-center">
              <i data-lucide="bell" className="w-4 h-4"></i>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        
        {/* Profile Header Card */}
        <div className="bg-[#262626] border border-neutral-700 rounded-xl sm:rounded-2xl p-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-2xl font-bold">JD</div>
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-2xl font-semibold mb-1">{userProfile.name}</h2>
              <p className="text-neutral-400 mb-2">{userProfile.email}</p>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-xs font-medium flex items-center gap-1">
                  <i data-lucide="check-circle" className="w-3 h-3"></i>
                  {userProfile.verificationStatus}
                </span>
                <span className="px-3 py-1 bg-[#2a2a2a] text-neutral-300 rounded-full text-xs font-medium">{userProfile.accountType}</span>
              </div>
            </div>
            <button onClick={() => setShowEditProfile(true)} className="px-6 py-2.5 bg-green-500 hover:bg-green-600 rounded-lg font-medium transition-all active:scale-95 flex items-center gap-2">
              <i data-lucide="edit-2" className="w-4 h-4"></i>
              Edit Profile
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Total Invested', value: `₦${userProfile.totalInvested.toLocaleString()}` },
            { label: 'Active Plans', value: userProfile.activeInvestments },
            { label: 'Total Returns', value: `+₦${userProfile.totalReturns.toLocaleString()}`, color: 'text-green-500' }
          ].map((stat, i) => (
            <div key={i} className="bg-[#262626] border border-neutral-700 rounded-xl p-4">
              <div className="text-sm text-neutral-400 mb-1">{stat.label}</div>
              <div className={`text-2xl font-semibold ${stat.color || ''}`}>{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="bg-[#262626] border border-neutral-700 rounded-xl sm:rounded-2xl overflow-hidden">
          <div className="flex border-b border-neutral-700">
            {['profile', 'security', 'preferences'].map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 px-4 py-3 font-medium transition-all capitalize ${activeTab === tab ? 'bg-green-500/10 text-green-500 border-b-2 border-green-500' : 'text-neutral-400 hover:text-white'}`}>
                {tab === 'profile' ? 'Account' : tab}
              </button>
            ))}
          </div>

          <div className="p-6 space-y-4">
            {/* Account Tab */}
            {activeTab === 'profile' && (
              <>
                <SettingRow icon="user" title="Full Name" subtitle={userProfile.name} />
                <SettingRow icon="mail" title="Email Address" subtitle={userProfile.email} action={<span className="text-xs px-2 py-1 bg-green-500/10 text-green-500 rounded-full">Verified</span>} />
                <SettingRow icon="phone" title="Phone Number" subtitle={userProfile.phone} action={<span className="text-xs px-2 py-1 bg-green-500/10 text-green-500 rounded-full">Verified</span>} />
                <SettingRow icon="calendar" title="Member Since" subtitle={userProfile.dateJoined} />
              </>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <>
                <button onClick={() => setShowChangePassword(true)} className="w-full flex items-center justify-between py-3 border-b border-neutral-700 hover:bg-[#2a2a2a] px-3 -mx-3 rounded-lg transition-all">
                  <div className="flex items-center gap-3">
                    <i data-lucide="lock" className="w-5 h-5 text-neutral-400"></i>
                    <div className="text-left">
                      <div className="font-medium">Change Password</div>
                      <div className="text-sm text-neutral-400">Update your account password</div>
                    </div>
                  </div>
                  <i data-lucide="chevron-right" className="w-5 h-5 text-neutral-400"></i>
                </button>
                <SettingRow icon="shield" title="Two-Factor Authentication" subtitle="Add an extra layer of security" action={<Toggle value={twoFactor} onChange={() => setTwoFactor(!twoFactor)} />} />
                <SettingRow icon="fingerprint" title="Biometric Login" subtitle="Use fingerprint or face ID" action={<Toggle value={biometric} onChange={() => setBiometric(!biometric)} />} />
                <button className="w-full flex items-center justify-between py-3 hover:bg-[#2a2a2a] px-3 -mx-3 rounded-lg transition-all">
                  <div className="flex items-center gap-3">
                    <i data-lucide="smartphone" className="w-5 h-5 text-neutral-400"></i>
                    <div className="text-left">
                      <div className="font-medium">Active Sessions</div>
                      <div className="text-sm text-neutral-400">Manage your logged-in devices</div>
                    </div>
                  </div>
                  <i data-lucide="chevron-right" className="w-5 h-5 text-neutral-400"></i>
                </button>
              </>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <>
                <h4 className="font-medium mb-3">Notifications</h4>
                {[
                  { key: 'email', icon: 'mail', title: 'Email Notifications', subtitle: 'Receive updates via email' },
                  { key: 'push', icon: 'bell', title: 'Push Notifications', subtitle: 'Get alerts on your device' },
                  { key: 'sms', icon: 'message-square', title: 'SMS Notifications', subtitle: 'Receive text messages' },
                  { key: 'marketing', icon: 'megaphone', title: 'Marketing Updates', subtitle: 'News and promotional offers' }
                ].map((notif) => (
                  <SettingRow key={notif.key} icon={notif.icon} title={notif.title} subtitle={notif.subtitle} action={<Toggle value={notifications[notif.key as keyof typeof notifications]} onChange={() => setNotifications({...notifications, [notif.key]: !notifications[notif.key as keyof typeof notifications]})} />} />
                ))}
                <h4 className="font-medium mb-3 pt-4">Other Settings</h4>
                {[
                  { icon: 'globe', title: 'Language', subtitle: 'English (US)' },
                  { icon: 'palette', title: 'Theme', subtitle: 'Dark Mode' }
                ].map((setting, i) => (
                  <button key={i} className="w-full flex items-center justify-between py-3 border-b border-neutral-700 last:border-0 hover:bg-[#2a2a2a] px-3 -mx-3 rounded-lg transition-all">
                    <div className="flex items-center gap-3">
                      <i data-lucide={setting.icon} className="w-5 h-5 text-neutral-400"></i>
                      <div className="text-left">
                        <div className="font-medium">{setting.title}</div>
                        <div className="text-sm text-neutral-400">{setting.subtitle}</div>
                      </div>
                    </div>
                    <i data-lucide="chevron-right" className="w-5 h-5 text-neutral-400"></i>
                  </button>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-[#262626] border border-red-500/20 rounded-xl sm:rounded-2xl p-6">
          <h3 className="font-medium text-red-500 mb-4">Danger Zone</h3>
          <div className="space-y-3">
            {[
              { icon: 'log-out', title: 'Logout', subtitle: 'Sign out of your account' },
              { icon: 'trash-2', title: 'Delete Account', subtitle: 'Permanently delete your account' }
            ].map((action, i) => (
              <button key={i} className="w-full flex items-center justify-between py-3 hover:bg-red-500/5 px-3 -mx-3 rounded-lg transition-all">
                <div className="flex items-center gap-3">
                  <i data-lucide={action.icon} className="w-5 h-5 text-red-500"></i>
                  <div className="text-left">
                    <div className="font-medium">{action.title}</div>
                    <div className="text-sm text-neutral-400">{action.subtitle}</div>
                  </div>
                </div>
                <i data-lucide="chevron-right" className="w-5 h-5 text-neutral-400"></i>
              </button>
            ))}
          </div>
        </div>

        {/* App Info */}
        <div className="text-center text-sm text-neutral-500 space-y-1">
          <div>Green Yield v2.1.0</div>
          <div className="flex items-center justify-center gap-4">
            {['Privacy Policy', 'Terms of Service', 'Support'].map((link, i, arr) => (
              <span key={link}>
                <button className="hover:text-green-500 transition-all">{link}</button>
                {i < arr.length - 1 && <span className="mx-4">•</span>}
              </span>
            ))}
          </div>
        </div>

        <div className="h-8"></div>
      </main>
    </div>
  );
}
