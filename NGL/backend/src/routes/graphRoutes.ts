import { Router, Response } from 'express';
import { Graph } from '../models/Graph';
import { ActivityLog } from '../models/ActivityLog';
import { authenticateJWT, AuthRequest } from '../middleware/auth';

const router = Router();

// All graph routes require JWT authentication
router.use(authenticateJWT);

// Get all graphs for current user
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const graphs = await Graph.find({ userId: req.user?.userId })
      .select('title description nodes connections updatedAt createdAt')
      .sort({ updatedAt: -1 });

    res.json({ graphs });
  } catch (error) {
    console.error('Error fetching graphs:', error);
    res.status(500).json({ message: 'Error fetching graphs' });
  }
});

// Create new graph
router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, nodes, connections, viewport } = req.body;

    const newGraph = new Graph({
      title: title || 'Untitled Node Graph',
      description: description || '',
      userId: req.user?.userId,
      nodes: nodes || [
        {
          id: 'node-1',
          x: 150,
          y: 150,
          title: 'Input Source',
          color: 'indigo',
          labels: [{ id: 'lbl-1', text: 'Data Feed Stream' }],
          inputs: ['in-1'],
          outputs: ['out-1'],
        },
        {
          id: 'node-2',
          x: 550,
          y: 200,
          title: 'Data Processor',
          color: 'emerald',
          labels: [{ id: 'lbl-2', text: 'Filter & Transform' }],
          inputs: ['in-1'],
          outputs: ['out-1'],
        },
      ],
      connections: connections || [
        {
          id: 'conn-1',
          fromNodeId: 'node-1',
          fromPort: 'out-1',
          toNodeId: 'node-2',
          toPort: 'in-1',
        },
      ],
      viewport: viewport || { zoom: 1, panX: 0, panY: 0 },
    });

    await newGraph.save();

    // Log creation
    await ActivityLog.create({
      graphId: newGraph._id,
      userId: req.user?.userId,
      actionType: 'GRAPH_CREATED',
      details: `Created new graph "${newGraph.title}"`,
    });

    res.status(201).json({ graph: newGraph });
  } catch (error) {
    console.error('Error creating graph:', error);
    res.status(500).json({ message: 'Error creating graph' });
  }
});

// Get single graph by ID
router.get('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const graph = await Graph.findOne({ _id: req.params.id, userId: req.user?.userId });
    
    if (!graph) {
      res.status(404).json({ message: 'Graph not found' });
      return;
    }

    res.json({ graph });
  } catch (error) {
    console.error('Error fetching graph by ID:', error);
    res.status(500).json({ message: 'Error fetching graph' });
  }
});

// Update/Save graph state
router.put('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, nodes, connections, viewport, logAction } = req.body;

    const graph = await Graph.findOne({ _id: req.params.id, userId: req.user?.userId });

    if (!graph) {
      res.status(404).json({ message: 'Graph not found' });
      return;
    }

    if (title !== undefined) graph.title = title;
    if (description !== undefined) graph.description = description;
    if (nodes !== undefined) graph.nodes = nodes;
    if (connections !== undefined) graph.connections = connections;
    if (viewport !== undefined) graph.viewport = viewport;

    await graph.save();

    // Log action if provided
    if (logAction) {
      await ActivityLog.create({
        graphId: graph._id,
        userId: req.user?.userId,
        actionType: logAction.actionType || 'GRAPH_SAVED',
        details: logAction.details || `Saved graph updates`,
      });
    }

    res.json({ graph });
  } catch (error) {
    console.error('Error saving graph:', error);
    res.status(500).json({ message: 'Error saving graph' });
  }
});

// Delete graph
router.delete('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const graph = await Graph.findOneAndDelete({ _id: req.params.id, userId: req.user?.userId });

    if (!graph) {
      res.status(404).json({ message: 'Graph not found' });
      return;
    }

    // Clean up activity logs
    await ActivityLog.deleteMany({ graphId: req.params.id });

    res.json({ message: 'Graph deleted successfully' });
  } catch (error) {
    console.error('Error deleting graph:', error);
    res.status(500).json({ message: 'Error deleting graph' });
  }
});

export default router;
