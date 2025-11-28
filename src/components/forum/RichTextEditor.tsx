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
import { useCallback, useState } from 'react';
import { mentionSuggestion } from './MentionSuggestion';
import { LinkDialog } from '@/components/ui/LinkDialog';

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
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [currentLinkUrl, setCurrentLinkUrl] = useState('');

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
          class: 'text-community-600 hover:underline dark:text-community-400',
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
            'mention bg-community-100 text-community-800 rounded px-1 py-0.5 font-medium dark:bg-community-900 dark:text-community-200',
        },
        suggestion: mentionSuggestion,
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class: `prose prose-sm max-w-none focus:outline-none min-h-[${minHeight}] px-4 py-3 dark:prose-invert dark:text-gray-100`,
        style: 'font-size: 16px',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editable: !disabled,
  });

  const openLinkDialog = useCallback(() => {
    if (!editor) return;

    const previousUrl = editor.getAttributes('link').href || '';
    setCurrentLinkUrl(previousUrl);
    setLinkDialogOpen(true);
  }, [editor]);

  const handleLinkSubmit = useCallback(
    (url: string) => {
      if (!editor) return;
      editor
        .chain()
        .focus()
        .extendMarkRange('link')
        .setLink({ href: url })
        .run();
    },
    [editor]
  );

  const handleLinkRemove = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().extendMarkRange('link').unsetLink().run();
  }, [editor]);

  const openImageDialog = useCallback(() => {
    setImageDialogOpen(true);
  }, []);

  const handleImageSubmit = useCallback(
    (url: string) => {
      if (!editor) return;
      editor.chain().focus().setImage({ src: url }).run();
    },
    [editor]
  );

  if (!editor) return null;

  const isLinkActive = editor.isActive('link');

  return (
    <>
      <div className="rounded-md border border-gray-300 focus-within:border-community-500 focus-within:ring-2 focus-within:ring-community-500 dark:border-gray-600 dark:focus-within:border-community-400 dark:focus-within:ring-community-400">
        <div className="flex flex-wrap items-center gap-1 border-b border-gray-200 bg-gray-50 p-2 dark:border-gray-700 dark:bg-gray-800">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            disabled={
              !editor.can().chain().focus().toggleBold().run() || disabled
            }
            className={`rounded p-2 hover:bg-gray-200 disabled:opacity-50 dark:hover:bg-gray-700 ${
              editor.isActive('bold') ? 'bg-gray-300 dark:bg-gray-600' : ''
            }`}
            title="Fett (Ctrl+B)"
          >
            <Bold className="h-4 w-4 dark:text-gray-300" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            disabled={
              !editor.can().chain().focus().toggleItalic().run() || disabled
            }
            className={`rounded p-2 hover:bg-gray-200 disabled:opacity-50 dark:hover:bg-gray-700 ${
              editor.isActive('italic') ? 'bg-gray-300 dark:bg-gray-600' : ''
            }`}
            title="Kursiv (Ctrl+I)"
          >
            <Italic className="h-4 w-4 dark:text-gray-300" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            disabled={
              !editor.can().chain().focus().toggleStrike().run() || disabled
            }
            className={`rounded p-2 hover:bg-gray-200 disabled:opacity-50 dark:hover:bg-gray-700 ${
              editor.isActive('strike') ? 'bg-gray-300 dark:bg-gray-600' : ''
            }`}
            title="Durchgestrichen"
          >
            <Strikethrough className="h-4 w-4 dark:text-gray-300" />
          </button>

          <div className="mx-1 h-6 w-px bg-gray-300 dark:bg-gray-600" />

          <button
            type="button"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            disabled={disabled}
            className={`rounded p-2 hover:bg-gray-200 disabled:opacity-50 dark:hover:bg-gray-700 ${
              editor.isActive('heading', { level: 2 })
                ? 'bg-gray-300 dark:bg-gray-600'
                : ''
            }`}
            title="Überschrift 2"
          >
            <Heading2 className="h-4 w-4 dark:text-gray-300" />
          </button>

          <button
            type="button"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
            disabled={disabled}
            className={`rounded p-2 hover:bg-gray-200 disabled:opacity-50 dark:hover:bg-gray-700 ${
              editor.isActive('heading', { level: 3 })
                ? 'bg-gray-300 dark:bg-gray-600'
                : ''
            }`}
            title="Überschrift 3"
          >
            <Heading3 className="h-4 w-4 dark:text-gray-300" />
          </button>

          <div className="mx-1 h-6 w-px bg-gray-300 dark:bg-gray-600" />

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            disabled={disabled}
            className={`rounded p-2 hover:bg-gray-200 disabled:opacity-50 dark:hover:bg-gray-700 ${
              editor.isActive('bulletList')
                ? 'bg-gray-300 dark:bg-gray-600'
                : ''
            }`}
            title="Aufzählung"
          >
            <List className="h-4 w-4 dark:text-gray-300" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            disabled={disabled}
            className={`rounded p-2 hover:bg-gray-200 disabled:opacity-50 dark:hover:bg-gray-700 ${
              editor.isActive('orderedList')
                ? 'bg-gray-300 dark:bg-gray-600'
                : ''
            }`}
            title="Nummerierte Liste"
          >
            <ListOrdered className="h-4 w-4 dark:text-gray-300" />
          </button>

          <div className="mx-1 h-6 w-px bg-gray-300 dark:bg-gray-600" />

          <button
            type="button"
            onClick={openLinkDialog}
            disabled={disabled}
            className={`rounded p-2 hover:bg-gray-200 disabled:opacity-50 dark:hover:bg-gray-700 ${
              isLinkActive ? 'bg-gray-300 dark:bg-gray-600' : ''
            }`}
            title="Link einfügen (Text markieren, dann klicken)"
          >
            <Link2 className="h-4 w-4 dark:text-gray-300" />
          </button>

          {isLinkActive && (
            <button
              type="button"
              onClick={handleLinkRemove}
              disabled={disabled}
              className="rounded p-2 text-red-600 hover:bg-red-50 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-950"
              title="Link entfernen"
            >
              <Unlink className="h-4 w-4" />
            </button>
          )}

          <button
            type="button"
            onClick={openImageDialog}
            disabled={disabled}
            className="rounded p-2 hover:bg-gray-200 disabled:opacity-50 dark:hover:bg-gray-700"
            title="Bild einfügen"
          >
            <ImageIcon className="h-4 w-4 dark:text-gray-300" />
          </button>

          <div className="mx-1 h-6 w-px bg-gray-300 dark:bg-gray-600" />

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            disabled={disabled}
            className={`rounded p-2 hover:bg-gray-200 disabled:opacity-50 dark:hover:bg-gray-700 ${
              editor.isActive('codeBlock') ? 'bg-gray-300 dark:bg-gray-600' : ''
            }`}
            title="Code-Block"
          >
            <Code className="h-4 w-4 dark:text-gray-300" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            disabled={disabled}
            className={`rounded p-2 hover:bg-gray-200 disabled:opacity-50 dark:hover:bg-gray-700 ${
              editor.isActive('blockquote')
                ? 'bg-gray-300 dark:bg-gray-600'
                : ''
            }`}
            title="Zitat"
          >
            <Quote className="h-4 w-4 dark:text-gray-300" />
          </button>

          <div className="mx-1 h-6 w-px bg-gray-300 dark:bg-gray-600" />

          <button
            type="button"
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            disabled={disabled}
            className="rounded p-2 hover:bg-gray-200 disabled:opacity-50 dark:hover:bg-gray-700"
            title="Horizontale Linie"
          >
            <Minus className="h-4 w-4 dark:text-gray-300" />
          </button>
        </div>

        <EditorContent editor={editor} />
      </div>

      <LinkDialog
        isOpen={linkDialogOpen}
        onClose={() => setLinkDialogOpen(false)}
        onSubmit={handleLinkSubmit}
        onRemove={handleLinkRemove}
        initialUrl={currentLinkUrl}
        title={isLinkActive ? 'Link bearbeiten' : 'Link einfügen'}
        placeholder="https://beispiel.de"
        hasExistingLink={isLinkActive}
      />

      <LinkDialog
        isOpen={imageDialogOpen}
        onClose={() => setImageDialogOpen(false)}
        onSubmit={handleImageSubmit}
        initialUrl=""
        title="Bild einfügen"
        placeholder="https://beispiel.de/bild.jpg"
      />
    </>
  );
}
