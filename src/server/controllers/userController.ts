import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { StorageProvider } from '../storage/storageProvider.js';

export const getProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = await StorageProvider.findUserById(req.user!.id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        mobileNumber: user.mobileNumber,
        createdAt: user.createdAt,
      },
    });
  } catch (error: any) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch user profile' });
  }
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { fullName, mobileNumber, currentPassword, newPassword } = req.body;

    const user = await StorageProvider.findUserById(userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const updates: any = {};
    if (fullName && fullName.trim()) updates.fullName = fullName.trim();
    if (mobileNumber && mobileNumber.trim()) updates.mobileNumber = mobileNumber.trim();

    if (newPassword) {
      if (!currentPassword) {
        res.status(400).json({
          success: false,
          message: 'Current password is required to set a new password',
        });
        return;
      }

      const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isMatch) {
        res.status(400).json({
          success: false,
          message: 'Current password is incorrect',
        });
        return;
      }

      if (newPassword.length < 6) {
        res.status(400).json({
          success: false,
          message: 'New password must be at least 6 characters',
        });
        return;
      }

      updates.passwordHash = await bcrypt.hash(newPassword, 10);
    }

    const updatedUser = await StorageProvider.updateUser(userId, updates);

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: updatedUser!._id,
        fullName: updatedUser!.fullName,
        email: updatedUser!.email,
        mobileNumber: updatedUser!.mobileNumber,
        createdAt: updatedUser!.createdAt,
      },
    });
  } catch (error: any) {
    console.error('Error updating profile:', error);
    res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
};

export const deleteAccount = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { password } = req.body;

    if (!password) {
      res.status(400).json({
        success: false,
        message: 'Password confirmation is required to delete account',
      });
      return;
    }

    const user = await StorageProvider.findUserById(userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: 'Incorrect password. Account deletion aborted.',
      });
      return;
    }

    await StorageProvider.deleteUser(userId);

    res.status(200).json({
      success: true,
      message: 'Account and all associated notebook data permanently deleted.',
    });
  } catch (error: any) {
    console.error('Error deleting account:', error);
    res.status(500).json({ success: false, message: 'Failed to delete account' });
  }
};
