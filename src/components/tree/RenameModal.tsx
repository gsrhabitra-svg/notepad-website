import React, { useState, useEffect, useRef } from 'react';
import { Pencil, X, Check } from 'lucide-react';
import { NotebookNode } from '../../types/index.js';

interface RenameModalProps {
  isOpen: boolean;
  node: NotebookNode | null;
  onClose: () => void;
  onRename: (id: string, newTitle: string) => Promise<void>;
}

export const RenameModal: React.FC<RenameModalProps> = ({
  isOpen,
  node,
  onClose,
  onRename,
}) => {
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && node) {
      setTitle(node.title);
      setError(null);
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
    }
  }, [isOpen, node]);

  if (!isOpen || !node) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title cannot be empty');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await onRename(node._id, title.trim());
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to rename');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-[420px] bg-[#FAF9F6] dark:bg-[#1A1E22] border border-[#E8E5DF] dark:border-[#2E333A] rounded-xl shadow-2xl p-6 flex flex-col gap-4 text-[#212529] dark:text-[#E2DED6]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#8C6D53]">
            <Pencil className="w-4 h-4" />
            <h3 className="font-['Literata'] text-lg font-medium text-[#212529] dark:text-[#FAF9F6]">
              Rename
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded text-[#75777B] hover:text-[#212529] dark:hover:text-[#FAF9F6] flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="p-2.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 rounded text-xs text-red-800 dark:text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-medium text-[#5A6268] dark:text-[#A0A4A8] mb-1">
              New title
            </label>
            <input
              ref={inputRef}
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#F4F3F0] dark:bg-[#121518] text-[#212529] dark:text-[#FAF9F6] px-3.5 py-2 rounded border border-[#E2DED6] dark:border-[#2E333A] text-sm focus:outline-none focus:border-[#8C6D53]"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded text-sm text-[#5A6268] hover:bg-[#EAE6DF] dark:hover:bg-[#252A30]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !title.trim()}
              className="px-4 py-1.5 rounded bg-[#212529] dark:bg-[#FAF9F6] text-[#FAF9F6] dark:text-[#212529] text-sm font-medium flex items-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{loading ? 'Saving...' : 'Rename'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
