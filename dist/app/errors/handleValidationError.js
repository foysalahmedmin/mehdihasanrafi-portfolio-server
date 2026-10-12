"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const handleValidationError = (err) => {
    const sources = Object.values(err.errors).map((val) => {
        return {
            path: val?.path,
            message: val?.message,
        };
    });
    const status = 400;
    return {
        status,
        message: 'Validation Error',
        sources,
    };
};
exports.default = handleValidationError;
