import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { StorageProvider } from '../storage/storageProvider.js';

export const searchNotes = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const query = req.query.q as string;

    if (!query || !query.trim()) {
      res.status(200).json({
        success: true,
        data: [],
      });
      return;
    }

    const results = await StorageProvider.searchUserNotes(userId, query);

    res.status(200).json({
      success: true,
      data: results,
    });
  } catch (error: any) {
    console.error('Error executing search:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search notes',
    });
  }
};
