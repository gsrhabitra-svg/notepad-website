import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { StorageProvider } from '../storage/storageProvider.js';

export const getNodes = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const nodes = await StorageProvider.getNodesByUserId(userId);
    res.status(200).json({
      success: true,
      data: nodes,
    });
  } catch (error: any) {
    console.error('Error fetching nodes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notebook nodes',
    });
  }
};

export const createNode = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { title, parentId, type, color } = req.body;

    if (!title || !title.trim()) {
      res.status(400).json({
        success: false,
        message: 'Notebook or topic name is required',
      });
      return;
    }

    // If parentId is specified, verify it belongs to this user
    if (parentId) {
      const parentNode = await StorageProvider.getNodeById(parentId, userId);
      if (!parentNode) {
        res.status(404).json({
          success: false,
          message: 'Parent topic or notebook not found',
        });
        return;
      }
    }

    const newNode = await StorageProvider.createNode({
      userId,
      title: title.trim(),
      parentId: parentId || null,
      type: type || (parentId ? 'topic' : 'notebook'),
      color: color || '#212529',
    });

    res.status(201).json({
      success: true,
      message: 'Created successfully',
      data: newNode,
    });
  } catch (error: any) {
    console.error('Error creating node:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create notebook node',
    });
  }
};

export const updateNode = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { title, color } = req.body;

    const existing = await StorageProvider.getNodeById(id, userId);
    if (!existing) {
      res.status(404).json({
        success: false,
        message: 'Node not found or unauthorized',
      });
      return;
    }

    const updates: any = {};
    if (title !== undefined) {
      if (!title.trim()) {
        res.status(400).json({ success: false, message: 'Title cannot be empty' });
        return;
      }
      updates.title = title.trim();
    }
    if (color !== undefined) {
      updates.color = color;
    }

    const updatedNode = await StorageProvider.updateNode(id, userId, updates);

    res.status(200).json({
      success: true,
      message: 'Node updated successfully',
      data: updatedNode,
    });
  } catch (error: any) {
    console.error('Error updating node:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update notebook node',
    });
  }
};

export const deleteNode = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const existing = await StorageProvider.getNodeById(id, userId);
    if (!existing) {
      res.status(404).json({
        success: false,
        message: 'Node not found or unauthorized',
      });
      return;
    }

    const deletedIds = await StorageProvider.deleteNodeCascade(id, userId);

    res.status(200).json({
      success: true,
      message: 'Node and all child topics deleted successfully',
      deletedIds,
    });
  } catch (error: any) {
    console.error('Error deleting node:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete notebook node',
    });
  }
};

export const moveNode = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { newParentId } = req.body;

    const existing = await StorageProvider.getNodeById(id, userId);
    if (!existing) {
      res.status(404).json({
        success: false,
        message: 'Node not found or unauthorized',
      });
      return;
    }

    if (newParentId) {
      const parent = await StorageProvider.getNodeById(newParentId, userId);
      if (!parent) {
        res.status(404).json({
          success: false,
          message: 'Target parent not found',
        });
        return;
      }
    }

    const updated = await StorageProvider.moveNode(id, userId, newParentId || null);

    res.status(200).json({
      success: true,
      message: 'Node moved successfully',
      data: updated,
    });
  } catch (error: any) {
    console.error('Error moving node:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to move node',
    });
  }
};

export const reorderNodes = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { orderedIds } = req.body;

    if (!Array.isArray(orderedIds)) {
      res.status(400).json({
        success: false,
        message: 'orderedIds must be an array of IDs',
      });
      return;
    }

    await StorageProvider.reorderNodes(userId, orderedIds);

    res.status(200).json({
      success: true,
      message: 'Nodes reordered successfully',
    });
  } catch (error: any) {
    console.error('Error reordering nodes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reorder nodes',
    });
  }
};
