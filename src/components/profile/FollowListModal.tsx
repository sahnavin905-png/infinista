import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Plus } from 'lucide-react';
import { User } from '../../types';
import { Modal } from '../common/Modal';
import { Avatar } from '../common/Avatar';
import { useAuth } from '../../context/AuthContext';
import { useSocial } from '../../context/SocialContext';

interface FollowListModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  users: User[];
}

export const FollowListModal: React.FC<FollowListModalProps> = ({
  isOpen,
  onClose,
  title,
  users,
}) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { isFollowing, toggleFollow } = useSocial();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="sm">
      {users.length === 0 ? (
        <div className="py-8 text-center text-xs text-neutral-400">
          No users to show.
        </div>
      ) : (
        <div className="divide-y divide-neutral-100 dark:divide-neutral-800/60 max-h-80 overflow-y-auto">
          {users.map((user) => {
            const following = isFollowing(user.id);
            const isMe = user.id === currentUser?.id;

            return (
              <div
                key={user.id}
                className="flex items-center justify-between py-2.5 px-1"
              >
                <div
                  onClick={() => {
                    navigate(`/profile/${user.username}`);
                    onClose();
                  }}
                  className="flex items-center gap-2.5 cursor-pointer flex-1 overflow-hidden"
                >
                  <Avatar
                    src={user.avatar}
                    alt={user.name}
                    size="sm"
                    isOnline={user.isOnline}
                  />
                  <div className="overflow-hidden">
                    <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 truncate hover:text-rose-500">
                      {user.name}
                    </p>
                    <p className="text-[11px] text-neutral-400 truncate">
                      @{user.username}
                    </p>
                  </div>
                </div>

                {!isMe && (
                  <button
                    onClick={() => toggleFollow(user.id)}
                    className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                      following
                        ? 'border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:text-red-500'
                        : 'bg-rose-500 text-white hover:bg-rose-600'
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
                )}
              </div>
            );
          })}
        </div>
      )}
    </Modal>
  );
};
