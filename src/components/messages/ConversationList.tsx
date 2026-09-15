import React, { useState } from 'react';
import { Search, Plus, Edit } from 'lucide-react';
import { Conversation, User } from '../../types';
import { Avatar } from '../common/Avatar';
import { useAuth } from '../../context/AuthContext';
import { useSocial } from '../../context/SocialContext';

interface ConversationListProps {
  selectedId?: string;
  onSelect: (id: string) => void;
  onStartNewChat: () => void;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  selectedId,
  onSelect,
  onStartNewChat,
}) => {
  const { currentUser } = useAuth();
  const { conversations } = useSocial();
  const [query, setQuery] = useState('');

  const getOtherParticipant = (conv: Conversation): User | undefined => {
    return conv.participants.find((p) => p.id !== currentUser?.id);
  };

  const getRelativeTime = (dateString: string) => {
    const diff = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
    if (diff < 60) return 'now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}d`;
  };

  const filtered = conversations.filter((c) => {
    const other = getOtherParticipant(c);
    if (!other) return false;
    const q = query.toLowerCase();
    return (
      other.name.toLowerCase().includes(q) ||
      other.username.toLowerCase().includes(q) ||
      c.lastMessage?.text.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex flex-col h-full bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800">
      {/* Header */}
      <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
            Messages
          </h2>
          <p className="text-xs text-neutral-400">Direct chats & replies</p>
        </div>
        <button
          onClick={onStartNewChat}
          className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 hover:bg-rose-100 transition-colors cursor-pointer"
          title="New conversation"
        >
          <Edit className="w-4 h-4" />
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-3 border-b border-neutral-100 dark:border-neutral-800/60">
        <div className="relative">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search chats..."
            className="w-full pl-9 pr-3 py-1.5 bg-neutral-100 dark:bg-neutral-800/80 rounded-xl text-xs outline-none text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400"
          />
        </div>
      </div>

      {/* Conversations Scrollable List */}
      <div className="flex-1 overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-800/40">
        {filtered.length === 0 ? (
          <div className="p-6 text-center text-xs text-neutral-400">
            No conversations found. Start a new chat!
          </div>
        ) : (
          filtered.map((conv) => {
            const other = getOtherParticipant(conv);
            if (!other) return null;
            const isSelected = conv.id === selectedId;

            return (
              <div
                key={conv.id}
                onClick={() => onSelect(conv.id)}
                className={`flex items-center gap-3 p-3.5 cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-rose-50/70 dark:bg-rose-950/30'
                    : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
                }`}
              >
                <Avatar
                  src={other.avatar}
                  alt={other.name}
                  size="md"
                  isOnline={other.isOnline}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <span className="font-semibold text-xs text-neutral-900 dark:text-neutral-100 truncate">
                      {other.name}
                    </span>
                    {conv.lastMessage && (
                      <span className="text-[10px] text-neutral-400 flex-shrink-0">
                        {getRelativeTime(conv.lastMessage.createdAt)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <p
                      className={`text-xs truncate ${
                        conv.unreadCount > 0
                          ? 'font-bold text-neutral-900 dark:text-neutral-100'
                          : 'text-neutral-500 dark:text-neutral-400'
                      }`}
                    >
                      {conv.lastMessage
                        ? (conv.lastMessage.senderId === currentUser?.id ? 'You: ' : '') +
                          conv.lastMessage.text
                        : 'Started a conversation'}
                    </p>
                    {conv.unreadCount > 0 && (
                      <span className="w-2 h-2 bg-rose-500 rounded-full flex-shrink-0" />
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
