import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';

import { connectDB } from './src/server/config/db.js';

import authRoutes from './src/server/routes/authRoutes.js';
import nodeRoutes from './src/server/routes/nodeRoutes.js';
import pageRoutes from './src/server/routes/pageRoutes.js';
import userRoutes from './src/server/routes/userRoutes.js';

import { searchNotes } from './src/server/controllers/searchController.js';
import { requireAuth } from './src/server/middleware/authMiddleware.js';

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// MongoDB connection
connectDB();

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/nodes', nodeRoutes);
app.use('/api/pages', pageRoutes);
app.use('/api/user', userRoutes);

app.get('/api/search', requireAuth, searchNotes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

export default app;
