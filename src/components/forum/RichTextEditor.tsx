import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TipTapLink from '@tiptap/extension-link';
import TipTapImage from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import Mention from '@tiptap/extension-mention';
import {
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  Link2,
  Code,
  Quote,
  Image as ImageIcon,
  Heading2,
  Heading3,
  Minus,
  Unlink,
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
      TipTapImage.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg my-4',
        },
        allowBase64: false,
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

    if (previousUrl) {
      const action = window.confirm(
        'Link bereits vorhanden. OK = Link ändern, Abbrechen = Link entfernen'
      );
      if (!action) {
        editor.chain().focus().extendMarkRange('link').unsetLink().run();
        return;
      }
    }

    const url = window.prompt('URL eingeben:', previousUrl || 'https://');

    if (url === null) return;

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      alert('Bitte gib eine gültige URL ein (muss mit https:// beginnen)');
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  const addImage = useCallback(() => {
    if (!editor) return;

    const url = window.prompt('Bild-URL eingeben:', 'https://');

    if (url === null || url === '' || url === 'https://') {
      return;
    }

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      alert('Bitte gib eine gültige URL ein (muss mit https:// beginnen)');
      return;
    }

    editor.chain().focus().setImage({ src: url }).run();
  }, [editor]);

  const removeLink = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().unsetLink().run();
  }, [editor]);

  if (!editor) return null;

  const isLinkActive = editor.isActive('link');

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
          title="Fett (Ctrl+B)"
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
          title="Kursiv (Ctrl+I)"
        >
          <Italic className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          disabled={
            !editor.can().chain().focus().toggleStrike().run() || disabled
          }
          className={`rounded p-2 hover:bg-gray-200 disabled:opacity-50 ${
            editor.isActive('strike') ? 'bg-gray-300' : ''
          }`}
          title="Durchgestrichen"
        >
          <Strikethrough className="h-4 w-4" />
        </button>

        <div className="mx-1 h-6 w-px bg-gray-300" />

        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          disabled={disabled}
          className={`rounded p-2 hover:bg-gray-200 disabled:opacity-50 ${
            editor.isActive('heading', { level: 2 }) ? 'bg-gray-300' : ''
          }`}
          title="Überschrift 2"
        >
          <Heading2 className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          disabled={disabled}
          className={`rounded p-2 hover:bg-gray-200 disabled:opacity-50 ${
            editor.isActive('heading', { level: 3 }) ? 'bg-gray-300' : ''
          }`}
          title="Überschrift 3"
        >
          <Heading3 className="h-4 w-4" />
        </button>

        <div className="mx-1 h-6 w-px bg-gray-300" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          disabled={disabled}
          className={`rounded p-2 hover:bg-gray-200 disabled:opacity-50 ${
            editor.isActive('bulletList') ? 'bg-gray-300' : ''
          }`}
          title="Aufzählung"
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
          title="Nummerierte Liste"
        >
          <ListOrdered className="h-4 w-4" />
        </button>

        <div className="mx-1 h-6 w-px bg-gray-300" />

        <button
          type="button"
          onClick={setLink}
          disabled={disabled}
          className={`rounded p-2 hover:bg-gray-200 disabled:opacity-50 ${
            isLinkActive ? 'bg-gray-300' : ''
          }`}
          title="Link einfügen (Text markieren, dann klicken)"
        >
          <Link2 className="h-4 w-4" />
        </button>
        {isLinkActive && (
          <button
            type="button"
            onClick={removeLink}
            disabled={disabled}
            className="rounded p-2 text-red-600 hover:bg-red-50 disabled:opacity-50"
            title="Link entfernen"
          >
            <Unlink className="h-4 w-4" />
          </button>
        )}

        <button
          type="button"
          onClick={addImage}
          disabled={disabled}
          className="rounded p-2 hover:bg-gray-200 disabled:opacity-50"
          title="Bild einfügen"
        >
          <ImageIcon className="h-4 w-4" />
        </button>

        <div className="mx-1 h-6 w-px bg-gray-300" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          disabled={disabled}
          className={`rounded p-2 hover:bg-gray-200 disabled:opacity-50 ${
            editor.isActive('codeBlock') ? 'bg-gray-300' : ''
          }`}
          title="Code-Block"
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
          title="Zitat"
        >
          <Quote className="h-4 w-4" />
        </button>

        <div className="mx-1 h-6 w-px bg-gray-300" />

        <button
          type="button"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          disabled={disabled}
          className="rounded p-2 hover:bg-gray-200 disabled:opacity-50"
          title="Horizontale Linie"
        >
          <Minus className="h-4 w-4" />
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
