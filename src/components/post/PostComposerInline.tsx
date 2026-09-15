import React, { useState, useRef } from 'react';
import { Image, MapPin, Sparkles, X } from 'lucide-react';
import { Avatar } from '../common/Avatar';
import { Button } from '../common/Button';
import { useAuth } from '../../context/AuthContext';
import { useSocial } from '../../context/SocialContext';

export const PostComposerInline: React.FC = () => {
  const { currentUser } = useAuth();
  const { createPost, addToast } = useSocial();

  const [text, setText] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!currentUser) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    for (const file of Array.from(files) as File[]) {
      if (!file.type.startsWith('image/')) continue;
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImages((prev) => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() && images.length === 0) return;

    setIsSubmitting(true);
    try {
      await createPost({
        text,
        images,
      });
      setText('');
      setImages([]);
      setIsFocused(false);
    } catch {
      addToast('Failed to post. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-neutral-900 md:rounded-2xl border-b md:border border-neutral-200/80 dark:border-neutral-800/80 p-4 mb-4 shadow-xs">
      <div className="flex gap-3">
        <Avatar src={currentUser.avatar} alt={currentUser.name} size="md" />

        <div className="flex-1">
          <form onSubmit={handleSubmit}>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onFocus={() => setIsFocused(true)}
              placeholder="What's vibing today? Share thoughts, links, photos..."
              rows={isFocused || text || images.length > 0 ? 3 : 2}
              className="w-full bg-transparent text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 outline-none resize-none"
            />

            {/* Image Previews */}
            {images.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-2 mb-2">
                {images.map((img, i) => (
                  <div
                    key={i}
                    className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-neutral-900"
                  >
                    <img src={img} alt="preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
                      className="absolute top-1 right-1 p-0.5 rounded-full bg-black/70 text-white hover:bg-black"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-neutral-800/70 mt-1">
              <div className="flex items-center gap-1 text-neutral-500">
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
                  className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-rose-500 cursor-pointer"
                  title="Add photos"
                >
                  <Image className="w-5 h-5" />
                </button>
                <span className="text-xs text-neutral-400 pl-2 hidden sm:inline">
                  Drag & drop or paste image
                </span>
              </div>

              <div className="flex items-center gap-2">
                {isFocused && !text && images.length === 0 && (
                  <button
                    type="button"
                    onClick={() => setIsFocused(false)}
                    className="text-xs text-neutral-400 hover:text-neutral-600 px-2"
                  >
                    Cancel
                  </button>
                )}
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
        </div>
      </div>
    </div>
  );
};
