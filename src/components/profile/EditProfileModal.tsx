import React, { useState, useRef } from 'react';
import { Camera, Image, X } from 'lucide-react';
import { User } from '../../types';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Avatar } from '../common/Avatar';
import { useAuth } from '../../context/AuthContext';
import { useSocial } from '../../context/SocialContext';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  user,
}) => {
  const { updateProfile } = useAuth();
  const { addToast } = useSocial();

  const [name, setName] = useState(user.name);
  const [username, setUsername] = useState(user.username);
  const [bio, setBio] = useState(user.bio || '');
  const [website, setWebsite] = useState(user.website || '');
  const [location, setLocation] = useState(user.location || '');
  const [avatar, setAvatar] = useState(user.avatar);
  const [coverImage, setCoverImage] = useState(user.coverImage || '');
  const [isSaving, setIsSaving] = useState(false);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setAvatar(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCoverFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setCoverImage(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      addToast('Name cannot be blank', 'error');
      return;
    }
    if (!username.trim()) {
      addToast('Username cannot be blank', 'error');
      return;
    }

    setIsSaving(true);
    updateProfile({
      name: name.trim(),
      username: username.trim().toLowerCase().replace('@', ''),
      bio: bio.trim(),
      website: website.trim(),
      location: location.trim(),
      avatar,
      coverImage,
    });
    setIsSaving(false);
    addToast('Profile updated!', 'success');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Profile" maxWidth="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Cover image edit */}
        <div className="relative h-28 w-full rounded-xl overflow-hidden bg-neutral-800 group">
          {coverImage ? (
            <img
              src={coverImage}
              alt="cover"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-rose-500/30 to-violet-500/30" />
          )}
          <div
            onClick={() => coverInputRef.current?.click()}
            className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-70 group-hover:opacity-100 cursor-pointer transition-opacity"
          >
            <Camera className="w-6 h-6 text-white" />
          </div>
          <input
            type="file"
            ref={coverInputRef}
            onChange={handleCoverFile}
            accept="image/*"
            className="hidden"
          />
        </div>

        {/* Avatar edit */}
        <div className="flex items-center gap-4 -mt-10 px-4 relative z-10">
          <div className="relative group">
            <Avatar
              src={avatar}
              alt={name}
              size="lg"
              className="ring-4 ring-white dark:ring-neutral-900 shadow-md"
            />
            <div
              onClick={() => avatarInputRef.current?.click()}
              className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
            >
              <Camera className="w-5 h-5 text-white" />
            </div>
            <input
              type="file"
              ref={avatarInputRef}
              onChange={handleAvatarFile}
              accept="image/*"
              className="hidden"
            />
          </div>
          <span className="text-xs text-neutral-500 pt-6">
            Click to change avatar photo
          </span>
        </div>

        {/* Form fields */}
        <div className="space-y-3 pt-2">
          <div>
            <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 border-0 text-xs text-neutral-900 dark:text-neutral-100 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 border-0 text-xs text-neutral-900 dark:text-neutral-100 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              maxLength={160}
              className="w-full px-3.5 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 border-0 text-xs text-neutral-900 dark:text-neutral-100 outline-none resize-none"
            />
            <div className="text-right text-[10px] text-neutral-400">
              {bio.length}/160
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. San Francisco, CA"
                className="w-full px-3.5 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 border-0 text-xs text-neutral-900 dark:text-neutral-100 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
                Website
              </label>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://yourwebsite.com"
                className="w-full px-3.5 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 border-0 text-xs text-neutral-900 dark:text-neutral-100 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 flex justify-end gap-2 border-t border-neutral-100 dark:border-neutral-800">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={isSaving}>
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
};
