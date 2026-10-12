import mongoose from 'mongoose';
import app from './app';
import config from './app/config';

// Serverless functions can be invoked while a previous invocation's
// connection is still warm (the same container reused), so the connection
// is cached on the module scope instead of reconnecting on every request.
let connectionPromise: Promise<typeof mongoose> | null = null;

export const connectDB = (): Promise<typeof mongoose> => {
  if (mongoose.connection.readyState === 1) {
    return Promise.resolve(mongoose);
  }
  if (!connectionPromise) {
    connectionPromise = mongoose.connect(config.database_url).catch((err) => {
      // Let the next invocation retry instead of caching a failed connection.
      connectionPromise = null;
      throw err;
    });
  }
  return connectionPromise;
};

// Connects on module load so the first request of a cold start doesn't pay
// the connection cost inside the request itself (and warm invocations reuse
// the already-open connection via connectDB()'s cache above).
connectDB()
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB connection failed:', err));

// On Vercel, this module's default export (the Express app) is handed
// directly to the Node serverless runtime — no .listen() here. Locally
// (`pnpm start:dev` / `pnpm start`), start a normal HTTP server instead.
if (!process.env.VERCEL) {
  app.listen(config.port, () => {
    console.log(`🚀 Server listening on port ${config.port}`);
  });
}

export default app;
