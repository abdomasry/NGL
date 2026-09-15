import { Router, Response } from 'express';
import { ActivityLog } from '../models/ActivityLog';
import { authenticateJWT, AuthRequest } from '../middleware/auth';

const router = Router();

router.use(authenticateJWT);

// Get activity logs for a graph
router.get('/:graphId', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const logs = await ActivityLog.find({ graphId: req.params.graphId })
      .sort({ timestamp: -1 })
      .limit(50);

    res.json({ logs });
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ message: 'Error fetching logs' });
  }
});

// Post a log entry manually
router.post('/:graphId', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { actionType, details } = req.body;

    const logEntry = await ActivityLog.create({
      graphId: req.params.graphId,
      userId: req.user?.userId,
      actionType: actionType || 'GENERIC_ACTION',
      details: details || 'User modified node graph',
    });

    res.status(201).json({ log: logEntry });
  } catch (error) {
    console.error('Error creating log:', error);
    res.status(500).json({ message: 'Error creating log' });
  }
});

export default router;
