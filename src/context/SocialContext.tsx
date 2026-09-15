import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Post,
  Comment,
  Story,
  Conversation,
  Message,
  Notification,
  TrendingTopic,
  User,
  UserSettings,
} from '../types';
import { storage } from '../services/storage';
import { useAuth } from './AuthContext';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'error';
  message: string;
}

interface SocialContextType {
  posts: Post[];
  stories: Story[];
  conversations: Conversation[];
  notifications: Notification[];
  trendingTopics: TrendingTopic[];
  settings: UserSettings;
  unreadNotificationsCount: number;
  unreadMessagesCount: number;
  toasts: ToastMessage[];
  addToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  removeToast: (id: string) => void;
  // Post actions
  createPost: (data: {
    text: string;
    images?: string[];
    hashtags?: string[];
    location?: string;
    privacy?: 'public' | 'followers' | 'only_me';
  }) => Promise<Post>;
  deletePost: (postId: string) => boolean;
  toggleLikePost: (postId: string) => void;
  toggleBookmarkPost: (postId: string) => void;
  isPostBookmarked: (postId: string) => boolean;
  getBookmarkedPosts: () => Post[];
  getPostById: (postId: string) => Post | undefined;
  // Comment actions
  getCommentsForPost: (postId: string) => Comment[];
  addComment: (postId: string, text: string, parentId?: string | null) => void;
  deleteComment: (commentId: string) => boolean;
  toggleLikeComment: (commentId: string) => void;
  // Follow actions
  isFollowing: (userId: string) => boolean;
  toggleFollow: (userId: string) => void;
  getFollowers: (userId: string) => User[];
  getFollowing: (userId: string) => User[];
  // Stories actions
  addStory: (mediaUrl: string, caption?: string) => void;
  markStorySeen: (storyId: string) => void;
  // Message actions
  getMessages: (conversationId: string) => Message[];
  sendMessage: (conversationId: string, text: string, image?: string) => void;
  startOrGetConversation: (targetUserId: string) => Conversation;
  markConversationAsRead: (conversationId: string) => void;
  // Notification actions
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  // Settings & Theme
  updateSettings: (settings: Partial<UserSettings>) => void;
  toggleTheme: () => void;
  resetAllData: () => void;
  refreshData: () => void;
}

const SocialContext = createContext<SocialContextType | undefined>(undefined);

