import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocial } from '../../context/SocialContext';
import { Avatar } from '../common/Avatar';
import { StoryViewer } from './StoryViewer';
import { CreateStoryModal } from './CreateStoryModal';

export const StoryBar: React.FC = () => {
  const { currentUser } = useAuth();
  const { stories } = useSocial();

  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Group stories by author
  const userStory = currentUser
    ? stories.find((s) => s.authorId === currentUser.id)
    : null;
  const otherStories = stories.filter(
    (s) => !currentUser || s.authorId !== currentUser.id
  );

  return (
    <div className="bg-white dark:bg-neutral-900 border-b md:border border-neutral-200/80 dark:border-neutral-800/80 md:rounded-2xl p-3.5 mb-4 overflow-hidden">
      <div className="flex gap-4 overflow-x-auto no-scrollbar py-1 px-1">
        {/* Your Story item */}
        {currentUser && (
          <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
            <div className="relative">
              {userStory ? (
                <div
                  onClick={() => setActiveStoryIndex(0)}
                  className={`p-0.5 rounded-full cursor-pointer transition-transform hover:scale-105 ${
                    userStory.seen
                      ? 'ring-2 ring-neutral-300 dark:ring-neutral-700'
                      : 'bg-gradient-to-tr from-amber-500 via-rose-500 to-violet-600 p-[2.5px]'
                  }`}
                >
                  <Avatar
                    src={currentUser.avatar}
                    alt="Your story"
                    size="md"
                    className="border-2 border-white dark:border-neutral-900"
                  />
                </div>
              ) : (
                <div
                  onClick={() => setIsCreateOpen(true)}
                  className="p-0.5 rounded-full cursor-pointer hover:scale-105 transition-transform"
                >
                  <Avatar src={currentUser.avatar} alt="Your story" size="md" />
                </div>
              )}

              {/* Add (+) badge */}
              <button
                onClick={() => setIsCreateOpen(true)}
                className="absolute bottom-0 right-0 w-4.5 h-4.5 bg-rose-500 hover:bg-rose-600 text-white rounded-full flex items-center justify-center ring-2 ring-white dark:ring-neutral-900 cursor-pointer shadow-xs"
                title="Add to story"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
              </button>
            </div>
            <span className="text-[11px] font-medium text-neutral-600 dark:text-neutral-400 max-w-[62px] truncate text-center">
              Your story
            </span>
          </div>
        )}

        {/* Other Users' Stories */}
        {otherStories.map((story, index) => {
          const effectiveIndex = userStory ? index + 1 : index;
          return (
            <div
              key={story.id}
              onClick={() => setActiveStoryIndex(effectiveIndex)}
              className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer group"
            >
              <div
                className={`rounded-full transition-transform group-hover:scale-105 ${
                  story.seen
                    ? 'ring-2 ring-neutral-300 dark:ring-neutral-700 p-0.5'
                    : 'bg-gradient-to-tr from-amber-500 via-rose-500 to-violet-600 p-[2.5px]'
                }`}
              >
                <Avatar
                  src={story.author.avatar}
                  alt={story.author.name}
                  size="md"
                  className="border-2 border-white dark:border-neutral-900"
                />
              </div>
              <span className="text-[11px] font-medium text-neutral-600 dark:text-neutral-400 max-w-[64px] truncate text-center">
                {story.author.username}
              </span>
            </div>
          );
        })}
      </div>

      {/* Story Viewer Modal */}
      {activeStoryIndex !== null && (
        <StoryViewer
          stories={stories}
          initialIndex={activeStoryIndex}
          onClose={() => setActiveStoryIndex(null)}
        />
      )}

      {/* Create Story Modal */}
      <CreateStoryModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />
    </div>
  );
};
