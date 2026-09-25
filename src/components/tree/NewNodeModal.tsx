import React, { useState, useEffect, useRef } from 'react';
import { FolderPlus, BookPlus, X, ArrowRight, Server } from 'lucide-react';
import { NotebookNode } from '../../types/index.js';

interface NewNodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (title: string, parentId: string | null, color: string) => Promise<void>;
  parentNode: NotebookNode | null;
}

const TINT_COLORS = [
  { name: 'Charcoal Ink', hex: '#212529', ring: 'ring-[#212529]' },
  { name: 'Saddle Tan', hex: '#8C6D53', ring: 'ring-[#8C6D53]' },
  { name: 'Slate Gray', hex: '#5A6268', ring: 'ring-[#5A6268]' },
  { name: 'Parchment Bone', hex: '#DED9D0', ring: 'ring-[#DED9D0]' },
];

export const NewNodeModal: React.FC<NewNodeModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  parentNode,
}) => {
  const [title, setTitle] = useState('');
  const [selectedColor, setSelectedColor] = useState(TINT_COLORS[0].hex);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setError(null);
      setSelectedColor(TINT_COLORS[0].hex);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a name');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await onSubmit(title.trim(), parentNode ? parentNode._id : null, selectedColor);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create');
    } finally {
      setLoading(false);
    }
  };

  const isRoot = !parentNode;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-[480px] bg-[#FAF9F6] dark:bg-[#1A1E22] border border-[#E8E5DF] dark:border-[#2E333A] rounded-xl shadow-2xl p-6 md:p-7 flex flex-col gap-5 text-[#212529] dark:text-[#E2DED6]">
        {/* Modal Header */}
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-[#8C6D53]">
              {isRoot ? <BookPlus className="w-4 h-4" /> : <FolderPlus className="w-4 h-4" />}
              <span className="text-[11px] font-semibold uppercase tracking-wider">
                {isRoot ? 'Shelving' : 'Topic Branch'}
              </span>
            </div>
            <h2 className="font-['Literata'] text-2xl font-medium text-[#212529] dark:text-[#FAF9F6]">
              {isRoot ? 'New Notebook' : `Add to "${parentNode?.title}"`}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded text-[#75777B] hover:text-[#212529] dark:hover:text-[#FAF9F6] hover:bg-[#EAE6DF] dark:hover:bg-[#252A30] flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 rounded text-xs text-red-800 dark:text-red-300">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[#212529] dark:text-[#E2DED6] flex items-center justify-between">
              <span>{isRoot ? 'Notebook name' : 'Topic title'}</span>
              <span className="font-mono text-[11px] text-[#75777B]">
                {isRoot ? 'Root entity' : 'Child branch'}
              </span>
            </label>
            <input
              ref={inputRef}
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={isRoot ? 'e.g. Computer Science, Personal, Projects' : 'e.g. Architecture, Algorithms'}
              className="w-full bg-[#F4F3F0] dark:bg-[#121518] text-[#212529] dark:text-[#FAF9F6] placeholder:text-[#9CA3AF] px-3.5 py-2.5 rounded border border-[#E2DED6] dark:border-[#2E333A] text-sm focus:outline-none focus:border-[#8C6D53] transition-colors"
            />
          </div>

          {/* Color Tint Selector for Notebooks */}
          {isRoot && (
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-[#5A6268] dark:text-[#A0A4A8]">
                Cover Tint Tone
              </label>
              <div className="flex items-center gap-3">
                {TINT_COLORS.map((col) => (
                  <button
                    key={col.hex}
                    type="button"
                    title={col.name}
                    onClick={() => setSelectedColor(col.hex)}
                    style={{ backgroundColor: col.hex }}
                    className={`w-6 h-6 rounded-full transition-transform ${
                      selectedColor === col.hex
                        ? 'ring-2 ring-offset-2 ring-[#8C6D53] scale-110'
                        : 'hover:scale-105'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Context Helper */}
          <div className="flex items-start gap-2.5 text-[#5A6268] dark:text-[#A0A4A8] bg-[#F4F3F0] dark:bg-[#121518] p-3 rounded text-xs leading-relaxed border border-[#E8E5DF] dark:border-[#2E333A]">
            <Server className="w-4 h-4 text-[#8C6D53] shrink-0 mt-0.5" />
            <p>
              {isRoot
                ? 'This will create a root-level notebook in your private workspace. You can nest topics and documents within it subsequently.'
                : `This branch will be nested under "${parentNode?.title}". You can organize further child topics inside it at any depth.`}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded text-sm text-[#5A6268] dark:text-[#A0A4A8] hover:bg-[#EAE6DF] dark:hover:bg-[#252A30] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !title.trim()}
              className="px-5 py-2 rounded bg-[#212529] dark:bg-[#FAF9F6] text-[#FAF9F6] dark:text-[#212529] hover:bg-[#343A40] dark:hover:bg-[#EAE6DF] text-sm font-medium flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
            >
              <span>{loading ? 'Creating...' : 'Create'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
