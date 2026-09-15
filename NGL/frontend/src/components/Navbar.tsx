import React from 'react';
import { Layers, Plus, User, LogOut, FileText } from 'lucide-react';
import { IGraph, IUser } from '../types/graph';

interface NavbarProps {
  currentUser?: IUser | null;
  graphs: IGraph[];
  activeGraphId: string | null;
  graphTitle: string;
  onSelectGraph: (id: string) => void;
  onNewGraph: () => void;
  onUpdateTitle: (title: string) => void;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  graphs,
  activeGraphId,
  graphTitle,
  onSelectGraph,
  onNewGraph,
  onUpdateTitle,
  onOpenAuth,
  onLogout,
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 px-6 py-3 flex items-center justify-between border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md">
      {/* Brand Logo & Graph Selector */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-600/30 text-white">
            <Layers className="w-5 h-5" />
          </div>
          <span className="font-bold text-white text-base tracking-tight hidden sm:inline">
            NodeGraph.io
          </span>
        </div>

        {/* Graph Title Input */}
        <div className="flex items-center gap-2 pl-4 border-l border-slate-800">
          <input
            type="text"
            value={graphTitle}
            onChange={(e) => onUpdateTitle(e.target.value)}
            placeholder="Graph Title..."
            className="bg-transparent text-white font-semibold text-sm px-2 py-1 rounded-lg hover:bg-slate-900 focus:bg-slate-900 border border-transparent focus:border-slate-700 focus:outline-none transition w-44 sm:w-60"
          />
        </div>

        {/* Saved Graphs Dropdown */}
        {graphs.length > 0 && (
          <select
            value={activeGraphId || ''}
            onChange={(e) => onSelectGraph(e.target.value)}
            className="bg-slate-900 text-slate-300 text-xs px-3 py-1.5 rounded-xl border border-slate-800 focus:border-indigo-500 focus:outline-none cursor-pointer"
          >
            <option value="" disabled>
              Select Graph...
            </option>
            {graphs.map((g) => (
              <option key={g._id} value={g._id}>
                {g.title}
              </option>
            ))}
          </select>
        )}

        <button
          onClick={onNewGraph}
          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium transition flex items-center gap-1 border border-slate-700"
          title="Create New Graph"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden md:inline">New Graph</span>
        </button>
      </div>

      {/* User Auth Info */}
      <div className="flex items-center gap-3">
        {currentUser ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1 bg-slate-900 rounded-full border border-slate-800">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-medium text-slate-200">{currentUser.username}</span>
            </div>
            <button
              onClick={onLogout}
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-900 rounded-xl transition"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-xl transition flex items-center gap-1.5 shadow-md shadow-indigo-600/30"
          >
            <User className="w-4 h-4" />
            <span>Sign In / Register</span>
          </button>
        )}
      </div>
    </header>
  );
};
