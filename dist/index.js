"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const app_1 = __importDefault(require("./app"));
const config_1 = __importDefault(require("./app/config"));
let server;
// A query issued before the connection is ready queues up instead of
// failing immediately (default). A cold-start TLS handshake to Atlas can
// take longer than Mongoose's default 10s buffer timeout, so give queued
// queries more room before giving up.
mongoose_1.default.set('bufferTimeoutMS', 20000);
// Serverless functions can be invoked while a previous invocation's
// connection is still warm (the same container reused), so the connection
// is cached on the module scope instead of reconnecting on every request.
let connectionPromise = null;
const connectDB = () => {
    if (mongoose_1.default.connection.readyState === 1) {
        return Promise.resolve(mongoose_1.default);
    }
    if (!connectionPromise) {
        connectionPromise = mongoose_1.default
            .connect(config_1.default.database_url, {
            serverSelectionTimeoutMS: 15000,
            // Each serverless invocation is effectively single-concurrency per
            // container, so a large pool just holds idle connections open
            // against Atlas for no benefit.
            maxPoolSize: 5,
        })
            .catch((err) => {
            // Let the next invocation retry instead of caching a failed connection.
            connectionPromise = null;
            throw err;
        });
    }
    return connectionPromise;
};
exports.connectDB = connectDB;
async function main() {
    try {
        // Connects on every boot (including Vercel cold starts) — unlike a
        // plain .listen() call, Vercel hands the app straight to its runtime
        // with no entry point of its own to open this connection, so it can't
        // be skipped behind the `!process.env.VERCEL` guard below.
        await (0, exports.connectDB)();
        console.log('🟢 MongoDB connected');
        if (!process.env.VERCEL) {
            server = app_1.default.listen(config_1.default.port, () => {
                console.log(`🚀 Server is listening on port ${config_1.default.port}`);
            });
        }
    }
    catch (err) {
        console.error('❌ Failed to connect to database:', err);
        if (!process.env.VERCEL)
            process.exit(1);
    }
}
main();
// Gracefully handle shutdown signals
process.on('SIGINT', async () => {
    console.log('👋 Shutting down...');
    await mongoose_1.default.disconnect();
    process.exit(0);
});
process.on('SIGTERM', async () => {
    console.log('🛑 Termination signal received...');
    await mongoose_1.default.disconnect();
    process.exit(0);
});
exports.default = app_1.default;
// Handle unhandled promise rejections
process.on('unhandledRejection', (reason) => {
    console.error('❗Unhandled Rejection:', reason);
    if (server) {
        server.close(async () => {
            await mongoose_1.default.disconnect();
            process.exit(1);
        });
    }
});
// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('❗Uncaught Exception:', err);
    process.exit(1);
});
