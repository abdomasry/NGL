import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { connectDB } from './config/db';
import authRoutes from './routes/authRoutes';
import graphRoutes from './routes/graphRoutes';
import logRoutes from './routes/logRoutes';
import uploadRoutes from './routes/uploadRoutes';
import exportRoutes from './routes/exportRoutes';

// Load environment variables from root or backend directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

// Health Check API
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Node Graph Editor API',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/graphs', graphRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/export', exportRoutes);

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ message: 'An internal server error occurred' });
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`🚀 Node Graph Editor Backend running on http://localhost:${PORT}`);
});
