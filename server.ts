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

/*
|--------------------------------------------------------------------------
| Basic Middleware
|--------------------------------------------------------------------------
*/

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(
  express.json({
    limit: '10mb',
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: '10mb',
  })
);

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

app.use('/api/auth', authRoutes);
app.use('/api/nodes', nodeRoutes);
app.use('/api/pages', pageRoutes);
app.use('/api/user', userRoutes);

app.get('/api/search', requireAuth, searchNotes);

/*
|--------------------------------------------------------------------------
| Health Check
|--------------------------------------------------------------------------
*/

app.get('/api/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    database: 'MongoDB Atlas',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
});

/*
|--------------------------------------------------------------------------
| Start Server
|--------------------------------------------------------------------------
*/

async function startServer() {
  try {
    /*
    |--------------------------------------------------------------------------
    | MongoDB Atlas Connection
    |--------------------------------------------------------------------------
    */

    const connected = await connectDB();

    if (!connected) {
      throw new Error('MongoDB Atlas connection failed.');
    }

    console.log('[Server] MongoDB Atlas connection verified.');

    /*
    |--------------------------------------------------------------------------
    | Development Mode
    |--------------------------------------------------------------------------
    */

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

      console.log('[Server] Vite middleware mounted.');
    }

    /*
    |--------------------------------------------------------------------------
    | Production Mode
    |--------------------------------------------------------------------------
    */

    else {
      const distPath = path.resolve(__dirname, 'dist');

      app.use(express.static(distPath));

      app.get('*', (_req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });

      console.log('[Server] Production frontend mounted from dist/.');
    }

    /*
    |--------------------------------------------------------------------------
    | Start Express
    |--------------------------------------------------------------------------
    */

    app.listen(PORT, '0.0.0.0', () => {
      console.log(
        `[Server] Folio digital notebook server running on port ${PORT}`
      );
    });
  } catch (error) {
    console.error('[Server] Startup failed:', error);

    /*
    |--------------------------------------------------------------------------
    | Do not start the application if MongoDB is unavailable.
    |--------------------------------------------------------------------------
    */

    process.exit(1);
  }
}

startServer();
