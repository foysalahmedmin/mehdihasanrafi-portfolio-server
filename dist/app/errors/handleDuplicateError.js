"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const handleDuplicateError = (err) => {
    const sources = Object.entries(err.keyValue ?? {}).map(([key, value]) => ({
        path: key,
        message: `${value} already exists`,
    }));
    return {
        status: 400,
        message: 'Duplicate key error',
        sources,
    };
};
exports.default = handleDuplicateError;
