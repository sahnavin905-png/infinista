import React, { useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Search,
  TrendingUp,
  Heart,
  MessageCircle,
  Users,
  Hash,
  Sparkles,
  Check,
  Plus,
} from 'lucide-react';
import { useSocial } from '../context/SocialContext';
import { useAuth } from '../context/AuthContext';
import { Avatar } from '../components/common/Avatar';
import { PostCard } from '../components/post/PostCard';

export const ExplorePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';

  const { posts, trendingTopics, isFollowing, toggleFollow } = useSocial();
  const { users, currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState<'all' | 'media' | 'people' | 'tags'>(
    'all'
  );
  const [searchQuery, setSearchQuery] = useState(queryParam);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (val) {
      setSearchParams({ q: val });
    } else {
      setSearchParams({});
    }
  };

  const handleTagClick = (tag: string) => {
    setSearchQuery(tag);
    setSearchParams({ q: tag });
  };

  // Filtered posts based on query
  const filteredPosts = useMemo(() => {
    if (!searchQuery.trim()) return posts;
    const q = searchQuery.toLowerCase().replace('#', '');
    return posts.filter((p) => {
      const textMatch = p.text.toLowerCase().includes(q);
      const tagMatch = p.hashtags?.some((t) => t.toLowerCase().includes(q));
      const authorMatch =
        p.author.name.toLowerCase().includes(q) ||
        p.author.username.toLowerCase().includes(q);
      return textMatch || tagMatch || authorMatch;
    });
  }, [posts, searchQuery]);

  // Posts with media only for the visual grid
  const mediaPosts = useMemo(() => {
    return filteredPosts.filter((p) => p.images && p.images.length > 0);
  }, [filteredPosts]);

  // Filtered users for people tab
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) {
      return users.filter((u) => u.id !== currentUser?.id);
    }
    const q = searchQuery.toLowerCase().replace('@', '');
    return users.filter(
      (u) =>
        u.id !== currentUser?.id &&
        (u.name.toLowerCase().includes(q) ||
          u.username.toLowerCase().includes(q) ||
          u.bio?.toLowerCase().includes(q))
    );
  }, [users, currentUser, searchQuery]);

  return (
    <div className="w-full">
      {/* Search Header */}
      <div className="sticky top-0 z-30 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800 p-3.5">
        <div className="relative mb-3">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search tags, people, or topics..."
            className="w-full pl-10 pr-4 py-2.5 bg-neutral-100 dark:bg-neutral-900 border border-transparent focus:border-rose-500/50 rounded-2xl text-sm outline-none placeholder:text-neutral-400 text-neutral-900 dark:text-neutral-100"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSearchParams({});
              }}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-neutral-400 hover:text-neutral-600"
            >
              Clear
            </button>
          )}
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {[
            { id: 'all', label: 'Top', icon: <Sparkles className="w-3.5 h-3.5" /> },
            { id: 'media', label: 'Photos', icon: null },
            { id: 'people', label: 'People', icon: <Users className="w-3.5 h-3.5" /> },
            { id: 'tags', label: 'Trending Tags', icon: <Hash className="w-3.5 h-3.5" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
                activeTab === tab.id
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Explore Content By Tab */}
      <div className="p-3 sm:p-4">
        {/* MEDIA TAB: Instagram-style 3-column Visual Grid */}
        {activeTab === 'media' && (
          <div className="grid grid-cols-3 gap-1 sm:gap-2">
            {mediaPosts.map((post) => (
              <div
                key={post.id}
                onClick={() => navigate(`/post/${post.id}`)}
                className="relative aspect-square rounded-lg sm:rounded-xl overflow-hidden bg-neutral-900 group cursor-pointer"
              >
                <img
                  src={post.images[0]}
                  alt="Explore asset"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
                {/* Hover overlay with likes and comments */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white font-bold text-xs sm:text-sm">
                  <div className="flex items-center gap-1">
                    <Heart className="w-4 h-4 fill-white" />
                    <span>{post.likesCount}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="w-4 h-4 fill-white" />
                    <span>{post.commentsCount}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* PEOPLE TAB */}
        {activeTab === 'people' && (
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 divide-y divide-neutral-100 dark:divide-neutral-800/60 overflow-hidden">
            {filteredUsers.length === 0 ? (
              <div className="p-8 text-center text-xs text-neutral-400">
                No users found for "{searchQuery}"
              </div>
            ) : (
              filteredUsers.map((user) => {
                const following = isFollowing(user.id);
                return (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4"
                  >
                    <div
                      onClick={() => navigate(`/profile/${user.username}`)}
                      className="flex items-center gap-3 cursor-pointer overflow-hidden flex-1"
                    >
                      <Avatar
                        src={user.avatar}
                        alt={user.name}
                        size="md"
                        isOnline={user.isOnline}
                      />
                      <div className="overflow-hidden">
                        <p className="text-sm font-bold text-neutral-900 dark:text-neutral-100 truncate hover:text-rose-500">
                          {user.name}
                        </p>
                        <p className="text-xs text-neutral-400 truncate">
                          @{user.username}
                        </p>
                        {user.bio && (
                          <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-1 mt-0.5">
                            {user.bio}
                          </p>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => toggleFollow(user.id)}
                      className={`flex items-center gap-1 px-4 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all ${
                        following
                          ? 'border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:text-red-500'
                          : 'bg-rose-500 text-white hover:bg-rose-600'
                      }`}
                    >
                      {following ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Following</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Follow</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* TAGS TAB */}
        {activeTab === 'tags' && (
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 divide-y divide-neutral-100 dark:divide-neutral-800/60 overflow-hidden">
            {trendingTopics.map((topic) => (
              <div
                key={topic.id}
                onClick={() => {
                  handleTagClick(topic.tag);
                  setActiveTab('all');
                }}
                className="flex items-center justify-between p-4 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 cursor-pointer transition-colors"
              >
                <div>
                  <span className="text-xs text-neutral-400">
                    {topic.category} · Trending
                  </span>
                  <p className="font-bold text-sm text-neutral-900 dark:text-neutral-100 hover:text-rose-500">
                    #{topic.tag}
                  </p>
                  <span className="text-xs text-neutral-500">
                    {(topic.postsCount / 1000).toFixed(1)}k posts
                  </span>
                </div>
                <div className="w-8 h-8 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ALL / TOP TAB */}
        {activeTab === 'all' && (
          <div className="space-y-4">
            {/* Quick Tag Pills */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {trendingTopics.slice(0, 6).map((topic) => (
                <button
                  key={topic.id}
                  onClick={() => handleTagClick(topic.tag)}
                  className="px-3 py-1 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-rose-500 rounded-full text-xs font-semibold text-neutral-700 dark:text-neutral-300 whitespace-nowrap transition-colors"
                >
                  #{topic.tag}
                </button>
              ))}
            </div>

            {/* Posts Stream */}
            <div className="space-y-4">
              {filteredPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
