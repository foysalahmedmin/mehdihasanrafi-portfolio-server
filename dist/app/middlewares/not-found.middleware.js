"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const notfound = (_req, res, _next) => {
    res.status(404).json({
        success: false,
        status: 404,
        message: 'API not found !!',
        sources: [],
        error: '',
        stack: '',
    });
    return;
};
exports.default = notfound;
