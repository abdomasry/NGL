'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, Layers } from 'lucide-react';
import { INode, IConnection, IViewport, IGraph, IUser } from '../types/graph';
import { NodeCanvas } from '../components/NodeCanvas';
import { Navbar } from '../components/Navbar';
import { Toolbar } from '../components/Toolbar';
import { LogDrawer } from '../components/LogDrawer';
import { AuthModal } from '../components/AuthModal';
import { api } from '../lib/api';

const INITIAL_NODES: INode[] = [
  {
    id: 'node-1',
    x: 100,
    y: 160,
    title: 'TanStack Query',
    color: '#6366f1',
    labels: [
      {
        id: 'lbl-1',
        text: 'Server-State Management',
        detail: 'Handles caching, revalidation, and API state orchestration.',
      },
      {
        id: 'lbl-2',
        text: 'Use Cases',
        detail: 'Client-side API data fetching, mutations, background updates.',
      },
    ],
    inputs: ['in-1'],
    outputs: ['out-1'],
  },
  {
    id: 'node-2',
    x: 480,
    y: 120,
    title: 'Express Backend API',
    color: '#10b981',
    labels: [
      {
        id: 'lbl-3',
        text: 'REST Services',
        detail: 'TypeScript routes for authentication, graphs, and export endpoints.',
      },
      {
        id: 'lbl-4',
        text: 'Cloud Integration',
        detail: 'Cloudinary image uploads and PDFKit server-side exports.',
      },
    ],
    inputs: ['in-1'],
    outputs: ['out-1'],
  },
  {
    id: 'node-3',
    x: 840,
    y: 220,
    title: 'MongoDB Database',
    color: '#f59e0b',
    labels: [
      {
        id: 'lbl-5',
        text: 'Persistence Layer',
        detail: 'Stores users, graph topologies, node labels, and audit logs.',
      },
    ],
    inputs: ['in-1'],
    outputs: ['out-1'],
  },
];

const INITIAL_CONNECTIONS: IConnection[] = [
  {
    id: 'conn-1',
    fromNodeId: 'node-1',
    fromPort: 'right',
    toNodeId: 'node-2',
    toPort: 'left',
    color: '#6366f1',
    style: 'curved',
    label: 'HTTP Fetch',
  },
  {
    id: 'conn-2',
    fromNodeId: 'node-2',
    fromPort: 'right',
    toNodeId: 'node-3',
    toPort: 'left',
    color: '#10b981',
    style: 'dashed',
    label: 'Mongoose Query',
  },
];

