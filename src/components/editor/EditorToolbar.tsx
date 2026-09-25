import React from 'react';
import { Editor } from '@tiptap/react';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Code,
  FileCode,
  Minus,
  Undo2,
  Redo2,
} from 'lucide-react';

interface EditorToolbarProps {
  editor: Editor | null;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({ editor }) => {
  if (!editor || editor.isDestroyed || !editor.schema) return null;

  return (
    <div className="sticky top-0 z-20 flex flex-wrap items-center gap-1 py-1.5 px-3 bg-[#FAF9F6]/95 dark:bg-[#121518]/95 backdrop-blur-md border-b border-[#E8E5DF] dark:border-[#2E333A] text-xs">
      {/* Text Styles */}
      <div className="flex items-center gap-0.5 pr-2 border-r border-[#E8E5DF] dark:border-[#2E333A]">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1.5 rounded transition-colors ${
            editor.isActive('bold')
              ? 'bg-[#EAE6DF] dark:bg-[#252A30] text-[#212529] dark:text-[#FAF9F6] font-bold'
              : 'text-[#5A6268] dark:text-[#A0A4A8] hover:text-[#212529] dark:hover:text-[#FAF9F6] hover:bg-[#F0EDE8] dark:hover:bg-[#1E2328]'
          }`}
          title="Bold (Ctrl+B)"
        >
          <Bold className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded transition-colors ${
            editor.isActive('italic')
              ? 'bg-[#EAE6DF] dark:bg-[#252A30] text-[#212529] dark:text-[#FAF9F6]'
              : 'text-[#5A6268] dark:text-[#A0A4A8] hover:text-[#212529] dark:hover:text-[#FAF9F6] hover:bg-[#F0EDE8] dark:hover:bg-[#1E2328]'
          }`}
          title="Italic (Ctrl+I)"
        >
          <Italic className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-1.5 rounded transition-colors ${
            editor.isActive('underline')
              ? 'bg-[#EAE6DF] dark:bg-[#252A30] text-[#212529] dark:text-[#FAF9F6]'
              : 'text-[#5A6268] dark:text-[#A0A4A8] hover:text-[#212529] dark:hover:text-[#FAF9F6] hover:bg-[#F0EDE8] dark:hover:bg-[#1E2328]'
          }`}
          title="Underline (Ctrl+U)"
        >
          <UnderlineIcon className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`p-1.5 rounded transition-colors ${
            editor.isActive('strike')
              ? 'bg-[#EAE6DF] dark:bg-[#252A30] text-[#212529] dark:text-[#FAF9F6]'
              : 'text-[#5A6268] dark:text-[#A0A4A8] hover:text-[#212529] dark:hover:text-[#FAF9F6] hover:bg-[#F0EDE8] dark:hover:bg-[#1E2328]'
          }`}
          title="Strikethrough"
        >
          <Strikethrough className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Headings */}
      <div className="flex items-center gap-0.5 px-2 border-r border-[#E8E5DF] dark:border-[#2E333A]">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-1.5 rounded transition-colors ${
            editor.isActive('heading', { level: 1 })
              ? 'bg-[#EAE6DF] dark:bg-[#252A30] text-[#8C6D53] font-bold'
              : 'text-[#5A6268] dark:text-[#A0A4A8] hover:text-[#212529] dark:hover:text-[#FAF9F6] hover:bg-[#F0EDE8] dark:hover:bg-[#1E2328]'
          }`}
          title="Heading 1"
        >
          <Heading1 className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-1.5 rounded transition-colors ${
            editor.isActive('heading', { level: 2 })
              ? 'bg-[#EAE6DF] dark:bg-[#252A30] text-[#8C6D53] font-bold'
              : 'text-[#5A6268] dark:text-[#A0A4A8] hover:text-[#212529] dark:hover:text-[#FAF9F6] hover:bg-[#F0EDE8] dark:hover:bg-[#1E2328]'
          }`}
          title="Heading 2"
        >
          <Heading2 className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`p-1.5 rounded transition-colors ${
            editor.isActive('heading', { level: 3 })
              ? 'bg-[#EAE6DF] dark:bg-[#252A30] text-[#8C6D53] font-bold'
              : 'text-[#5A6268] dark:text-[#A0A4A8] hover:text-[#212529] dark:hover:text-[#FAF9F6] hover:bg-[#F0EDE8] dark:hover:bg-[#1E2328]'
          }`}
          title="Heading 3"
        >
          <Heading3 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Lists & Checklists */}
      <div className="flex items-center gap-0.5 px-2 border-r border-[#E8E5DF] dark:border-[#2E333A]">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1.5 rounded transition-colors ${
            editor.isActive('bulletList')
              ? 'bg-[#EAE6DF] dark:bg-[#252A30] text-[#8C6D53]'
              : 'text-[#5A6268] dark:text-[#A0A4A8] hover:text-[#212529] dark:hover:text-[#FAF9F6] hover:bg-[#F0EDE8] dark:hover:bg-[#1E2328]'
          }`}
          title="Bullet List"
        >
          <List className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-1.5 rounded transition-colors ${
            editor.isActive('orderedList')
              ? 'bg-[#EAE6DF] dark:bg-[#252A30] text-[#8C6D53]'
              : 'text-[#5A6268] dark:text-[#A0A4A8] hover:text-[#212529] dark:hover:text-[#FAF9F6] hover:bg-[#F0EDE8] dark:hover:bg-[#1E2328]'
          }`}
          title="Numbered List"
        >
          <ListOrdered className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          className={`p-1.5 rounded transition-colors ${
            editor.isActive('taskList')
              ? 'bg-[#EAE6DF] dark:bg-[#252A30] text-[#8C6D53]'
              : 'text-[#5A6268] dark:text-[#A0A4A8] hover:text-[#212529] dark:hover:text-[#FAF9F6] hover:bg-[#F0EDE8] dark:hover:bg-[#1E2328]'
          }`}
          title="Checklist"
        >
          <CheckSquare className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Blocks: Quote, Code block, Inline code, HR */}
      <div className="flex items-center gap-0.5 px-2 border-r border-[#E8E5DF] dark:border-[#2E333A]">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-1.5 rounded transition-colors ${
            editor.isActive('blockquote')
              ? 'bg-[#EAE6DF] dark:bg-[#252A30] text-[#8C6D53]'
              : 'text-[#5A6268] dark:text-[#A0A4A8] hover:text-[#212529] dark:hover:text-[#FAF9F6] hover:bg-[#F0EDE8] dark:hover:bg-[#1E2328]'
          }`}
          title="Quote Block"
        >
          <Quote className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`p-1.5 rounded transition-colors ${
            editor.isActive('codeBlock')
              ? 'bg-[#EAE6DF] dark:bg-[#252A30] text-[#8C6D53]'
              : 'text-[#5A6268] dark:text-[#A0A4A8] hover:text-[#212529] dark:hover:text-[#FAF9F6] hover:bg-[#F0EDE8] dark:hover:bg-[#1E2328]'
          }`}
          title="Code Block (Programming notes)"
        >
          <FileCode className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={`p-1.5 rounded transition-colors ${
            editor.isActive('code')
              ? 'bg-[#EAE6DF] dark:bg-[#252A30] text-[#8C6D53]'
              : 'text-[#5A6268] dark:text-[#A0A4A8] hover:text-[#212529] dark:hover:text-[#FAF9F6] hover:bg-[#F0EDE8] dark:hover:bg-[#1E2328]'
          }`}
          title="Inline Code"
        >
          <Code className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="p-1.5 rounded text-[#5A6268] dark:text-[#A0A4A8] hover:text-[#212529] dark:hover:text-[#FAF9F6] hover:bg-[#F0EDE8] dark:hover:bg-[#1E2328] transition-colors"
          title="Horizontal Rule"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Undo / Redo */}
      <div className="flex items-center gap-0.5 pl-2">
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-1.5 rounded text-[#5A6268] dark:text-[#A0A4A8] hover:text-[#212529] dark:hover:text-[#FAF9F6] hover:bg-[#F0EDE8] dark:hover:bg-[#1E2328] disabled:opacity-30 transition-colors"
          title="Undo (Ctrl+Z)"
        >
          <Undo2 className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-1.5 rounded text-[#5A6268] dark:text-[#A0A4A8] hover:text-[#212529] dark:hover:text-[#FAF9F6] hover:bg-[#F0EDE8] dark:hover:bg-[#1E2328] disabled:opacity-30 transition-colors"
          title="Redo (Ctrl+Y)"
        >
          <Redo2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
