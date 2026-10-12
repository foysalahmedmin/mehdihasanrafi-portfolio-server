import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express, { Application } from 'express';
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

// API routes — this is an API-only server now. Uploaded files live on
// Cloudinary and the frontend is a separately-deployed static site, so
// there's no local /uploads static serving or SPA fallback here.
app.use('/api', router);

// Error handling middleware
app.use(error);
app.use(notfound);

export default app;
