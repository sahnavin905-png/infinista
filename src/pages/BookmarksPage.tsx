import React from 'react';
import { Bookmark } from 'lucide-react';
import { useSocial } from '../context/SocialContext';
import { PostCard } from '../components/post/PostCard';
import { EmptyState } from '../components/common/EmptyState';

export const BookmarksPage: React.FC = () => {
  const { posts } = useSocial();

  const savedPosts = posts.filter((p) => p.isBookmarked);

  return (
    <div className="w-full">
      <div className="sticky top-0 z-30 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-md border-b border-neutral-200/80 dark:border-neutral-800/80 px-4 py-3.5">
        <h1 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
          Bookmarks
        </h1>
        <p className="text-xs text-neutral-400">Posts you saved for later</p>
      </div>

      <div className="p-0 md:p-4">
        {savedPosts.length === 0 ? (
          <div className="bg-white dark:bg-neutral-900 md:rounded-2xl border border-neutral-200/80 dark:border-neutral-800 p-8 my-4">
            <EmptyState
              title="No bookmarks yet"
              description="Click the bookmark icon on any post to save it here for easy reading."
              icon={<Bookmark className="w-10 h-10 text-neutral-400" />}
            />
          </div>
        ) : (
          <div className="space-y-0 md:space-y-4">
            {savedPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
