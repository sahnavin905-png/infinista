import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, TrendingUp, Check, Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocial } from '../../context/SocialContext';
import { Avatar } from '../common/Avatar';

export const RightSidebar: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, users } = useAuth();
  const { trendingTopics, isFollowing, toggleFollow } = useSocial();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Filter suggested users: exclude current user, limit to 4-5
  const suggestedUsers = users
    .filter((u) => u.id !== currentUser?.id)
    .slice(0, 4);

  return (
    <aside className="hidden xl:flex flex-col gap-6 w-80 h-screen sticky top-0 px-4 py-6 border-l border-neutral-200 dark:border-neutral-800 overflow-y-auto select-none">
      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search Vibely..."
          className="w-full pl-10 pr-4 py-2.5 bg-neutral-100 dark:bg-neutral-900 border border-transparent focus:border-rose-500/50 rounded-2xl text-sm outline-none placeholder:text-neutral-400 dark:text-neutral-100 transition-colors"
        />
      </form>

      {/* Trending Topics */}
      <div className="bg-neutral-50/70 dark:bg-neutral-900/50 rounded-2xl p-4 border border-neutral-200/70 dark:border-neutral-800/80">
        <div className="flex items-center gap-2 mb-3 px-1">
          <TrendingUp className="w-4 h-4 text-rose-500" />
          <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
            Trending for you
          </h3>
        </div>

        <div className="flex flex-col divide-y divide-neutral-100 dark:divide-neutral-800/60">
          {trendingTopics.slice(0, 5).map((topic) => (
            <div
              key={topic.id}
              onClick={() => navigate(`/search?q=${topic.tag}`)}
              className="py-2.5 px-1 hover:bg-neutral-100/60 dark:hover:bg-neutral-800/40 rounded-xl cursor-pointer transition-colors"
            >
              <div className="flex items-center justify-between text-xs text-neutral-400 dark:text-neutral-500 mb-0.5">
                <span>{topic.category} · Trending</span>
              </div>
              <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 hover:text-rose-500 transition-colors">
                #{topic.tag}
              </p>
              <span className="text-xs text-neutral-400">
                {(topic.postsCount / 1000).toFixed(1)}k posts
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Suggested Accounts */}
      <div className="bg-neutral-50/70 dark:bg-neutral-900/50 rounded-2xl p-4 border border-neutral-200/70 dark:border-neutral-800/80">
        <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 mb-3 px-1">
          Who to follow
        </h3>

        <div className="flex flex-col gap-3">
          {suggestedUsers.map((user) => {
            const following = isFollowing(user.id);
            return (
              <div
                key={user.id}
                className="flex items-center justify-between gap-3 p-1"
              >
                <div
                  onClick={() => navigate(`/profile/${user.username}`)}
                  className="flex items-center gap-2.5 overflow-hidden cursor-pointer group flex-1"
                >
                  <Avatar
                    src={user.avatar}
                    alt={user.name}
                    size="sm"
                    isOnline={user.isOnline}
                  />
                  <div className="overflow-hidden">
                    <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 group-hover:text-rose-500 truncate transition-colors">
                      {user.name}
                    </p>
                    <p className="text-[11px] text-neutral-400 truncate">
                      @{user.username}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => toggleFollow(user.id)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all duration-150 ${
                    following
                      ? 'border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:border-red-400 hover:text-red-500'
                      : 'bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:hover:bg-white dark:text-neutral-900'
                  }`}
                >
                  {following ? (
                    <>
                      <Check className="w-3 h-3" />
                      <span>Following</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3 h-3" />
                      <span>Follow</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Meta */}
      <footer className="px-2 pt-2 text-xs text-neutral-400 dark:text-neutral-500 space-y-2">
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          <span className="hover:underline cursor-pointer">About</span>
          <span className="hover:underline cursor-pointer">Privacy</span>
          <span className="hover:underline cursor-pointer">Terms</span>
          <span className="hover:underline cursor-pointer">Help</span>
          <span className="hover:underline cursor-pointer">Guidelines</span>
          <span className="hover:underline cursor-pointer">API</span>
        </div>
        <p>© 2026 Vibely Inc. Connect. Create. Share.</p>
      </footer>
    </aside>
  );
};
