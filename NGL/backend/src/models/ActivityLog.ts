import { Schema, model, Document, Types } from 'mongoose';

export interface IActivityLog extends Document {
  graphId: Types.ObjectId | string;
  userId?: Types.ObjectId | string;
  actionType: string;
  details: string;
  timestamp: Date;
}

const ActivityLogSchema = new Schema<IActivityLog>(
  {
    graphId: { type: Schema.Types.ObjectId, ref: 'Graph', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    actionType: { type: String, required: true },
    details: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const ActivityLog = model<IActivityLog>('ActivityLog', ActivityLogSchema);
