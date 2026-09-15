import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Avatar } from '../common/Avatar';
import { useAuth } from '../../context/AuthContext';
import { useSocial } from '../../context/SocialContext';

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectConversation: (conversationId: string) => void;
}

export const NewChatModal: React.FC<NewChatModalProps> = ({
  isOpen,
  onClose,
  onSelectConversation,
}) => {
  const { currentUser, users } = useAuth();
  const { startOrGetConversation } = useSocial();
  const [query, setQuery] = useState('');

  const candidates = users.filter((u) => {
    if (u.id === currentUser?.id) return false;
    const q = query.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q)
    );
  });

  const handleSelectUser = (targetUserId: string) => {
    const conv = startOrGetConversation(targetUserId);
    onSelectConversation(conv.id);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Message" maxWidth="sm">
      <div className="space-y-3">
        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search people..."
            className="w-full pl-9 pr-3 py-2 bg-neutral-100 dark:bg-neutral-800 rounded-xl text-xs outline-none text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400"
          />
        </div>

        {/* User list */}
        <div className="max-h-72 overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-800/60">
          {candidates.map((user) => (
            <div
              key={user.id}
              onClick={() => handleSelectUser(user.id)}
              className="flex items-center gap-3 py-2.5 px-2 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 rounded-xl cursor-pointer transition-colors"
            >
              <Avatar
                src={user.avatar}
                alt={user.name}
                size="sm"
                isOnline={user.isOnline}
              />
              <div className="overflow-hidden flex-1 text-left">
                <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                  {user.name}
                </p>
                <p className="text-[11px] text-neutral-400 truncate">
                  @{user.username}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
};
