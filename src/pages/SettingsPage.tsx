import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sun,
  Moon,
  Monitor,
  Bell,
  Lock,
  User as UserIcon,
  LogOut,
  RefreshCw,
  ShieldCheck,
  Smartphone,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocial } from '../context/SocialContext';
import { Button } from '../components/common/Button';
import { storage } from '../services/storage';

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, updateProfile, logout } = useAuth();
  const { settings, updateSettings, toggleTheme, addToast } = useSocial();

  const [activeSection, setActiveSection] = useState<
    'appearance' | 'account' | 'notifications' | 'privacy'
  >('appearance');

  // Account form state
  const [name, setName] = useState(currentUser?.name || '');
  const [username, setUsername] = useState(currentUser?.username || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !username.trim()) {
      addToast('Name and username are required', 'error');
      return;
    }
    updateProfile({
      name: name.trim(),
      username: username.trim().toLowerCase(),
      email: email.trim(),
    });
    addToast('Account information updated!', 'success');
  };

  const handleResetData = () => {
    if (
      confirm(
        'Reset Vibely to default seed data? All custom posts and interactions will be reset to factory defaults.'
      )
    ) {
      storage.resetToDefaults();
      window.location.reload();
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="w-full pb-12">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-md border-b border-neutral-200/80 dark:border-neutral-800/80 px-4 py-3.5">
        <h1 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
          Settings
        </h1>
        <p className="text-xs text-neutral-400">
          Preferences, theme, account, and privacy
        </p>
      </div>

      {/* Settings Navigation Pills */}
      <div className="flex gap-2 p-4 overflow-x-auto no-scrollbar border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
        {[
          { id: 'appearance', label: 'Appearance', icon: <Sun className="w-4 h-4" /> },
          { id: 'account', label: 'Account', icon: <UserIcon className="w-4 h-4" /> },
          { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
          { id: 'privacy', label: 'Privacy', icon: <Lock className="w-4 h-4" /> },
        ].map((sec) => (
          <button
            key={sec.id}
            onClick={() => setActiveSection(sec.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer whitespace-nowrap transition-colors ${
              activeSection === sec.id
                ? 'bg-rose-500 text-white shadow-xs'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
            }`}
          >
            {sec.icon}
            <span>{sec.label}</span>
          </button>
        ))}
      </div>

      <div className="p-4 space-y-6 max-w-xl mx-auto">
        {/* APPEARANCE SECTION */}
        {activeSection === 'appearance' && (
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 p-5 space-y-5">
            <div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                Display Theme
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Choose your preferred interface vibe and brightness
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  if (settings.theme === 'dark') toggleTheme();
                }}
                className={`p-4 rounded-xl border flex flex-col items-center gap-2 text-center transition-all ${
                  settings.theme === 'light'
                    ? 'border-rose-500 bg-rose-50/40 text-rose-600 font-bold'
                    : 'border-neutral-200 dark:border-neutral-800 text-neutral-500'
                }`}
              >
                <Sun className="w-6 h-6" />
                <span className="text-xs">Light Mode</span>
              </button>

              <button
                onClick={() => {
                  if (settings.theme === 'light') toggleTheme();
                }}
                className={`p-4 rounded-xl border flex flex-col items-center gap-2 text-center transition-all ${
                  settings.theme === 'dark'
                    ? 'border-rose-500 bg-rose-950/40 text-rose-400 font-bold'
                    : 'border-neutral-200 dark:border-neutral-800 text-neutral-500'
                }`}
              >
                <Moon className="w-6 h-6" />
                <span className="text-xs">Dark Mode</span>
              </button>
            </div>
          </div>
        )}

        {/* ACCOUNT SECTION */}
        {activeSection === 'account' && currentUser && (
          <form
            onSubmit={handleSaveAccount}
            className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 p-5 space-y-4"
          >
            <div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                Account Credentials
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Update personal identification and email
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 border-0 text-xs text-neutral-900 dark:text-neutral-100 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 border-0 text-xs text-neutral-900 dark:text-neutral-100 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 border-0 text-xs text-neutral-900 dark:text-neutral-100 outline-none"
              />
            </div>

            <div className="pt-2">
              <Button type="submit" variant="primary" size="sm">
                Save Account Changes
              </Button>
            </div>
          </form>
        )}

        {/* NOTIFICATIONS PREFERENCES SECTION */}
        {activeSection === 'notifications' && (
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 p-5 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                Push & In-App Notifications
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Control which interactions trigger alerts
              </p>
            </div>

            <div className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
              {[
                {
                  key: 'likes',
                  label: 'Likes',
                  desc: 'When someone likes one of your posts or stories',
                },
                {
                  key: 'comments',
                  label: 'Comments',
                  desc: 'When someone comments on your post or replies',
                },
                {
                  key: 'follows',
                  label: 'New Followers',
                  desc: 'When a new member follows your profile',
                },
                {
                  key: 'messages',
                  label: 'Direct Messages',
                  desc: 'When you receive a private message or story reply',
                },
              ].map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between py-3"
                >
                  <div>
                    <p className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                      {item.label}
                    </p>
                    <p className="text-[11px] text-neutral-400">{item.desc}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={
                      (settings.notificationPreferences as any)[item.key]
                    }
                    onChange={(e) =>
                      updateSettings({
                        notificationPreferences: {
                          ...settings.notificationPreferences,
                          [item.key]: e.target.checked,
                        },
                      })
                    }
                    className="w-4 h-4 accent-rose-500 cursor-pointer"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PRIVACY SECTION */}
        {activeSection === 'privacy' && (
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 p-5 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                Account Privacy
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Manage who can discover and view your profile
              </p>
            </div>

            <div className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                    Private Account
                  </p>
                  <p className="text-[11px] text-neutral-400">
                    Only approved followers can see your posts and stories
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.privacy.isPrivate}
                  onChange={(e) =>
                    updateSettings({
                      privacy: {
                        ...settings.privacy,
                        isPrivate: e.target.checked,
                      },
                    })
                  }
                  className="w-4 h-4 accent-rose-500 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                    Allow Tags & Mentions
                  </p>
                  <p className="text-[11px] text-neutral-400">
                    Allow other creators to tag you in posts and comments
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.privacy.allowTags}
                  onChange={(e) =>
                    updateSettings({
                      privacy: {
                        ...settings.privacy,
                        allowTags: e.target.checked,
                      },
                    })
                  }
                  className="w-4 h-4 accent-rose-500 cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* DATA MANAGEMENT & LOGOUT */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 p-5 space-y-3">
          <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
            System & Session
          </h3>

          <div className="flex flex-col sm:flex-row gap-3 pt-1">
            <Button
              variant="outline"
              size="sm"
              icon={<RefreshCw className="w-4 h-4" />}
              onClick={handleResetData}
            >
              Reset Seed Data
            </Button>

            {currentUser && (
              <Button
                variant="danger"
                size="sm"
                icon={<LogOut className="w-4 h-4" />}
                onClick={handleLogout}
              >
                Log Out
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
