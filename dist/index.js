"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const app_1 = __importDefault(require("./app"));
const db_1 = require("./app/db");
const config_1 = __importDefault(require("./app/config"));
let server;
async function main() {
    try {
        // Connects on every boot (including Vercel cold starts) — unlike a
        // plain .listen() call, Vercel hands the app straight to its runtime
        // with no entry point of its own to open this connection, so it can't
        // be skipped behind the `!process.env.VERCEL` guard below.
        await (0, db_1.connectDB)();
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
