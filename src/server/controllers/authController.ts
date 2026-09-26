import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { StorageProvider } from '../storage/storageProvider.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';

const JWT_SECRET = process.env.JWT_SECRET;

const getJWTSecret = (): string => {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }

  return JWT_SECRET;
};

export const register = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      fullName,
      mobileNumber,
      email,
      password,
      confirmPassword,
    } = req.body;

    // 1. Validation
    if (!fullName || !fullName.trim()) {
      res.status(400).json({
        success: false,
        message: 'Full name is required',
      });
      return;
    }

    if (!mobileNumber || !mobileNumber.trim()) {
      res.status(400).json({
        success: false,
        message: 'Mobile number is required',
      });
      return;
    }

    if (!email || !email.trim()) {
      res.status(400).json({
        success: false,
        message: 'Email address is required',
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email.trim())) {
      res.status(400).json({
        success: false,
        message: 'Please provide a valid email address',
      });
      return;
    }

    if (!password) {
      res.status(400).json({
        success: false,
        message: 'Password is required',
      });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters in length',
      });
      return;
    }

    if (!confirmPassword) {
      res.status(400).json({
        success: false,
        message: 'Please confirm your password',
      });
      return;
    }

    if (password !== confirmPassword) {
      res.status(400).json({
        success: false,
        message: 'Passwords do not match',
      });
      return;
    }

    // 2. Check existing email
    const existing =
      await StorageProvider.findUserByEmail(email);

    if (existing) {
      res.status(409).json({
        success: false,
        message:
          'An account with this email address already exists',
      });
      return;
    }

    // 3. Hash password
    const passwordHash =
      await bcrypt.hash(password, 10);

    // 4. Create user
    const newUser =
      await StorageProvider.createUser({
        fullName,
        mobileNumber,
        email,
        passwordHash,
      });

    // 5. Generate token
    const token = jwt.sign(
      { userId: newUser._id },
      getJWTSecret(),
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Account registered successfully',
      token,
      user: {
        id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        mobileNumber: newUser.mobileNumber,
        createdAt: newUser.createdAt,
      },
    });
  } catch (error: any) {
    console.error('Registration error:', error);

    res.status(500).json({
      success: false,
      message:
        error.message ||
        'Registration failed. Please try again.',
    });
  }
};

export const login = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (
      !email ||
      !email.trim() ||
      !password
    ) {
      res.status(400).json({
        success: false,
        message:
          'Email and password are required',
      });
      return;
    }

    const user =
      await StorageProvider.findUserByEmail(email);

    if (!user) {
      res.status(401).json({
        success: false,
        message:
          'Invalid credentials. Please check your email and password.',
      });
      return;
    }

    const isMatch =
      await bcrypt.compare(
        password,
        user.passwordHash
      );

    if (!isMatch) {
      res.status(401).json({
        success: false,
        message:
          'Invalid credentials. Please check your email and password.',
      });
      return;
    }

    const token = jwt.sign(
      { userId: user._id },
      getJWTSecret(),
      { expiresIn: '7d' }
    );

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        mobileNumber: user.mobileNumber,
        createdAt: user.createdAt,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);

    res.status(500).json({
      success: false,
      message:
        'An error occurred during login. Please try again.',
    });
  }
};

export const getMe = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Not authenticated',
    });
    return;
  }

  const user =
    await StorageProvider.findUserById(
      req.user.id
    );

  if (!user) {
    res.status(404).json({
      success: false,
      message: 'User not found',
    });
    return;
  }

  res.status(200).json({
    success: true,
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      mobileNumber: user.mobileNumber,
      createdAt: user.createdAt,
    },
  });
};

export const logout = async (
  _req: Request,
  res: Response
): Promise<void> => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};
