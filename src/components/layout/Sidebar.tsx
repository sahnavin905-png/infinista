import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Home,
  Compass,
  Bell,
  Mail,
  Bookmark,
  User as UserIcon,
  Settings,
  PlusSquare,
  Sparkles,
  Flame,
  LogOut,
  ChevronDown,
  Moon,
  Sun,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocial } from '../../context/SocialContext';
import { Avatar } from '../common/Avatar';
import { PostComposerModal } from '../post/PostComposerModal';

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, logout, switchUser, users } = useAuth();
  const { unreadNotificationsCount, unreadMessagesCount, settings, toggleTheme } = useSocial();
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const navItems = [
    { to: '/home', label: 'Home', icon: Home },
    { to: '/explore', label: 'Explore', icon: Compass },
    { to: '/stories', label: 'Stories', icon: Flame },
    {
      to: '/notifications',
      label: 'Notifications',
      icon: Bell,
      badge: unreadNotificationsCount > 0 ? unreadNotificationsCount : null,
    },
    {
      to: '/messages',
      label: 'Messages',
      icon: Mail,
      badge: unreadMessagesCount > 0 ? unreadMessagesCount : null,
    },
    { to: '/bookmarks', label: 'Bookmarks', icon: Bookmark },
    {
      to: currentUser ? `/profile/${currentUser.username}` : '/login',
      label: 'Profile',
      icon: UserIcon,
    },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      <aside className="hidden md:flex flex-col justify-between w-64 lg:w-72 h-screen sticky top-0 px-4 py-6 border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 select-none z-30">
        <div className="flex flex-col gap-6">
          {/* Brand Logo */}
          <div
            onClick={() => navigate('/home')}
            className="flex items-center gap-3 px-3 py-1 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 via-pink-500 to-violet-600 flex items-center justify-center text-white shadow-md shadow-rose-500/20 group-hover:scale-105 transition-transform duration-200">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-rose-500 to-violet-600 bg-clip-text text-transparent">
                Vibely
              </span>
              <p className="text-[11px] text-neutral-400 dark:text-neutral-500 font-medium -mt-1">
                Connect. Create. Share.
              </p>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="flex flex-col gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-3 rounded-2xl text-[15px] font-medium transition-all duration-150 ${
                      isActive
                        ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-semibold shadow-xs'
                        : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900 hover:text-neutral-900 dark:hover:text-neutral-100'
                    }`
                  }
                >
                  <div className="flex items-center gap-3.5">
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== null && item.badge !== undefined && (
                    <span className="px-2 py-0.5 text-xs font-bold bg-rose-500 text-white rounded-full">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Create Post Button */}
          <button
            onClick={() => setIsComposerOpen(true)}
            className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-semibold rounded-2xl shadow-sm hover:shadow-md active:scale-[0.98] transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer"
          >
            <PlusSquare className="w-5 h-5" />
            <span>Create Post</span>
          </button>
        </div>

        {/* User Account / Switcher / Theme Toggle */}
        <div className="relative pt-4 border-t border-neutral-100 dark:border-neutral-800">
          {currentUser ? (
            <div>
              <div
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-neutral-100 dark:hover:bg-neutral-900 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <Avatar
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    size="sm"
                    isOnline={currentUser.isOnline}
                  />
                  <div className="overflow-hidden text-left">
                    <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                      {currentUser.name}
                    </p>
                    <p className="text-xs text-neutral-400 truncate">
                      @{currentUser.username}
                    </p>
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-neutral-400 flex-shrink-0" />
              </div>

              {/* User Dropdown */}
              {isUserMenuOpen && (
                <div className="absolute bottom-20 left-2 right-2 p-2 bg-white dark:bg-neutral-900 rounded-2xl shadow-xl border border-neutral-200 dark:border-neutral-800 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="p-2 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                    <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                      Switch Demo User
                    </span>
                    <button
                      onClick={toggleTheme}
                      className="p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500"
                      title="Toggle theme"
                    >
                      {settings.theme === 'dark' ? (
                        <Sun className="w-4 h-4 text-amber-400" />
                      ) : (
                        <Moon className="w-4 h-4 text-neutral-600" />
                      )}
                    </button>
                  </div>

                  {/* Switch user options */}
                  <div className="max-h-48 overflow-y-auto py-1">
                    {users.slice(0, 5).map((u) => (
                      <button
                        key={u.id}
                        onClick={() => {
                          switchUser(u.id);
                          setIsUserMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-left text-xs ${
                          u.id === currentUser.id
                            ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 font-semibold'
                            : 'hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                        }`}
                      >
                        <span className="truncate">{u.name}</span>
                        {u.id === currentUser.id && (
                          <UserCheck className="w-3.5 h-3.5 text-rose-500" />
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="pt-2 mt-1 border-t border-neutral-100 dark:border-neutral-800">
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        logout();
                        navigate('/login');
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="w-full py-2.5 px-4 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-xl text-sm font-semibold text-neutral-900 dark:text-neutral-100 transition-colors"
            >
              Log In
            </button>
          )}
        </div>
      </aside>

      {/* Post Composer Modal */}
      <PostComposerModal
        isOpen={isComposerOpen}
        onClose={() => setIsComposerOpen(false)}
      />
    </>
  );
};
