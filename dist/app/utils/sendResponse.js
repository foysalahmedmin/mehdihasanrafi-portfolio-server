"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sendResponse = (res, payload) => {
    const { status, success, message, data, meta } = payload;
    return res.status(status).json({
        success: success,
        status: status,
        message: message ?? (status === 200 || status === 201 ? 'Success' : ''),
        data: data,
        ...(meta && { meta }),
    });
};
exports.default = sendResponse;
