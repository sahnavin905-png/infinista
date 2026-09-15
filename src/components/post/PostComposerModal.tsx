import React, { useState, useRef } from 'react';
import {
  Image,
  X,
  MapPin,
  Globe,
  Users,
  Lock,
  Smile,
  Hash,
  Sparkles,
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Avatar } from '../common/Avatar';
import { useAuth } from '../../context/AuthContext';
import { useSocial } from '../../context/SocialContext';

interface PostComposerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SAMPLE_PHOTOS = [
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
];

export const PostComposerModal: React.FC<PostComposerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { currentUser } = useAuth();
  const { createPost, addToast } = useSocial();

  const [text, setText] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [location, setLocation] = useState('');
  const [showLocationInput, setShowLocationInput] = useState(false);
  const [privacy, setPrivacy] = useState<'public' | 'followers' | 'only_me'>('public');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const MAX_CHARS = 500;

  if (!currentUser) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    processFiles(Array.from(files));
  };

  const processFiles = (files: File[]) => {
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        addToast('Only image files are supported', 'error');
        continue;
      }
      if (file.size > 10 * 1024 * 1024) {
        addToast('Image size exceeds 10MB limit', 'error');
        continue;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImages((prev) => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() && images.length === 0) {
      addToast('Please enter some text or add an image', 'error');
      return;
    }
    if (text.length > MAX_CHARS) {
      addToast(`Character limit exceeded (${MAX_CHARS} max)`, 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await createPost({
        text,
        images,
        location: location.trim(),
        privacy,
      });
      // Reset form
      setText('');
      setImages([]);
      setLocation('');
      setShowLocationInput(false);
      onClose();
    } catch {
      addToast('Failed to create post. Try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const insertEmoji = (emoji: string) => {
    setText((prev) => prev + emoji);
  };

  const addSamplePhoto = (url: string) => {
    setImages((prev) => [...prev, url]);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Post" maxWidth="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Author Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar src={currentUser.avatar} alt={currentUser.name} size="md" />
            <div>
              <p className="font-semibold text-sm text-neutral-900 dark:text-neutral-100">
                {currentUser.name}
              </p>
              {/* Privacy Selector */}
              <div className="flex items-center gap-1.5 mt-0.5">
                <select
                  value={privacy}
                  onChange={(e) =>
                    setPrivacy(e.target.value as 'public' | 'followers' | 'only_me')
                  }
                  className="bg-neutral-100 dark:bg-neutral-800 text-xs px-2 py-0.5 rounded-lg border-0 text-neutral-600 dark:text-neutral-300 outline-none cursor-pointer"
                >
                  <option value="public">🌍 Anyone (Public)</option>
                  <option value="followers">👥 Followers Only</option>
                  <option value="only_me">🔒 Only Me</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Text Field */}
        <div className="relative">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What's on your mind? Share your thoughts, designs, updates..."
            rows={4}
            className="w-full bg-transparent border-0 resize-none text-base text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 outline-none"
          />

          <div className="flex justify-end text-xs text-neutral-400 font-medium">
            <span
              className={
                text.length > MAX_CHARS
                  ? 'text-red-500 font-bold'
                  : text.length > MAX_CHARS - 30
                  ? 'text-amber-500'
                  : ''
              }
            >
              {text.length}/{MAX_CHARS}
            </span>
          </div>
        </div>

        {/* Location input row */}
        {showLocationInput && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl border border-neutral-200 dark:border-neutral-700">
            <MapPin className="w-4 h-4 text-rose-500 flex-shrink-0" />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Add location (e.g. San Francisco, CA)"
              className="w-full bg-transparent text-xs text-neutral-900 dark:text-neutral-100 outline-none placeholder:text-neutral-400"
            />
            <button
              type="button"
              onClick={() => {
                setLocation('');
                setShowLocationInput(false);
              }}
              className="text-neutral-400 hover:text-neutral-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Drag and drop image dropzone & preview */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`rounded-2xl transition-all ${
            isDragging
              ? 'border-2 border-dashed border-rose-500 bg-rose-50/50 dark:bg-rose-950/20 p-4'
              : ''
          }`}
        >
          {images.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-2 max-h-56 overflow-y-auto p-1">
              {images.map((img, i) => (
                <div
                  key={i}
                  className="relative group rounded-xl overflow-hidden aspect-video bg-neutral-900"
                >
                  <img
                    src={img}
                    alt="Upload preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/70 text-white hover:bg-black transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Sample Gallery Shortcuts */}
        <div className="space-y-1">
          <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
            Quick Add Photo Demo:
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {SAMPLE_PHOTOS.map((photo, index) => (
              <button
                key={index}
                type="button"
                onClick={() => addSamplePhoto(photo)}
                className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border border-neutral-200 dark:border-neutral-700 hover:opacity-80 transition-opacity"
              >
                <img
                  src={photo}
                  alt="sample thumbnail"
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Toolbar & Actions */}
        <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              multiple
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-xl text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              title="Upload images"
            >
              <Image className="w-5 h-5 text-rose-500" />
            </button>

            <button
              type="button"
              onClick={() => setShowLocationInput(!showLocationInput)}
              className="p-2 rounded-xl text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              title="Add location"
            >
              <MapPin className="w-5 h-5 text-emerald-500" />
            </button>

            <div className="hidden sm:flex items-center gap-1">
              {['✨', '🔥', '🚀', '❤️', '🎨'].map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => insertEmoji(emoji)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-sm"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSubmitting}
              disabled={!text.trim() && images.length === 0}
            >
              Post
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
