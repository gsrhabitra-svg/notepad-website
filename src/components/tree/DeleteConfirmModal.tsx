import React, { useState } from 'react';
import { Trash2, AlertTriangle, X } from 'lucide-react';
import { NotebookNode } from '../../types/index.js';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  node: NotebookNode | null;
  hasChildren: boolean;
  onClose: () => void;
  onConfirm: (nodeId: string) => Promise<void>;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  node,
  hasChildren,
  onClose,
  onConfirm,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !node) return null;

  const handleDelete = async () => {
    setLoading(true);
    setError(null);
    try {
      await onConfirm(node._id);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to delete');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-[440px] bg-[#FAF9F6] dark:bg-[#1A1E22] border border-[#E8E5DF] dark:border-[#2E333A] rounded-xl shadow-2xl p-6 flex flex-col gap-4 text-[#212529] dark:text-[#E2DED6]">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5 text-red-600 dark:text-red-400">
            <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-950/60 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="font-['Literata'] text-xl font-medium text-[#212529] dark:text-[#FAF9F6]">
              {hasChildren ? 'Delete topic & children?' : 'Delete notebook topic?'}
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

        <div className="text-sm text-[#5A6268] dark:text-[#A0A4A8] leading-relaxed">
          <p>
            Are you sure you want to permanently delete{' '}
            <strong className="text-[#212529] dark:text-[#FAF9F6]">"{node.title}"</strong>?
          </p>
          {hasChildren && (
            <p className="mt-2 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 p-2.5 rounded border border-red-200 dark:border-red-900/40">
              Warning: All nested child topics and their associated manuscript pages will also be permanently deleted.
            </p>
          )}
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded text-sm text-[#5A6268] hover:bg-[#EAE6DF] dark:hover:bg-[#252A30] transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white text-sm font-medium flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            <span>{loading ? 'Deleting...' : 'Delete Permanently'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
