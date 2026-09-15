import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  affectedNodesCount?: number;
  affectedConnectionsCount?: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  affectedNodesCount = 1,
  affectedConnectionsCount = 0,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="glass-panel w-full max-w-md p-6 rounded-2xl border border-slate-700/80 shadow-2xl relative">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-4">
          <div className="p-3 bg-rose-500/20 text-rose-400 rounded-xl border border-rose-500/30">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            <p className="mt-1 text-sm text-slate-300 leading-relaxed">{message}</p>

            <div className="mt-3 px-3 py-2 bg-slate-900/80 rounded-lg border border-slate-800 text-xs text-rose-300 space-y-1">
              {affectedNodesCount > 1 && (
                <div>
                  • Deleting <span className="font-semibold text-white">{affectedNodesCount}</span> selected nodes.
                </div>
              )}
              {affectedConnectionsCount > 0 && (
                <div>
                  • Removing <span className="font-semibold text-white">{affectedConnectionsCount}</span> attached connection link{affectedConnectionsCount > 1 ? 's' : ''}.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-800/80 hover:bg-slate-700/80 rounded-xl transition border border-slate-700"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-500 rounded-xl transition shadow-lg shadow-rose-600/30 flex items-center gap-2"
          >
            Confirm Delete
          </button>
        </div>
      </div>
    </div>
  );
};
