import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TipTapLink from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Mention from '@tiptap/extension-mention';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Link2,
  Code,
  Quote,
} from 'lucide-react';
import { useCallback } from 'react';
import { mentionSuggestion } from './MentionSuggestion';

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  disabled?: boolean;
  minHeight?: string;
}

export function RichTextEditor({
  content,
  onChange,
  placeholder = 'Schreibe deinen Post...',
  disabled = false,
  minHeight = '150px',
}: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
      }),
      TipTapLink.configure({
        openOnClick: false,
        HTMLAttributes: {
          rel: 'noopener noreferrer',
          target: '_blank',
          class: 'text-community-600 hover:underline',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      Mention.configure({
        HTMLAttributes: {
          class:
            'mention bg-community-100 text-community-800 rounded px-1 py-0.5 font-medium',
        },
        suggestion: mentionSuggestion,
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class: `prose prose-sm max-w-none focus:outline-none min-h-[${minHeight}] px-4 py-3`,
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editable: !disabled,
  });

  const setLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL eingeben:', previousUrl);
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="rounded-md border border-gray-300 focus-within:border-community-500 focus-within:ring-2 focus-within:ring-community-500">
      <div className="flex flex-wrap items-center gap-1 border-b border-gray-200 bg-gray-50 p-2">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={
            !editor.can().chain().focus().toggleBold().run() || disabled
          }
          className={`rounded p-2 hover:bg-gray-200 disabled:opacity-50 ${
            editor.isActive('bold') ? 'bg-gray-300' : ''
          }`}
        >
          <Bold className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={
            !editor.can().chain().focus().toggleItalic().run() || disabled
          }
          className={`rounded p-2 hover:bg-gray-200 disabled:opacity-50 ${
            editor.isActive('italic') ? 'bg-gray-300' : ''
          }`}
        >
          <Italic className="h-4 w-4" />
        </button>
        <div className="mx-1 h-6 w-px bg-gray-300" />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          disabled={disabled}
          className={`rounded p-2 hover:bg-gray-200 disabled:opacity-50 ${
            editor.isActive('bulletList') ? 'bg-gray-300' : ''
          }`}
        >
          <List className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          disabled={disabled}
          className={`rounded p-2 hover:bg-gray-200 disabled:opacity-50 ${
            editor.isActive('orderedList') ? 'bg-gray-300' : ''
          }`}
        >
          <ListOrdered className="h-4 w-4" />
        </button>
        <div className="mx-1 h-6 w-px bg-gray-300" />
        <button
          type="button"
          onClick={setLink}
          disabled={disabled}
          className={`rounded p-2 hover:bg-gray-200 disabled:opacity-50 ${
            editor.isActive('link') ? 'bg-gray-300' : ''
          }`}
        >
          <Link2 className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          disabled={disabled}
          className={`rounded p-2 hover:bg-gray-200 disabled:opacity-50 ${
            editor.isActive('codeBlock') ? 'bg-gray-300' : ''
          }`}
        >
          <Code className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          disabled={disabled}
          className={`rounded p-2 hover:bg-gray-200 disabled:opacity-50 ${
            editor.isActive('blockquote') ? 'bg-gray-300' : ''
          }`}
        >
          <Quote className="h-4 w-4" />
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
