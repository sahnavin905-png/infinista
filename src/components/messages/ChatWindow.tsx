import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Send,
  Image as ImageIcon,
  Smile,
  CheckCheck,
  Check,
  ChevronLeft,
  Info,
  X,
} from 'lucide-react';
import { Conversation, Message, User } from '../../types';
import { Avatar } from '../common/Avatar';
import { useAuth } from '../../context/AuthContext';
import { useSocial } from '../../context/SocialContext';

interface ChatWindowProps {
  conversationId: string;
  onBack?: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  conversationId,
  onBack,
}) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const {
    conversations,
    getMessages,
    sendMessage,
    markConversationAsRead,
  } = useSocial();

  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const conversation = conversations.find((c) => c.id === conversationId);
  const messages = getMessages(conversationId);

  const otherUser = conversation?.participants.find(
    (p) => p.id !== currentUser?.id
  );

  useEffect(() => {
    markConversationAsRead(conversationId);
  }, [conversationId, markConversationAsRead]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() && !selectedImage) return;

    sendMessage(conversationId, inputText.trim(), selectedImage || undefined);
    setInputText('');
    setSelectedImage(null);

    // Simulate quick typing reply preview for active feel
    if (otherUser && messages.length % 2 === 0) {
      setTimeout(() => {
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          sendMessage(
            conversationId,
            `Awesome! Always great catching up with you.`
          );
        }, 2200);
      }, 1000);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setSelectedImage(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  if (!conversation || !otherUser) {
    return (
      <div className="h-full flex items-center justify-center p-6 text-neutral-400 text-sm">
        Select a conversation to start chatting
      </div>
    );
  }

  const formatTime = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full bg-neutral-50/50 dark:bg-neutral-950">
      {/* Chat Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 flex-shrink-0">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="md:hidden p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          <Avatar
            src={otherUser.avatar}
            alt={otherUser.name}
            size="sm"
            isOnline={otherUser.isOnline}
            onClick={() => navigate(`/profile/${otherUser.username}`)}
          />
          <div>
            <div
              onClick={() => navigate(`/profile/${otherUser.username}`)}
              className="font-bold text-xs md:text-sm text-neutral-900 dark:text-neutral-100 hover:underline cursor-pointer"
            >
              {otherUser.name}
            </div>
            <p className="text-[11px] text-neutral-400">
              {otherUser.isOnline ? 'Active now' : `@${otherUser.username}`}
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate(`/profile/${otherUser.username}`)}
          className="p-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800"
          title="View profile"
        >
          <Info className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {/* User intro card */}
        <div className="text-center py-6 flex flex-col items-center">
          <Avatar
            src={otherUser.avatar}
            alt={otherUser.name}
            size="lg"
            className="mb-2"
          />
          <h3 className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
            {otherUser.name}
          </h3>
          <p className="text-xs text-neutral-400 mb-1">@{otherUser.username}</p>
          <p className="text-xs text-neutral-500 max-w-xs">{otherUser.bio}</p>
        </div>

        {/* Message Bubbles */}
        {messages.map((msg) => {
          const isMe = msg.senderId === currentUser?.id;
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl p-3 shadow-xs ${
                  isMe
                    ? 'bg-gradient-to-tr from-rose-500 to-rose-600 text-white rounded-br-xs'
                    : 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 border border-neutral-200/80 dark:border-neutral-800 rounded-bl-xs'
                }`}
              >
                {msg.image && (
                  <div className="rounded-xl overflow-hidden mb-2 max-h-60 bg-black/20">
                    <img
                      src={msg.image}
                      alt="Attachment"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                {msg.text && (
                  <p className="text-xs md:text-sm leading-relaxed break-words whitespace-pre-wrap">
                    {msg.text}
                  </p>
                )}
              </div>

              {/* Timestamp & read receipt */}
              <div className="flex items-center gap-1 mt-1 text-[10px] text-neutral-400 px-1">
                <span>{formatTime(msg.createdAt)}</span>
                {isMe && (
                  <span>
                    {msg.read ? (
                      <CheckCheck className="w-3 h-3 text-rose-500" />
                    ) : (
                      <Check className="w-3 h-3 text-neutral-400" />
                    )}
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-center gap-2 text-xs text-neutral-400 bg-white dark:bg-neutral-900 p-2.5 rounded-2xl max-w-fit border border-neutral-200 dark:border-neutral-800">
            <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-bounce" />
            <span
              className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-bounce"
              style={{ animationDelay: '150ms' }}
            />
            <span
              className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-bounce"
              style={{ animationDelay: '300ms' }}
            />
            <span className="text-[11px] ml-1">{otherUser.name} is typing...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Composer Footer */}
      <div className="p-3 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 flex-shrink-0">
        {/* Attachment preview */}
        {selectedImage && (
          <div className="relative inline-block mb-2">
            <img
              src={selectedImage}
              alt="attachment preview"
              className="w-16 h-16 object-cover rounded-xl border border-neutral-300 dark:border-neutral-700"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-1.5 -right-1.5 p-0.5 bg-black text-white rounded-full"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        <form onSubmit={handleSend} className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-neutral-500 hover:text-rose-500 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            title="Attach photo"
          >
            <ImageIcon className="w-5 h-5" />
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 bg-neutral-100 dark:bg-neutral-800 rounded-2xl text-xs md:text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 outline-none"
          />

          <button
            type="submit"
            disabled={!inputText.trim() && !selectedImage}
            className="p-2 bg-rose-500 hover:bg-rose-600 disabled:opacity-40 text-white rounded-2xl transition-all cursor-pointer shadow-xs active:scale-95"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
