import { IGraph, IUser, IActivityLog, INode, IConnection } from '../types/graph';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('nodegraph_token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const api = {
  // Server-side Graph Export (MD, TXT, JSON, PDF)
  async downloadServerExport(title: string, nodes: INode[], connections: IConnection[], format: 'md' | 'txt' | 'json' | 'pdf'): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/export`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, nodes, connections, format }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || 'Server-side export failed');
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;

    const sanitizeFilename = (title || 'graph').toLowerCase().replace(/[^a-z0-9]/g, '_');
    a.download = `${sanitizeFilename}.${format}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  },

  // Image Upload to Cloudinary
  async uploadImage(file: File): Promise<{ url: string; public_id: string }> {
    const formData = new FormData();
    formData.append('image', file);

    const res = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || 'Image upload to Cloudinary failed');
    }

    return res.json();
  },

  // Auth
  async register(username: string, email: string, password: string): Promise<{ user: IUser; token: string }> {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || 'Registration failed');
    }
    return res.json();
  },

  async login(email: string, password: string): Promise<{ user: IUser; token: string }> {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || 'Login failed');
    }
    return res.json();
  },

  async getMe(): Promise<{ user: IUser }> {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      throw new Error('Not authenticated');
    }
    return res.json();
  },

  // Graphs
  async fetchGraphs(): Promise<IGraph[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/graphs`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) return [];
      const data = await res.json().catch(() => ({}));
      return data.graphs || [];
    } catch {
      return [];
    }
  },

  async createGraph(title: string, initialData?: { nodes?: INode[]; connections?: IConnection[]; viewport?: any }): Promise<IGraph> {
    const res = await fetch(`${API_BASE_URL}/graphs`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ title, ...initialData }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || 'Failed to create graph');
    }
    const data = await res.json();
    return data.graph;
  },

  async fetchGraphById(id: string): Promise<IGraph | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/graphs/${id}`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) return null;
      const data = await res.json().catch(() => ({}));
      return data.graph;
    } catch {
      return null;
    }
  },

  async saveGraph(id: string, graphData: Partial<IGraph>, logAction?: { actionType: string; details: string }): Promise<IGraph> {
    const res = await fetch(`${API_BASE_URL}/graphs/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ ...graphData, logAction }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || 'Failed to save graph');
    }
    const data = await res.json();
    return data.graph;
  },

  async deleteGraph(id: string): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/graphs/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || 'Failed to delete graph');
    }
  },

  // Logs
  async fetchLogs(graphId: string): Promise<IActivityLog[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/logs/${graphId}`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) return [];
      const data = await res.json().catch(() => ({}));
      return data.logs || [];
    } catch {
      return [];
    }
  },

  async addLog(graphId: string, actionType: string, details: string): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/logs/${graphId}`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ actionType, details }),
      });
    } catch {
      // Ignore background log errors
    }
  },
};
