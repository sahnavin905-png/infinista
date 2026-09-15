import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import { storage } from '../services/storage';

interface RegisterData {
  name: string;
  username: string;
  email: string;
  password?: string;
  avatar?: string;
}

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  login: (emailOrUsername: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
  switchUser: (userId: string) => void;
  users: User[];
  refreshUsers: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUsers = useCallback(() => {
    const list = storage.getUsers();
    setUsers(list);
    const curr = storage.getCurrentUser();
    if (curr) {
      const updatedCurr = list.find((u) => u.id === curr.id) || curr;
      setCurrentUser(updatedCurr);
    }
  }, []);

  useEffect(() => {
    // Initialize storage and load user
    storage.init();
    const storedUser = storage.getCurrentUser();
    const all = storage.getUsers();
    setUsers(all);
    setCurrentUser(storedUser);
    setIsLoading(false);
  }, []);

  const login = async (emailOrUsername: string, _password?: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    // Simulate short network delay for realistic feel
    await new Promise((r) => setTimeout(r, 350));

    const cleanInput = emailOrUsername.trim().toLowerCase().replace('@', '');
    const foundUser = users.find(
      (u) =>
        u.email.toLowerCase() === cleanInput ||
        u.username.toLowerCase() === cleanInput
    );

    if (!foundUser) {
      setIsLoading(false);
      return {
        success: false,
        error: 'No account found with this email or username. Try "alexrivera" or create an account.',
      };
    }

    storage.setCurrentUser(foundUser);
    setCurrentUser(foundUser);
    setIsLoading(false);
    return { success: true };
  };

  const register = async (data: RegisterData): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 400));

    const cleanUsername = data.username.trim().toLowerCase().replace('@', '');
    const cleanEmail = data.email.trim().toLowerCase();

    // Check collision
    const existing = users.find(
      (u) =>
        u.username.toLowerCase() === cleanUsername ||
        u.email.toLowerCase() === cleanEmail
    );

    if (existing) {
      setIsLoading(false);
      return {
        success: false,
        error: existing.email.toLowerCase() === cleanEmail
          ? 'An account with this email already exists.'
          : 'Username is already taken. Please pick another.',
      };
    }

    const newUser: User = {
      id: `user_${Date.now()}`,
      name: data.name.trim(),
      username: cleanUsername,
      email: cleanEmail,
      avatar:
        data.avatar ||
        `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80`,
      coverImage: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&auto=format&fit=crop&q=80',
      bio: 'Excited to be on Vibely! Connecting, creating, and sharing vibes ✨',
      location: 'Earth',
      website: '',
      isVerified: false,
      followersCount: 0,
      followingCount: 0,
      postsCount: 0,
      createdAt: new Date().toISOString(),
      isOnline: true,
    };

    storage.saveUser(newUser);
    storage.setCurrentUser(newUser);
    refreshUsers();
    setIsLoading(false);
    return { success: true };
  };

  const logout = () => {
    storage.setCurrentUser(null);
    setCurrentUser(null);
  };

  const updateProfile = (data: Partial<User>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...data };
    storage.saveUser(updated);
    setCurrentUser(updated);
    refreshUsers();
  };

  const switchUser = (userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (target) {
      storage.setCurrentUser(target);
      setCurrentUser(target);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
        switchUser,
        users,
        refreshUsers,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
