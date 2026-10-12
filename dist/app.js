"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const db_1 = require("./app/db");
const error_middleware_1 = __importDefault(require("./app/middlewares/error.middleware"));
const log_middleware_1 = __importDefault(require("./app/middlewares/log.middleware"));
const not_found_middleware_1 = __importDefault(require("./app/middlewares/not-found.middleware"));
const routes_1 = __importDefault(require("./app/routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.set('trust proxy', true);
app.use(express_1.default.json({ limit: '1mb' }));
app.use((0, cookie_parser_1.default)());
app.use((0, cors_1.default)({
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
}));
// Log request middleware
app.use(log_middleware_1.default);
// Health check endpoint
app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});
// Ensures a DB connection before any /api route runs. `main()` in index.ts
// only connects once at cold start — if that one attempt ever fails (a
// transient blip), nothing would otherwise retry for the rest of that warm
// container's lifetime, leaving it stuck serving errors indefinitely. This
// is cheap once connected (an immediate readyState check inside connectDB).
app.use('/api', async (_req, _res, next) => {
    try {
        await (0, db_1.connectDB)();
        next();
    }
    catch (err) {
        next(err);
    }
});
// API routes — this is an API-only server now. Uploaded files live on
// Cloudinary and the frontend is a separately-deployed static site, so
// there's no local /uploads static serving or SPA fallback here.
app.use('/api', routes_1.default);
// Error handling middleware
app.use(error_middleware_1.default);
app.use(not_found_middleware_1.default);
exports.default = app;
