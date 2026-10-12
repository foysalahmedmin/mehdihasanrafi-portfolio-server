"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const zod_1 = require("zod");
const AppError_1 = __importDefault(require("../builder/AppError"));
const config_1 = __importDefault(require("../config"));
const handleCastError_1 = __importDefault(require("../errors/handleCastError"));
const handleDuplicateError_1 = __importDefault(require("../errors/handleDuplicateError"));
const handleValidationError_1 = __importDefault(require("../errors/handleValidationError"));
const handleZodError_1 = __importDefault(require("../errors/handleZodError"));
const error = (error, _req, res, _next) => {
    let status = 500;
    let message = 'Something went wrong!';
    let sources = [
        {
            path: '',
            message: 'Something went wrong',
        },
    ];
    if (error instanceof zod_1.ZodError) {
        const simplifiedError = (0, handleZodError_1.default)(error);
        status = simplifiedError?.status;
        message = simplifiedError?.message;
        sources = simplifiedError?.sources;
    }
    else if (error?.name === 'ValidationError') {
        const simplifiedError = (0, handleValidationError_1.default)(error);
        status = simplifiedError?.status;
        message = simplifiedError?.message;
        sources = simplifiedError?.sources;
    }
    else if (error?.name === 'CastError') {
        const simplifiedError = (0, handleCastError_1.default)(error);
        status = simplifiedError?.status;
        message = simplifiedError?.message;
        sources = simplifiedError?.sources;
    }
    else if (error?.code === 11000) {
        const simplifiedError = (0, handleDuplicateError_1.default)(error);
        status = simplifiedError?.status;
        message = simplifiedError?.message;
        sources = simplifiedError?.sources;
    }
    else if (error instanceof AppError_1.default) {
        status = error?.status;
        message = error.message;
        sources = [
            {
                path: '',
                message: error?.message,
            },
        ];
    }
    else if (error instanceof Error) {
        message = error.message;
        sources = [
            {
                path: '',
                message: error?.message,
            },
        ];
    }
    res.status(status).json({
        success: false,
        status,
        message,
        sources,
        error,
        stack: config_1.default.node_dev === 'development' ? error?.stack : null,
    });
    return;
};
exports.default = error;
