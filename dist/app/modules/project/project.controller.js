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
exports.deleteBulkProjectsPermanent = exports.deleteProjectPermanent = exports.updateBulkProjects = exports.updateProject = exports.getPublicBulkProjects = exports.getPublicProject = exports.createProject = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const ProjectServices = __importStar(require("./project.service"));
exports.createProject = (0, catchAsync_1.default)(async (req, res) => {
    // Multer files type casting
    const files = req.files;
    // file.middleware has already uploaded these to Cloudinary — `.path` is
    // each one's secure_url.
    const thumbnailFile = files['thumbnail']?.[0] || '';
    const thumbnailPath = thumbnailFile ? thumbnailFile.path : '';
    // Multiple images
    const imagesFiles = files['images'] || [];
    const imagesPaths = imagesFiles?.map((f) => f.path);
    const { ...rest } = req.body || {};
    const payload = {
        ...rest,
        ...(thumbnailPath && { thumbnail: thumbnailPath }),
        ...(imagesPaths?.length > 0 && { images: imagesPaths }),
    };
    const result = await ProjectServices.createProject(payload);
    (0, sendResponse_1.default)(res, {
        status: http_status_1.default.OK,
        success: true,
        message: 'Project created successfully',
        data: result,
    });
});
exports.getPublicProject = (0, catchAsync_1.default)(async (req, res) => {
    const { slug } = req.params;
    const result = await ProjectServices.getPublicProject(slug);
    (0, sendResponse_1.default)(res, {
        status: http_status_1.default.OK,
        success: true,
        message: 'Project retrieved successfully',
        data: result,
    });
});
exports.getPublicBulkProjects = (0, catchAsync_1.default)(async (req, res) => {
    const result = await ProjectServices.getPublicBulkProjects(req.query);
    (0, sendResponse_1.default)(res, {
        status: http_status_1.default.OK,
        success: true,
        message: 'All Projects are retrieved successfully',
        meta: result.meta,
        data: result.data,
    });
});
exports.updateProject = (0, catchAsync_1.default)(async (req, res) => {
    // Multer files type casting
    const files = req.files;
    // file.middleware has already uploaded these to Cloudinary — `.path` is
    // each one's secure_url.
    const thumbnailFile = files['thumbnail']?.[0] || '';
    const thumbnailPath = thumbnailFile ? thumbnailFile.path : '';
    // Multiple images
    const imagesFiles = files['images'] || [];
    const imagesPaths = imagesFiles?.map((f) => f.path);
    const { ...rest } = req.body || {};
    const payload = {
        ...rest,
        ...(thumbnailFile && { thumbnail: thumbnailPath }),
        ...(imagesPaths?.length > 0 && { images: imagesPaths }),
    };
    const { id } = req.params;
    const result = await ProjectServices.updateProject(id, payload);
    (0, sendResponse_1.default)(res, {
        status: http_status_1.default.OK,
        success: true,
        message: 'Project updated successfully',
        data: result,
    });
});
exports.updateBulkProjects = (0, catchAsync_1.default)(async (req, res) => {
    const { ids, ...payload } = req.body;
    const result = await ProjectServices.updateBulkProjects(ids, payload);
    (0, sendResponse_1.default)(res, {
        status: http_status_1.default.OK,
        success: true,
        message: 'All Projects are updated successfully',
        data: result,
    });
});
exports.deleteProjectPermanent = (0, catchAsync_1.default)(async (req, res) => {
    const { id } = req.params;
    await ProjectServices.deleteProjectPermanent(id);
    (0, sendResponse_1.default)(res, {
        status: http_status_1.default.OK,
        success: true,
        message: 'Project permanently deleted successfully',
        data: null,
    });
});
exports.deleteBulkProjectsPermanent = (0, catchAsync_1.default)(async (req, res) => {
    const { ids } = req.body;
    const result = await ProjectServices.deleteBulkProjectsPermanent(ids);
    (0, sendResponse_1.default)(res, {
        status: http_status_1.default.OK,
        success: true,
        message: `${result.count} Projects are permanently deleted successfully`,
        data: {
            not_found_ids: result.not_found_ids,
        },
    });
});
