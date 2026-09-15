import React, { useState, useRef } from 'react';
import { Upload, X, Sparkles } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useSocial } from '../../context/SocialContext';

interface CreateStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_STORY_IMAGES = [
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
];

export const CreateStoryModal: React.FC<CreateStoryModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { addStory, addToast } = useSocial();
  const [mediaUrl, setMediaUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      addToast('Please select a valid image file', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setMediaUrl(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mediaUrl) {
      addToast('Please select or upload a story photo', 'error');
      return;
    }
    setIsSubmitting(true);
    addStory(mediaUrl, caption.trim());
    setMediaUrl('');
    setCaption('');
    setIsSubmitting(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create a Story" maxWidth="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Media Preview or Upload Dropzone */}
        {mediaUrl ? (
          <div className="relative rounded-2xl overflow-hidden aspect-[9/14] max-h-[360px] mx-auto bg-black">
            <img
              src={mediaUrl}
              alt="Story preview"
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={() => setMediaUrl('')}
              className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-black text-white rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-neutral-300 dark:border-neutral-700 hover:border-rose-500 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors text-center"
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center mb-3">
              <Upload className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
              Click to upload photo
            </p>
            <p className="text-xs text-neutral-400 mt-1">PNG, JPG, WEBP up to 10MB</p>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
          </div>
        )}

        {/* Quick aesthetic presets */}
        {!mediaUrl && (
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
              Or choose a sample photo:
            </span>
            <div className="grid grid-cols-4 gap-2">
              {PRESET_STORY_IMAGES.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setMediaUrl(img)}
                  className="aspect-square rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-700 hover:opacity-80 transition-opacity cursor-pointer"
                >
                  <img
                    src={img}
                    alt="preset thumbnail"
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Caption */}
        <div>
          <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
            Caption (optional)
          </label>
          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Add a vibe caption..."
            maxLength={100}
            className="w-full px-3.5 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 border-0 text-xs text-neutral-900 dark:text-neutral-100 outline-none"
          />
        </div>

        {/* Actions */}
        <div className="pt-2 flex justify-end gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={!mediaUrl}
            isLoading={isSubmitting}
          >
            Share to Story
          </Button>
        </div>
      </form>
    </Modal>
  );
};
