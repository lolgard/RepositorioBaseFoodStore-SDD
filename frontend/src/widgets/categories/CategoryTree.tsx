/**
 * Recursive CategoryTree component for displaying hierarchical category tree.
 * Supports expand/collapse for nodes with children.
 */
import { useState } from 'react';
import type { CategoryTreeNode } from '@/entities/category/types';

interface CategoryTreeProps {
  nodes: CategoryTreeNode[];
  /** Called when a category node is clicked for editing */
  onEdit?: (category: CategoryTreeNode) => void;
  /** Called when a category node is selected for deletion */
  onDelete?: (category: CategoryTreeNode) => void;
  /** Depth level for indentation (used internally by recursion) */
  depth?: number;
}

function CategoryTreeNodeItem({
  node,
  onEdit,
  onDelete,
  depth,
}: {
  node: CategoryTreeNode;
  onEdit?: (category: CategoryTreeNode) => void;
  onDelete?: (category: CategoryTreeNode) => void;
  depth: number;
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = node.children.length > 0;

  return (
    <div className="select-none">
      <div
        className="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-gray-100 group"
        style={{ paddingLeft: `${depth * 1.5 + 0.5}rem` }}
      >
        {/* Expand/collapse toggle */}
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className={`w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600 
            ${!hasChildren ? 'invisible' : ''}`}
          aria-label={isExpanded ? 'Collapse' : 'Expand'}
        >
          {isExpanded ? '▼' : '▶'}
        </button>

        {/* Category name */}
        <span className="flex-1 text-sm font-medium text-gray-800">
          {node.name}
        </span>

        {/* Action buttons */}
        <div className="hidden group-hover:flex gap-1">
          {onEdit && (
            <button
              type="button"
              onClick={() => onEdit(node)}
              className="px-2 py-0.5 text-xs text-blue-600 hover:bg-blue-50 rounded"
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(node)}
              className="px-2 py-0.5 text-xs text-red-600 hover:bg-red-50 rounded"
            >
              Delete
            </button>
          )}
        </div>
      </div>

      {/* Children (recursive) */}
      {hasChildren && isExpanded && (
        <div className="border-l border-gray-200 ml-4">
          {node.children.map((child) => (
            <CategoryTreeNodeItem
              key={child.id}
              node={child}
              onEdit={onEdit}
              onDelete={onDelete}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function CategoryTree({
  nodes,
  onEdit,
  onDelete,
  depth = 0,
}: CategoryTreeProps) {
  if (nodes.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No categories yet. Click "Add Category" to create one.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {nodes.map((node) => (
        <CategoryTreeNodeItem
          key={node.id}
          node={node}
          onEdit={onEdit}
          onDelete={onDelete}
          depth={depth}
        />
      ))}
    </div>
  );
}
