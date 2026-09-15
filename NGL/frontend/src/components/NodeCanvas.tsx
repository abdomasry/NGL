import React, { useState, useRef, useEffect, useCallback } from 'react';
import { INode, IConnection, IViewport, IDragWire } from '../types/graph';
import { NodeCard } from './NodeCard';
import { NodeInspector } from './NodeInspector';
import { ConnectionInspector } from './ConnectionInspector';
import { ConnectionLines } from './ConnectionLines';
import { InteractiveGrid } from './InteractiveGrid';
import { ConfirmModal } from './ConfirmModal';

interface NodeCanvasProps {
  nodes: INode[];
  connections: IConnection[];
  viewport: IViewport;
  onUpdateNodes: (nodes: INode[]) => void;
  onUpdateConnections: (connections: IConnection[]) => void;
  onUpdateViewport: (viewport: IViewport) => void;
  onLogAction: (actionType: string, details: string) => void;
}

const DEFAULT_COLORS = [
  '#6366f1', // Indigo
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#f43f5e', // Rose
  '#06b6d4', // Cyan
  '#8b5cf6', // Violet
  '#d946ef', // Fuchsia
  '#14b8a6', // Teal
];

export const NodeCanvas: React.FC<NodeCanvasProps> = ({
  nodes,
  connections,
  viewport,
  onUpdateNodes,
  onUpdateConnections,
  onUpdateViewport,
  onLogAction,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Multi-Selection state
  const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);
  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null);

  // Selection Box (Lasso) state
  const [isBoxSelecting, setIsBoxSelecting] = useState(false);
  const [boxStart, setBoxStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [boxCurrent, setBoxCurrent] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Pan state
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Mouse position for interactive background grid
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });

  // Dragging group node state
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const [dragNodeInitialPositions, setDragNodeInitialPositions] = useState<
    Record<string, { x: number; y: number }>
  >({});
  const [dragStartMousePos, setDragStartMousePos] = useState({ x: 0, y: 0 });

  // Wire connection creation state
  const [dragWire, setDragWire] = useState<IDragWire | null>(null);

  // Confirmation Modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    nodeIds: string[];
    affectedConnectionsCount: number;
  }>({
    isOpen: false,
    nodeIds: [],
    affectedConnectionsCount: 0,
  });

  // Selected single node for Inspector (shows first selected node)
  const primarySelectedNode =
    selectedNodeIds.length === 1 ? nodes.find((n) => n.id === selectedNodeIds[0]) || null : null;
  const selectedConnection = connections.find((c) => c.id === selectedConnectionId) || null;

  // Cursor-centered Mouse Wheel Zooming
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
      const newZoom = Math.min(Math.max(0.2, viewport.zoom * zoomFactor), 3.0);

      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const newPanX = mouseX - (mouseX - viewport.panX) * (newZoom / viewport.zoom);
      const newPanY = mouseY - (mouseY - viewport.panY) * (newZoom / viewport.zoom);

      onUpdateViewport({
        zoom: newZoom,
        panX: newPanX,
        panY: newPanY,
      });
    },
    [viewport, onUpdateViewport]
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  // Double-Click empty canvas to create compact node
  const handleCanvasDoubleClick = (e: React.MouseEvent) => {
    if (
      (e.target as HTMLElement).closest('.glass-node') ||
      (e.target as HTMLElement).closest('.glass-panel')
    ) {
      return;
    }

    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const worldX = (mouseX - viewport.panX) / viewport.zoom;
    const worldY = (mouseY - viewport.panY) / viewport.zoom;

    const newNodeId = `node-${Date.now()}`;
    const newNode: INode = {
      id: newNodeId,
      x: Math.round(worldX - 95),
      y: Math.round(worldY - 35),
      title: `Node #${nodes.length + 1}`,
      color: DEFAULT_COLORS[nodes.length % DEFAULT_COLORS.length],
      labels: [
        {
          id: `lbl-${Date.now()}`,
          text: 'Configuration Item',
          detail: 'Type detailed notes, code, or parameters here...',
        },
      ],
      inputs: ['in-1'],
      outputs: ['out-1'],
    };

    onUpdateNodes([...nodes, newNode]);
    setSelectedNodeIds([newNodeId]);
    setSelectedConnectionId(null);
    onLogAction('NODE_CREATED', `Created new compact node "${newNode.title}"`);
  };

  // Node Selection (Single or Multi via Shift/Ctrl)
  const handleNodeSelect = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    setSelectedConnectionId(null);

    if (e.shiftKey || e.ctrlKey || e.metaKey) {
      if (selectedNodeIds.includes(nodeId)) {
        setSelectedNodeIds(selectedNodeIds.filter((id) => id !== nodeId));
      } else {
        setSelectedNodeIds([...selectedNodeIds, nodeId]);
      }
    } else {
      if (!selectedNodeIds.includes(nodeId)) {
        setSelectedNodeIds([nodeId]);
      }
    }
  };

  // Node Group Dragging Start
  const handleNodeMouseDown = (e: React.MouseEvent, nodeId: string) => {
    setDraggedNodeId(nodeId);
    setDragStartMousePos({ x: e.clientX, y: e.clientY });

    const currentSelected = selectedNodeIds.includes(nodeId) ? selectedNodeIds : [nodeId];

    const initialPos: Record<string, { x: number; y: number }> = {};
    nodes.forEach((n) => {
      if (currentSelected.includes(n.id)) {
        initialPos[n.id] = { x: n.x, y: n.y };
      }
    });
    setDragNodeInitialPositions(initialPos);
  };

  // Port Connection Drag Start
  const handlePortDragStart = (e: React.MouseEvent, nodeId: string, portId: string, isOutput: boolean) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left - viewport.panX) / viewport.zoom;
    const mouseY = (e.clientY - rect.top - viewport.panY) / viewport.zoom;

    setDragWire({
      fromNodeId: nodeId,
      fromPort: portId,
      startX: mouseX,
      startY: mouseY,
      currentX: mouseX,
      currentY: mouseY,
    });
  };

  // Port Drop -> Create Wire Connection
  const handlePortDrop = (targetNodeId: string, targetPortId: string, isOutput: boolean) => {
    if (!dragWire) return;

    if (dragWire.fromNodeId === targetNodeId) {
      setDragWire(null);
      return;
    }

    const exists = connections.some(
      (c) => c.fromNodeId === dragWire.fromNodeId && c.toNodeId === targetNodeId
    );

    if (!exists) {
      const newConn: IConnection = {
        id: `conn-${Date.now()}`,
        fromNodeId: dragWire.fromNodeId,
        fromPort: dragWire.fromPort,
        toNodeId: targetNodeId,
        toPort: targetPortId,
        color: '#6366f1',
        style: 'curved',
      };

      onUpdateConnections([...connections, newConn]);

      const sourceNode = nodes.find((n) => n.id === dragWire.fromNodeId);
      const targetNode = nodes.find((n) => n.id === targetNodeId);
      onLogAction(
        'CONNECTION_CREATED',
        `Connected "${sourceNode?.title || dragWire.fromNodeId}" -> "${targetNode?.title || targetNodeId}"`
      );
    }

    setDragWire(null);
  };

  // Global Mouse Move
  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });

    if (isPanning) {
      onUpdateViewport({
        ...viewport,
        panX: viewport.panX + (e.clientX - panStart.x),
        panY: viewport.panY + (e.clientY - panStart.y),
      });
      setPanStart({ x: e.clientX, y: e.clientY });
      return;
    }

    if (isBoxSelecting && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const worldX = (e.clientX - rect.left - viewport.panX) / viewport.zoom;
      const worldY = (e.clientY - rect.top - viewport.panY) / viewport.zoom;

      setBoxCurrent({ x: worldX, y: worldY });

      const minX = Math.min(boxStart.x, worldX);
      const maxX = Math.max(boxStart.x, worldX);
      const minY = Math.min(boxStart.y, worldY);
      const maxY = Math.max(boxStart.y, worldY);

      const selectedIds = nodes
        .filter((n) => {
          const nodeWidth = 190;
          const nodeHeight = 36 + 16 + Math.max(n.labels.length, 1) * 28;
          return (
            n.x < maxX &&
            n.x + nodeWidth > minX &&
            n.y < maxY &&
            n.y + nodeHeight > minY
          );
        })
        .map((n) => n.id);

      setSelectedNodeIds(selectedIds);
      return;
    }

    if (draggedNodeId) {
      const deltaX = (e.clientX - dragStartMousePos.x) / viewport.zoom;
      const deltaY = (e.clientY - dragStartMousePos.y) / viewport.zoom;

      const updated = nodes.map((n) => {
        if (dragNodeInitialPositions[n.id]) {
          return {
            ...n,
            x: Math.round(dragNodeInitialPositions[n.id].x + deltaX),
            y: Math.round(dragNodeInitialPositions[n.id].y + deltaY),
          };
        }
        return n;
      });
      onUpdateNodes(updated);
      return;
    }

    if (dragWire && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const mouseX = (e.clientX - rect.left - viewport.panX) / viewport.zoom;
      const mouseY = (e.clientY - rect.top - viewport.panY) / viewport.zoom;

      setDragWire({
        ...dragWire,
        currentX: mouseX,
        currentY: mouseY,
      });
    }
  };

  // Canvas Mouse Down -> Pan or Box Select
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (
      e.button === 0 &&
      !(e.target as HTMLElement).closest('.glass-node') &&
      !(e.target as HTMLElement).closest('.glass-panel')
    ) {
      if (e.shiftKey || e.altKey) {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const worldX = (e.clientX - rect.left - viewport.panX) / viewport.zoom;
        const worldY = (e.clientY - rect.top - viewport.panY) / viewport.zoom;

        setIsBoxSelecting(true);
        setBoxStart({ x: worldX, y: worldY });
        setBoxCurrent({ x: worldX, y: worldY });
        if (!e.shiftKey) setSelectedNodeIds([]);
      } else {
        setIsPanning(true);
        setPanStart({ x: e.clientX, y: e.clientY });
        if (!e.shiftKey && !e.ctrlKey) {
          setSelectedNodeIds([]);
          setSelectedConnectionId(null);
        }
      }
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setIsBoxSelecting(false);
    setDraggedNodeId(null);
    setDragWire(null);
  };

  // Request Multi-Node Deletion Confirmation
  const requestDeleteSelectedNodes = () => {
    if (selectedNodeIds.length === 0) return;

    const affectedConns = connections.filter(
      (c) => selectedNodeIds.includes(c.fromNodeId) || selectedNodeIds.includes(c.toNodeId)
    );

    setConfirmModal({
      isOpen: true,
      nodeIds: selectedNodeIds,
      affectedConnectionsCount: affectedConns.length,
    });
  };

  // Confirm Multi-Node Deletion
  const executeDeleteNodes = () => {
    const idsToDelete = confirmModal.nodeIds;
    if (idsToDelete.length === 0) return;

    const remainingNodes = nodes.filter((n) => !idsToDelete.includes(n.id));
    const remainingConns = connections.filter(
      (c) => !idsToDelete.includes(c.fromNodeId) && !idsToDelete.includes(c.toNodeId)
    );

    onUpdateNodes(remainingNodes);
    onUpdateConnections(remainingConns);

    setSelectedNodeIds([]);
    onLogAction(
      'NODES_DELETED',
      `Deleted ${idsToDelete.length} selected node${idsToDelete.length > 1 ? 's' : ''}`
    );
    setConfirmModal({ isOpen: false, nodeIds: [], affectedConnectionsCount: 0 });
  };

  // Delete Hotkey Handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedNodeIds.length > 0) {
        if (
          document.activeElement?.tagName === 'INPUT' ||
          document.activeElement?.tagName === 'TEXTAREA'
        ) {
          return;
        }
        e.preventDefault();
        requestDeleteSelectedNodes();
      } else if (e.key === 'Delete' && selectedConnectionId) {
        const remainingConns = connections.filter((c) => c.id !== selectedConnectionId);
        onUpdateConnections(remainingConns);
        setSelectedConnectionId(null);
        onLogAction('CONNECTION_DELETED', 'Deleted connection wire');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNodeIds, selectedConnectionId, nodes, connections]);

  return (
    <div
      ref={containerRef}
      onMouseDown={handleCanvasMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onDoubleClick={handleCanvasDoubleClick}
      className="relative w-screen h-screen overflow-hidden bg-[#090d16] cursor-grab active:cursor-grabbing"
    >
      {/* Mouse Interactive Canvas Dot Background */}
      <InteractiveGrid viewport={viewport} mousePos={mousePos} />

      {/* Transform Container Layer */}
      <div
        style={{
          transform: `translate(${viewport.panX}px, ${viewport.panY}px) scale(${viewport.zoom})`,
          transformOrigin: '0 0',
        }}
        className="absolute inset-0 w-full h-full pointer-events-none"
      >
        {/* SVG Connection Layer */}
        <ConnectionLines
          nodes={nodes}
          connections={connections}
          selectedConnectionId={selectedConnectionId}
          dragWire={dragWire}
          onSelectConnection={(id) => {
            setSelectedConnectionId(id);
            setSelectedNodeIds([]);
          }}
        />

        {/* Selection Box (Lasso) Overlay */}
        {isBoxSelecting && (
          <div
            style={{
              left: `${Math.min(boxStart.x, boxCurrent.x)}px`,
              top: `${Math.min(boxStart.y, boxCurrent.y)}px`,
              width: `${Math.abs(boxCurrent.x - boxStart.x)}px`,
              height: `${Math.abs(boxCurrent.y - boxStart.y)}px`,
            }}
            className="absolute bg-indigo-500/20 border-2 border-indigo-400 rounded-lg pointer-events-none z-30 shadow-lg shadow-indigo-500/30"
          />
        )}

        {/* DOM Compact Node Cards Layer */}
        {nodes.map((node) => (
          <div key={node.id} className="pointer-events-auto">
            <NodeCard
              node={node}
              isSelected={selectedNodeIds.includes(node.id)}
              onSelect={(e) => handleNodeSelect(e, node.id)}
              onPortDragStart={handlePortDragStart}
              onPortDrop={handlePortDrop}
              onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
            />
          </div>
        ))}
      </div>

      {/* Selected Node Inspector Pop-up */}
      {primarySelectedNode && (
        <NodeInspector
          node={primarySelectedNode}
          onClose={() => setSelectedNodeIds([])}
          onUpdateTitle={(id, title) => {
            onUpdateNodes(nodes.map((n) => (n.id === id ? { ...n, title } : n)));
            onLogAction('TITLE_EDITED', `Updated title for node "${title}"`);
          }}
          onUpdateColor={(id, color) => {
            onUpdateNodes(nodes.map((n) => (n.id === id ? { ...n, color } : n)));
          }}
          onUpdateImage={(id, imageUrl) => {
            onUpdateNodes(nodes.map((n) => (n.id === id ? { ...n, imageUrl } : n)));
            onLogAction('IMAGE_UPLOADED', `Uploaded image to node "${primarySelectedNode.title}"`);
          }}
          onAddLabel={(id, text, detail) => {
            onUpdateNodes(
              nodes.map((n) =>
                n.id === id
                  ? { ...n, labels: [...n.labels, { id: `lbl-${Date.now()}`, text, detail }] }
                  : n
              )
            );
            onLogAction('LABEL_ADDED', `Added label "${text}"`);
          }}
          onUpdateLabel={(id, labelId, text, detail) => {
            onUpdateNodes(
              nodes.map((n) =>
                n.id === id
                  ? {
                      ...n,
                      labels: n.labels.map((l) => (l.id === labelId ? { ...l, text, detail } : l)),
                    }
                  : n
              )
            );
          }}
          onReorderLabels={(id, newLabels) => {
            onUpdateNodes(nodes.map((n) => (n.id === id ? { ...n, labels: newLabels } : n)));
            onLogAction('LABEL_REORDERED', 'Reordered label items inside node');
          }}
          onDeleteLabel={(id, labelId) => {
            onUpdateNodes(
              nodes.map((n) =>
                n.id === id
                  ? { ...n, labels: n.labels.filter((l) => l.id !== labelId) }
                  : n
              )
            );
          }}
          onDeleteNode={(id) => requestDeleteSelectedNodes()}
        />
      )}

      {/* Selected Connection Wire Inspector Pop-up */}
      {selectedConnection && (
        <ConnectionInspector
          connection={selectedConnection}
          nodes={nodes}
          onClose={() => setSelectedConnectionId(null)}
          onUpdateConnection={(connId, updates) => {
            onUpdateConnections(
              connections.map((c) => (c.id === connId ? { ...c, ...updates } : c))
            );
            onLogAction('CONNECTION_UPDATED', 'Updated connection line properties');
          }}
          onDeleteConnection={(connId) => {
            onUpdateConnections(connections.filter((c) => c.id !== connId));
            setSelectedConnectionId(null);
            onLogAction('CONNECTION_DELETED', 'Deleted connection wire link');
          }}
        />
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={
          confirmModal.nodeIds.length > 1
            ? `Delete ${confirmModal.nodeIds.length} Selected Nodes?`
            : `Delete Selected Node?`
        }
        message={`Are you sure you want to delete ${
          confirmModal.nodeIds.length > 1
            ? `${confirmModal.nodeIds.length} selected nodes`
            : 'this node'
        } from the canvas?`}
        affectedNodesCount={confirmModal.nodeIds.length}
        affectedConnectionsCount={confirmModal.affectedConnectionsCount}
        onConfirm={executeDeleteNodes}
        onCancel={() =>
          setConfirmModal({ isOpen: false, nodeIds: [], affectedConnectionsCount: 0 })
        }
      />
    </div>
  );
};
