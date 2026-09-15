import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  Link as LinkIcon,
  CheckCircle,
  Mail,
  Edit3,
  UserPlus,
  UserCheck,
} from 'lucide-react';
import { User } from '../../types';
import { Avatar } from '../common/Avatar';
import { Button } from '../common/Button';
import { useAuth } from '../../context/AuthContext';
import { useSocial } from '../../context/SocialContext';
import { EditProfileModal } from './EditProfileModal';
import { FollowListModal } from './FollowListModal';

interface ProfileHeaderProps {
  user: User;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user }) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { isFollowing, toggleFollow, startOrGetConversation, getFollowers, getFollowing } = useSocial();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [followModalType, setFollowModalType] = useState<'followers' | 'following' | null>(null);

  const isMe = currentUser?.id === user.id;
  const following = isFollowing(user.id);

  const formatJoinedDate = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const handleMessageClick = () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    const conv = startOrGetConversation(user.id);
    navigate(`/messages/${conv.id}`);
  };

  return (
    <div className="bg-white dark:bg-neutral-900 border-b border-neutral-200/80 dark:border-neutral-800/80">
      {/* Cover Image */}
      <div className="relative h-44 sm:h-56 w-full bg-neutral-800 overflow-hidden">
        {user.coverImage ? (
          <img
            src={user.coverImage}
            alt={`${user.name} cover`}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-tr from-rose-500/30 via-purple-500/30 to-blue-500/30" />
        )}
      </div>

      {/* Profile Details Container */}
      <div className="px-4 sm:px-6 pb-6">
        {/* Avatar & Action Buttons Row */}
        <div className="flex items-end justify-between -mt-14 sm:-mt-16 mb-4">
          <Avatar
            src={user.avatar}
            alt={user.name}
            size="xl"
            isOnline={user.isOnline}
            className="ring-4 ring-white dark:ring-neutral-900 shadow-md"
          />

          <div className="flex items-center gap-2">
            {isMe ? (
              <Button
                variant="outline"
                size="sm"
                icon={<Edit3 className="w-4 h-4" />}
                onClick={() => setIsEditOpen(true)}
              >
                Edit Profile
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  icon={<Mail className="w-4 h-4" />}
                  onClick={handleMessageClick}
                >
                  Message
                </Button>
                <Button
                  variant={following ? 'outline' : 'primary'}
                  size="sm"
                  icon={
                    following ? (
                      <UserCheck className="w-4 h-4" />
                    ) : (
                      <UserPlus className="w-4 h-4" />
                    )
                  }
                  onClick={() => toggleFollow(user.id)}
                >
                  {following ? 'Following' : 'Follow'}
                </Button>
              </>
            )}
          </div>
        </div>

        {/* User Identity */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              {user.name}
            </h1>
            {user.isVerified && (
              <CheckCircle className="w-5 h-5 text-rose-500 fill-rose-500/20" />
            )}
          </div>
          <p className="text-xs sm:text-sm text-neutral-400 font-medium">
            @{user.username}
          </p>
        </div>

        {/* Bio */}
        {user.bio && (
          <p className="text-sm text-neutral-800 dark:text-neutral-200 mt-3 leading-relaxed whitespace-pre-line max-w-xl">
            {user.bio}
          </p>
        )}

        {/* Meta Info (Location, Website, Joined) */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3.5 text-xs text-neutral-500 dark:text-neutral-400">
          {user.location && (
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-rose-500" />
              {user.location}
            </span>
          )}

          {user.website && (
            <a
              href={user.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-rose-500 hover:underline"
            >
              <LinkIcon className="w-3.5 h-3.5" />
              {user.website.replace(/^https?:\/\//, '')}
            </a>
          )}

          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-neutral-400" />
            Joined {formatJoinedDate(user.createdAt)}
          </span>
        </div>

        {/* Stats Row */}
        <div className="flex items-center gap-6 mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800/60">
          <div className="text-xs">
            <span className="font-bold text-sm text-neutral-900 dark:text-neutral-100 mr-1.5">
              {user.postsCount || 0}
            </span>
            <span className="text-neutral-400">Posts</span>
          </div>

          <div
            onClick={() => setFollowModalType('followers')}
            className="text-xs cursor-pointer hover:underline"
          >
            <span className="font-bold text-sm text-neutral-900 dark:text-neutral-100 mr-1.5">
              {user.followersCount || 0}
            </span>
            <span className="text-neutral-400">Followers</span>
          </div>

          <div
            onClick={() => setFollowModalType('following')}
            className="text-xs cursor-pointer hover:underline"
          >
            <span className="font-bold text-sm text-neutral-900 dark:text-neutral-100 mr-1.5">
              {user.followingCount || 0}
            </span>
            <span className="text-neutral-400">Following</span>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isMe && (
        <EditProfileModal
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          user={user}
        />
      )}

      {/* Followers / Following List Modal */}
      {followModalType && (
        <FollowListModal
          isOpen={Boolean(followModalType)}
          onClose={() => setFollowModalType(null)}
          title={followModalType === 'followers' ? 'Followers' : 'Following'}
          users={
            followModalType === 'followers'
              ? getFollowers(user.id)
              : getFollowing(user.id)
          }
        />
      )}
    </div>
  );
};
