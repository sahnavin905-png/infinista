import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  MoreHorizontal,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Copy,
  MapPin,
  Globe,
  Lock,
  Users,
} from 'lucide-react';
import { Post } from '../../types';
import { Avatar } from '../common/Avatar';
import { useAuth } from '../../context/AuthContext';
import { useSocial } from '../../context/SocialContext';

interface PostCardProps {
  post: Post;
  showCommentPreview?: boolean;
}

export const PostCard: React.FC<PostCardProps> = ({ post, showCommentPreview = true }) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const {
    toggleLikePost,
    toggleBookmarkPost,
    deletePost,
    addComment,
    getCommentsForPost,
    addToast,
  } = useSocial();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [quickComment, setQuickComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const comments = getCommentsForPost(post.id);
  const isAuthor = currentUser?.id === post.authorId;

  // Relative time helper
  const getRelativeTime = (dateString: string) => {
    const diff = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const handleQuickCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickComment.trim()) return;
    setIsSubmittingComment(true);
    addComment(post.id, quickComment.trim());
    setQuickComment('');
    setIsSubmittingComment(false);
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/post/${post.id}`;
    navigator.clipboard.writeText(url);
    addToast('Post link copied to clipboard!', 'success');
    setShowMoreMenu(false);
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this post?')) {
      deletePost(post.id);
      setShowMoreMenu(false);
    }
  };

  return (
    <article className="bg-white dark:bg-neutral-900 border-b border-neutral-200/80 dark:border-neutral-800/80 md:border md:rounded-2xl md:mb-4 overflow-hidden shadow-xs hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5">
        <div className="flex items-center gap-3">
          <Avatar
            src={post.author.avatar}
            alt={post.author.name}
            size="md"
            isOnline={post.author.isOnline}
            onClick={() => navigate(`/profile/${post.author.username}`)}
          />
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <Link
                to={`/profile/${post.author.username}`}
                className="font-bold text-sm text-neutral-900 dark:text-neutral-100 hover:text-rose-500 dark:hover:text-rose-400 transition-colors"
              >
                {post.author.name}
              </Link>
              {post.author.isVerified && (
                <CheckCircle className="w-4 h-4 text-rose-500 fill-rose-500/20" />
              )}
              <span className="text-xs text-neutral-400">
                @{post.author.username}
              </span>
              <span className="text-xs text-neutral-400">·</span>
              <span className="text-xs text-neutral-400">
                {getRelativeTime(post.createdAt)}
              </span>
            </div>

            {/* Location & Privacy badges */}
            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-neutral-400">
              {post.location && (
                <span className="flex items-center gap-0.5">
                  <MapPin className="w-3 h-3 text-rose-500" />
                  {post.location}
                </span>
              )}
              {post.privacy === 'followers' && (
                <span className="flex items-center gap-0.5" title="Followers only">
                  <Users className="w-3 h-3" />
                  Followers
                </span>
              )}
              {post.privacy === 'only_me' && (
                <span className="flex items-center gap-0.5" title="Only you">
                  <Lock className="w-3 h-3" />
                  Private
                </span>
              )}
            </div>
          </div>
        </div>

        {/* More Menu Trigger */}
        <div className="relative">
          <button
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            className="p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>

          {showMoreMenu && (
            <div className="absolute right-0 top-8 w-44 bg-white dark:bg-neutral-800 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-700 py-1.5 z-20 animate-in fade-in zoom-in-95 duration-100">
              <button
                onClick={handleCopyLink}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700/60 transition-colors"
              >
                <Copy className="w-4 h-4" />
                <span>Copy link</span>
              </button>
              {isAuthor && (
                <button
                  onClick={handleDelete}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete post</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Post Text Content */}
      <div className="px-4 pb-3">
        <p className="text-[15px] leading-relaxed text-neutral-800 dark:text-neutral-200 whitespace-pre-line">
          {post.text.split(' ').map((word, i) => {
            if (word.startsWith('#')) {
              const tag = word.replace(/[^a-zA-Z0-9_]/g, '');
              return (
                <Link
                  key={i}
                  to={`/search?q=${tag}`}
                  className="text-rose-500 hover:underline font-medium inline-block mr-1"
                >
                  {word}{' '}
                </Link>
              );
            }
            if (word.startsWith('@')) {
              const user = word.replace(/[^a-zA-Z0-9_]/g, '');
              return (
                <Link
                  key={i}
                  to={`/profile/${user}`}
                  className="text-violet-500 hover:underline font-medium inline-block mr-1"
                >
                  {word}{' '}
                </Link>
              );
            }
            return word + ' ';
          })}
        </p>

        {/* Hashtags list pills */}
        {post.hashtags && post.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {post.hashtags.map((tag) => (
              <Link
                key={tag}
                to={`/search?q=${tag}`}
                className="px-2.5 py-0.5 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 rounded-full text-xs font-medium transition-colors"
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Images Carousel */}
      {post.images && post.images.length > 0 && (
        <div className="relative bg-neutral-900 overflow-hidden select-none">
          <div className="relative w-full aspect-[4/3] max-h-[500px]">
            <img
              src={post.images[activeImageIndex]}
              alt="Post asset"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transition-opacity duration-300"
              loading="lazy"
            />
          </div>

          {/* Carousel Arrows */}
          {post.images.length > 1 && (
            <>
              <button
                onClick={() =>
                  setActiveImageIndex((prev) =>
                    prev === 0 ? post.images.length - 1 : prev - 1
                  )
                }
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors backdrop-blur-xs"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                onClick={() =>
                  setActiveImageIndex((prev) =>
                    prev === post.images.length - 1 ? 0 : prev + 1
                  )
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors backdrop-blur-xs"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Dots */}
              <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                {post.images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`h-1.5 rounded-full transition-all ${
                      idx === activeImageIndex
                        ? 'w-5 bg-white'
                        : 'w-1.5 bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Actions Bar */}
      <div className="px-4 py-3 flex items-center justify-between border-t border-neutral-100 dark:border-neutral-800/60">
        <div className="flex items-center gap-4">
          {/* Like Button */}
          <button
            onClick={() => toggleLikePost(post.id)}
            className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400 hover:text-rose-500 dark:hover:text-rose-400 group cursor-pointer transition-colors"
          >
            <Heart
              className={`w-5 h-5 transition-transform group-active:scale-125 ${
                post.isLiked
                  ? 'fill-rose-500 text-rose-500'
                  : 'group-hover:text-rose-500'
              }`}
            />
            <span
              className={`text-xs font-semibold ${
                post.isLiked ? 'text-rose-500' : ''
              }`}
            >
              {post.likesCount}
            </span>
          </button>

          {/* Comment Button */}
          <button
            onClick={() => navigate(`/post/${post.id}`)}
            className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 group cursor-pointer transition-colors"
          >
            <MessageCircle className="w-5 h-5 group-hover:text-violet-500 transition-colors" />
            <span className="text-xs font-semibold">{post.commentsCount}</span>
          </button>

          {/* Share Button */}
          <button
            onClick={handleCopyLink}
            className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 cursor-pointer transition-colors"
            title="Share post"
          >
            <Share2 className="w-5 h-5 hover:text-blue-500 transition-colors" />
          </button>
        </div>

        {/* Bookmark Button */}
        <button
          onClick={() => toggleBookmarkPost(post.id)}
          className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 cursor-pointer transition-colors"
          title={post.isBookmarked ? 'Remove bookmark' : 'Bookmark post'}
        >
          <Bookmark
            className={`w-5 h-5 ${
              post.isBookmarked
                ? 'fill-rose-500 text-rose-500'
                : 'hover:text-rose-500'
            }`}
          />
        </button>
      </div>

      {/* Footer & Comments Preview */}
      <div className="px-4 pb-3.5 space-y-2">
        {/* Likes summary */}
        {post.likesCount > 0 && (
          <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
            {post.likesCount} {post.likesCount === 1 ? 'like' : 'likes'}
          </p>
        )}

        {/* View all comments link */}
        {showCommentPreview && comments.length > 0 && (
          <div>
            {comments.length > 2 && (
              <button
                onClick={() => navigate(`/post/${post.id}`)}
                className="text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 font-medium"
              >
                View all {comments.length} comments
              </button>
            )}

            {/* Render 1-2 comment previews */}
            <div className="space-y-1 mt-1">
              {comments.slice(0, 2).map((comm) => (
                <div key={comm.id} className="text-xs text-neutral-800 dark:text-neutral-200">
                  <Link
                    to={`/profile/${comm.author.username}`}
                    className="font-bold text-neutral-900 dark:text-neutral-100 hover:text-rose-500 mr-1.5"
                  >
                    {comm.author.username}
                  </Link>
                  <span>{comm.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick comment input field */}
        {showCommentPreview && currentUser && (
          <form
            onSubmit={handleQuickCommentSubmit}
            className="flex items-center gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800/60"
          >
            <Avatar
              src={currentUser.avatar}
              alt={currentUser.name}
              size="xs"
            />
            <input
              type="text"
              value={quickComment}
              onChange={(e) => setQuickComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 bg-transparent text-xs text-neutral-800 dark:text-neutral-100 placeholder:text-neutral-400 outline-none"
            />
            {quickComment.trim() && (
              <button
                type="submit"
                disabled={isSubmittingComment}
                className="text-xs font-bold text-rose-500 hover:text-rose-600 disabled:opacity-50 cursor-pointer"
              >
                Post
              </button>
            )}
          </form>
        )}
      </div>
    </article>
  );
};
