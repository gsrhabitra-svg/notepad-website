import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './src/server/config/db.js';
import authRoutes from './src/server/routes/authRoutes.js';
import nodeRoutes from './src/server/routes/nodeRoutes.js';
import pageRoutes from './src/server/routes/pageRoutes.js';
import userRoutes from './src/server/routes/userRoutes.js';
import { searchNotes } from './src/server/controllers/searchController.js';
import { requireAuth } from './src/server/middleware/authMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Basic middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Dedicated MongoDB Atlas Connection
connectDB().catch((err) => {
  console.error('[Server] Initial MongoDB connection check completed with error:', err);
});

// REST API routes
app.use('/api/auth', authRoutes);
app.use('/api/nodes', nodeRoutes);
app.use('/api/pages', pageRoutes);
app.use('/api/user', userRoutes);
app.get('/api/search', requireAuth, searchNotes);

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (!isProduction) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: PORT,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('[Server] Vite middleware mounted in development mode.');
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
    console.log('[Server] Serving production build from dist/.');
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] Folio digital notebook server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[Server] Fatal startup failure:', err);
  process.exit(1);
});
