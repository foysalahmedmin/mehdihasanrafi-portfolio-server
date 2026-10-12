"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = __importDefault(require("./config"));
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
            // Let the next caller retry instead of caching a failed connection.
            connectionPromise = null;
            throw err;
        });
    }
    return connectionPromise;
};
exports.connectDB = connectDB;
