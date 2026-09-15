import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ConversationList } from '../components/messages/ConversationList';
import { ChatWindow } from '../components/messages/ChatWindow';
import { NewChatModal } from '../components/messages/NewChatModal';
import { useSocial } from '../context/SocialContext';
import { useAuth } from '../context/AuthContext';
import { MessageSquarePlus } from 'lucide-react';
import { Button } from '../components/common/Button';

export const MessagesPage: React.FC = () => {
  const { conversationId } = useParams<{ conversationId?: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { conversations } = useSocial();

  const [selectedId, setSelectedId] = useState<string | undefined>(conversationId);
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);

  useEffect(() => {
    if (conversationId) {
      setSelectedId(conversationId);
    } else if (conversations.length > 0 && window.innerWidth >= 768) {
      // Auto-select first conversation on desktop
      setSelectedId(conversations[0].id);
    }
  }, [conversationId, conversations]);

  const handleSelect = (id: string) => {
    setSelectedId(id);
    navigate(`/messages/${id}`);
  };

  if (!currentUser) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-lg font-bold mb-2">Sign in to view messages</h2>
        <Button variant="primary" onClick={() => navigate('/login')}>
          Go to Login
        </Button>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-60px)] md:h-screen w-full flex bg-white dark:bg-neutral-900 overflow-hidden">
      {/* Conversation List: hidden on mobile if chat is selected */}
      <div
        className={`w-full md:w-80 h-full flex-shrink-0 ${
          selectedId ? 'hidden md:flex flex-col' : 'flex flex-col'
        }`}
      >
        <ConversationList
          selectedId={selectedId}
          onSelect={handleSelect}
          onStartNewChat={() => setIsNewChatOpen(true)}
        />
      </div>

      {/* Chat Window: full width on mobile if selected, hidden if not selected on mobile */}
      <div
        className={`flex-1 h-full ${
          !selectedId ? 'hidden md:flex items-center justify-center' : 'flex flex-col'
        }`}
      >
        {selectedId ? (
          <ChatWindow
            conversationId={selectedId}
            onBack={() => {
              setSelectedId(undefined);
              navigate('/messages');
            }}
          />
        ) : (
          <div className="text-center p-8 max-w-sm">
            <div className="w-16 h-16 rounded-3xl bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center mx-auto mb-4">
              <MessageSquarePlus className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 mb-1">
              Your Messages
            </h3>
            <p className="text-xs text-neutral-500 mb-4">
              Send private photos and messages to a friend or creator.
            </p>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsNewChatOpen(true)}
            >
              Send Message
            </Button>
          </div>
        )}
      </div>

      {/* New Chat Modal */}
      <NewChatModal
        isOpen={isNewChatOpen}
        onClose={() => setIsNewChatOpen(false)}
        onSelectConversation={(id) => {
          setSelectedId(id);
          navigate(`/messages/${id}`);
        }}
      />
    </div>
  );
};
