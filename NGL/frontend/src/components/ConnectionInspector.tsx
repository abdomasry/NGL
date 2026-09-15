import React from 'react';
import { X, Trash2, Palette, Sliders, ArrowRight, Type } from 'lucide-react';
import { IConnection, INode, ConnectionStyle } from '../types/graph';

interface ConnectionInspectorProps {
  connection: IConnection | null;
  nodes: INode[];
  onClose: () => void;
  onUpdateConnection: (connId: string, updates: Partial<IConnection>) => void;
  onDeleteConnection: (connId: string) => void;
}

const LINE_STYLES: { id: ConnectionStyle; label: string }[] = [
  { id: 'curved', label: 'Bezier Curve' },
  { id: 'straight', label: 'Straight Line' },
  { id: 'dashed', label: 'Dashed Line' },
  { id: 'dotted', label: 'Dotted Line' },
  { id: 'step', label: 'Orthogonal Step' },
];

const PRESET_SWATCHES = [
  '#6366f1', // Indigo
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#f43f5e', // Rose
  '#06b6d4', // Cyan
  '#8b5cf6', // Violet
  '#d946ef', // Fuchsia
  '#38bdf8', // Light Blue
  '#ffffff', // White
];

export const ConnectionInspector: React.FC<ConnectionInspectorProps> = ({
  connection,
  nodes,
  onClose,
  onUpdateConnection,
  onDeleteConnection,
}) => {
  if (!connection) return null;

  const fromNode = nodes.find((n) => n.id === connection.fromNodeId);
  const toNode = nodes.find((n) => n.id === connection.toNodeId);

  const wireColor = connection.color || '#6366f1';
  const wireStyle = connection.style || 'curved';

  return (
    <div
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      onDoubleClick={(e) => e.stopPropagation()}
      className="fixed top-20 right-6 z-50 w-90 glass-panel rounded-2xl p-5 border border-slate-700/80 shadow-2xl animate-fade-in flex flex-col space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div
            className="w-3.5 h-3.5 rounded-full border border-white/40 shadow-sm shrink-0"
            style={{ backgroundColor: wireColor }}
          />
          <h3 className="font-bold text-white text-sm">Connection Link Inspector</h3>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Linked Nodes Metadata Info */}
      <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 space-y-2 text-xs">
        <span className="block font-semibold text-slate-400 uppercase text-[10px] tracking-wider">
          Link Connections
        </span>
        <div className="flex items-center justify-between text-white font-medium gap-2">
          <div className="flex flex-col">
            <span className="text-indigo-300 font-bold truncate max-w-[110px]">
              {fromNode?.title || connection.fromNodeId}
            </span>
            <span className="text-[10px] text-slate-500">Port: {connection.fromPort}</span>
          </div>

          <ArrowRight className="w-4 h-4 text-slate-500 shrink-0" />

          <div className="flex flex-col text-right">
            <span className="text-emerald-300 font-bold truncate max-w-[110px]">
              {toNode?.title || connection.toNodeId}
            </span>
            <span className="text-[10px] text-slate-500">Port: {connection.toPort}</span>
          </div>
        </div>
      </div>

      {/* Line Style Selector */}
      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Sliders className="w-3.5 h-3.5 text-indigo-400" /> Line Style / Type
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {LINE_STYLES.map((st) => (
            <button
              key={st.id}
              onClick={() => onUpdateConnection(connection.id, { style: st.id })}
              className={`px-3 py-1.5 text-xs font-medium rounded-xl border transition text-left ${
                wireStyle === st.id
                  ? 'bg-indigo-600/30 border-indigo-500 text-white shadow-sm'
                  : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Line Color Picker */}
      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Palette className="w-3.5 h-3.5 text-indigo-400" /> Wire Color
        </label>

        <div className="flex items-center gap-3">
          <div className="relative group shrink-0">
            <input
              type="color"
              value={wireColor}
              onChange={(e) => onUpdateConnection(connection.id, { color: e.target.value })}
              className="opacity-0 absolute inset-0 w-8 h-8 cursor-pointer z-10"
              title="Pick wire color"
            />
            <div
              className="w-8 h-8 rounded-full border-2 border-white/60 shadow-md cursor-pointer flex items-center justify-center transition-transform group-hover:scale-110"
              style={{ backgroundColor: wireColor }}
            >
              <Palette className="w-4 h-4 text-white opacity-80" />
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-1.5 flex-1">
            {PRESET_SWATCHES.map((hex) => (
              <button
                key={hex}
                onClick={() => onUpdateConnection(connection.id, { color: hex })}
                style={{ backgroundColor: hex }}
                className={`w-5 h-5 rounded-full transition-transform ${
                  wireColor === hex
                    ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-slate-900'
                    : 'hover:scale-110 opacity-80'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Connection Wire Label / Annotation */}
      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
          <Type className="w-3.5 h-3.5 text-indigo-400" /> Wire Label / Note
        </label>
        <input
          type="text"
          value={connection.label || ''}
          onChange={(e) => onUpdateConnection(connection.id, { label: e.target.value })}
          placeholder="e.g. Data Flow Rate (100 MB/s)..."
          className="w-full bg-slate-900/90 text-white text-xs px-3 py-2 rounded-xl border border-slate-700 focus:border-indigo-500 focus:outline-none transition"
        />
      </div>

      {/* Delete Wire Link */}
      <div className="pt-2 border-t border-slate-800">
        <button
          onClick={() => onDeleteConnection(connection.id)}
          className="w-full py-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 rounded-xl text-xs font-medium transition flex items-center justify-center gap-2"
        >
          <Trash2 className="w-4 h-4" />
          <span>Delete Connection Link</span>
        </button>
      </div>
    </div>
  );
};
