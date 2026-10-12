"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const mongoose_1 = __importStar(require("mongoose"));
const config_1 = __importDefault(require("../config"));
// Log schema
const logSchema = new mongoose_1.default.Schema({
    user: { type: mongoose_1.Schema.Types.ObjectId },
    role: { type: String },
    ip_address: { type: String },
    user_agent: { type: String },
    url: { type: String },
    method: { type: String },
    status: { type: Number },
    payload: { type: mongoose_1.Schema.Types.Mixed },
    response: { type: mongoose_1.Schema.Types.Mixed },
    duration: { type: Number },
    date: { type: Date, default: Date.now },
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    },
});
logSchema.index({ updated_at: 1 }, {
    expireAfterSeconds: 60 * 60 * 24 * 30 * 3,
});
// Log model
const Log = mongoose_1.default.model('Log', logSchema);
// Log Middleware
const log = (req, res, next) => {
    const start = Date.now();
    // Hold response body
    const oldSend = res.send;
    let responseBody;
    // Override res.send to capture response
    res.send = function (body) {
        responseBody = body;
        return oldSend.apply(res, arguments);
    };
    res.on('finish', async () => {
        try {
            if (req.method === 'GET')
                return;
            const token = req.headers['authorization'];
            if (!token)
                return;
            let _id;
            let role;
            try {
                const decoded = jsonwebtoken_1.default.verify(token, config_1.default.jwt_access_secret);
                _id = decoded._id;
                role = decoded.role;
            }
            catch (_err) {
                return;
            }
            // Skip if user role is "user"
            if (!_id || !role || (role && role === 'user'))
                return;
            await Log.create({
                user: _id,
                role: role,
                ip_address: req.ip === '::1' ? '127.0.0.1' : req.ip,
                user_agent: req.get('User-Agent') || '',
                method: req.method,
                url: req.originalUrl,
                status: res.statusCode,
                payload: req.body,
                response: responseBody,
                duration: Date.now() - start,
                date: new Date(),
            });
        }
        catch (err) {
            console.error('Log save error:', err);
        }
    });
    next();
};
exports.default = log;
