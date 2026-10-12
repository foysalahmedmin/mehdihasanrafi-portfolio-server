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
exports.emailVerification = exports.emailVerificationSource = exports.resetPassword = exports.forgetPassword = exports.changePassword = exports.refreshToken = exports.signup = exports.signin = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const AuthServices = __importStar(require("./auth.service"));
const COOKIE_NAME = 'refresh_token';
const COOKIE_MAX_AGE = 1000 * 60 * 60 * 24 * 365;
exports.signin = (0, catchAsync_1.default)(async (req, res) => {
    const { refresh_token, access_token, info } = await AuthServices.signin(req.body);
    res.cookie(COOKIE_NAME, refresh_token, {
        maxAge: COOKIE_MAX_AGE,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
    });
    (0, sendResponse_1.default)(res, {
        status: http_status_1.default.OK,
        success: true,
        message: 'User is singed in successfully!',
        data: {
            token: access_token,
            info: info,
        },
    });
});
exports.signup = (0, catchAsync_1.default)(async (req, res) => {
    const files = req.files;
    const image = files?.image?.[0]?.path || '';
    const payload = {
        ...req.body,
        ...(image && { image: image }),
        role: 'user',
    };
    const { refresh_token, access_token, info } = await AuthServices.signup(payload);
    res.cookie(COOKIE_NAME, refresh_token, {
        maxAge: COOKIE_MAX_AGE,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
    });
    (0, sendResponse_1.default)(res, {
        status: http_status_1.default.OK,
        success: true,
        message: 'User is singed in successfully!',
        data: {
            token: access_token,
            info: info,
        },
    });
});
exports.refreshToken = (0, catchAsync_1.default)(async (req, res) => {
    const { refresh_token } = req.cookies;
    const { access_token, info } = await AuthServices.refreshToken(refresh_token);
    (0, sendResponse_1.default)(res, {
        status: http_status_1.default.OK,
        success: true,
        message: 'Access token is retrieved successfully!',
        data: {
            token: access_token,
            info: info,
        },
    });
});
exports.changePassword = (0, catchAsync_1.default)(async (req, res) => {
    const result = await AuthServices.changePassword(req.user, req.body);
    (0, sendResponse_1.default)(res, {
        status: http_status_1.default.OK,
        success: true,
        message: 'Password is changed successfully!',
        data: result,
    });
});
exports.forgetPassword = (0, catchAsync_1.default)(async (req, res) => {
    const result = await AuthServices.forgetPassword(req.body);
    (0, sendResponse_1.default)(res, {
        status: http_status_1.default.OK,
        success: true,
        message: 'Password reset link is sent successfully! Check your email.',
        data: result,
    });
});
exports.resetPassword = (0, catchAsync_1.default)(async (req, res) => {
    const token = req.headers.authorization || '';
    const result = await AuthServices.resetPassword(req.body, token);
    (0, sendResponse_1.default)(res, {
        status: http_status_1.default.OK,
        success: true,
        message: 'Password is reset successfully!',
        data: result,
    });
});
exports.emailVerificationSource = (0, catchAsync_1.default)(async (req, res) => {
    const result = await AuthServices.emailVerificationSource(req.user);
    (0, sendResponse_1.default)(res, {
        status: http_status_1.default.OK,
        success: true,
        message: 'Email verification link is sent successfully! Check your email.',
        data: result,
    });
});
exports.emailVerification = (0, catchAsync_1.default)(async (req, res) => {
    const token = req.headers.authorization || '';
    const result = await AuthServices.emailVerification(token);
    (0, sendResponse_1.default)(res, {
        status: http_status_1.default.OK,
        success: true,
        message: 'Email is verified successfully!',
        data: result,
    });
});
