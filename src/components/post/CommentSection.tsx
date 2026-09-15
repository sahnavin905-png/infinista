import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, CornerDownRight, Trash2, Send } from 'lucide-react';
import { Comment } from '../../types';
import { Avatar } from '../common/Avatar';
import { useAuth } from '../../context/AuthContext';
import { useSocial } from '../../context/SocialContext';

interface CommentItemProps {
  comment: Comment;
  postId: string;
  onReplyClick: (parentComment: Comment) => void;
}

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  postId,
  onReplyClick,
}) => {
  const { currentUser } = useAuth();
  const { toggleLikeComment, deleteComment } = useSocial();

  const isAuthor = currentUser?.id === comment.authorId;

  const getRelativeTime = (dateString: string) => {
    const diff = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
    if (diff < 60) return 'now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}d`;
  };

  return (
    <div className="flex gap-3 py-3 group">
      <Avatar
        src={comment.author.avatar}
        alt={comment.author.name}
        size="sm"
        isOnline={comment.author.isOnline}
      />
      <div className="flex-1 min-w-0">
        <div className="bg-neutral-100/70 dark:bg-neutral-800/60 rounded-2xl px-3.5 py-2.5">
          <div className="flex items-center justify-between gap-2">
            <Link
              to={`/profile/${comment.author.username}`}
              className="font-bold text-xs text-neutral-900 dark:text-neutral-100 hover:text-rose-500"
            >
              {comment.author.name}
              <span className="ml-1 text-[11px] font-normal text-neutral-400">
                @{comment.author.username}
              </span>
            </Link>
            <span className="text-[11px] text-neutral-400">
              {getRelativeTime(comment.createdAt)}
            </span>
          </div>
          <p className="text-xs text-neutral-800 dark:text-neutral-200 mt-1 leading-relaxed break-words">
            {comment.text}
          </p>
        </div>

        {/* Comment actions row */}
        <div className="flex items-center gap-4 mt-1.5 px-2 text-[11px] text-neutral-400">
          <button
            onClick={() => toggleLikeComment(comment.id)}
            className={`flex items-center gap-1 font-semibold hover:text-rose-500 cursor-pointer ${
              comment.isLiked ? 'text-rose-500' : ''
            }`}
          >
            <Heart
              className={`w-3.5 h-3.5 ${
                comment.isLiked ? 'fill-rose-500 text-rose-500' : ''
              }`}
            />
            <span>{comment.likesCount || 0}</span>
          </button>

          <button
            onClick={() => onReplyClick(comment)}
            className="font-semibold hover:text-neutral-700 dark:hover:text-neutral-300 cursor-pointer"
          >
            Reply
          </button>

          {isAuthor && (
            <button
              onClick={() => deleteComment(comment.id)}
              className="hover:text-red-500 transition-colors cursor-pointer"
              title="Delete comment"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Nested Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-2 pl-4 border-l-2 border-neutral-200 dark:border-neutral-800 space-y-2">
            {comment.replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                postId={postId}
                onReplyClick={onReplyClick}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

interface CommentSectionProps {
  postId: string;
}

export const CommentSection: React.FC<CommentSectionProps> = ({ postId }) => {
  const { currentUser } = useAuth();
  const { getCommentsForPost, addComment, addToast } = useSocial();

  const [text, setText] = useState('');
  const [replyingTo, setReplyingTo] = useState<Comment | null>(null);

  const comments = getCommentsForPost(postId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      addToast('Please log in to comment', 'info');
      return;
    }
    if (!text.trim()) return;

    addComment(postId, text.trim(), replyingTo ? replyingTo.id : null);
    setText('');
    setReplyingTo(null);
  };

  return (
    <div className="mt-4">
      <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 mb-3">
        Comments ({comments.length})
      </h3>

      {/* Comment input form */}
      {currentUser ? (
        <form onSubmit={handleSubmit} className="mb-4">
          {replyingTo && (
            <div className="flex items-center justify-between text-xs text-rose-500 bg-rose-50 dark:bg-rose-950/40 px-3 py-1.5 rounded-t-xl">
              <span>Replying to @{replyingTo.author.username}</span>
              <button
                type="button"
                onClick={() => setReplyingTo(null)}
                className="text-neutral-400 hover:text-neutral-600 font-bold"
              >
                ✕
              </button>
            </div>
          )}
          <div className="flex items-center gap-2 p-2 bg-neutral-100 dark:bg-neutral-800/80 rounded-2xl">
            <Avatar src={currentUser.avatar} alt={currentUser.name} size="sm" />
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={
                replyingTo
                  ? `Reply to @${replyingTo.author.username}...`
                  : 'Write a comment...'
              }
              className="flex-1 bg-transparent text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 outline-none"
            />
            <button
              type="submit"
              disabled={!text.trim()}
              className="p-2 text-rose-500 hover:text-rose-600 disabled:opacity-30 transition-opacity cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      ) : (
        <div className="p-3 bg-neutral-100 dark:bg-neutral-800/60 rounded-xl text-xs text-center text-neutral-500 mb-4">
          Please <Link to="/login" className="text-rose-500 font-bold underline">log in</Link> to join the conversation.
        </div>
      )}

      {/* Comments List */}
      {comments.length === 0 ? (
        <p className="text-xs text-neutral-400 text-center py-6">
          No comments yet. Be the first to share your thoughts!
        </p>
      ) : (
        <div className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              postId={postId}
              onReplyClick={(target) => setReplyingTo(target)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
