import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, Send, Heart, Play, Pause } from 'lucide-react';
import { Story } from '../../types';
import { Avatar } from '../common/Avatar';
import { useSocial } from '../../context/SocialContext';
import { useAuth } from '../../context/AuthContext';

interface StoryViewerProps {
  stories: Story[];
  initialIndex?: number;
  onClose: () => void;
}

const STORY_DURATION_MS = 5000;

export const StoryViewer: React.FC<StoryViewerProps> = ({
  stories,
  initialIndex = 0,
  onClose,
}) => {
  const { markStorySeen, startOrGetConversation, sendMessage, addToast } = useSocial();
  const { currentUser } = useAuth();

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [replyText, setReplyText] = useState('');

  const currentStory = stories[currentIndex];

  useEffect(() => {
    if (!currentStory) return;
    markStorySeen(currentStory.id);
    setProgress(0);
  }, [currentIndex, currentStory]);

  useEffect(() => {
    if (isPaused) return;

    const interval = 50; // update every 50ms
    const step = (interval / STORY_DURATION_MS) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          if (currentIndex < stories.length - 1) {
            setCurrentIndex((idx) => idx + 1);
            return 0;
          } else {
            clearInterval(timer);
            onClose();
            return 100;
          }
        }
        return prev + step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [currentIndex, isPaused, stories.length, onClose]);

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setProgress(0);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setProgress(0);
    }
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      addToast('Please log in to reply to stories', 'info');
      return;
    }
    if (!replyText.trim()) return;

    try {
      const conv = startOrGetConversation(currentStory.authorId);
      sendMessage(
        conv.id,
        `Replied to your story: "${replyText.trim()}"`
      );
      addToast(`Reply sent to @${currentStory.author.username}`, 'success');
      setReplyText('');
    } catch {
      addToast('Unable to send reply', 'error');
    }
  };

  const sendStoryLike = () => {
    if (!currentUser) return;
    try {
      const conv = startOrGetConversation(currentStory.authorId);
      sendMessage(conv.id, '❤️ Liked your story!');
      addToast('Liked story!', 'success');
    } catch {
      // ignore
    }
  };

  if (!currentStory) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center select-none">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-50 p-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Navigation arrows */}
      {currentIndex > 0 && (
        <button
          onClick={handlePrev}
          className="hidden md:flex absolute left-8 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {currentIndex < stories.length - 1 && (
        <button
          onClick={handleNext}
          className="hidden md:flex absolute right-8 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      {/* Story Stage Container */}
      <div
        className="relative w-full max-w-sm h-[85vh] max-h-[750px] bg-neutral-900 rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between"
        onMouseDown={() => setIsPaused(true)}
        onMouseUp={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {/* Background Image */}
        <img
          src={currentStory.mediaUrl}
          alt="Story content"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Top gradient overlay */}
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-none" />

        {/* Bottom gradient overlay */}
        <div className="absolute bottom-0 inset-x-0 h-36 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none" />

        {/* Story Top Progress & Author Info */}
        <div className="relative z-10 p-4 space-y-3">
          {/* Progress Bars */}
          <div className="flex gap-1.5 w-full">
            {stories.map((s, idx) => (
              <div
                key={s.id}
                className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden"
              >
                <div
                  className="h-full bg-white transition-all duration-75"
                  style={{
                    width:
                      idx < currentIndex
                        ? '100%'
                        : idx === currentIndex
                        ? `${progress}%`
                        : '0%',
                  }}
                />
              </div>
            ))}
          </div>

          {/* Author Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Avatar
                src={currentStory.author.avatar}
                alt={currentStory.author.name}
                size="sm"
                className="border border-white/40"
              />
              <div>
                <p className="text-sm font-semibold text-white leading-tight">
                  {currentStory.author.name}
                </p>
                <p className="text-[11px] text-white/70">
                  @{currentStory.author.username}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsPaused(!isPaused)}
              className="text-white/80 hover:text-white p-1"
            >
              {isPaused ? (
                <Play className="w-4 h-4 fill-white" />
              ) : (
                <Pause className="w-4 h-4 fill-white" />
              )}
            </button>
          </div>
        </div>

        {/* Tap areas for mobile stories next/prev */}
        <div className="absolute inset-y-20 inset-x-0 z-0 flex">
          <div className="w-1/3 h-full" onClick={handlePrev} />
          <div className="w-2/3 h-full" onClick={handleNext} />
        </div>

        {/* Bottom Caption & Reply Bar */}
        <div className="relative z-10 p-4 space-y-3">
          {currentStory.caption && (
            <p className="text-sm font-medium text-white drop-shadow-md text-center bg-black/40 backdrop-blur-xs py-1.5 px-3 rounded-xl">
              {currentStory.caption}
            </p>
          )}

          {/* Reply Form */}
          <form onSubmit={handleSendReply} className="flex items-center gap-2">
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder={`Reply to ${currentStory.author.username}...`}
              className="flex-1 bg-white/20 hover:bg-white/30 focus:bg-white/30 text-white placeholder:text-white/70 px-4 py-2.5 rounded-full text-xs outline-none backdrop-blur-md border border-white/20 transition-all"
            />
            {replyText.trim() ? (
              <button
                type="submit"
                className="p-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-full transition-transform active:scale-95"
              >
                <Send className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={sendStoryLike}
                className="p-2.5 text-white/90 hover:text-rose-500 hover:bg-white/20 rounded-full transition-all active:scale-125"
              >
                <Heart className="w-5 h-5 fill-rose-500 text-rose-500" />
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};
