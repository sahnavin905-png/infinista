import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Mail, Lock, User, AtSign, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocial } from '../context/SocialContext';
import { Button } from '../components/common/Button';
import { Avatar } from '../components/common/Avatar';

export const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, signup, switchUser, users } = useAuth();
  const { addToast } = useSocial();

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        if (!email.trim() || !password.trim()) {
          addToast('Please enter both email and password', 'error');
          setIsLoading(false);
          return;
        }
        await login(email.trim(), password);
        addToast('Welcome back to Vibely!', 'success');
        navigate('/home');
      } else {
        if (!name.trim() || !username.trim() || !email.trim() || !password.trim()) {
          addToast('Please fill out all fields', 'error');
          setIsLoading(false);
          return;
        }
        await signup(name.trim(), username.trim().toLowerCase(), email.trim(), password);
        addToast('Account created successfully!', 'success');
        navigate('/home');
      }
    } catch (err: any) {
      addToast(err.message || 'Authentication failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoLogin = (userId: string) => {
    switchUser(userId);
    addToast('Logged in as demo user', 'success');
    navigate('/home');
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand Header */}
        <div className="flex justify-center items-center gap-2 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 via-pink-500 to-violet-600 flex items-center justify-center text-white shadow-md">
            <Sparkles className="w-6 h-6" />
          </div>
          <span className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-rose-500 to-violet-600 bg-clip-text text-transparent">
            Vibely
          </span>
        </div>
        <p className="text-center text-xs font-semibold text-neutral-400 tracking-wider uppercase">
          Connect. Create. Share.
        </p>

        <h2 className="mt-6 text-center text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
          {isLogin ? 'Sign in to your account' : 'Create your Vibely profile'}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-neutral-900 py-8 px-6 sm:px-10 shadow-xl rounded-3xl border border-neutral-200/80 dark:border-neutral-800">
          <form className="space-y-4" onSubmit={handleSubmit}>
            {!isLogin && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Alex Rivera"
                      required
                      className="w-full pl-9 pr-3 py-2 bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs text-neutral-900 dark:text-neutral-100 outline-none focus:border-rose-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
                    Username
                  </label>
                  <div className="relative">
                    <AtSign className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="alexrivera"
                      required
                      className="w-full pl-9 pr-3 py-2 bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs text-neutral-900 dark:text-neutral-100 outline-none focus:border-rose-500"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
                Email address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full pl-9 pr-3 py-2 bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs text-neutral-900 dark:text-neutral-100 outline-none focus:border-rose-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-9 pr-3 py-2 bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs text-neutral-900 dark:text-neutral-100 outline-none focus:border-rose-500"
                />
              </div>
            </div>

            {isLogin && (
              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded accent-rose-500"
                  />
                  <span>Remember me</span>
                </label>

                <span
                  onClick={() => addToast('Password reset link sent to demo email', 'info')}
                  className="text-rose-500 hover:underline cursor-pointer"
                >
                  Forgot password?
                </span>
              </div>
            )}

            <div>
              <Button
                type="submit"
                variant="primary"
                fullWidth
                isLoading={isLoading}
              >
                {isLogin ? 'Sign In' : 'Create Account'}
              </Button>
            </div>
          </form>

          {/* Toggle between login & signup */}
          <div className="mt-6 text-center text-xs text-neutral-500">
            {isLogin ? "Don't have an account yet?" : 'Already have an account?'}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="ml-1 text-rose-500 font-bold hover:underline cursor-pointer"
            >
              {isLogin ? 'Sign up' : 'Log in'}
            </button>
          </div>

          {/* 1-Click Quick Demo Login Section */}
          <div className="mt-8 pt-6 border-t border-neutral-100 dark:border-neutral-800">
            <p className="text-center text-xs font-semibold text-neutral-400 mb-3 uppercase tracking-wider">
              1-Click Demo Login
            </p>

            <div className="grid grid-cols-2 gap-2">
              {users.slice(0, 4).map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => handleQuickDemoLogin(user.id)}
                  className="flex items-center gap-2 p-2 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-rose-500 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-all text-left group cursor-pointer"
                >
                  <Avatar src={user.avatar} alt={user.name} size="xs" />
                  <div className="overflow-hidden">
                    <p className="text-[11px] font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-rose-500 truncate">
                      {user.name}
                    </p>
                    <p className="text-[10px] text-neutral-400 truncate">
                      @{user.username}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
