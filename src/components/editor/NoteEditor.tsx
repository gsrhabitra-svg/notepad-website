import React, { useState, useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { EditorToolbar } from './EditorToolbar.js';
import { SaveStatusIndicator } from './SaveStatusIndicator.js';
import { useAutosave } from '../../hooks/useAutosave.js';
import { PageContent, NotebookNode } from '../../types/index.js';
import { pageApi } from '../../services/pageApi.js';
import { BookOpen, Calendar, Clock, BookPlus, Keyboard } from 'lucide-react';

interface NoteEditorProps {
  selectedNode: NotebookNode | null;
  onTitleUpdated: (nodeId: string, newTitle: string) => void;
  onOpenNewNotebookModal: () => void;
  onOpenShortcuts: () => void;
}

export const NoteEditor: React.FC<NoteEditorProps> = ({
  selectedNode,
  onTitleUpdated,
  onOpenNewNotebookModal,
  onOpenShortcuts,
}) => {
  const [page, setPage] = useState<PageContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);
  const [titleInput, setTitleInput] = useState('');

  // Fetch page content when selectedNode changes
  useEffect(() => {
    let isCurrent = true;

    if (!selectedNode) {
      setPage(null);
      setTitleInput('');
      return;
    }

    setLoading(true);
    setPageError(null);

    pageApi
      .getPage(selectedNode._id)
      .then((data) => {
        if (isCurrent) {
          setPage(data);
          setTitleInput(data.title || selectedNode.title);
        }
      })
      .catch((err) => {
        if (isCurrent) {
          setPageError(err.message || 'Failed to load page content');
        }
      })
      .finally(() => {
        if (isCurrent) {
          setLoading(false);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [selectedNode?._id]);

  // Setup Autosave hook
  const {
    saveStatus,
    errorMessage: autosaveError,
    triggerChange,
    retrySave,
  } = useAutosave({
    pageId: page?._id || null,
    initialTitle: page?.title || '',
    initialContent: page?.content || '',
    onSaved: (savedTitle) => {
      if (selectedNode && savedTitle !== selectedNode.title) {
        onTitleUpdated(selectedNode._id, savedTitle);
      }
    },
    debounceMs: 750,
  });

  // TipTap Editor initialization (stable instance)
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        codeBlock: {
          HTMLAttributes: {
            class: 'font-mono text-sm leading-relaxed p-4 rounded-md',
          },
        },
        link: {
          openOnClick: false,
          HTMLAttributes: {
            class: 'underline underline-offset-4 text-[#8C6D53]',
          },
        },
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
    ],
    content: '',
    editorProps: {
      attributes: {
        class:
          'tiptap prose prose-neutral dark:prose-invert max-w-none focus:outline-none min-h-[500px] text-[#212529] dark:text-[#E2DED6]',
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      if (!currentEditor || currentEditor.isDestroyed || !currentEditor.schema) return;
      const html = currentEditor.getHTML();
      triggerChange(undefined, html);
    },
  });

  // Synchronize editor content when loaded page changes
  useEffect(() => {
    if (editor && !editor.isDestroyed && editor.schema && page) {
      try {
        const currentHtml = editor.getHTML();
        if (currentHtml !== (page.content || '')) {
          editor.commands.setContent(page.content || '', { emitUpdate: false });
        }
      } catch (err) {
        console.warn('Error synchronizing editor content:', err);
      }
    }
  }, [page?._id, page?.content, editor]);

  // Title change handler
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitleInput(newTitle);
    triggerChange(newTitle, undefined);
  };

  // Keyboard shortcut Ctrl+S handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        retrySave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [retrySave]);

  // 1. EMPTY STATE (No note/topic selected)
  if (!selectedNode) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 md:p-16 relative overflow-y-auto bg-[#FAF9F6] dark:bg-[#121518] h-full min-h-0 text-[#212529] dark:text-[#E2DED6]">
        {/* Subtle Archival Atmosphere Glow */}
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[#EAE6DF]/40 dark:bg-white/5 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-[#8C6D53]/10 dark:bg-[#8C6D53]/5 blur-3xl pointer-events-none" />

        <div className="w-full max-w-[640px] flex flex-col items-center text-center z-10 my-auto">
          {/* Emblem */}
          <div className="relative w-20 h-20 rounded-full bg-[#EAE6DF] dark:bg-[#1E2328] flex items-center justify-center mb-6 shadow-sm">
            <svg
              className="w-10 h-10 text-[#5A6268] dark:text-[#A0A4A8]"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              viewBox="0 0 48 48"
            >
              <path d="M8 8C8 6.89543 8.89543 6 10 6H38C39.1046 6 40 6.89543 40 8V42H10C8.89543 42 8 41.1046 8 40V8Z" />
              <path d="M14 6V42" />
              <line x1="20" x2="32" y1="16" y2="16" />
              <line x1="20" x2="30" y1="24" y2="24" />
              <circle cx="20" cy="32" fill="currentColor" r="1.5" />
              <circle cx="26" cy="32" fill="currentColor" r="1.5" />
            </svg>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#8C6D53] text-white flex items-center justify-center shadow-xs">
              <BookOpen className="w-3.5 h-3.5" />
            </div>
          </div>

          <span className="font-mono text-xs uppercase tracking-widest text-[#8C6D53] mb-2 font-medium">
            Digital Sanctuary · Tabula Rasa
          </span>

          <h1 className="font-['Literata'] text-3xl md:text-4xl text-[#212529] dark:text-[#FAF9F6] mb-3 font-semibold tracking-tight">
            Create your first notebook
          </h1>

          <p className="font-['Literata'] text-base md:text-lg text-[#5A6268] dark:text-[#A0A4A8] max-w-[520px] mb-8 leading-relaxed">
            Your digital notebook is completely blank. Create a root notebook in the sidebar to organize your notes, topics, code snippets, and research.
          </p>

          <div className="flex items-center gap-3.5 mb-10">
            <button
              type="button"
              onClick={onOpenNewNotebookModal}
              className="px-5 py-2.5 rounded bg-[#212529] dark:bg-[#FAF9F6] text-[#FAF9F6] dark:text-[#212529] hover:bg-[#343A40] dark:hover:bg-[#EAE6DF] text-sm font-medium flex items-center gap-2 shadow-md transition-all active:scale-[0.98]"
            >
              <BookPlus className="w-4 h-4 text-[#8C6D53]" />
              <span>+ Create Notebook</span>
            </button>
            <button
              type="button"
              onClick={onOpenShortcuts}
              className="px-4 py-2.5 rounded bg-[#EAE6DF] dark:bg-[#1E2328] hover:bg-[#E2DED6] dark:hover:bg-[#252A30] text-[#212529] dark:text-[#E2DED6] text-sm font-medium transition-colors flex items-center gap-2"
            >
              <Keyboard className="w-4 h-4 text-[#75777B]" />
              <span>Key Shortcuts</span>
            </button>
          </div>

          {/* Three Pillars Value Triad */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full text-left">
            <div className="p-4 rounded-lg bg-[#F4F3F0] dark:bg-[#1A1E22] border border-[#E8E5DF] dark:border-[#2E333A] shadow-xs flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-[#212529] dark:text-[#FAF9F6] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#8C6D53]" />
                Unlimited Nesting
              </span>
              <p className="text-xs text-[#5A6268] dark:text-[#A0A4A8] leading-relaxed">
                Organize topics, sub-disciplines, and index tabs to any logical depth.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-[#F4F3F0] dark:bg-[#1A1E22] border border-[#E8E5DF] dark:border-[#2E333A] shadow-xs flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-[#212529] dark:text-[#FAF9F6] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#8C6D53]" />
                Keyboard First
              </span>
              <p className="text-xs text-[#5A6268] dark:text-[#A0A4A8] leading-relaxed">
                Swift navigation using quick switcher, tag jumps, and markdown keys.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-[#F4F3F0] dark:bg-[#1A1E22] border border-[#E8E5DF] dark:border-[#2E333A] shadow-xs flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-[#212529] dark:text-[#FAF9F6] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#8C6D53]" />
                Distraction Free
              </span>
              <p className="text-xs text-[#5A6268] dark:text-[#A0A4A8] leading-relaxed">
                Archival Literata typography with quiet syntax highlighting and zero clatter.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. LOADING STATE
  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] text-[#75777B]">
        <div className="w-6 h-6 border-2 border-[#8C6D53]/30 border-t-[#8C6D53] rounded-full animate-spin mb-3" />
        <span className="text-xs font-mono">Loading manuscript topic...</span>
      </div>
    );
  }

  // 3. ERROR STATE
  if (pageError) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] text-red-600 dark:text-red-400 p-6">
        <p className="text-sm font-medium mb-2">{pageError}</p>
        <button
          type="button"
          onClick={() => {
            setLoading(true);
            pageApi.getPage(selectedNode._id).then(setPage).catch(setPageError).finally(() => setLoading(false));
          }}
          className="px-3.5 py-1.5 rounded bg-[#FAF9F6] border border-[#E8E5DF] text-xs text-[#212529] hover:bg-[#EAE6DF]"
        >
          Retry
        </button>
      </div>
    );
  }

  // Word & Character count calculation (safeguarded)
  const isEditorReady = Boolean(editor && !editor.isDestroyed && editor.schema);
  const editorText = isEditorReady ? editor!.getText() : '';
  const wordCount = editorText.trim() ? editorText.trim().split(/\s+/).length : 0;
  const charCount = editorText.length;

  return (
    <div className="flex-1 flex flex-col min-h-0 h-full bg-[#FAF9F6] dark:bg-[#121518] text-[#212529] dark:text-[#E2DED6] relative">
      {/* Editor Sub-header / Status bar */}
      <div className="flex items-center justify-between px-6 py-2 border-b border-[#E8E5DF] dark:border-[#2E333A] bg-[#FAF9F6]/80 dark:bg-[#121518]/80 backdrop-blur-xs">
        {/* Breadcrumb path */}
        <div className="flex items-center gap-1.5 text-xs text-[#75777B] truncate">
          <BookOpen className="w-3.5 h-3.5 text-[#8C6D53] shrink-0" />
          <span className="truncate">{selectedNode.title}</span>
          <span className="text-[#8C6D53]">/</span>
          <span className="text-[#212529] dark:text-[#FAF9F6] font-medium font-mono text-[11px] uppercase">
            {selectedNode.type}
          </span>
        </div>

        {/* Live Autosave status */}
        <SaveStatusIndicator
          status={saveStatus}
          errorMessage={autosaveError}
          onRetry={retrySave}
        />
      </div>

      {/* Editor Formatting Toolbar */}
      <EditorToolbar editor={editor} />

      {/* Central Reading / Writing Canvas */}
      <div className="flex-1 overflow-y-auto px-6 md:px-12 py-8 flex justify-center">
        <div className="w-full max-w-[760px] flex flex-col">
          {/* Editable Document Title */}
          <input
            type="text"
            value={titleInput}
            onChange={handleTitleChange}
            placeholder="Untitled Document..."
            className="w-full font-['Literata'] text-3xl md:text-4xl font-semibold tracking-tight text-[#212529] dark:text-[#FAF9F6] bg-transparent border-none outline-none placeholder:text-[#A0A4A8]/60 mb-6 selection:bg-[#EAE6DF]"
          />

          {/* Document metadata rule */}
          <div className="flex items-center gap-4 text-xs text-[#75777B] pb-6 mb-6 border-b border-[#E8E5DF] dark:border-[#2E333A]">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#8C6D53]" />
              {page?.updatedAt
                ? new Date(page.updatedAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : 'Current Document'}
            </span>
            <span>·</span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#8C6D53]" />
              {Math.max(1, Math.ceil(wordCount / 200))} min read
            </span>
          </div>

          {/* TipTap Rich Text Composition Surface */}
          <div className="flex-1 pb-24">
            {isEditorReady ? (
              <EditorContent editor={editor} />
            ) : (
              <div className="min-h-[500px] flex items-center justify-center text-[#75777B]">
                <div className="w-5 h-5 border-2 border-[#8C6D53]/30 border-t-[#8C6D53] rounded-full animate-spin" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Metrics (Quiet tabular stats) */}
      <div className="flex items-center justify-between px-6 py-1.5 border-t border-[#E8E5DF] dark:border-[#2E333A] bg-[#FAF9F6]/90 dark:bg-[#121518]/90 text-[11px] font-mono text-[#75777B]">
        <div className="flex items-center gap-3">
          <span>{wordCount} words</span>
          <span>·</span>
          <span>{charCount} characters</span>
        </div>
        <div>
          <span>Press ⌘S to save anytime</span>
        </div>
      </div>
    </div>
  );
};
