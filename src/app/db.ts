import mongoose from 'mongoose';
import config from './config';

// A query issued before the connection is ready queues up instead of
// failing immediately (default). A cold-start TLS handshake to Atlas can
// take longer than Mongoose's default 10s buffer timeout, so give queued
// queries more room before giving up.
mongoose.set('bufferTimeoutMS', 20000);

// Serverless functions can be invoked while a previous invocation's
// connection is still warm (the same container reused), so the connection
// is cached on the module scope instead of reconnecting on every request.
let connectionPromise: Promise<typeof mongoose> | null = null;

export const connectDB = (): Promise<typeof mongoose> => {
  if (mongoose.connection.readyState === 1) {
    return Promise.resolve(mongoose);
  }
  if (!connectionPromise) {
    connectionPromise = mongoose
      .connect(config.database_url, {
        serverSelectionTimeoutMS: 15000,
        // Each serverless invocation is effectively single-concurrency per
        // container, so a large pool just holds idle connections open
        // against Atlas for no benefit.
        maxPoolSize: 5,
      })
      .catch((err) => {
        // Let the next caller retry instead of caching a failed connection.
        connectionPromise = null;
        throw err;
      });
  }
  return connectionPromise;
};
