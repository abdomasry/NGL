import React, { useState } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Save, History, Download, FileText, FileCode, FileType, File, Loader2, ChevronDown } from 'lucide-react';
import { IViewport } from '../types/graph';

interface ToolbarProps {
  viewport: IViewport;
  nodeCount: number;
  connectionCount: number;
  graphTitle: string;
  isSaving: boolean;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
  onSaveGraph: () => void;
  onToggleLogs: () => void;
  onExport: (format: 'md' | 'txt' | 'json' | 'pdf') => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  viewport,
  nodeCount,
  connectionCount,
  graphTitle,
  isSaving,
  onZoomIn,
  onZoomOut,
  onResetView,
  onSaveGraph,
  onToggleLogs,
  onExport,
}) => {
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleExportClick = async (format: 'md' | 'txt' | 'json' | 'pdf') => {
    setIsExportOpen(false);
    setIsExporting(true);
    try {
      await onExport(format);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3">
      {/* Main Glass Floating Toolbar */}
      <div className="glass-panel px-4 py-2 rounded-2xl border border-slate-700/80 shadow-2xl flex items-center gap-4">
        {/* Graph Title & Stats */}
        <div className="flex items-center gap-3 pr-3 border-r border-slate-800">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-white max-w-[140px] truncate">
              {graphTitle || 'Untitled Graph'}
            </span>
            <span className="text-[10px] text-slate-400">
              {nodeCount} Nodes • {connectionCount} Wires
            </span>
          </div>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={onZoomOut}
            className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition"
            title="Zoom Out (Wheel Down)"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono text-indigo-400 w-12 text-center select-none font-semibold">
            {Math.round(viewport.zoom * 100)}%
          </span>
          <button
            onClick={onZoomIn}
            className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition"
            title="Zoom In (Wheel Up)"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={onResetView}
            className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition ml-1"
            title="Reset Pan & Zoom"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pl-3 border-l border-slate-800">
          {/* Cloud Save Button */}
          <button
            onClick={onSaveGraph}
            disabled={isSaving}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white font-medium text-xs rounded-xl transition flex items-center gap-1.5 shadow-md shadow-indigo-600/30"
            title="Save Graph to Cloud Database"
          >
            {isSaving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            <span>Save</span>
          </button>

          {/* Export Dropdown Menu */}
          <div className="relative">
            <button
              onClick={() => setIsExportOpen(!isExportOpen)}
              disabled={isExporting}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700/90 text-slate-200 font-medium text-xs rounded-xl transition flex items-center gap-1.5 border border-slate-700"
              title="Download Server-Generated Export Files"
            >
              {isExporting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
              ) : (
                <Download className="w-3.5 h-3.5 text-indigo-400" />
              )}
              <span>Export</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isExportOpen && (
              <div
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
                className="absolute top-10 right-0 w-52 glass-panel rounded-xl p-2 border border-slate-700 shadow-2xl space-y-1 z-50 animate-fade-in"
              >
                <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 mb-1">
                  Server Code Format Export
                </div>
                <button
                  onClick={() => handleExportClick('md')}
                  className="w-full px-2.5 py-1.5 text-left text-xs text-slate-200 hover:text-white hover:bg-indigo-600/30 rounded-lg transition flex items-center gap-2"
                >
                  <FileText className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Markdown (.md)</span>
                </button>
                <button
                  onClick={() => handleExportClick('txt')}
                  className="w-full px-2.5 py-1.5 text-left text-xs text-slate-200 hover:text-white hover:bg-indigo-600/30 rounded-lg transition flex items-center gap-2"
                >
                  <FileType className="w-3.5 h-3.5 text-amber-400" />
                  <span>Plain Text (.txt)</span>
                </button>
                <button
                  onClick={() => handleExportClick('json')}
                  className="w-full px-2.5 py-1.5 text-left text-xs text-slate-200 hover:text-white hover:bg-indigo-600/30 rounded-lg transition flex items-center gap-2"
                >
                  <FileCode className="w-3.5 h-3.5 text-emerald-400" />
                  <span>JSON Data (.json)</span>
                </button>
                <button
                  onClick={() => handleExportClick('pdf')}
                  className="w-full px-2.5 py-1.5 text-left text-xs text-slate-200 hover:text-white hover:bg-indigo-600/30 rounded-lg transition flex items-center gap-2"
                >
                  <File className="w-3.5 h-3.5 text-rose-400" />
                  <span>PDF Document (.pdf)</span>
                </button>
              </div>
            )}
          </div>

          {/* Activity Logs Toggle */}
          <button
            onClick={onToggleLogs}
            className="p-1.5 text-slate-300 hover:text-white rounded-xl hover:bg-slate-800 transition"
            title="Activity Logs"
          >
            <History className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
