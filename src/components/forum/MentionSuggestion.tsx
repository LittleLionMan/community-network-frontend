import { ReactRenderer } from '@tiptap/react';
import tippy, { Instance as TippyInstance } from 'tippy.js';
import { MentionList, MentionListRef } from './MentionList';
import type { SuggestionOptions } from '@tiptap/suggestion';
import type { UserSummary } from '@/types/forum';
import { apiClient } from '@/lib/api';

let component: ReactRenderer | null = null;
let popup: TippyInstance[] | null = null;

export const mentionSuggestion: Partial<SuggestionOptions> = {
  char: '@',
  allowSpaces: false,
  items: async ({ query }) => {
    if (!query || query.length < 2) return [];

    try {
      const params = new URLSearchParams({
        q: query,
        limit: '10',
      });

      const users = (await apiClient.users.search(params)) as UserSummary[];

      return users;
    } catch (error) {
      console.error('Mention search error:', error);
      return [];
    }
  },

  render: () => {
    return {
      onStart: (props) => {
        component = new ReactRenderer(MentionList, {
          props,
          editor: props.editor,
        });

        if (!props.clientRect) {
          return;
        }

        popup = tippy('body', {
          getReferenceClientRect: props.clientRect as () => DOMRect,
          appendTo: () => document.body,
          content: component.element,
          showOnCreate: true,
          interactive: true,
          trigger: 'manual',
          placement: 'bottom-start',
        });
      },

      onUpdate(props) {
        component?.updateProps(props);

        if (!props.clientRect) {
          return;
        }

        popup?.[0]?.setProps({
          getReferenceClientRect: props.clientRect as () => DOMRect,
        });
      },

      onKeyDown(props) {
        if (props.event.key === 'Escape') {
          popup?.[0]?.hide();
          return true;
        }
        return (component?.ref as MentionListRef)?.onKeyDown(props) ?? false;
      },

      onExit() {
        popup?.[0]?.destroy();
        component?.destroy();
        popup = null;
        component = null;
      },
    };
  },
};
