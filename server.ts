import dotenv from 'dotenv';
dotenv.config();

import express, { type NextFunction, type Request, type Response } from 'express';
import cors from 'cors';
import { connectDB } from './src/server/config/db.js';
import authRoutes from './src/server/routes/authRoutes.js';
import nodeRoutes from './src/server/routes/nodeRoutes.js';
import pageRoutes from './src/server/routes/pageRoutes.js';
import userRoutes from './src/server/routes/userRoutes.js';
import { searchNotes } from './src/server/controllers/searchController.js';
import { requireAuth } from './src/server/middleware/authMiddleware.js';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Common middleware.
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Every API request must have a working MongoDB connection in production.
// This prevents Vercel from accidentally using the non-persistent local
// JSON-file fallback when Atlas is unavailable.
app.use('/api', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error('[Database] API request could not connect to MongoDB:', error);

    res.status(503).json({
      success: false,
      message: 'Database connection unavailable. Please try again shortly.',
    });
  }
});

// REST API routes.
app.use('/api/auth', authRoutes);
app.use('/api/nodes', nodeRoutes);
app.use('/api/pages', pageRoutes);
app.use('/api/user', userRoutes);
app.get('/api/search', requireAuth, searchNotes);

// Health check.
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Vercel imports the Express application directly.
// For local development, start a normal Node server with Vite middleware.
if (process.env.VERCEL !== '1') {
  const startLocalServer = async () => {
    const isProduction = process.env.NODE_ENV === 'production';

    if (!isProduction) {
      const { createServer: createViteServer } = await import('vite');

      const vite = await createViteServer({
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
      const path = await import('path');
      const { fileURLToPath } = await import('url');

      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);
      const publicPath = path.resolve(__dirname, 'public');

      app.use(express.static(publicPath));
      app.get('*', (_req, res) => {
        res.sendFile(path.resolve(publicPath, 'index.html'));
      });

      console.log('[Server] Serving production build from public/.');
    }

    app.listen(PORT, '0.0.0.0', () => {
      console.log(
        `[Server] Folio digital notebook server listening on http://0.0.0.0:${PORT}`
      );
    });
  };

  startLocalServer().catch((error) => {
    console.error('[Server] Fatal startup failure:', error);
    process.exit(1);
  });
}

export default app;
