import React from 'react';
import { NotebookNode } from '../../types/index.js';
import { TreeNodeItem } from './TreeNodeItem.js';

interface TreeViewProps {
  nodes: NotebookNode[];
  selectedNodeId: string | null;
  expandedNodeIds: Set<string>;
  onSelect: (node: NotebookNode) => void;
  onToggleExpand: (nodeId: string) => void;
  onAddChild: (parentNode: NotebookNode) => void;
  onRename: (node: NotebookNode) => void;
  onDelete: (node: NotebookNode, hasChildren: boolean) => void;
  onMove: (node: NotebookNode) => void;
}

export const TreeView: React.FC<TreeViewProps> = ({
  nodes,
  selectedNodeId,
  expandedNodeIds,
  onSelect,
  onToggleExpand,
  onAddChild,
  onRename,
  onDelete,
  onMove,
}) => {
  // Filter for root level nodes
  const rootNodes = nodes
    .filter((n) => !n.parentId)
    .sort((a, b) => a.order - b.order || new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  return (
    <div className="flex flex-col gap-0.5 py-1">
      {rootNodes.map((rootNode) => (
        <TreeNodeItem
          key={rootNode._id}
          node={rootNode}
          allNodes={nodes}
          selectedNodeId={selectedNodeId}
          expandedNodeIds={expandedNodeIds}
          depth={0}
          onSelect={onSelect}
          onToggleExpand={onToggleExpand}
          onAddChild={onAddChild}
          onRename={onRename}
          onDelete={onDelete}
          onMove={onMove}
        />
      ))}
    </div>
  );
};
