"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class AppError extends Error {
    status;
    constructor(status, message, stack = '') {
        super(message);
        this.status = status;
        if (stack) {
            this.stack = stack;
        }
        else {
            this.name = this.constructor.name;
            if (Error.captureStackTrace) {
                Error.captureStackTrace(this, this.constructor);
            }
        }
    }
}
exports.default = AppError;
