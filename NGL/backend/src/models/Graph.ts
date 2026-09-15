import { Schema, model, Document, Types } from 'mongoose';

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
  color?: string;
  imageUrl?: string;
  labels: INodeLabel[];
  inputs: string[];
  outputs: string[];
}

export interface IConnection {
  id: string;
  fromNodeId: string;
  fromPort: string;
  toNodeId: string;
  toPort: string;
  color?: string;
  style?: 'curved' | 'straight' | 'dashed' | 'dotted' | 'step';
  label?: string;
}

export interface IViewport {
  zoom: number;
  panX: number;
  panY: number;
}

export interface IGraph extends Document {
  title: string;
  description?: string;
  userId: Types.ObjectId | string;
  nodes: INode[];
  connections: IConnection[];
  viewport: IViewport;
  createdAt: Date;
  updatedAt: Date;
}

const NodeLabelSchema = new Schema<INodeLabel>({
  id: { type: String, required: true },
  text: { type: String, required: true },
  detail: { type: String, default: '' },
}, { _id: false });

const NodeSchema = new Schema<INode>({
  id: { type: String, required: true },
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  title: { type: String, required: true, default: 'New Node' },
  color: { type: String, default: '#6366f1' },
  imageUrl: { type: String, default: '' },
  labels: [NodeLabelSchema],
  inputs: [{ type: String }],
  outputs: [{ type: String }],
}, { _id: false });

const ConnectionSchema = new Schema<IConnection>({
  id: { type: String, required: true },
  fromNodeId: { type: String, required: true },
  fromPort: { type: String, required: true },
  toNodeId: { type: String, required: true },
  toPort: { type: String, required: true },
  color: { type: String, default: '#6366f1' },
  style: { type: String, default: 'curved' },
  label: { type: String, default: '' },
}, { _id: false });

const ViewportSchema = new Schema<IViewport>({
  zoom: { type: Number, default: 1 },
  panX: { type: Number, default: 0 },
  panY: { type: Number, default: 0 },
}, { _id: false });

const GraphSchema = new Schema<IGraph>(
  {
    title: { type: String, required: true, trim: true, default: 'Untitled Graph' },
    description: { type: String, trim: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    nodes: [NodeSchema],
    connections: [ConnectionSchema],
    viewport: { type: ViewportSchema, default: () => ({ zoom: 1, panX: 0, panY: 0 }) },
  },
  { timestamps: true }
);

export const Graph = model<IGraph>('Graph', GraphSchema);
