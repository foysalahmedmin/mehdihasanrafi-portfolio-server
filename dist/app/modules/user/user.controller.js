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
exports.restoreUsers = exports.restoreUser = exports.deleteUsersPermanent = exports.deleteUsers = exports.deleteUserPermanent = exports.deleteUser = exports.updateUsers = exports.updateUser = exports.updateSelf = exports.getUsers = exports.getWritersUsers = exports.getUser = exports.getSelf = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const UserServices = __importStar(require("./user.service"));
exports.getSelf = (0, catchAsync_1.default)(async (req, res) => {
    const result = await UserServices.getSelf(req.user);
    (0, sendResponse_1.default)(res, {
        status: http_status_1.default.OK,
        success: true,
        message: 'User retrieved successfully',
        data: result,
    });
});
exports.getUser = (0, catchAsync_1.default)(async (req, res) => {
    const { id } = req.params;
    const result = await UserServices.getUser(id);
    (0, sendResponse_1.default)(res, {
        status: http_status_1.default.OK,
        success: true,
        message: 'User retrieved successfully',
        data: result,
    });
});
exports.getWritersUsers = (0, catchAsync_1.default)(async (req, res) => {
    const result = await UserServices.getWritersUsers(req.query);
    (0, sendResponse_1.default)(res, {
        status: http_status_1.default.OK,
        success: true,
        message: 'Users retrieved successfully',
        meta: result.meta,
        data: result.data,
    });
});
exports.getUsers = (0, catchAsync_1.default)(async (req, res) => {
    const result = await UserServices.getUsers(req.query);
    (0, sendResponse_1.default)(res, {
        status: http_status_1.default.OK,
        success: true,
        message: 'Users retrieved successfully',
        meta: result.meta,
        data: result.data,
    });
});
exports.updateSelf = (0, catchAsync_1.default)(async (req, res) => {
    const files = req.files;
    const image = files.image?.[0]?.path || '';
    const payload = {
        ...req.body,
        ...(image ? { image } : {}),
    };
    const result = await UserServices.updateSelf(req.user, payload);
    (0, sendResponse_1.default)(res, {
        status: http_status_1.default.OK,
        success: true,
        message: 'User updated successfully',
        data: result,
    });
});
exports.updateUser = (0, catchAsync_1.default)(async (req, res) => {
    const { id } = req.params;
    const files = req.files;
    const image = files.image?.[0]?.path || '';
    const payload = {
        ...req.body,
        ...(image ? { image } : {}),
    };
    const result = await UserServices.updateUser(id, payload);
    (0, sendResponse_1.default)(res, {
        status: http_status_1.default.OK,
        success: true,
        message: 'User updated successfully',
        data: result,
    });
});
exports.updateUsers = (0, catchAsync_1.default)(async (req, res) => {
    const { ids, ...payload } = req.body;
    const result = await UserServices.updateUsers(ids, payload);
    (0, sendResponse_1.default)(res, {
        status: http_status_1.default.OK,
        success: true,
        message: 'Users updated successfully',
        data: result,
    });
});
exports.deleteUser = (0, catchAsync_1.default)(async (req, res) => {
    const { id } = req.params;
    await UserServices.deleteUser(id);
    (0, sendResponse_1.default)(res, {
        status: http_status_1.default.OK,
        success: true,
        message: 'User soft deleted successfully',
        data: null,
    });
});
exports.deleteUserPermanent = (0, catchAsync_1.default)(async (req, res) => {
    const { id } = req.params;
    await UserServices.deleteUserPermanent(id);
    (0, sendResponse_1.default)(res, {
        status: http_status_1.default.OK,
        success: true,
        message: 'User permanently deleted successfully',
        data: null,
    });
});
exports.deleteUsers = (0, catchAsync_1.default)(async (req, res) => {
    const { ids } = req.body;
    const result = await UserServices.deleteUsers(ids);
    (0, sendResponse_1.default)(res, {
        status: http_status_1.default.OK,
        success: true,
        message: `${result.count} users soft deleted successfully`,
        data: {
            not_found_ids: result.not_found_ids,
        },
    });
});
exports.deleteUsersPermanent = (0, catchAsync_1.default)(async (req, res) => {
    const { ids } = req.body;
    const result = await UserServices.deleteUsersPermanent(ids);
    (0, sendResponse_1.default)(res, {
        status: http_status_1.default.OK,
        success: true,
        message: `${result.count} users permanently deleted successfully`,
        data: {
            not_found_ids: result.not_found_ids,
        },
    });
});
exports.restoreUser = (0, catchAsync_1.default)(async (req, res) => {
    const { id } = req.params;
    const result = await UserServices.restoreUser(id);
    (0, sendResponse_1.default)(res, {
        status: http_status_1.default.OK,
        success: true,
        message: 'User restored successfully',
        data: result,
    });
});
exports.restoreUsers = (0, catchAsync_1.default)(async (req, res) => {
    const { ids } = req.body;
    const result = await UserServices.restoreUsers(ids);
    (0, sendResponse_1.default)(res, {
        status: http_status_1.default.OK,
        success: true,
        message: `${result.count} users restored successfully`,
        data: {
            not_found_ids: result.not_found_ids,
        },
    });
});