export default function Home() {
  const [isMounted, setIsMounted] = useState(false);
  const [currentUser, setCurrentUser] = useState<IUser | null>(null);
  const [graphs, setGraphs] = useState<IGraph[]>([]);
  const [activeGraphId, setActiveGraphId] = useState<string | null>(null);
  const [graphTitle, setGraphTitle] = useState('My Node Architecture');

  // Canvas State
  const [nodes, setNodes] = useState<INode[]>(INITIAL_NODES);
  const [connections, setConnections] = useState<IConnection[]>(INITIAL_CONNECTIONS);
  const [viewport, setViewport] = useState<IViewport>({ zoom: 1, panX: 0, panY: 0 });

  // UI Drawer / Modal / Toast states
  const [isLogsOpen, setIsLogsOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Mount effect
  useEffect(() => {
    setIsMounted(true);
    api
      .getMe()
      .then((data) => {
        setCurrentUser(data.user);
      })
      .catch(() => {
        setCurrentUser(null);
        // Restore guest graph if present
        if (typeof window !== 'undefined') {
          const localData = localStorage.getItem('nodegraph_guest_graph');
          if (localData) {
            try {
              const parsed = JSON.parse(localData);
              if (parsed.graphTitle) setGraphTitle(parsed.graphTitle);
              if (parsed.nodes) setNodes(parsed.nodes);
              if (parsed.connections) setConnections(parsed.connections);
              if (parsed.viewport) setViewport(parsed.viewport);
            } catch (e) {
              console.error('Failed to parse local guest graph', e);
            }
          }
        }
      });
  }, []);

  // Fetch user graphs when authenticated
  useEffect(() => {
    if (currentUser) {
      api.fetchGraphs().then((list) => {
        setGraphs(list);
        if (list.length > 0 && !activeGraphId) {
          loadGraph(list[0]);
        }
      });
    }
  }, [currentUser]);

  const loadGraph = (graph: IGraph) => {
    if (graph._id) setActiveGraphId(graph._id);
    setGraphTitle(graph.title || 'Untitled Graph');
    setNodes(graph.nodes || []);
    setConnections(graph.connections || []);
    if (graph.viewport) setViewport(graph.viewport);
  };

  const handleSaveGraph = async () => {
    setIsSaving(true);

    // Save to local browser storage first for offline / guest redundancy
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        'nodegraph_guest_graph',
        JSON.stringify({ graphTitle, nodes, connections, viewport })
      );
    }

    if (!currentUser) {
      setIsSaving(false);
      showToast('Saved locally in browser! Sign in to sync with Cloud MongoDB.', 'info');
      setIsAuthOpen(true);
      return;
    }

    try {
      if (activeGraphId) {
        await api.saveGraph(activeGraphId, {
          title: graphTitle,
          nodes,
          connections,
          viewport,
        });
        showToast('Graph saved successfully to Cloud!', 'success');
      } else {
        const newGraph = await api.createGraph(graphTitle, {
          nodes,
          connections,
          viewport,
        });
        if (newGraph && newGraph._id) {
          setActiveGraphId(newGraph._id);
          setGraphs((prev) => [newGraph, ...prev]);
        }
        showToast('New Graph created and saved to Cloud!', 'success');
      }
    } catch (err: any) {
      console.error('Save error:', err);
      showToast(err.message || 'Failed to save to cloud database', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogAction = (actionType: string, details: string) => {
    if (activeGraphId) {
      api.addLog(activeGraphId, actionType, details);
    }
  };

  const handleExportGraph = async (format: 'md' | 'txt' | 'json' | 'pdf') => {
    try {
      await api.downloadServerExport(graphTitle, nodes, connections, format);
      handleLogAction('GRAPH_EXPORTED', `Exported graph as .${format} document`);
      showToast(`Exported graph as .${format} successfully!`, 'success');
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Export failed', 'error');
    }
  };

  const handleAuthSuccess = async (user: IUser, token?: string) => {
    if (token && typeof window !== 'undefined') {
      localStorage.setItem('nodegraph_token', token);
    }
    setCurrentUser(user);
    setIsAuthOpen(false);
    showToast(`Welcome, ${user.username}! Syncing graph to Cloud...`, 'success');

    // Automatically sync current canvas to the user's cloud account
    try {
      const newGraph = await api.createGraph(graphTitle, {
        nodes,
        connections,
        viewport,
      });
      if (newGraph && newGraph._id) {
        setActiveGraphId(newGraph._id);
        const updatedList = await api.fetchGraphs();
        setGraphs(updatedList);
      }
      showToast('Graph synchronized and saved to your account!', 'success');
    } catch (err) {
      console.error('Sync after login error:', err);
    }
  };

  if (!isMounted) {
    return (
      <div className="w-screen h-screen bg-[#090d16] flex items-center justify-center">
        <div className="flex items-center gap-3 text-indigo-400">
          <Layers className="w-6 h-6 animate-pulse" />
          <span className="text-sm font-semibold tracking-wider text-slate-300">Loading NodeGraph.io...</span>
        </div>
      </div>
    );
  }

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#090d16] select-none font-sans">
      {/* Toast Notification Banner */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-fade-in flex items-center gap-2.5 px-4 py-3 rounded-2xl glass-panel border border-slate-700/80 shadow-2xl">
          {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
          {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />}
          {toast.type === 'info' && <Info className="w-5 h-5 text-indigo-400 shrink-0" />}
          <span className="text-xs font-semibold text-slate-100">{toast.message}</span>
        </div>
      )}

      {/* Navbar Header */}
      <Navbar
        currentUser={currentUser}
        graphs={graphs}
        activeGraphId={activeGraphId}
        graphTitle={graphTitle}
        onSelectGraph={(id) => {
          const target = graphs.find((g) => g._id === id);
          if (target) loadGraph(target);
        }}
        onNewGraph={async () => {
          if (!currentUser) {
            setIsAuthOpen(true);
            return;
          }
          try {
            const newG = await api.createGraph(`Untitled Graph ${graphs.length + 1}`);
            setGraphs([...graphs, newG]);
            loadGraph(newG);
            showToast('New graph created!', 'success');
          } catch (err: any) {
            showToast(err.message || 'Failed to create graph', 'error');
          }
        }}
        onUpdateTitle={(title) => setGraphTitle(title)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={() => {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('nodegraph_token');
          }
          setCurrentUser(null);
          setGraphs([]);
          setActiveGraphId(null);
          showToast('Logged out successfully', 'info');
        }}
      />

      {/* Floating Toolbar with Zoom & Server Export Controls */}
      <Toolbar
        viewport={viewport}
        nodeCount={nodes.length}
        connectionCount={connections.length}
        graphTitle={graphTitle}
        isSaving={isSaving}
        onZoomIn={() =>
          setViewport((prev) => ({ ...prev, zoom: Math.min(prev.zoom * 1.2, 3.0) }))
        }
        onZoomOut={() =>
          setViewport((prev) => ({ ...prev, zoom: Math.max(prev.zoom * 0.8, 0.2) }))
        }
        onResetView={() => setViewport({ zoom: 1, panX: 0, panY: 0 })}
        onSaveGraph={handleSaveGraph}
        onToggleLogs={() => setIsLogsOpen(!isLogsOpen)}
        onExport={handleExportGraph}
      />

      {/* Main Node Canvas Layer */}
      <NodeCanvas
        nodes={nodes}
        connections={connections}
        viewport={viewport}
        onUpdateNodes={setNodes}
        onUpdateConnections={setConnections}
        onUpdateViewport={setViewport}
        onLogAction={handleLogAction}
      />

      {/* Activity Log Drawer */}
      <LogDrawer
        isOpen={isLogsOpen}
        graphId={activeGraphId}
        onClose={() => setIsLogsOpen(false)}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </main>
  );
}
