import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express, { Application, NextFunction, Request, Response } from 'express';
import { connectDB } from './app/db';
import error from './app/middlewares/error.middleware';
import log from './app/middlewares/log.middleware';
import notfound from './app/middlewares/not-found.middleware';
import router from './app/routes';

dotenv.config();
const app: Application = express();

app.set('trust proxy', true);

app.use(express.json({ limit: '1mb' }));

app.use(cookieParser());

app.use(
  cors({
    origin: [
      'http://localhost:8080',
      'http://localhost:5000',
      'http://localhost:5005',
      'http://mehdihasanrafi.com',
      'http://www.mehdihasanrafi.com',
      'https://mehdihasanrafi.com',
      'https://www.mehdihasanrafi.com',
      'https://mehdihasanrafi.vercel.app',
      'https://www.mehdihasanrafi.vercel.app',
      'https://mehdihasanrafi-api.vercel.app',
      'https://www.mehdihasanrafi-ap.vercel.app',
    ],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  }),
);

// Log request middleware
app.use(log);

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Ensures a DB connection before any /api route runs. `main()` in index.ts
// only connects once at cold start — if that one attempt ever fails (a
// transient blip), nothing would otherwise retry for the rest of that warm
// container's lifetime, leaving it stuck serving errors indefinitely. This
// is cheap once connected (an immediate readyState check inside connectDB).
app.use('/api', async (_req: Request, _res: Response, next: NextFunction) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    next(err);
  }
});

// API routes — this is an API-only server now. Uploaded files live on
// Cloudinary and the frontend is a separately-deployed static site, so
// there's no local /uploads static serving or SPA fallback here.
app.use('/api', router);

// Error handling middleware
app.use(error);
app.use(notfound);

export default app;
