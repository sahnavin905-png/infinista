import {
  User,
  Post,
  Comment,
  Story,
  Conversation,
  Message,
  Notification,
  UserSettings,
  TrendingTopic,
} from '../types';
import {
  SEED_USERS,
  SEED_POSTS,
  SEED_COMMENTS,
  SEED_STORIES,
  SEED_CONVERSATIONS,
  SEED_MESSAGES,
  SEED_NOTIFICATIONS,
  SEED_TRENDING_TOPICS,
} from '../data/seedData';

const STORAGE_KEYS = {
  USERS: 'vibely_users_v1',
  CURRENT_USER: 'vibely_current_user_v1',
  POSTS: 'vibely_posts_v1',
  COMMENTS: 'vibely_comments_v1',
  STORIES: 'vibely_stories_v1',
  CONVERSATIONS: 'vibely_conversations_v1',
  MESSAGES: 'vibely_messages_v1',
  NOTIFICATIONS: 'vibely_notifications_v1',
  FOLLOWS: 'vibely_follows_v1', // Record<string, string[]> (userId -> followingIds)
  BOOKMARKS: 'vibely_bookmarks_v1', // Record<string, string[]> (userId -> postIds)
  SETTINGS: 'vibely_settings_v1',
  TRENDING: 'vibely_trending_v1',
};

export const DEFAULT_SETTINGS: UserSettings = {
  theme: 'system',
  isPrivateAccount: false,
  showActivityStatus: true,
  messagePermissions: 'everyone',
  emailNotifications: true,
  pushNotifications: {
    likes: true,
    comments: true,
    followers: true,
    messages: true,
  },
};

export class StorageService {
  private get<T>(key: string, fallback: T): T {
    try {
      const item = localStorage.getItem(key);
      if (!item) return fallback;
      return JSON.parse(item);
    } catch {
      return fallback;
    }
  }

