import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useSocial } from '../context/SocialContext';
import { PostCard } from '../components/post/PostCard';
import { CommentSection } from '../components/post/CommentSection';
import { EmptyState } from '../components/common/EmptyState';
import { Button } from '../components/common/Button';

export const PostDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { posts } = useSocial();

  const post = posts.find((p) => p.id === id);

  if (!post) {
    return (
      <div className="p-8">
        <EmptyState
          title="Post not found"
          description="This post may have been deleted or does not exist."
          action={
            <Button variant="primary" onClick={() => navigate('/home')}>
              Back to Home
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header with Back button */}
      <div className="sticky top-0 z-30 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-md border-b border-neutral-200/80 dark:border-neutral-800/80 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
          Post
        </h2>
      </div>

      {/* Main Post Card without duplicated comment preview */}
      <div className="md:p-4">
        <PostCard post={post} showCommentPreview={false} />

        {/* Full Comment Thread */}
        <div className="bg-white dark:bg-neutral-900 md:rounded-2xl border border-neutral-200/80 dark:border-neutral-800/80 p-4 mt-2">
          <CommentSection postId={post.id} />
        </div>
      </div>
    </div>
  );
};
