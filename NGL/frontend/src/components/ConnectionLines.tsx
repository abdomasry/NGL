import React from 'react';
import { IConnection, INode, IDragWire, ConnectionStyle } from '../types/graph';

interface ConnectionLinesProps {
  nodes: INode[];
  connections: IConnection[];
  selectedConnectionId: string | null;
  dragWire: IDragWire | null;
  onSelectConnection: (id: string) => void;
}

export const ConnectionLines: React.FC<ConnectionLinesProps> = ({
  nodes,
  connections,
  selectedConnectionId,
  dragWire,
  onSelectConnection,
}) => {
  const getNodePortPos = (nodeId: string, portId: string) => {
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return { x: 0, y: 0, dir: 'right' };

    const nodeWidth = 190;
    const headerHeight = 36;
    const labelHeight = 28;
    const padding = 16;
    const totalHeight = headerHeight + padding + Math.max(node.labels.length, 1) * labelHeight;

    switch (portId) {
      case 'top':
        return { x: node.x + nodeWidth / 2, y: node.y, dir: 'top' };
      case 'bottom':
        return { x: node.x + nodeWidth / 2, y: node.y + totalHeight, dir: 'bottom' };
      case 'left':
      case 'in-1':
        return { x: node.x, y: node.y + totalHeight / 2, dir: 'left' };
      case 'right':
      case 'out-1':
      default:
        return { x: node.x + nodeWidth, y: node.y + totalHeight / 2, dir: 'right' };
    }
  };

  const createPath = (
    x1: number,
    y1: number,
    dir1: string,
    x2: number,
    y2: number,
    dir2: string,
    style: ConnectionStyle = 'curved'
  ) => {
    if (style === 'straight' || style === 'dashed' || style === 'dotted') {
      return `M ${x1} ${y1} L ${x2} ${y2}`;
    }

    if (style === 'step') {
      const midX = (x1 + x2) / 2;
      return `M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}`;
    }

    // Curved (Bezier) default
    let cx1 = x1;
    let cy1 = y1;
    let cx2 = x2;
    let cy2 = y2;
    const offset = Math.max(Math.hypot(x2 - x1, y2 - y1) * 0.35, 40);

    if (dir1 === 'right') cx1 += offset;
    else if (dir1 === 'left') cx1 -= offset;
    else if (dir1 === 'bottom') cy1 += offset;
    else if (dir1 === 'top') cy1 -= offset;

    if (dir2 === 'right') cx2 += offset;
    else if (dir2 === 'left') cx2 -= offset;
    else if (dir2 === 'bottom') cy2 += offset;
    else if (dir2 === 'top') cy2 -= offset;

    return `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`;
  };

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible">
      <defs>
        <marker
          id="arrow-default"
          viewBox="0 0 10 10"
          refX="6"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#6366f1" />
        </marker>
        <marker
          id="arrow-selected"
          viewBox="0 0 10 10"
          refX="6"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#f43f5e" />
        </marker>
        <marker
          id="arrow-drag"
          viewBox="0 0 10 10"
          refX="6"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8" />
        </marker>
      </defs>

      {/* Render established connections */}
      {connections.map((conn) => {
        const start = getNodePortPos(conn.fromNodeId, conn.fromPort);
        const end = getNodePortPos(conn.toNodeId, conn.toPort);
        const isSelected = selectedConnectionId === conn.id;

        const pathData = createPath(
          start.x,
          start.y,
          start.dir,
          end.x,
          end.y,
          end.dir,
          conn.style || 'curved'
        );

        const strokeColor = isSelected ? '#f43f5e' : conn.color || '#6366f1';
        const midX = (start.x + end.x) / 2;
        const midY = (start.y + end.y) / 2;

        const dashArray =
          conn.style === 'dashed'
            ? '10 6'
            : conn.style === 'dotted'
            ? '3 6'
            : undefined;

        return (
          <g key={conn.id} className="pointer-events-auto cursor-pointer">
            {/* Transparent wide hit path for easy click */}
            <path
              d={pathData}
              fill="none"
              stroke="transparent"
              strokeWidth="18"
              onClick={(e) => {
                e.stopPropagation();
                onSelectConnection(conn.id);
              }}
            />

            {/* Visible rendered path */}
            <path
              d={pathData}
              fill="none"
              stroke={strokeColor}
              strokeWidth={isSelected ? '4' : '3'}
              strokeDasharray={dashArray}
              strokeLinecap={conn.style === 'dotted' ? 'round' : 'square'}
              markerEnd={isSelected ? 'url(#arrow-selected)' : 'url(#arrow-default)'}
              className={`connection-wire ${isSelected ? 'selected' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                onSelectConnection(conn.id);
              }}
            />

            {/* Optional Connection Wire Text Label */}
            {conn.label && (
              <g transform={`translate(${midX}, ${midY})`}>
                <rect
                  x="-45"
                  y="-12"
                  width="90"
                  height="24"
                  rx="6"
                  fill="#090d16"
                  stroke={strokeColor}
                  strokeWidth="1.5"
                />
                <text
                  x="0"
                  y="4"
                  textAnchor="middle"
                  fill="#e2e8f0"
                  fontSize="11"
                  fontWeight="bold"
                  className="pointer-events-none font-sans"
                >
                  {conn.label}
                </text>
              </g>
            )}
          </g>
        );
      })}

      {/* Active drag wire preview */}
      {dragWire && (
        <path
          d={createPath(
            dragWire.startX,
            dragWire.startY,
            dragWire.fromPort === 'top'
              ? 'top'
              : dragWire.fromPort === 'bottom'
              ? 'bottom'
              : dragWire.fromPort === 'left'
              ? 'left'
              : 'right',
            dragWire.currentX,
            dragWire.currentY,
            'right',
            'curved'
          )}
          fill="none"
          stroke="#38bdf8"
          strokeWidth="3"
          strokeDasharray="6 4"
          markerEnd="url(#arrow-drag)"
          className="pointer-events-none"
        />
      )}
    </svg>
  );
};
