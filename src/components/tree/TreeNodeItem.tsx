import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronRight,
  ChevronDown,
  Book,
  FileText,
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  FolderSymlink,
  Hash,
} from 'lucide-react';
import { NotebookNode } from '../../types/index.js';

interface TreeNodeItemProps {
  node: NotebookNode;
  allNodes: NotebookNode[];
  selectedNodeId: string | null;
  expandedNodeIds: Set<string>;
  depth?: number;
  onSelect: (node: NotebookNode) => void;
  onToggleExpand: (nodeId: string) => void;
  onAddChild: (parentNode: NotebookNode) => void;
  onRename: (node: NotebookNode) => void;
  onDelete: (node: NotebookNode, hasChildren: boolean) => void;
  onMove: (node: NotebookNode) => void;
}

export const TreeNodeItem: React.FC<TreeNodeItemProps> = ({
  node,
  allNodes,
  selectedNodeId,
  expandedNodeIds,
  depth = 0,
  onSelect,
  onToggleExpand,
  onAddChild,
  onRename,
  onDelete,
  onMove,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Find children of this node
  const children = allNodes
    .filter((n) => n.parentId === node._id)
    .sort((a, b) => a.order - b.order || new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  const hasChildren = children.length > 0;
  const isExpanded = expandedNodeIds.has(node._id);
  const isSelected = selectedNodeId === node._id;

  // Close context menu on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    if (showMenu) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [showMenu]);

  const handleRowClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(node);
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleExpand(node._id);
  };

  const isRoot = !node.parentId;

  return (
    <div className="flex flex-col select-none">
      {/* Node Row */}
      <div
        onClick={handleRowClick}
        style={{ paddingLeft: `${Math.max(8, depth * 16 + 8)}px` }}
        className={`group relative flex items-center justify-between pr-2 py-1.5 rounded transition-all cursor-pointer text-xs ${
          isSelected
            ? 'bg-[#EAE6DF] dark:bg-[#252A30] text-[#212529] dark:text-[#FAF9F6] font-medium shadow-xs'
            : 'text-[#44474A] dark:text-[#A0A4A8] hover:text-[#212529] dark:hover:text-[#FAF9F6] hover:bg-[#F0EDE8] dark:hover:bg-[#1E2328]'
        }`}
      >
        {/* Leading accent line if selected */}
        {isSelected && (
          <span className="absolute left-0 top-1 bottom-1 w-0.5 rounded-full bg-[#8C6D53]" />
        )}

        <div className="flex items-center gap-1.5 min-w-0 flex-1 mr-1">
          {/* Chevron expand/collapse toggle */}
          {hasChildren ? (
            <button
              type="button"
              onClick={handleToggle}
              className="w-4 h-4 rounded hover:bg-black/5 dark:hover:bg-white/5 flex items-center justify-center text-[#75777B] shrink-0"
            >
              {isExpanded ? (
                <ChevronDown className="w-3 h-3 text-[#75777B]" />
              ) : (
                <ChevronRight className="w-3 h-3 text-[#75777B]" />
              )}
            </button>
          ) : (
            <span className="w-4 shrink-0" />
          )}

          {/* Node Icon */}
          <span className="shrink-0 text-[#8C6D53] dark:text-[#C5A88E]">
            {isRoot ? (
              <Book className="w-3.5 h-3.5" />
            ) : depth === 1 ? (
              <Hash className="w-3.5 h-3.5 opacity-80" />
            ) : (
              <FileText className="w-3.5 h-3.5 opacity-80" />
            )}
          </span>

          {/* Title */}
          <span className="truncate tracking-tight">{node.title}</span>
        </div>

        {/* Action buttons (revealed on hover or when context menu open) */}
        <div
          onClick={(e) => e.stopPropagation()}
          className={`flex items-center gap-0.5 shrink-0 ${
            showMenu ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          } transition-opacity`}
        >
          {/* Quick Add Child button */}
          <button
            type="button"
            title="Add Child Topic"
            onClick={() => onAddChild(node)}
            className="w-5 h-5 rounded hover:bg-black/10 dark:hover:bg-white/10 flex items-center justify-center text-[#75777B] hover:text-[#212529] dark:hover:text-[#FAF9F6]"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>

          {/* More actions menu trigger */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              title="More actions"
              onClick={() => setShowMenu(!showMenu)}
              className="w-5 h-5 rounded hover:bg-black/10 dark:hover:bg-white/10 flex items-center justify-center text-[#75777B] hover:text-[#212529] dark:hover:text-[#FAF9F6]"
            >
              <MoreHorizontal className="w-3.5 h-3.5" />
            </button>

            {/* Context Flyout Menu */}
            {showMenu && (
              <div className="absolute right-0 top-full mt-1 w-44 bg-white dark:bg-[#1E2328] border border-[#E8E5DF] dark:border-[#2E333A] rounded-lg shadow-xl py-1 z-50 text-xs text-[#212529] dark:text-[#E2DED6] animate-in fade-in duration-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    onAddChild(node);
                  }}
                  className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-[#F4F3F0] dark:hover:bg-[#252A30] text-left transition-colors"
                >
                  <Plus className="w-3.5 h-3.5 text-[#8C6D53]" />
                  <span>Add child topic</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    onRename(node);
                  }}
                  className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-[#F4F3F0] dark:hover:bg-[#252A30] text-left transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5 text-[#75777B]" />
                  <span>Rename</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    onMove(node);
                  }}
                  className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-[#F4F3F0] dark:hover:bg-[#252A30] text-left transition-colors"
                >
                  <FolderSymlink className="w-3.5 h-3.5 text-[#75777B]" />
                  <span>Move topic</span>
                </button>
                <div className="my-1 border-t border-[#E8E5DF] dark:border-[#2E333A]" />
                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    onDelete(node, hasChildren);
                  }}
                  className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 dark:text-red-400 text-left transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recursive Children Rendering */}
      {hasChildren && isExpanded && (
        <div className="flex flex-col">
          {children.map((child) => (
            <TreeNodeItem
              key={child._id}
              node={child}
              allNodes={allNodes}
              selectedNodeId={selectedNodeId}
              expandedNodeIds={expandedNodeIds}
              depth={depth + 1}
              onSelect={onSelect}
              onToggleExpand={onToggleExpand}
              onAddChild={onAddChild}
              onRename={onRename}
              onDelete={onDelete}
              onMove={onMove}
            />
          ))}
        </div>
      )}
    </div>
  );
};
