"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const handleCastError = (err) => {
    const sources = [
        {
            path: err.path,
            message: err.message,
        },
    ];
    const status = 400;
    return {
        status,
        message: 'Invalid ID',
        sources,
    };
};
exports.default = handleCastError;
