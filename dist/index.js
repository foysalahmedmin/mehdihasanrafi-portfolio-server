"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const app_1 = __importDefault(require("./app"));
const config_1 = __importDefault(require("./app/config"));
// Serverless functions can be invoked while a previous invocation's
// connection is still warm (the same container reused), so the connection
// is cached on the module scope instead of reconnecting on every request.
let connectionPromise = null;
const connectDB = () => {
    if (mongoose_1.default.connection.readyState === 1) {
        return Promise.resolve(mongoose_1.default);
    }
    if (!connectionPromise) {
        connectionPromise = mongoose_1.default.connect(config_1.default.database_url).catch((err) => {
            // Let the next invocation retry instead of caching a failed connection.
            connectionPromise = null;
            throw err;
        });
    }
    return connectionPromise;
};
exports.connectDB = connectDB;
// Connects on module load so the first request of a cold start doesn't pay
// the connection cost inside the request itself (and warm invocations reuse
// the already-open connection via connectDB()'s cache above).
(0, exports.connectDB)()
    .then(() => console.log('✅ MongoDB connected'))
    .catch((err) => console.error('❌ MongoDB connection failed:', err));
// On Vercel, this module's default export (the Express app) is handed
// directly to the Node serverless runtime — no .listen() here. Locally
// (`pnpm start:dev` / `pnpm start`), start a normal HTTP server instead.
if (!process.env.VERCEL) {
    app_1.default.listen(config_1.default.port, () => {
        console.log(`🚀 Server listening on port ${config_1.default.port}`);
    });
}
exports.default = app_1.default;
