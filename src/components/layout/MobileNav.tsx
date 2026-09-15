import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Home,
  Compass,
  PlusCircle,
  Mail,
  User as UserIcon,
  Bell,
  Search,
  Sparkles,
  Sun,
  Moon,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocial } from '../../context/SocialContext';
import { Avatar } from '../common/Avatar';
import { PostComposerModal } from '../post/PostComposerModal';

export const MobileHeader: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { unreadNotificationsCount, settings, toggleTheme } = useSocial();

  return (
    <header className="md:hidden sticky top-0 z-40 flex items-center justify-between px-4 py-3 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800">
      <div
        onClick={() => navigate('/home')}
        className="flex items-center gap-2 cursor-pointer"
      >
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-500 via-pink-500 to-violet-600 flex items-center justify-center text-white shadow-sm">
          <Sparkles className="w-4 h-4" />
        </div>
        <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-rose-500 to-violet-600 bg-clip-text text-transparent">
          Vibely
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
          title="Toggle theme"
        >
          {settings.theme === 'dark' ? (
            <Sun className="w-5 h-5 text-amber-400" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </button>

        <button
          onClick={() => navigate('/search')}
          className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
        >
          <Search className="w-5 h-5" />
        </button>

        <button
          onClick={() => navigate('/notifications')}
          className="relative p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
        >
          <Bell className="w-5 h-5" />
          {unreadNotificationsCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
              {unreadNotificationsCount}
            </span>
          )}
        </button>

        {currentUser && (
          <Avatar
            src={currentUser.avatar}
            alt={currentUser.name}
            size="xs"
            onClick={() => navigate(`/profile/${currentUser.username}`)}
          />
        )}
      </div>
    </header>
  );
};

export const MobileBottomNav: React.FC = () => {
  const { currentUser } = useAuth();
  const { unreadMessagesCount } = useSocial();
  const [isComposerOpen, setIsComposerOpen] = useState(false);

  return (
    <>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-md border-t border-neutral-200 dark:border-neutral-800 py-2 px-3 flex items-center justify-around">
        <NavLink
          to="/home"
          className={({ isActive }) =>
            `flex flex-col items-center p-2 rounded-xl transition-colors ${
              isActive
                ? 'text-rose-600 dark:text-rose-400'
                : 'text-neutral-500 dark:text-neutral-400'
            }`
          }
        >
          <Home className="w-6 h-6" />
        </NavLink>

        <NavLink
          to="/explore"
          className={({ isActive }) =>
            `flex flex-col items-center p-2 rounded-xl transition-colors ${
              isActive
                ? 'text-rose-600 dark:text-rose-400'
                : 'text-neutral-500 dark:text-neutral-400'
            }`
          }
        >
          <Compass className="w-6 h-6" />
        </NavLink>

        <button
          onClick={() => setIsComposerOpen(true)}
          className="flex flex-col items-center justify-center p-1.5 text-rose-500 hover:text-rose-600 transition-transform active:scale-95"
        >
          <PlusCircle className="w-8 h-8 fill-rose-500 text-white" />
        </button>

        <NavLink
          to="/messages"
          className={({ isActive }) =>
            `relative flex flex-col items-center p-2 rounded-xl transition-colors ${
              isActive
                ? 'text-rose-600 dark:text-rose-400'
                : 'text-neutral-500 dark:text-neutral-400'
            }`
          }
        >
          <Mail className="w-6 h-6" />
          {unreadMessagesCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full" />
          )}
        </NavLink>

        <NavLink
          to={currentUser ? `/profile/${currentUser.username}` : '/login'}
          className={({ isActive }) =>
            `flex flex-col items-center p-2 rounded-xl transition-colors ${
              isActive
                ? 'text-rose-600 dark:text-rose-400 font-bold'
                : 'text-neutral-500 dark:text-neutral-400'
            }`
          }
        >
          {currentUser ? (
            <Avatar src={currentUser.avatar} alt={currentUser.name} size="xs" />
          ) : (
            <UserIcon className="w-6 h-6" />
          )}
        </NavLink>
      </nav>

      <PostComposerModal
        isOpen={isComposerOpen}
        onClose={() => setIsComposerOpen(false)}
      />
    </>
  );
};
