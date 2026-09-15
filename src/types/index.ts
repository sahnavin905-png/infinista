export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar: string;
  coverImage?: string;
  bio: string;
  website?: string;
  location?: string;
  isVerified?: boolean;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  createdAt: string;
  isOnline?: boolean;
}

export interface Post {
  id: string;
  authorId: string;
  author: User;
  text: string;
  images: string[];
  hashtags: string[];
  location?: string;
  privacy: 'public' | 'followers' | 'only_me';
  likesCount: number;
  commentsCount: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
  createdAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  author: User;
  text: string;
  parentId?: string | null;
  likesCount: number;
  isLiked?: boolean;
  createdAt: string;
  replies?: Comment[];
}

export interface Story {
  id: string;
  authorId: string;
  author: User;
  mediaUrl: string;
  caption?: string;
  createdAt: string;
  expiresAt: string;
  seen?: boolean;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  image?: string;
  read: boolean;
  createdAt: string;
}

export interface Conversation {
  id: string;
  participantIds: string[];
  participants: User[];
  lastMessage?: {
    text: string;
    senderId: string;
    createdAt: string;
    read: boolean;
  };
  unreadCount: number;
  updatedAt: string;
}

export type NotificationType = 'like' | 'comment' | 'reply' | 'follow' | 'mention' | 'message';

export interface Notification {
  id: string;
  recipientId: string;
  senderId: string;
  sender: User;
  type: NotificationType;
  postId?: string;
  postSnippet?: string;
  message?: string;
  read: boolean;
  createdAt: string;
}

export interface TrendingTopic {
  id: string;
  tag: string;
  category: string;
  postsCount: number;
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  isPrivateAccount: boolean;
  showActivityStatus: boolean;
  messagePermissions: 'everyone' | 'following' | 'nobody';
  emailNotifications: boolean;
  pushNotifications: {
    likes: boolean;
    comments: boolean;
    followers: boolean;
    messages: boolean;
  };
}
