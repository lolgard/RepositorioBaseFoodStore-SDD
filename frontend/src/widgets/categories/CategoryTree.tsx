import { useState } from 'react';
import { ChevronRight, ChevronDown, Edit2, Trash2, Folder, FolderOpen } from 'lucide-react';
import type { CategoryTreeNode } from '@/entities/category/types';

interface CategoryTreeProps {
  nodes: CategoryTreeNode[];
  onEdit?: (category: CategoryTreeNode) => void;
  onDelete?: (category: CategoryTreeNode) => void;
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
        className={`flex items-center gap-3 py-3 px-4 rounded-2xl hover:bg-white/5 group transition-all ${
          depth === 0 ? 'mt-2' : ''
        }`}
        style={{ marginLeft: `${depth * 1.5}rem` }}
      >
        {/* Expand/collapse toggle */}
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className={`w-6 h-6 flex items-center justify-center text-surface-custom-500 hover:text-primary-400 transition-colors
            ${!hasChildren ? 'invisible' : ''}`}
        >
          {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
        </button>

        {/* Icon based on state */}
        <div className={`${isExpanded && hasChildren ? 'text-primary-400' : 'text-surface-custom-600'}`}>
          {hasChildren ? (isExpanded ? <FolderOpen size={18} /> : <Folder size={18} />) : <Folder size={18} />}
        </div>

        {/* Category name */}
        <span className={`flex-1 text-sm font-bold tracking-tight transition-colors ${
          isExpanded && hasChildren ? 'text-white' : 'text-surface-custom-300'
        }`}>
          {node.name}
        </span>

        {/* Action buttons */}
        <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
          {onEdit && (
            <button
              type="button"
              onClick={() => onEdit(node)}
              className="p-2 text-surface-custom-500 hover:text-white hover:bg-white/5 rounded-xl transition-all"
              title="Editar"
            >
              <Edit2 size={16} />
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(node)}
              className="p-2 text-surface-custom-500 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
              title="Eliminar"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Children (recursive) */}
      {hasChildren && isExpanded && (
        <div className="border-l border-white/5 ml-7 space-y-1">
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
      <div className="text-center py-12 space-y-4">
        <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center text-surface-custom-600 mx-auto">
          <Folder size={32} />
        </div>
        <p className="text-surface-custom-500 italic">
          No hay categorías definidas aún. Comienza creando una nueva.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
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
