import React, { useState } from 'react';
import { StoryBar } from '../components/stories/StoryBar';
import { PostComposerInline } from '../components/post/PostComposerInline';
import { PostCard } from '../components/post/PostCard';
import { EmptyState } from '../components/common/EmptyState';
import { useSocial } from '../context/SocialContext';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Users } from 'lucide-react';

export const HomePage: React.FC = () => {
  const { posts, isFollowing } = useSocial();
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'for_you' | 'following'>('for_you');

  // Filter feed based on active tab
  const displayPosts = posts.filter((post) => {
    if (activeTab === 'for_you') return true;
    // 'following' feed: posts by currentUser or authors that currentUser follows
    if (!currentUser) return false;
    return post.authorId === currentUser.id || isFollowing(post.authorId);
  });

  return (
    <div className="w-full">
      {/* Top Feed Tabs */}
      <div className="sticky top-0 md:top-0 z-30 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-md border-b border-neutral-200/80 dark:border-neutral-800/80 flex items-center justify-around">
        <button
          onClick={() => setActiveTab('for_you')}
          className={`flex-1 py-3 text-center text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'for_you'
              ? 'border-rose-500 text-rose-600 dark:text-rose-400'
              : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
          }`}
        >
          <span className="flex items-center justify-center gap-1.5">
            <Sparkles className="w-4 h-4" />
            For You
          </span>
        </button>

        <button
          onClick={() => setActiveTab('following')}
          className={`flex-1 py-3 text-center text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'following'
              ? 'border-rose-500 text-rose-600 dark:text-rose-400'
              : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
          }`}
        >
          <span className="flex items-center justify-center gap-1.5">
            <Users className="w-4 h-4" />
            Following
          </span>
        </button>
      </div>

      {/* Stories Bar */}
      <StoryBar />

      {/* Inline Post Composer */}
      <PostComposerInline />

      {/* Posts Feed */}
      {displayPosts.length === 0 ? (
        <div className="bg-white dark:bg-neutral-900 md:rounded-2xl border border-neutral-200/80 dark:border-neutral-800/80 p-8 my-4">
          <EmptyState
            title={
              activeTab === 'following'
                ? 'No posts from people you follow'
                : 'No posts yet'
            }
            description={
              activeTab === 'following'
                ? 'Follow more creators on the Explore page or switch to "For You" to discover posts.'
                : 'Be the first person to share a post on Vibely!'
            }
          />
        </div>
      ) : (
        <div className="space-y-0 md:space-y-4">
          {displayPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
};
