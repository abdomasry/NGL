export interface INodeLabel {
  id: string;
  text: string;
  detail?: string;
}

export interface INode {
  id: string;
  x: number;
  y: number;
  title: string;
  color: string;
  imageUrl?: string;
  labels: INodeLabel[];
  inputs: string[];
  outputs: string[];
}

export type ConnectionStyle = 'curved' | 'straight' | 'dashed' | 'dotted' | 'step';

export interface IConnection {
  id: string;
  fromNodeId: string;
  fromPort: string;
  toNodeId: string;
  toPort: string;
  color?: string;
  style?: ConnectionStyle;
  label?: string;
}

export interface IViewport {
  zoom: number;
  panX: number;
  panY: number;
}

export interface IGraph {
  _id?: string;
  id?: string;
  title: string;
  description?: string;
  nodes: INode[];
  connections: IConnection[];
  viewport: IViewport;
  createdAt?: string;
  updatedAt?: string;
}

export interface IUser {
  id: string;
  username: string;
  email: string;
}

export interface IActivityLog {
  _id: string;
  graphId: string;
  actionType: string;
  details: string;
  timestamp: string;
}

export interface IDragWire {
  fromNodeId: string;
  fromPort: string;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}