  private set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`Error saving to localStorage key: ${key}`, e);
    }
  }

  public init() {
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      this.resetToDefaults();
    }
  }

  public resetToDefaults() {
    this.set(STORAGE_KEYS.USERS, SEED_USERS);
    this.set(STORAGE_KEYS.CURRENT_USER, SEED_USERS[0]); // Alex Rivera is default logged-in user
    this.set(STORAGE_KEYS.POSTS, SEED_POSTS);
    this.set(STORAGE_KEYS.COMMENTS, SEED_COMMENTS);
    this.set(STORAGE_KEYS.STORIES, SEED_STORIES);
    this.set(STORAGE_KEYS.CONVERSATIONS, SEED_CONVERSATIONS);
    this.set(STORAGE_KEYS.MESSAGES, SEED_MESSAGES);
    this.set(STORAGE_KEYS.NOTIFICATIONS, SEED_NOTIFICATIONS);
    this.set(STORAGE_KEYS.TRENDING, SEED_TRENDING_TOPICS);
    this.set(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);

    // Initial follow graph: user_alex follows user_elena, user_marcus, user_sophia
    const follows: Record<string, string[]> = {
      user_alex: ['user_elena', 'user_marcus', 'user_sophia'],
    };
    this.set(STORAGE_KEYS.FOLLOWS, follows);

    // Initial bookmarks for alex
    const bookmarks: Record<string, string[]> = {
      user_alex: ['post_2', 'post_5', 'post_9', 'post_12', 'post_16'],
    };
    this.set(STORAGE_KEYS.BOOKMARKS, bookmarks);
  }

  // Current User
  public getCurrentUser(): User | null {
    return this.get<User | null>(STORAGE_KEYS.CURRENT_USER, null);
  }

  public setCurrentUser(user: User | null): void {
    this.set(STORAGE_KEYS.CURRENT_USER, user);
  }

  // Users
  public getUsers(): User[] {
    return this.get<User[]>(STORAGE_KEYS.USERS, SEED_USERS);
  }

  public getUserById(id: string): User | undefined {
    return this.getUsers().find((u) => u.id === id);
  }

  public getUserByUsername(username: string): User | undefined {
    const cleanUsername = username.toLowerCase().replace('@', '');
    return this.getUsers().find(
      (u) => u.username.toLowerCase() === cleanUsername
    );
  }

  public saveUser(user: User): void {
    const users = this.getUsers();
    const index = users.findIndex((u) => u.id === user.id);
    if (index >= 0) {
      users[index] = user;
    } else {
      users.unshift(user);
    }
    this.set(STORAGE_KEYS.USERS, users);

    // Also update current user if matching
    const curr = this.getCurrentUser();
    if (curr && curr.id === user.id) {
      this.setCurrentUser(user);
    }
  }

  // Follows
  public getFollows(): Record<string, string[]> {
    return this.get<Record<string, string[]>>(STORAGE_KEYS.FOLLOWS, {});
  }

  public isFollowing(followerId: string, targetUserId: string): boolean {
    const follows = this.getFollows();
    return Boolean(follows[followerId]?.includes(targetUserId));
  }

  public toggleFollow(followerId: string, targetUserId: string): boolean {
    if (followerId === targetUserId) return false;
    const follows = this.getFollows();
    const currentFollowing = follows[followerId] || [];
    const isNowFollowing = !currentFollowing.includes(targetUserId);

    if (isNowFollowing) {
      follows[followerId] = [...currentFollowing, targetUserId];
    } else {
      follows[followerId] = currentFollowing.filter((id) => id !== targetUserId);
    }
    this.set(STORAGE_KEYS.FOLLOWS, follows);

    // Update counts
    const users = this.getUsers();
    const follower = users.find((u) => u.id === followerId);
    const target = users.find((u) => u.id === targetUserId);

    if (follower) {
      follower.followingCount = Math.max(0, follower.followingCount + (isNowFollowing ? 1 : -1));
    }
    if (target) {
      target.followersCount = Math.max(0, target.followersCount + (isNowFollowing ? 1 : -1));
    }
    this.set(STORAGE_KEYS.USERS, users);

    if (follower && follower.id === this.getCurrentUser()?.id) {
      this.setCurrentUser(follower);
    }

    // Generate follow notification if following
    if (isNowFollowing && follower && target) {
      this.addNotification({
        id: `notif_${Date.now()}`,
        recipientId: targetUserId,
        senderId: followerId,
        sender: follower,
        type: 'follow',
        read: false,
        createdAt: new Date().toISOString(),
      });
    }

    return isNowFollowing;
  }

  public getFollowers(userId: string): User[] {
    const follows = this.getFollows();
    const followerIds: string[] = [];
    Object.entries(follows).forEach(([followerId, list]) => {
      if (list.includes(userId)) {
        followerIds.push(followerId);
      }
    });
    return this.getUsers().filter((u) => followerIds.includes(u.id));
  }

  public getFollowing(userId: string): User[] {
    const follows = this.getFollows();
    const followingIds = follows[userId] || [];
    return this.getUsers().filter((u) => followingIds.includes(u.id));
  }

  // Posts
  public getPosts(): Post[] {
    return this.get<Post[]>(STORAGE_KEYS.POSTS, SEED_POSTS);
  }

  public getPostById(id: string): Post | undefined {
    return this.getPosts().find((p) => p.id === id);
  }

  public savePost(post: Post): void {
    const posts = this.getPosts();
    const index = posts.findIndex((p) => p.id === post.id);
    if (index >= 0) {
      posts[index] = post;
    } else {
      posts.unshift(post);
      // Increment user post count
      const users = this.getUsers();
      const author = users.find((u) => u.id === post.authorId);
      if (author) {
        author.postsCount = (author.postsCount || 0) + 1;
        this.saveUser(author);
      }
    }
    this.set(STORAGE_KEYS.POSTS, posts);
  }

  public deletePost(postId: string, userId: string): boolean {
    const posts = this.getPosts();
    const post = posts.find((p) => p.id === postId);
    if (!post || post.authorId !== userId) return false;

    const filtered = posts.filter((p) => p.id !== postId);
    this.set(STORAGE_KEYS.POSTS, filtered);

    // Decrement user post count
    const users = this.getUsers();
    const author = users.find((u) => u.id === userId);
    if (author) {
      author.postsCount = Math.max(0, (author.postsCount || 1) - 1);
      this.saveUser(author);
    }
    return true;
  }

  public toggleLikePost(postId: string, userId: string): { isLiked: boolean; likesCount: number } {
    const posts = this.getPosts();
    const post = posts.find((p) => p.id === postId);
    if (!post) return { isLiked: false, likesCount: 0 };

    const wasLiked = Boolean(post.isLiked);
    post.isLiked = !wasLiked;
    post.likesCount = Math.max(0, post.likesCount + (post.isLiked ? 1 : -1));
    this.set(STORAGE_KEYS.POSTS, posts);

    // Notification
    if (post.isLiked && post.authorId !== userId) {
      const sender = this.getUserById(userId);
      if (sender) {
        this.addNotification({
          id: `notif_${Date.now()}`,
          recipientId: post.authorId,
          senderId: userId,
          sender,
          type: 'like',
          postId: post.id,
          postSnippet: post.text.slice(0, 60),
          read: false,
          createdAt: new Date().toISOString(),
        });
      }
    }

    return { isLiked: post.isLiked, likesCount: post.likesCount };
  }

  // Bookmarks
  public getBookmarks(): Record<string, string[]> {
    return this.get<Record<string, string[]>>(STORAGE_KEYS.BOOKMARKS, {});
  }

  public isBookmarked(userId: string, postId: string): boolean {
    const bookmarks = this.getBookmarks();
    return Boolean(bookmarks[userId]?.includes(postId));
  }

  public toggleBookmark(userId: string, postId: string): boolean {
    const bookmarks = this.getBookmarks();
    const userBookmarks = bookmarks[userId] || [];
    const isNowBookmarked = !userBookmarks.includes(postId);

    if (isNowBookmarked) {
      bookmarks[userId] = [postId, ...userBookmarks];
    } else {
      bookmarks[userId] = userBookmarks.filter((id) => id !== postId);
    }
    this.set(STORAGE_KEYS.BOOKMARKS, bookmarks);

    // Update post cached isBookmarked flag
    const posts = this.getPosts();
    const post = posts.find((p) => p.id === postId);
    if (post) {
      post.isBookmarked = isNowBookmarked;
      this.set(STORAGE_KEYS.POSTS, posts);
    }

    return isNowBookmarked;
  }

  public getBookmarkedPosts(userId: string): Post[] {
    const bookmarks = this.getBookmarks();
    const userBookmarks = bookmarks[userId] || [];
    const posts = this.getPosts();
    return posts.filter((p) => userBookmarks.includes(p.id));
  }

  // Comments
  public getComments(): Comment[] {
    return this.get<Comment[]>(STORAGE_KEYS.COMMENTS, SEED_COMMENTS);
  }

  public getCommentsByPostId(postId: string): Comment[] {
    return this.getComments().filter((c) => c.postId === postId);
  }

  public addComment(comment: Comment): void {
    const comments = this.getComments();
    if (comment.parentId) {
      // It's a reply
      const parent = comments.find((c) => c.id === comment.parentId);
      if (parent) {
        parent.replies = parent.replies || [];
        parent.replies.push(comment);
      } else {
        comments.push(comment);
      }
    } else {
      comments.push(comment);
    }
    this.set(STORAGE_KEYS.COMMENTS, comments);

    // Update post comments count
    const posts = this.getPosts();
    const post = posts.find((p) => p.id === comment.postId);
    if (post) {
      post.commentsCount = (post.commentsCount || 0) + 1;
      this.set(STORAGE_KEYS.POSTS, posts);

      // Notification
      if (post.authorId !== comment.authorId) {
        this.addNotification({
          id: `notif_${Date.now()}`,
          recipientId: post.authorId,
          senderId: comment.authorId,
          sender: comment.author,
          type: comment.parentId ? 'reply' : 'comment',
          postId: post.id,
          postSnippet: comment.text.slice(0, 60),
          read: false,
          createdAt: new Date().toISOString(),
        });
      }
    }
  }

  public deleteComment(commentId: string, userId: string): boolean {
    const comments = this.getComments();
    let deleted = false;
    let postId = '';

    const newComments = comments.filter((c) => {
      if (c.id === commentId && c.authorId === userId) {
        deleted = true;
        postId = c.postId;
        return false;
      }
      if (c.replies) {
        c.replies = c.replies.filter((r) => {
          if (r.id === commentId && r.authorId === userId) {
            deleted = true;
            postId = r.postId;
            return false;
          }
          return true;
        });
      }
      return true;
    });

    if (deleted) {
      this.set(STORAGE_KEYS.COMMENTS, newComments);
      if (postId) {
        const posts = this.getPosts();
        const post = posts.find((p) => p.id === postId);
        if (post) {
          post.commentsCount = Math.max(0, (post.commentsCount || 1) - 1);
          this.set(STORAGE_KEYS.POSTS, posts);
        }
      }
    }
    return deleted;
  }

  public toggleLikeComment(commentId: string): boolean {
    const comments = this.getComments();
    let isLiked = false;

    const updateLike = (c: Comment) => {
      if (c.id === commentId) {
        c.isLiked = !c.isLiked;
        c.likesCount = Math.max(0, c.likesCount + (c.isLiked ? 1 : -1));
        isLiked = Boolean(c.isLiked);
        return true;
      }
      if (c.replies) {
        for (const r of c.replies) {
          if (updateLike(r)) return true;
        }
      }
      return false;
    };

    for (const c of comments) {
      if (updateLike(c)) break;
    }

    this.set(STORAGE_KEYS.COMMENTS, comments);
    return isLiked;
  }

  // Stories
  public getStories(): Story[] {
    const stories = this.get<Story[]>(STORAGE_KEYS.STORIES, SEED_STORIES);
    // filter out expired stories if older than 48 hours for demo resilience
    return stories;
  }

  public addStory(story: Story): void {
    const stories = this.getStories();
    stories.unshift(story);
    this.set(STORAGE_KEYS.STORIES, stories);
  }

  public markStorySeen(storyId: string): void {
    const stories = this.getStories();
    const story = stories.find((s) => s.id === storyId);
    if (story) {
      story.seen = true;
      this.set(STORAGE_KEYS.STORIES, stories);
    }
  }

  // Conversations & Messages
  public getConversations(): Conversation[] {
    return this.get<Conversation[]>(STORAGE_KEYS.CONVERSATIONS, SEED_CONVERSATIONS);
  }

  public getConversationById(id: string): Conversation | undefined {
    return this.getConversations().find((c) => c.id === id);
  }

  public getMessages(conversationId: string): Message[] {
    const allMessages = this.get<Record<string, Message[]>>(
      STORAGE_KEYS.MESSAGES,
      SEED_MESSAGES
    );
    return allMessages[conversationId] || [];
  }

  public sendMessage(conversationId: string, message: Message): void {
    const allMessages = this.get<Record<string, Message[]>>(
      STORAGE_KEYS.MESSAGES,
      SEED_MESSAGES
    );
    const convMessages = allMessages[conversationId] || [];
    convMessages.push(message);
    allMessages[conversationId] = convMessages;
    this.set(STORAGE_KEYS.MESSAGES, allMessages);

    // Update conversation last message
    const conversations = this.getConversations();
    const conv = conversations.find((c) => c.id === conversationId);
    if (conv) {
      conv.lastMessage = {
        text: message.text || 'Image attachment',
        senderId: message.senderId,
        createdAt: message.createdAt,
        read: false,
      };
      conv.updatedAt = message.createdAt;
      this.set(STORAGE_KEYS.CONVERSATIONS, conversations);
    }
  }

  public createOrGetConversation(userId1: string, userId2: string): Conversation {
    const conversations = this.getConversations();
    const existing = conversations.find(
      (c) => c.participantIds.includes(userId1) && c.participantIds.includes(userId2)
    );
    if (existing) return existing;

    const user1 = this.getUserById(userId1);
    const user2 = this.getUserById(userId2);
    if (!user1 || !user2) {
      throw new Error('Users not found');
    }

    const newConv: Conversation = {
      id: `conv_${Date.now()}`,
      participantIds: [userId1, userId2],
      participants: [user1, user2],
      unreadCount: 0,
      updatedAt: new Date().toISOString(),
    };

    conversations.unshift(newConv);
    this.set(STORAGE_KEYS.CONVERSATIONS, conversations);
    return newConv;
  }

  public markConversationRead(conversationId: string): void {
    const conversations = this.getConversations();
    const conv = conversations.find((c) => c.id === conversationId);
    if (conv && conv.unreadCount > 0) {
      conv.unreadCount = 0;
      if (conv.lastMessage) conv.lastMessage.read = true;
      this.set(STORAGE_KEYS.CONVERSATIONS, conversations);
    }
  }

  // Notifications
  public getNotifications(recipientId: string): Notification[] {
    const all = this.get<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, SEED_NOTIFICATIONS);
    return all.filter((n) => n.recipientId === recipientId);
  }

  public addNotification(notification: Notification): void {
    const all = this.get<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, SEED_NOTIFICATIONS);
    all.unshift(notification);
    this.set(STORAGE_KEYS.NOTIFICATIONS, all);
  }

  public markNotificationRead(id: string): void {
    const all = this.get<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, SEED_NOTIFICATIONS);
    const notif = all.find((n) => n.id === id);
    if (notif) {
      notif.read = true;
      this.set(STORAGE_KEYS.NOTIFICATIONS, all);
    }
  }

  public markAllNotificationsRead(recipientId: string): void {
    const all = this.get<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, SEED_NOTIFICATIONS);
    all.forEach((n) => {
      if (n.recipientId === recipientId) {
        n.read = true;
      }
    });
    this.set(STORAGE_KEYS.NOTIFICATIONS, all);
  }

  // Trending
  public getTrendingTopics(): TrendingTopic[] {
    return this.get<TrendingTopic[]>(STORAGE_KEYS.TRENDING, SEED_TRENDING_TOPICS);
  }

  // Settings
  public getSettings(): UserSettings {
    return this.get<UserSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  }

  public saveSettings(settings: UserSettings): void {
    this.set(STORAGE_KEYS.SETTINGS, settings);
  }
}

export const storage = new StorageService();
storage.init();
