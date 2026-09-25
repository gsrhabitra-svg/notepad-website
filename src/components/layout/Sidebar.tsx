import React from 'react';
import { useAuth } from '../../hooks/useAuth.js';
import { NotebookNode } from '../../types/index.js';
import { TreeView } from '../tree/TreeView.js';
import {
  FolderOpen,
  Plus,
  Settings,
  Book,
  X,
} from 'lucide-react';

interface SidebarProps {
  nodes: NotebookNode[];
  selectedNodeId: string | null;
  expandedNodeIds: Set<string>;
  onSelectNode: (node: NotebookNode) => void;
  onToggleExpand: (nodeId: string) => void;
  onOpenNewModal: (parentNode?: NotebookNode | null) => void;
  onOpenRenameModal: (node: NotebookNode) => void;
  onOpenDeleteModal: (node: NotebookNode, hasChildren: boolean) => void;
  onOpenMoveModal: (node: NotebookNode) => void;
  onOpenSettings: () => void;
  isCollapsed: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  nodes,
  selectedNodeId,
  expandedNodeIds,
  onSelectNode,
  onToggleExpand,
  onOpenNewModal,
  onOpenRenameModal,
  onOpenDeleteModal,
  onOpenMoveModal,
  onOpenSettings,
  isCollapsed,
  onCloseMobile,
}) => {
  const { user } = useAuth();

  const hasNotebooks = nodes.length > 0;

  return (
    <aside
      aria-label="Manuscript Shelf Slide Menu"
      className={`fixed top-14 bottom-0 left-0 z-30 w-72 md:w-80 bg-[#F4F3F0] dark:bg-[#15191D] border-r border-[#E8E5DF] dark:border-[#2E333A] flex flex-col justify-between select-none text-[#212529] dark:text-[#E2DED6] transition-transform duration-300 ease-in-out shadow-xl md:shadow-none ${
        isCollapsed ? '-translate-x-full pointer-events-none' : 'translate-x-0 pointer-events-auto'
      }`}
    >
      {/* Top Compartment: Shelf Header & Tree / Empty State */}
      <div className="flex flex-col flex-1 min-h-0 p-4 md:p-5 overflow-hidden">
        {/* Shelf Header */}
        <div className="flex items-center justify-between pb-3 mb-2 border-b border-[#E8E5DF] dark:border-[#2E333A] shrink-0">
          <div className="flex flex-col">
            <span className="font-mono text-[10px] text-[#75777B] uppercase tracking-wider">
              Vault
            </span>
            <span className="font-['Literata'] text-lg font-medium text-[#212529] dark:text-[#FAF9F6]">
              Manuscript Shelf
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onOpenNewModal(null)}
              title="Create Root Notebook (Ctrl+N)"
              className="w-7 h-7 rounded bg-[#212529] dark:bg-[#FAF9F6] text-[#FAF9F6] dark:text-[#212529] hover:bg-[#343A40] dark:hover:bg-[#EAE6DF] flex items-center justify-center transition-transform active:scale-95 shadow-2xs"
            >
              <Plus className="w-4 h-4 text-[#8C6D53]" />
            </button>
            {onCloseMobile && (
              <button
                type="button"
                onClick={onCloseMobile}
                title="Close Slide Menu"
                className="md:hidden w-7 h-7 rounded text-[#75777B] hover:text-[#212529] dark:hover:text-[#FAF9F6] hover:bg-[#EAE6DF] dark:hover:bg-[#252A30] flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Tree Container or Empty State */}
        <div className="flex-1 overflow-y-auto pr-1 -mr-1">
          {!hasNotebooks ? (
            /* EMPTY SHELF STATE (Section 2 & 13) */
            <div className="flex flex-col items-center justify-center p-6 bg-white/70 dark:bg-[#1A1E22]/60 rounded-xl border border-[#E8E5DF] dark:border-[#2E333A] text-center gap-2.5 my-3">
              <div className="w-10 h-10 rounded-full bg-[#EAE6DF] dark:bg-[#252A30] flex items-center justify-center text-[#75777B]">
                <FolderOpen className="w-5 h-5 text-[#8C6D53]" />
              </div>
              <div className="flex flex-col gap-0.5">
                <p className="text-xs font-semibold text-[#212529] dark:text-[#FAF9F6]">
                  No notebooks yet
                </p>
                <p className="text-[11px] text-[#75777B] leading-relaxed max-w-[200px]">
                  Begin your archival shelf with a root collection.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onOpenNewModal(null)}
                className="mt-1 font-mono text-[11px] uppercase tracking-wider text-[#8C6D53] hover:text-[#705641] transition-colors flex items-center gap-1 font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create First</span>
              </button>
            </div>
          ) : (
            /* POPULATED HIERARCHICAL TREE (User Created Data Only) */
            <TreeView
              nodes={nodes}
              selectedNodeId={selectedNodeId}
              expandedNodeIds={expandedNodeIds}
              onSelect={onSelectNode}
              onToggleExpand={onToggleExpand}
              onAddChild={(node) => onOpenNewModal(node)}
              onRename={onOpenRenameModal}
              onDelete={onOpenDeleteModal}
              onMove={onOpenMoveModal}
            />
          )}
        </div>
      </div>

      {/* Bottom Compartment: Authenticated User Profile */}
      <div className="p-4 border-t border-[#E8E5DF] dark:border-[#2E333A] bg-[#EAE6DF]/40 dark:bg-[#121518]/60 flex flex-col gap-2.5 shrink-0">
        <div className="flex items-center justify-between bg-white dark:bg-[#1A1E22] p-2 rounded-lg border border-[#E8E5DF] dark:border-[#2E333A] shadow-2xs">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="w-8 h-8 rounded-md bg-[#212529] dark:bg-[#FAF9F6] text-[#FAF9F6] dark:text-[#212529] font-mono font-medium text-xs flex items-center justify-center shrink-0">
              {user?.fullName?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-[#212529] dark:text-[#FAF9F6] truncate">
                {user?.fullName}
              </span>
              <span className="font-mono text-[10px] text-[#75777B] truncate">
                {user?.email}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenSettings}
            title="Workspace Preferences"
            className="w-7 h-7 rounded text-[#75777B] hover:text-[#212529] dark:hover:text-[#FAF9F6] hover:bg-[#F4F3F0] dark:hover:bg-[#252A30] flex items-center justify-center transition-colors shrink-0"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
