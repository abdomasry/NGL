import React from 'react';
import { GripHorizontal, Tag, Image as ImageIcon } from 'lucide-react';
import { INode } from '../types/graph';

interface NodeCardProps {
  node: INode;
  isSelected: boolean;
  onSelect: (e: React.MouseEvent) => void;
  onPortDragStart: (e: React.MouseEvent, nodeId: string, portId: string, isOutput: boolean) => void;
  onPortDrop: (nodeId: string, portId: string, isOutput: boolean) => void;
  onMouseDown: (e: React.MouseEvent) => void;
}

export const NodeCard: React.FC<NodeCardProps> = ({
  node,
  isSelected,
  onSelect,
  onPortDragStart,
  onPortDrop,
  onMouseDown,
}) => {
  const nodeColor = node.color || '#6366f1';

  return (
    <div
      style={{
        left: `${node.x}px`,
        top: `${node.y}px`,
        width: '190px',
        borderColor: isSelected ? nodeColor : `${nodeColor}55`,
        boxShadow: isSelected
          ? `0 0 0 2px ${nodeColor}, 0 12px 30px -5px ${nodeColor}66`
          : `0 8px 20px -5px rgba(0, 0, 0, 0.5)`,
      }}
      onMouseDown={(e) => {
        onSelect(e);
        onMouseDown(e);
      }}
      className={`absolute glass-node rounded-2xl select-none z-20 cursor-grab active:cursor-grabbing transition-all ${
        isSelected ? 'selected scale-[1.02]' : ''
      }`}
    >
      {/* Top Port Handle */}
      <div
        onMouseDown={(e) => {
          e.stopPropagation();
          onPortDragStart(e, node.id, 'top', true);
        }}
        onMouseUp={(e) => {
          e.stopPropagation();
          onPortDrop(node.id, 'top', false);
        }}
        title="Top Port (Drag wire to connect)"
        className="port-handle absolute -top-2 left-1/2 -translate-x-1/2 z-30"
      />

      {/* Bottom Port Handle */}
      <div
        onMouseDown={(e) => {
          e.stopPropagation();
          onPortDragStart(e, node.id, 'bottom', true);
        }}
        onMouseUp={(e) => {
          e.stopPropagation();
          onPortDrop(node.id, 'bottom', false);
        }}
        title="Bottom Port (Drag wire to connect)"
        className="port-handle absolute -bottom-2 left-1/2 -translate-x-1/2 z-30"
      />

      {/* Left Port Handle */}
      <div
        onMouseDown={(e) => {
          e.stopPropagation();
          onPortDragStart(e, node.id, 'left', true);
        }}
        onMouseUp={(e) => {
          e.stopPropagation();
          onPortDrop(node.id, 'left', false);
        }}
        title="Left Port (Drag wire to connect)"
        className="port-handle absolute -left-2.5 top-1/2 -translate-y-1/2 z-30"
      />

      {/* Right Port Handle */}
      <div
        onMouseDown={(e) => {
          e.stopPropagation();
          onPortDragStart(e, node.id, 'right', true);
        }}
        onMouseUp={(e) => {
          e.stopPropagation();
          onPortDrop(node.id, 'right', false);
        }}
        title="Right Port (Drag wire to connect)"
        className="port-handle absolute -right-2.5 top-1/2 -translate-y-1/2 z-30"
      />

      {/* Compact Header Bar */}
      <div
        style={{ backgroundColor: `${nodeColor}33` }}
        className="px-3 py-2 rounded-t-2xl flex items-center justify-between border-b border-white/10"
      >
        <div className="flex items-center gap-1.5 overflow-hidden">
          <GripHorizontal className="w-3.5 h-3.5 text-slate-300 shrink-0" />
          <h4
            className="text-xs font-bold text-white truncate cursor-pointer"
            title={`${node.title} (Click to inspect)`}
          >
            {node.title}
          </h4>
        </div>
        <div className="flex items-center gap-1">
          {node.imageUrl && (
            <span title="Has Cloudinary Image">
              <ImageIcon className="w-3 h-3 text-indigo-300" />
            </span>
          )}
          <div
            className="w-2.5 h-2.5 rounded-full shrink-0 border border-white/40 shadow-sm"
            style={{ backgroundColor: nodeColor }}
          />
        </div>
      </div>

      {/* Uploaded Cloudinary Image Thumbnail */}
      {node.imageUrl && (
        <div className="w-full h-24 overflow-hidden border-b border-slate-800 bg-slate-950">
          <img
            src={node.imageUrl}
            alt={node.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Compact Body / Label Titles */}
      <div className="p-2.5 space-y-1.5">
        {node.labels.length === 0 ? (
          <div className="text-[10px] text-slate-500 italic text-center py-1">No labels</div>
        ) : (
          node.labels.map((lbl) => (
            <div
              key={lbl.id}
              className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] text-slate-200"
            >
              <Tag className="w-3 h-3 text-slate-400 shrink-0" />
              <span className="truncate flex-1 font-medium">{lbl.text}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
