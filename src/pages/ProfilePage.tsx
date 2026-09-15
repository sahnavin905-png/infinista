import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Grid, Bookmark, Heart, FileText, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocial } from '../context/SocialContext';
import { ProfileHeader } from '../components/profile/ProfileHeader';
import { PostCard } from '../components/post/PostCard';
import { EmptyState } from '../components/common/EmptyState';

export const ProfilePage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { users, currentUser } = useAuth();
  const { posts } = useSocial();

  const [activeTab, setActiveTab] = useState<'posts' | 'media' | 'likes' | 'saved'>('posts');

  const user = users.find(
    (u) => u.username.toLowerCase() === username?.toLowerCase()
  );

  const isMe = currentUser?.id === user?.id;

  if (!user) {
    return (
      <div className="p-8">
        <EmptyState
          title="User not found"
          description="The user you are looking for does not exist on Vibely."
        />
      </div>
    );
  }

  // Filter posts
  const userPosts = posts.filter((p) => p.authorId === user.id);
  const mediaPosts = userPosts.filter((p) => p.images && p.images.length > 0);
  const likedPosts = posts.filter((p) => p.isLiked);
  const savedPosts = posts.filter((p) => p.isBookmarked);

  const getActiveTabPosts = () => {
    switch (activeTab) {
      case 'media':
        return mediaPosts;
      case 'likes':
        return likedPosts;
      case 'saved':
        return savedPosts;
      case 'posts':
      default:
        return userPosts;
    }
  };

  const displayPosts = getActiveTabPosts();

  return (
    <div className="w-full">
      {/* Sticky top nav bar */}
      <div className="sticky top-0 z-30 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-md border-b border-neutral-200/80 dark:border-neutral-800/80 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 leading-tight">
            {user.name}
          </h2>
          <p className="text-[11px] text-neutral-400">
            {userPosts.length} {userPosts.length === 1 ? 'post' : 'posts'}
          </p>
        </div>
      </div>

      {/* Profile Header Details */}
      <ProfileHeader user={user} />

      {/* Tabs */}
      <div className="flex border-b border-neutral-200/80 dark:border-neutral-800/80 bg-white dark:bg-neutral-900 sticky top-12 z-20">
        <button
          onClick={() => setActiveTab('posts')}
          className={`flex-1 py-3 text-center text-xs font-bold border-b-2 flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
            activeTab === 'posts'
              ? 'border-rose-500 text-rose-500'
              : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Posts</span>
        </button>

        <button
          onClick={() => setActiveTab('media')}
          className={`flex-1 py-3 text-center text-xs font-bold border-b-2 flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
            activeTab === 'media'
              ? 'border-rose-500 text-rose-500'
              : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>Media</span>
        </button>

        <button
          onClick={() => setActiveTab('likes')}
          className={`flex-1 py-3 text-center text-xs font-bold border-b-2 flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
            activeTab === 'likes'
              ? 'border-rose-500 text-rose-500'
              : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>Likes</span>
        </button>

        {isMe && (
          <button
            onClick={() => setActiveTab('saved')}
            className={`flex-1 py-3 text-center text-xs font-bold border-b-2 flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'saved'
                ? 'border-rose-500 text-rose-500'
                : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>Saved</span>
          </button>
        )}
      </div>

      {/* Feed Content */}
      <div className="py-2 sm:py-4">
        {activeTab === 'media' ? (
          /* Media Grid */
          displayPosts.length === 0 ? (
            <div className="p-8">
              <EmptyState
                title="No media posts"
                description="Photos and uploaded media will appear here."
              />
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-1 sm:gap-2 px-2">
              {displayPosts.map((post) => (
                <div
                  key={post.id}
                  onClick={() => navigate(`/post/${post.id}`)}
                  className="aspect-square rounded-lg sm:rounded-xl overflow-hidden bg-neutral-900 cursor-pointer group relative"
                >
                  <img
                    src={post.images[0]}
                    alt="Media"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
          )
        ) : (
          /* Regular Post Stream */
          displayPosts.length === 0 ? (
            <div className="p-8">
              <EmptyState
                title={
                  activeTab === 'saved'
                    ? 'No saved posts'
                    : activeTab === 'likes'
                    ? 'No liked posts'
                    : 'No posts yet'
                }
                description={
                  activeTab === 'saved'
                    ? 'Bookmark posts you want to view later.'
                    : activeTab === 'likes'
                    ? 'Posts liked will show up here.'
                    : 'This user has not posted anything yet.'
                }
              />
            </div>
          ) : (
            <div className="space-y-0 md:space-y-4">
              {displayPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
};
