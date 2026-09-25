import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth.js';
import { userApi } from '../../services/userApi.js';
import { CountryPhoneInput } from '../common/CountryPhoneInput.js';
import { COUNTRIES, Country, parsePhoneNumber } from '../../utils/countries.js';
import {
  X,
  User as UserIcon,
  Moon,
  Sun,
  Laptop,
  Lock,
  Trash2,
  Database,
  Check,
  AlertTriangle,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: 'light' | 'dark' | 'system';
  onThemeChange: (theme: 'light' | 'dark' | 'system') => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  theme,
  onThemeChange,
}) => {
  const { user, updateUser, logout } = useAuth();

  const [activeTab, setActiveTab] = useState<'profile' | 'appearance' | 'database' | 'danger'>('profile');

  // Profile Form state
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [selectedCountry, setSelectedCountry] = useState<Country>(() => {
    return parsePhoneNumber(user?.mobileNumber || '').country;
  });
  const [phoneDigits, setPhoneDigits] = useState(() => {
    return parsePhoneNumber(user?.mobileNumber || '').localNumber;
  });
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [profileMsg, setProfileMsg] = useState<{ text: string; error?: boolean } | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // Database status
  const [dbStatus, setDbStatus] = useState<any>(null);

  // Delete account state
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName);
      const parsed = parsePhoneNumber(user.mobileNumber || '');
      setSelectedCountry(parsed.country);
      setPhoneDigits(parsed.localNumber);
    }
  }, [user]);

  useEffect(() => {
    if (isOpen) {
      userApi.getDbStatus().then(setDbStatus).catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMsg(null);

    try {
      const fullMobile = phoneDigits.trim() ? `${selectedCountry.dialCode} ${phoneDigits.trim()}` : '';
      const payload: any = { fullName, mobileNumber: fullMobile };
      if (newPassword) {
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }
      const updated = await userApi.updateProfile(payload);
      updateUser(updated);
      setProfileMsg({ text: 'Profile updated successfully' });
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: any) {
      setProfileMsg({ text: err.message || 'Failed to update profile', error: true });
    } finally {
      setProfileLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      setDeleteError('Please enter your password to confirm deletion');
      return;
    }

    setDeleteLoading(true);
    setDeleteError(null);

    try {
      await userApi.deleteAccount(deletePassword);
      await logout();
      onClose();
    } catch (err: any) {
      setDeleteError(err.message || 'Failed to delete account');
      setDeleteLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150 text-[#212529] dark:text-[#E2DED6]">
      <div className="w-full max-w-[560px] bg-[#FAF9F6] dark:bg-[#1A1E22] border border-[#E8E5DF] dark:border-[#2E333A] rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E5DF] dark:border-[#2E333A]">
          <h2 className="font-['Literata'] text-xl font-medium text-[#212529] dark:text-[#FAF9F6]">
            Workspace Preferences
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded text-[#75777B] hover:text-[#212529] dark:hover:text-[#FAF9F6] flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-6 pt-3 border-b border-[#E8E5DF] dark:border-[#2E333A] bg-[#F4F3F0] dark:bg-[#121518] text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`px-3 py-2 border-b-2 font-medium transition-colors ${
              activeTab === 'profile'
                ? 'border-[#8C6D53] text-[#212529] dark:text-[#FAF9F6]'
                : 'border-transparent text-[#75777B] hover:text-[#212529] dark:hover:text-[#FAF9F6]'
            }`}
          >
            Account Profile
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('appearance')}
            className={`px-3 py-2 border-b-2 font-medium transition-colors ${
              activeTab === 'appearance'
                ? 'border-[#8C6D53] text-[#212529] dark:text-[#FAF9F6]'
                : 'border-transparent text-[#75777B] hover:text-[#212529] dark:hover:text-[#FAF9F6]'
            }`}
          >
            Appearance
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('database')}
            className={`px-3 py-2 border-b-2 font-medium transition-colors ${
              activeTab === 'database'
                ? 'border-[#8C6D53] text-[#212529] dark:text-[#FAF9F6]'
                : 'border-transparent text-[#75777B] hover:text-[#212529] dark:hover:text-[#FAF9F6]'
            }`}
          >
            Database & Cloud
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('danger')}
            className={`px-3 py-2 border-b-2 font-medium transition-colors ${
              activeTab === 'danger'
                ? 'border-red-500 text-red-600 dark:text-red-400'
                : 'border-transparent text-[#75777B] hover:text-red-600'
            }`}
          >
            Danger Zone
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 max-h-[460px] overflow-y-auto">
          {/* 1. PROFILE */}
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileSubmit} className="space-y-4 text-xs">
              {profileMsg && (
                <div
                  className={`p-3 rounded text-xs ${
                    profileMsg.error
                      ? 'bg-red-50 dark:bg-red-950/30 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-900/40'
                      : 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/40'
                  }`}
                >
                  {profileMsg.text}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-medium text-[#5A6268] dark:text-[#A0A4A8] mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-[#F4F3F0] dark:bg-[#121518] px-3 py-2 rounded border border-[#E2DED6] dark:border-[#2E333A] text-sm text-[#212529] dark:text-[#FAF9F6] focus:outline-none focus:border-[#8C6D53]"
                  />
                </div>

                <div>
                  <label className="block font-medium text-[#5A6268] dark:text-[#A0A4A8] mb-1">
                    Country & Mobile Number
                  </label>
                  <CountryPhoneInput
                    selectedCountry={selectedCountry}
                    onSelectCountry={setSelectedCountry}
                    phoneValue={phoneDigits}
                    onPhoneChange={setPhoneDigits}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-[#5A6268] dark:text-[#A0A4A8] mb-1">
                  Email Address (Immutable)
                </label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full bg-[#EAE6DF]/60 dark:bg-[#1A1E22]/60 px-3 py-2 rounded border border-[#E2DED6] dark:border-[#2E333A] text-sm text-[#75777B] cursor-not-allowed"
                />
              </div>

              <div className="pt-3 border-t border-[#E8E5DF] dark:border-[#2E333A]">
                <span className="block font-medium text-[#212529] dark:text-[#FAF9F6] mb-2">
                  Change Password
                </span>
                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[#5A6268] dark:text-[#A0A4A8] mb-1">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[#F4F3F0] dark:bg-[#121518] px-3 py-2 rounded border border-[#E2DED6] dark:border-[#2E333A] text-sm text-[#212529] dark:text-[#FAF9F6] focus:outline-none focus:border-[#8C6D53]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#5A6268] dark:text-[#A0A4A8] mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      className="w-full bg-[#F4F3F0] dark:bg-[#121518] px-3 py-2 rounded border border-[#E2DED6] dark:border-[#2E333A] text-sm text-[#212529] dark:text-[#FAF9F6] focus:outline-none focus:border-[#8C6D53]"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3">
                <span className="text-[11px] text-[#75777B] font-mono">
                  Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '2026'}
                </span>
                <button
                  type="submit"
                  disabled={profileLoading}
                  className="px-4 py-2 bg-[#212529] dark:bg-[#FAF9F6] text-[#FAF9F6] dark:text-[#212529] rounded font-medium text-xs shadow-xs hover:bg-[#343A40] transition-colors disabled:opacity-50"
                >
                  {profileLoading ? 'Saving...' : 'Update Profile'}
                </button>
              </div>
            </form>
          )}

          {/* 2. APPEARANCE */}
          {activeTab === 'appearance' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#5A6268] dark:text-[#A0A4A8] mb-2">
                  Theme Selection
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => onThemeChange('light')}
                    className={`p-3 rounded-lg border text-left flex flex-col gap-2 transition-all ${
                      theme === 'light'
                        ? 'border-[#8C6D53] bg-[#EAE6DF]/40 dark:bg-[#8C6D53]/20 shadow-xs'
                        : 'border-[#E8E5DF] dark:border-[#2E333A] hover:bg-[#F4F3F0] dark:hover:bg-[#121518]'
                    }`}
                  >
                    <Sun className="w-4 h-4 text-[#8C6D53]" />
                    <div>
                      <div className="text-xs font-semibold text-[#212529] dark:text-[#FAF9F6]">Alabaster Light</div>
                      <div className="text-[11px] text-[#75777B]">Archival warm stationery</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => onThemeChange('dark')}
                    className={`p-3 rounded-lg border text-left flex flex-col gap-2 transition-all ${
                      theme === 'dark'
                        ? 'border-[#8C6D53] bg-[#EAE6DF]/40 dark:bg-[#8C6D53]/20 shadow-xs'
                        : 'border-[#E8E5DF] dark:border-[#2E333A] hover:bg-[#F4F3F0] dark:hover:bg-[#121518]'
                    }`}
                  >
                    <Moon className="w-4 h-4 text-[#8C6D53]" />
                    <div>
                      <div className="text-xs font-semibold text-[#212529] dark:text-[#FAF9F6]">Obsidian Slate</div>
                      <div className="text-[11px] text-[#75777B]">Comfortable night flow</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => onThemeChange('system')}
                    className={`p-3 rounded-lg border text-left flex flex-col gap-2 transition-all ${
                      theme === 'system'
                        ? 'border-[#8C6D53] bg-[#EAE6DF]/40 dark:bg-[#8C6D53]/20 shadow-xs'
                        : 'border-[#E8E5DF] dark:border-[#2E333A] hover:bg-[#F4F3F0] dark:hover:bg-[#121518]'
                    }`}
                  >
                    <Laptop className="w-4 h-4 text-[#8C6D53]" />
                    <div>
                      <div className="text-xs font-semibold text-[#212529] dark:text-[#FAF9F6]">System Default</div>
                      <div className="text-[11px] text-[#75777B]">Follows OS preference</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 3. DATABASE */}
          {activeTab === 'database' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-[#F4F3F0] dark:bg-[#121518] rounded-lg border border-[#E8E5DF] dark:border-[#2E333A] flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#212529] dark:text-[#FAF9F6] flex items-center gap-1.5">
                    <Database className="w-4 h-4 text-[#8C6D53]" />
                    Storage Backend
                  </span>
                  <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                    Connected & Synchronized
                  </span>
                </div>
                <p className="text-[#5A6268] dark:text-[#A0A4A8] leading-relaxed">
                  Your notebook documents and hierarchical structure are securely saved and isolated to your user account.
                </p>
              </div>
            </div>
          )}

          {/* 4. DANGER ZONE */}
          {activeTab === 'danger' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-lg flex flex-col gap-3">
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-semibold">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Permanent Account Deletion</span>
                </div>
                <p className="text-red-700 dark:text-red-300/80 leading-relaxed">
                  Permanently deletes your account, personal workspace, all root notebooks, topics, and manuscript pages. This action cannot be reversed.
                </p>

                {!deleteConfirmOpen ? (
                  <button
                    type="button"
                    onClick={() => setDeleteConfirmOpen(true)}
                    className="self-start px-3.5 py-1.5 rounded bg-red-600 hover:bg-red-700 text-white font-medium shadow-xs transition-colors"
                  >
                    Delete My Account...
                  </button>
                ) : (
                  <div className="flex flex-col gap-2.5 pt-2 border-t border-red-200 dark:border-red-900/40">
                    {deleteError && (
                      <div className="text-xs text-red-700 dark:text-red-300">{deleteError}</div>
                    )}
                    <label className="text-red-800 dark:text-red-200 font-medium">
                      Enter your password to confirm permanent deletion:
                    </label>
                    <input
                      type="password"
                      value={deletePassword}
                      onChange={(e) => setDeletePassword(e.target.value)}
                      placeholder="Your current password"
                      className="w-full bg-white dark:bg-[#121518] px-3 py-1.5 rounded border border-red-300 dark:border-red-800 text-xs focus:outline-none"
                    />
                    <div className="flex items-center gap-2 mt-1">
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmOpen(false)}
                        className="px-3 py-1.5 rounded text-xs text-[#5A6268] hover:bg-red-100 dark:hover:bg-red-950/40"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={deleteLoading || !deletePassword}
                        onClick={handleDeleteAccount}
                        className="px-3 py-1.5 rounded bg-red-700 hover:bg-red-800 text-white text-xs font-medium shadow-xs disabled:opacity-50"
                      >
                        {deleteLoading ? 'Deleting...' : 'Confirm Permanent Deletion'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
