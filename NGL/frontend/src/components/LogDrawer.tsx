import React, { useEffect, useState } from 'react';
import { X, Clock, Activity, RefreshCw } from 'lucide-react';
import { IActivityLog } from '../types/graph';
import { api } from '../lib/api';

interface LogDrawerProps {
  isOpen: boolean;
  graphId: string | null;
  onClose: () => void;
}

export const LogDrawer: React.FC<LogDrawerProps> = ({ isOpen, graphId, onClose }) => {
  const [logs, setLogs] = useState<IActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadLogs = async () => {
    if (!graphId) return;
    setIsLoading(true);
    try {
      const data = await api.fetchLogs(graphId);
      setLogs(data);
    } catch {
      setLogs([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && graphId) {
      loadLogs();
    }
  }, [isOpen, graphId]);

  if (!isOpen) return null;

  const formatTimestamp = (ts: string) => {
    try {
      const d = new Date(ts);
      return isNaN(d.getTime()) ? '' : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      onDoubleClick={(e) => e.stopPropagation()}
      className="fixed inset-y-0 right-0 z-50 w-96 glass-panel border-l border-slate-700/80 shadow-2xl p-5 flex flex-col animate-fade-in"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-indigo-400" />
          <h3 className="font-bold text-white text-base">Activity Log History</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadLogs}
            disabled={isLoading}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            title="Refresh Logs"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Logs List */}
      <div className="mt-4 flex-1 overflow-y-auto space-y-3 pr-1">
        {logs.length === 0 ? (
          <div className="text-center py-10 text-slate-500 text-xs">
            No activity logged yet for this graph.
          </div>
        ) : (
          logs.map((log) => (
            <div
              key={log._id}
              className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">
                  {log.actionType}
                </span>
                <span
                  suppressHydrationWarning
                  className="text-[10px] text-slate-500 flex items-center gap-1"
                >
                  <Clock className="w-3 h-3" />
                  {formatTimestamp(log.timestamp)}
                </span>
              </div>
              <p className="text-xs text-slate-200 leading-snug">{log.details}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
