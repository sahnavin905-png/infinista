import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { MobileHeader, MobileBottomNav } from './MobileNav';
import { RightSidebar } from './RightSidebar';
import { ToastContainer } from '../common/Toast';

export const Layout: React.FC = () => {
  const location = useLocation();
  const isMessages = location.pathname.startsWith('/messages');

  return (
    <div className="min-h-screen bg-neutral-50/60 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex flex-col md:flex-row justify-center">
      {/* Mobile Top Header (hidden in chat view on mobile) */}
      {!isMessages && <MobileHeader />}

      {/* Desktop Left Sidebar */}
      <Sidebar />

      {/* Center Feed / Page Content */}
      <main
        className={`flex-1 min-h-screen border-r border-neutral-200/80 dark:border-neutral-800/80 ${
          isMessages
            ? 'max-w-4xl pb-16 md:pb-0'
            : 'max-w-2xl pb-20 md:pb-8'
        }`}
      >
        <Outlet />
      </main>

      {/* Desktop Right Sidebar */}
      {!isMessages && <RightSidebar />}

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />

      {/* Floating Toasts */}
      <ToastContainer />
    </div>
  );
};
