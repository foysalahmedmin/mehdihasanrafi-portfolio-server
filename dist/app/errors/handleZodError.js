"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const handleZodError = (err) => {
    const sources = err.issues.map((issue) => {
        return {
            path: issue?.path[issue.path.length - 1],
            message: issue.message,
        };
    });
    const status = 400;
    return {
        status,
        message: 'Validation Error',
        sources,
    };
};
exports.default = handleZodError;
