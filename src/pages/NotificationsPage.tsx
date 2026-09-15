import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Heart,
  MessageCircle,
  UserPlus,
  AtSign,
  CheckCheck,
  Bell,
} from 'lucide-react';
import { useSocial } from '../context/SocialContext';
import { Avatar } from '../components/common/Avatar';
import { EmptyState } from '../components/common/EmptyState';
import { Notification } from '../types';

export const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
  } = useSocial();

  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filtered = notifications.filter((n) =>
    filter === 'unread' ? !n.read : true
  );

  const getRelativeTime = (dateString: string) => {
    const diff = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'like':
        return <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />;
      case 'comment':
        return <MessageCircle className="w-4 h-4 text-violet-500 fill-violet-500/20" />;
      case 'follow':
        return <UserPlus className="w-4 h-4 text-blue-500" />;
      case 'mention':
        return <AtSign className="w-4 h-4 text-amber-500" />;
    }
  };

  const handleClickNotification = (n: Notification) => {
    markNotificationAsRead(n.id);
    if (n.postId) {
      navigate(`/post/${n.postId}`);
    } else {
      navigate(`/profile/${n.sender.username}`);
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-md border-b border-neutral-200/80 dark:border-neutral-800/80 px-4 py-3.5 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
            Notifications
          </h1>
          <p className="text-xs text-neutral-400">Activity and interactions</p>
        </div>

        <button
          onClick={markAllNotificationsAsRead}
          className="flex items-center gap-1.5 text-xs font-semibold text-rose-500 hover:text-rose-600 transition-colors cursor-pointer"
        >
          <CheckCheck className="w-4 h-4" />
          <span>Mark all read</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex border-b border-neutral-200/80 dark:border-neutral-800/80 bg-white dark:bg-neutral-900">
        <button
          onClick={() => setFilter('all')}
          className={`flex-1 py-2.5 text-center text-xs font-bold border-b-2 transition-colors cursor-pointer ${
            filter === 'all'
              ? 'border-rose-500 text-rose-500'
              : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`flex-1 py-2.5 text-center text-xs font-bold border-b-2 transition-colors cursor-pointer ${
            filter === 'unread'
              ? 'border-rose-500 text-rose-500'
              : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
          }`}
        >
          Unread
        </button>
      </div>

      {/* Notifications List */}
      <div className="divide-y divide-neutral-100 dark:divide-neutral-800/60 bg-white dark:bg-neutral-900 md:m-4 md:rounded-2xl border-b md:border border-neutral-200/80 dark:border-neutral-800/80 overflow-hidden shadow-xs">
        {filtered.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="All caught up!"
              description="No new notifications at this time."
              icon={<Bell className="w-10 h-10 text-neutral-400" />}
            />
          </div>
        ) : (
          filtered.map((n) => (
            <div
              key={n.id}
              onClick={() => handleClickNotification(n)}
              className={`flex items-start gap-3.5 p-4 cursor-pointer transition-colors ${
                !n.read
                  ? 'bg-rose-50/40 dark:bg-rose-950/20'
                  : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
              }`}
            >
              <div className="relative flex-shrink-0">
                <Avatar
                  src={n.sender.avatar}
                  alt={n.sender.name}
                  size="md"
                  isOnline={n.sender.isOnline}
                />
                <div className="absolute -bottom-1 -right-1 p-1 bg-white dark:bg-neutral-900 rounded-full shadow-xs">
                  {getNotificationIcon(n.type)}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-xs text-neutral-800 dark:text-neutral-200 leading-snug">
                  <span className="font-bold text-neutral-900 dark:text-neutral-100 mr-1 hover:underline">
                    {n.sender.name}
                  </span>
                  {n.text}
                </p>

                <span className="text-[11px] text-neutral-400 mt-1 block">
                  {getRelativeTime(n.createdAt)}
                </span>
              </div>

              {!n.read && (
                <div className="w-2 h-2 rounded-full bg-rose-500 flex-shrink-0 mt-2" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
