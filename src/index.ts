/* eslint-disable no-console */
import { Server } from 'http';
import mongoose from 'mongoose';
import app from './app';
import config from './app/config';

let server: Server;

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

async function main() {
  try {
    // Connects on every boot (including Vercel cold starts) — unlike a
    // plain .listen() call, Vercel hands the app straight to its runtime
    // with no entry point of its own to open this connection, so it can't
    // be skipped behind the `!process.env.VERCEL` guard below.
    await connectDB();
    console.log('🟢 MongoDB connected');

    if (!process.env.VERCEL) {
      server = app.listen(config.port, () => {
        console.log(`🚀 Server is listening on port ${config.port}`);
      });
    }
  } catch (err) {
    console.error('❌ Failed to connect to database:', err);
    if (!process.env.VERCEL) process.exit(1);
  }
}

main();

// Gracefully handle shutdown signals
process.on('SIGINT', async () => {
  console.log('👋 Shutting down...');
  await mongoose.disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🛑 Termination signal received...');
  await mongoose.disconnect();
  process.exit(0);
});

export default app;

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason) => {
  console.error('❗Unhandled Rejection:', reason);
  if (server) {
    server.close(async () => {
      await mongoose.disconnect();
      process.exit(1);
    });
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❗Uncaught Exception:', err);
  process.exit(1);
});
