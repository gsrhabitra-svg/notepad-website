import React, { useState } from 'react';
import { FolderSymlink, X, Check } from 'lucide-react';
import { NotebookNode } from '../../types/index.js';

interface MoveModalProps {
  isOpen: boolean;
  node: NotebookNode | null;
  allNodes: NotebookNode[];
  onClose: () => void;
  onMove: (nodeId: string, newParentId: string | null) => Promise<void>;
}

export const MoveModal: React.FC<MoveModalProps> = ({
  isOpen,
  node,
  allNodes,
  onClose,
  onMove,
}) => {
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !node) return null;

  // Find all descendant IDs of this node to prevent cycles
  const getDescendantIds = (rootId: string): Set<string> => {
    const descendants = new Set<string>([rootId]);
    const addChildren = (parentId: string) => {
      const children = allNodes.filter((n) => n.parentId === parentId);
      for (const child of children) {
        descendants.add(child._id);
        addChildren(child._id);
      }
    };
    addChildren(rootId);
    return descendants;
  };

  const forbiddenIds = getDescendantIds(node._id);
  const eligibleParents = allNodes.filter((n) => !forbiddenIds.has(n._id));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await onMove(node._id, selectedParentId);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to move node');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-[460px] bg-[#FAF9F6] dark:bg-[#1A1E22] border border-[#E8E5DF] dark:border-[#2E333A] rounded-xl shadow-2xl p-6 flex flex-col gap-4 text-[#212529] dark:text-[#E2DED6]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#8C6D53]">
            <FolderSymlink className="w-4 h-4" />
            <h3 className="font-['Literata'] text-xl font-medium text-[#212529] dark:text-[#FAF9F6]">
              Move "{node.title}"
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
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-[#5A6268] dark:text-[#A0A4A8]">
              Select Destination Location
            </label>

            <div className="max-h-60 overflow-y-auto border border-[#E2DED6] dark:border-[#2E333A] rounded bg-[#F4F3F0] dark:bg-[#121518] p-2 flex flex-col gap-1">
              <label
                className={`flex items-center gap-2.5 px-3 py-2 rounded text-xs cursor-pointer transition-colors ${
                  selectedParentId === null
                    ? 'bg-[#212529] text-[#FAF9F6] font-medium'
                    : 'text-[#212529] dark:text-[#E2DED6] hover:bg-[#EAE6DF] dark:hover:bg-[#252A30]'
                }`}
              >
                <input
                  type="radio"
                  name="destination"
                  checked={selectedParentId === null}
                  onChange={() => setSelectedParentId(null)}
                  className="hidden"
                />
                <span className="font-mono">/ (Root Notebook Level)</span>
              </label>

              {eligibleParents.map((parent) => (
                <label
                  key={parent._id}
                  className={`flex items-center justify-between px-3 py-2 rounded text-xs cursor-pointer transition-colors ${
                    selectedParentId === parent._id
                      ? 'bg-[#212529] text-[#FAF9F6] font-medium'
                      : 'text-[#212529] dark:text-[#E2DED6] hover:bg-[#EAE6DF] dark:hover:bg-[#252A30]'
                  }`}
                >
                  <input
                    type="radio"
                    name="destination"
                    checked={selectedParentId === parent._id}
                    onChange={() => setSelectedParentId(parent._id)}
                    className="hidden"
                  />
                  <span>{parent.title}</span>
                  <span className="text-[10px] text-[#75777B] uppercase font-mono">
                    {parent.type}
                  </span>
                </label>
              ))}
            </div>
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
              disabled={loading}
              className="px-4 py-1.5 rounded bg-[#212529] dark:bg-[#FAF9F6] text-[#FAF9F6] dark:text-[#212529] text-sm font-medium flex items-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{loading ? 'Relocating...' : 'Move Here'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