export const SocialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, refreshUsers } = useAuth();

  const [posts, setPosts] = useState<Post[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([]);
  const [settings, setSettings] = useState<UserSettings>(storage.getSettings());
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((message: string, type: 'success' | 'info' | 'error' = 'info') => {
    const id = `toast_${Date.now()}_${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Theme management
  useEffect(() => {
    const root = document.documentElement;
    const isDark =
      settings.theme === 'dark' ||
      (settings.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [settings.theme]);

  // Load and refresh state
  const refreshData = useCallback(() => {
    const rawPosts = storage.getPosts();
    // Map with current user like/bookmark state
    const userId = currentUser?.id;
    const mappedPosts = rawPosts.map((p) => ({
      ...p,
      isLiked: userId ? p.isLiked : false,
      isBookmarked: userId ? storage.isBookmarked(userId, p.id) : false,
    }));

    setPosts(mappedPosts);
    setStories(storage.getStories());
    setConversations(storage.getConversations());
    setTrendingTopics(storage.getTrendingTopics());

    if (userId) {
      setNotifications(storage.getNotifications(userId));
    } else {
      setNotifications([]);
    }
  }, [currentUser?.id]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Post methods
  const createPost = async (data: {
    text: string;
    images?: string[];
    hashtags?: string[];
    location?: string;
    privacy?: 'public' | 'followers' | 'only_me';
  }): Promise<Post> => {
    if (!currentUser) throw new Error('Must be logged in to create post');

    // Extract hashtags if not explicitly passed
    let tags = data.hashtags || [];
    if (tags.length === 0) {
      const matched = data.text.match(/#[a-zA-Z0-9_]+/g);
      if (matched) {
        tags = matched.map((t) => t.replace('#', ''));
      }
    }

    const newPost: Post = {
      id: `post_${Date.now()}`,
      authorId: currentUser.id,
      author: currentUser,
      text: data.text.trim(),
      images: data.images || [],
      hashtags: tags,
      location: data.location || '',
      privacy: data.privacy || 'public',
      likesCount: 0,
      commentsCount: 0,
      isLiked: false,
      isBookmarked: false,
      createdAt: new Date().toISOString(),
    };

    storage.savePost(newPost);
    refreshData();
    refreshUsers();
    addToast('Post published successfully!', 'success');
    return newPost;
  };

  const deletePost = (postId: string): boolean => {
    if (!currentUser) return false;
    const ok = storage.deletePost(postId, currentUser.id);
    if (ok) {
      refreshData();
      refreshUsers();
      addToast('Post deleted', 'info');
    }
    return ok;
  };

  const toggleLikePost = (postId: string) => {
    if (!currentUser) {
      addToast('Please login to like posts', 'info');
      return;
    }

    // Optimistic UI update
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const newLiked = !p.isLiked;
          return {
            ...p,
            isLiked: newLiked,
            likesCount: Math.max(0, p.likesCount + (newLiked ? 1 : -1)),
          };
        }
        return p;
      })
    );

    // Save in storage
    storage.toggleLikePost(postId, currentUser.id);
  };

  const toggleBookmarkPost = (postId: string) => {
    if (!currentUser) {
      addToast('Please login to save bookmarks', 'info');
      return;
    }

    const isNowBookmarked = storage.toggleBookmark(currentUser.id, postId);

    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            isBookmarked: isNowBookmarked,
          };
        }
        return p;
      })
    );

    addToast(isNowBookmarked ? 'Post saved to bookmarks' : 'Removed from bookmarks', 'info');
  };

  const isPostBookmarked = (postId: string): boolean => {
    if (!currentUser) return false;
    return storage.isBookmarked(currentUser.id, postId);
  };

  const getBookmarkedPosts = (): Post[] => {
    if (!currentUser) return [];
    return storage.getBookmarkedPosts(currentUser.id);
  };

  const getPostById = (postId: string): Post | undefined => {
    return posts.find((p) => p.id === postId) || storage.getPostById(postId);
  };

  // Comment methods
  const getCommentsForPost = (postId: string): Comment[] => {
    return storage.getCommentsByPostId(postId);
  };

  const addComment = (postId: string, text: string, parentId?: string | null) => {
    if (!currentUser) {
      addToast('Please login to comment', 'info');
      return;
    }

    const newComment: Comment = {
      id: `comm_${Date.now()}`,
      postId,
      authorId: currentUser.id,
      author: currentUser,
      text: text.trim(),
      parentId: parentId || null,
      likesCount: 0,
      isLiked: false,
      createdAt: new Date().toISOString(),
      replies: [],
    };

    storage.addComment(newComment);
    refreshData();
    addToast('Comment added!', 'success');
  };

  const deleteComment = (commentId: string): boolean => {
    if (!currentUser) return false;
    const ok = storage.deleteComment(commentId, currentUser.id);
    if (ok) {
      refreshData();
      addToast('Comment removed', 'info');
    }
    return ok;
  };

  const toggleLikeComment = (commentId: string) => {
    if (!currentUser) return;
    storage.toggleLikeComment(commentId);
    refreshData();
  };

  // Follow methods
  const isFollowing = (userId: string): boolean => {
    if (!currentUser) return false;
    return storage.isFollowing(currentUser.id, userId);
  };

  const toggleFollow = (userId: string) => {
    if (!currentUser) {
      addToast('Please login to follow accounts', 'info');
      return;
    }
    if (currentUser.id === userId) {
      addToast('You cannot follow yourself', 'info');
      return;
    }

    const nowFollowing = storage.toggleFollow(currentUser.id, userId);
    refreshUsers();
    refreshData();

    const target = storage.getUserById(userId);
    const targetName = target ? `@${target.username}` : 'user';
    addToast(nowFollowing ? `Now following ${targetName}` : `Unfollowed ${targetName}`, 'info');
  };

  const getFollowers = (userId: string): User[] => {
    return storage.getFollowers(userId);
  };

  const getFollowing = (userId: string): User[] => {
    return storage.getFollowing(userId);
  };

  // Stories
  const addStory = (mediaUrl: string, caption?: string) => {
    if (!currentUser) return;
    const newStory: Story = {
      id: `story_${Date.now()}`,
      authorId: currentUser.id,
      author: currentUser,
      mediaUrl,
      caption: caption || '',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      seen: false,
    };
    storage.addStory(newStory);
    refreshData();
    addToast('Story shared!', 'success');
  };

  const markStorySeen = (storyId: string) => {
    storage.markStorySeen(storyId);
    setStories((prev) =>
      prev.map((s) => (s.id === storyId ? { ...s, seen: true } : s))
    );
  };

  // Direct messaging
  const getMessages = (conversationId: string): Message[] => {
    return storage.getMessages(conversationId);
  };

  const sendMessage = (conversationId: string, text: string, image?: string) => {
    if (!currentUser) return;
    const msg: Message = {
      id: `msg_${Date.now()}`,
      conversationId,
      senderId: currentUser.id,
      text: text.trim(),
      image,
      read: false,
      createdAt: new Date().toISOString(),
    };
    storage.sendMessage(conversationId, msg);
    refreshData();
  };

  const startOrGetConversation = (targetUserId: string): Conversation => {
    if (!currentUser) throw new Error('Not logged in');
    const conv = storage.createOrGetConversation(currentUser.id, targetUserId);
    refreshData();
    return conv;
  };

  const markConversationAsRead = (conversationId: string) => {
    storage.markConversationRead(conversationId);
    refreshData();
  };

  // Notifications
  const markNotificationAsRead = (id: string) => {
    storage.markNotificationRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    if (!currentUser) return;
    storage.markAllNotificationsRead(currentUser.id);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    addToast('All notifications marked as read', 'info');
  };

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;
  const unreadMessagesCount = conversations.reduce(
    (acc, curr) => acc + (curr.unreadCount || 0),
    0
  );

  // Settings & Theme
  const updateSettings = (newSettings: Partial<UserSettings>) => {
    const merged = { ...settings, ...newSettings };
    storage.saveSettings(merged);
    setSettings(merged);
    addToast('Settings saved', 'success');
  };

  const toggleTheme = () => {
    const nextTheme = settings.theme === 'dark' ? 'light' : 'dark';
    updateSettings({ theme: nextTheme });
  };

  const resetAllData = () => {
    storage.resetToDefaults();
    refreshUsers();
    refreshData();
    addToast('Reset to demo data successfully!', 'success');
  };

  return (
    <SocialContext.Provider
      value={{
        posts,
        stories,
        conversations,
        notifications,
        trendingTopics,
        settings,
        unreadNotificationsCount,
        unreadMessagesCount,
        toasts,
        addToast,
        removeToast,
        createPost,
        deletePost,
        toggleLikePost,
        toggleBookmarkPost,
        isPostBookmarked,
        getBookmarkedPosts,
        getPostById,
        getCommentsForPost,
        addComment,
        deleteComment,
        toggleLikeComment,
        isFollowing,
        toggleFollow,
        getFollowers,
        getFollowing,
        addStory,
        markStorySeen,
        getMessages,
        sendMessage,
        startOrGetConversation,
        markConversationAsRead,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        updateSettings,
        toggleTheme,
        resetAllData,
        refreshData,
      }}
    >
      {children}
    </SocialContext.Provider>
  );
};

export const useSocial = () => {
  const context = useContext(SocialContext);
  if (!context) {
    throw new Error('useSocial must be used within a SocialProvider');
  }
  return context;
};
