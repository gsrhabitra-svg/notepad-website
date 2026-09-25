import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { useTheme } from '../hooks/useTheme.js';
import { NotebookNode } from '../types/index.js';
import { nodeApi } from '../services/nodeApi.js';
import { AppHeader } from '../components/layout/AppHeader.js';
import { Sidebar } from '../components/layout/Sidebar.js';
import { NoteEditor } from '../components/editor/NoteEditor.js';
import { NewNodeModal } from '../components/tree/NewNodeModal.js';
import { RenameModal } from '../components/tree/RenameModal.js';
import { DeleteConfirmModal } from '../components/tree/DeleteConfirmModal.js';
import { MoveModal } from '../components/tree/MoveModal.js';
import { SearchModal } from '../components/search/SearchModal.js';
import { SettingsModal } from '../components/settings/SettingsModal.js';
import { ShortcutsModal } from '../components/modals/ShortcutsModal.js';

export const Workspace: React.FC = () => {
  const { user } = useAuth();

  // State
  const [nodes, setNodes] = useState<NotebookNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<NotebookNode | null>(null);
  const [expandedNodeIds, setExpandedNodeIds] = useState<Set<string>>(new Set());
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      return true;
    }
    return false;
  });
  const [loading, setLoading] = useState(true);

  // Modals
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [parentNodeForNew, setParentNodeForNew] = useState<NotebookNode | null>(null);

  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [nodeForRename, setNodeForRename] = useState<NotebookNode | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [nodeForDelete, setNodeForDelete] = useState<NotebookNode | null>(null);
  const [deleteHasChildren, setDeleteHasChildren] = useState(false);

  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [nodeForMove, setNodeForMove] = useState<NotebookNode | null>(null);

  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);

  // Theme Management
  const { theme, setTheme } = useTheme();

  // Load user nodes
  const fetchNodes = useCallback(async () => {
    try {
      setLoading(true);
      const data = await nodeApi.getNodes();
      setNodes(data);
    } catch (err) {
      console.error('Failed to load nodes:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNodes();
  }, [fetchNodes]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMeta = e.metaKey || e.ctrlKey;
      if (isMeta && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        setParentNodeForNew(null);
        setIsNewModalOpen(true);
      } else if (isMeta && (e.key.toLowerCase() === 'f' || e.key.toLowerCase() === 'k')) {
        e.preventDefault();
        setIsSearchModalOpen(true);
      } else if (isMeta && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        setIsSidebarCollapsed((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Tree Handlers
  const handleToggleExpand = (nodeId: string) => {
    setExpandedNodeIds((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  };

  const handleSelectNode = (node: NotebookNode) => {
    setSelectedNode(node);
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setIsSidebarCollapsed(true);
    }
  };

  const handleCreateNode = async (
    title: string,
    parentId: string | null,
    color: string
  ) => {
    const newNode = await nodeApi.createNode({
      title,
      parentId,
      color,
    });

    setNodes((prev) => [...prev, newNode]);

    // If it had a parent, make sure the parent is expanded
    if (parentId) {
      setExpandedNodeIds((prev) => new Set([...prev, parentId]));
    }

    // Automatically select newly created node
    setSelectedNode(newNode);
  };

  const handleRenameNode = async (id: string, newTitle: string) => {
    const updated = await nodeApi.updateNode(id, { title: newTitle });
    setNodes((prev) => prev.map((n) => (n._id === id ? { ...n, title: updated.title } : n)));
    if (selectedNode?._id === id) {
      setSelectedNode((prev) => (prev ? { ...prev, title: updated.title } : null));
    }
  };

  const handleDeleteNode = async (nodeId: string) => {
    const deletedIds = await nodeApi.deleteNode(nodeId);
    const deletedSet = new Set(deletedIds);

    setNodes((prev) => prev.filter((n) => !deletedSet.has(n._id)));

    // Clear selection if active note was deleted
    if (selectedNode && deletedSet.has(selectedNode._id)) {
      setSelectedNode(null);
    }
  };

  const handleMoveNode = async (nodeId: string, newParentId: string | null) => {
    const updated = await nodeApi.moveNode(nodeId, newParentId);
    setNodes((prev) =>
      prev.map((n) => (n._id === nodeId ? { ...n, parentId: updated.parentId } : n))
    );
    if (newParentId) {
      setExpandedNodeIds((prev) => new Set([...prev, newParentId]));
    }
  };

  const handleTitleUpdatedFromEditor = (nodeId: string, newTitle: string) => {
    setNodes((prev) =>
      prev.map((n) => (n._id === nodeId ? { ...n, title: newTitle } : n))
    );
    if (selectedNode?._id === nodeId) {
      setSelectedNode((prev) => (prev ? { ...prev, title: newTitle } : null));
    }
  };

  const handleSelectSearchResult = (nodeId: string) => {
    const targetNode = nodes.find((n) => n._id === nodeId);
    if (targetNode) {
      // Ensure all parents leading up to this node are expanded
      let curr = targetNode;
      const toExpand: string[] = [];
      while (curr.parentId) {
        toExpand.push(curr.parentId);
        const parent = nodes.find((n) => n._id === curr.parentId);
        if (!parent) break;
        curr = parent;
      }
      if (toExpand.length > 0) {
        setExpandedNodeIds((prev) => new Set([...prev, ...toExpand]));
      }

      setSelectedNode(targetNode);
      if (typeof window !== 'undefined' && window.innerWidth < 768) {
        setIsSidebarCollapsed(true);
      }
    }
  };

  return (
    <div className="h-screen h-[100dvh] max-h-screen max-h-[100dvh] flex flex-col bg-[#FAF9F6] dark:bg-[#121518] text-[#212529] dark:text-[#E2DED6] antialiased overflow-hidden select-none">
      {/* Universal Header */}
      <AppHeader
        onOpenSearch={() => setIsSearchModalOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenShortcuts={() => setIsShortcutsModalOpen(true)}
        isSidebarCollapsed={isSidebarCollapsed}
        onToggleSidebar={() => setIsSidebarCollapsed((prev) => !prev)}
        theme={theme}
        onThemeChange={setTheme}
      />

      {/* Main Workspace Frame */}
      <div className="flex flex-1 min-h-0 overflow-hidden relative">
        {/* Mobile slide menu backdrop */}
        {!isSidebarCollapsed && (
          <div
            className="fixed inset-0 top-14 bg-black/40 backdrop-blur-xs z-25 md:hidden transition-opacity"
            onClick={() => setIsSidebarCollapsed(true)}
            aria-label="Close slide menu backdrop"
          />
        )}

        {/* Navigation Shelf Sidebar (Fixed slide menu) */}
        <Sidebar
          nodes={nodes}
          selectedNodeId={selectedNode?._id || null}
          expandedNodeIds={expandedNodeIds}
          onSelectNode={handleSelectNode}
          onToggleExpand={handleToggleExpand}
          onOpenNewModal={(parent) => {
            setParentNodeForNew(parent || null);
            setIsNewModalOpen(true);
          }}
          onOpenRenameModal={(node) => {
            setNodeForRename(node);
            setIsRenameModalOpen(true);
          }}
          onOpenDeleteModal={(node, hasChildren) => {
            setNodeForDelete(node);
            setDeleteHasChildren(hasChildren);
            setIsDeleteModalOpen(true);
          }}
          onOpenMoveModal={(node) => {
            setNodeForMove(node);
            setIsMoveModalOpen(true);
          }}
          onOpenSettings={() => setIsSettingsModalOpen(true)}
          isCollapsed={isSidebarCollapsed}
          onCloseMobile={() => setIsSidebarCollapsed(true)}
        />

        {/* Central Writing / Manuscript Canvas (Smooth offset from fixed slide menu) */}
        <main
          className={`flex-1 flex flex-col min-w-0 overflow-hidden relative transition-[margin] duration-300 ease-in-out ${
            isSidebarCollapsed ? 'ml-0' : 'md:ml-72 lg:ml-80 ml-0'
          }`}
        >
          <NoteEditor
            selectedNode={selectedNode}
            onTitleUpdated={handleTitleUpdatedFromEditor}
            onOpenNewNotebookModal={() => {
              setParentNodeForNew(null);
              setIsNewModalOpen(true);
            }}
            onOpenShortcuts={() => setIsShortcutsModalOpen(true)}
          />
        </main>
      </div>

      {/* MODALS */}
      <NewNodeModal
        isOpen={isNewModalOpen}
        parentNode={parentNodeForNew}
        onClose={() => setIsNewModalOpen(false)}
        onSubmit={handleCreateNode}
      />

      <RenameModal
        isOpen={isRenameModalOpen}
        node={nodeForRename}
        onClose={() => setIsRenameModalOpen(false)}
        onRename={handleRenameNode}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        node={nodeForDelete}
        hasChildren={deleteHasChildren}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteNode}
      />

      <MoveModal
        isOpen={isMoveModalOpen}
        node={nodeForMove}
        allNodes={nodes}
        onClose={() => setIsMoveModalOpen(false)}
        onMove={handleMoveNode}
      />

      <SearchModal
        isOpen={isSearchModalOpen}
        allNodes={nodes}
        onClose={() => setIsSearchModalOpen(false)}
        onSelectResult={handleSelectSearchResult}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        theme={theme}
        onThemeChange={setTheme}
      />

      <ShortcutsModal
        isOpen={isShortcutsModalOpen}
        onClose={() => setIsShortcutsModalOpen(false)}
      />
    </div>
  );
};
