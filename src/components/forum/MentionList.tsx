import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { ProfileAvatar } from '@/components/profile/ProfileAvatar';
import type { UserSummary } from '@/types/forum';

export interface MentionListRef {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

interface MentionListProps {
  items: UserSummary[];
  command: (item: { id: number; label: string }) => void;
}

export const MentionList = forwardRef<MentionListRef, MentionListProps>(
  (props, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    const selectItem = (index: number) => {
      const item = props.items[index];
      if (item) {
        props.command({ id: item.id, label: item.display_name });
      }
    };

    const upHandler = () => {
      setSelectedIndex(
        (selectedIndex + props.items.length - 1) % props.items.length
      );
    };

    const downHandler = () => {
      setSelectedIndex((selectedIndex + 1) % props.items.length);
    };

    const enterHandler = () => {
      selectItem(selectedIndex);
    };

    useEffect(() => setSelectedIndex(0), [props.items]);

    useImperativeHandle(ref, () => ({
      onKeyDown: ({ event }: { event: KeyboardEvent }) => {
        if (event.key === 'ArrowUp') {
          upHandler();
          return true;
        }

        if (event.key === 'ArrowDown') {
          downHandler();
          return true;
        }

        if (event.key === 'Enter' || event.key === 'Tab') {
          enterHandler();
          return true;
        }

        return false;
      },
    }));

    return (
      <div className="z-50 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
        {props.items.length ? (
          <div className="max-h-60 overflow-y-auto">
            {props.items.map((item, index) => (
              <button
                key={item.id}
                onClick={() => selectItem(index)}
                className={`flex w-full items-center gap-3 px-4 py-2 text-left transition-colors ${
                  index === selectedIndex
                    ? 'bg-community-100 text-community-900'
                    : 'hover:bg-gray-50'
                }`}
              >
                <ProfileAvatar user={item} size="sm" />
                <span className="font-medium">{item.display_name}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="px-4 py-3 text-sm text-gray-500">Ungültige Suche</div>
        )}
      </div>
    );
  }
);

MentionList.displayName = 'MentionList';
