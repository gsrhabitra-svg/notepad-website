import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { StorageProvider } from '../storage/storageProvider.js';

export const getPageByNodeId = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { nodeId } = req.params;

    const node = await StorageProvider.getNodeById(nodeId, userId);
    if (!node) {
      res.status(404).json({
        success: false,
        message: 'Notebook topic not found or unauthorized',
      });
      return;
    }

    const page = await StorageProvider.getPageByNodeId(nodeId, userId);

    res.status(200).json({
      success: true,
      data: page,
    });
  } catch (error: any) {
    console.error('Error fetching page:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch page content',
    });
  }
};

export const updatePage = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { title, content } = req.body;

    const updates: { title?: string; content?: string } = {};
    if (title !== undefined) updates.title = title;
    if (content !== undefined) updates.content = content;

    const updated = await StorageProvider.updatePage(id, userId, updates);
    if (!updated) {
      res.status(404).json({
        success: false,
        message: 'Page not found or unauthorized',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Page saved successfully',
      data: updated,
    });
  } catch (error: any) {
    console.error('Error saving page:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save page content. Please retry.',
    });
  }
};
