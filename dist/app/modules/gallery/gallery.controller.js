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
exports.deleteBulkGallery = exports.deleteGallery = exports.updateGallery = exports.getGalleryById = exports.getPublicGallery = exports.getAllGallery = exports.createGallery = void 0;
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../builder/AppError"));
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const deleteCloudinaryFiles_1 = require("../../utils/deleteCloudinaryFiles");
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const GalleryServices = __importStar(require("./gallery.service"));
const gallery_utils_1 = require("./gallery.utils");
exports.createGallery = (0, catchAsync_1.default)(async (req, res) => {
    // By this point file.middleware has already uploaded every file straight
    // to Cloudinary — `file.path` is each one's secure_url.
    const uploaded = req.files
        ?.files || [];
    const { caption, is_active, image_url, video_url } = req.body;
    // Validate every uploaded file up front so a batch either fully succeeds
    // or fully fails — never partially creates items and leaves the rest as
    // orphaned Cloudinary assets.
    const fileItems = [];
    for (const uploadedFile of uploaded) {
        const mediaType = (0, gallery_utils_1.detectMediaType)(uploadedFile.mimetype);
        if (!mediaType || uploadedFile.size > (0, gallery_utils_1.maxSizeFor)(mediaType || 'image')) {
            await (0, deleteCloudinaryFiles_1.deleteCloudinaryFiles)(uploaded.map((f) => f.path), 'auto');
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, mediaType
                ? `"${uploadedFile.originalname}" exceeds the ${mediaType} size limit`
                : `Unsupported file type: ${uploadedFile.originalname}`);
        }
        fileItems.push({ media_type: mediaType, url: uploadedFile.path });
    }
    if (fileItems.length === 0 && !image_url && !video_url) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Provide at least one file, an image URL, or a video URL');
    }
    let nextOrder = await GalleryServices.getNextOrder();
    const docs = fileItems.map((item) => ({
        media_type: item.media_type,
        ...(item.media_type === 'image'
            ? { image: item.url }
            : { video: item.url }),
        caption,
        is_active: is_active ?? true,
        order: nextOrder++,
    }));
    if (image_url) {
        docs.push({
            media_type: 'image',
            image_url,
            caption,
            is_active: is_active ?? true,
            order: nextOrder++,
        });
    }
    if (video_url) {
        docs.push({
            media_type: 'video',
            video_url,
            caption,
            is_active: is_active ?? true,
            order: nextOrder++,
        });
    }
    const result = await GalleryServices.createGalleryBatch(docs);
    (0, sendResponse_1.default)(res, {
        status: http_status_1.default.CREATED,
        success: true,
        message: `${result.length} gallery item${result.length === 1 ? '' : 's'} created successfully`,
        data: result,
    });
});
exports.getAllGallery = (0, catchAsync_1.default)(async (req, res) => {
    const result = await GalleryServices.getAllGallery(req.query);
    (0, sendResponse_1.default)(res, {
        status: http_status_1.default.OK,
        success: true,
        message: 'Gallery retrieved successfully',
        data: result.data,
        meta: result.meta,
    });
});
exports.getPublicGallery = (0, catchAsync_1.default)(async (req, res) => {
    const result = await GalleryServices.getPublicGallery(req.query);
    (0, sendResponse_1.default)(res, {
        status: http_status_1.default.OK,
        success: true,
        message: 'Gallery retrieved successfully',
        data: result.data,
        meta: result.meta,
    });
});
exports.getGalleryById = (0, catchAsync_1.default)(async (req, res) => {
    const { id } = req.params;
    const result = await GalleryServices.getGallery(id);
    (0, sendResponse_1.default)(res, {
        status: http_status_1.default.OK,
        success: true,
        message: 'Gallery item retrieved successfully',
        data: result,
    });
});
exports.updateGallery = (0, catchAsync_1.default)(async (req, res) => {
    const { id } = req.params;
    const uploaded = req.files
        ?.files?.[0];
    const { caption, is_active, order, image_url, video_url } = req.body;
    const existing = await GalleryServices.getGallery(id);
    const patch = {};
    if (caption !== undefined)
        patch.caption = caption;
    if (is_active !== undefined)
        patch.is_active = is_active;
    if (order !== undefined)
        patch.order = order;
    // Only ever replace media when a genuinely new file or URL was given.
    // Anything else about this request (a caption edit, an order change, a
    // blank/untouched url field left over from the form) leaves the existing
    // image/video/image_url/video_url completely alone.
    let oldAssetToDelete;
    if (uploaded) {
        const detected = (0, gallery_utils_1.detectMediaType)(uploaded.mimetype);
        if (detected !== existing.media_type) {
            await (0, deleteCloudinaryFiles_1.deleteCloudinaryFiles)(uploaded.path, 'auto');
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, `This item is a${existing.media_type === 'image' ? 'n image' : ' video'} — the replacement file must be too`);
        }
        if (uploaded.size > (0, gallery_utils_1.maxSizeFor)(detected)) {
            await (0, deleteCloudinaryFiles_1.deleteCloudinaryFiles)(uploaded.path, 'auto');
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, `"${uploaded.originalname}" exceeds the ${detected} size limit`);
        }
        if (existing.media_type === 'image') {
            patch.image = uploaded.path;
            patch.image_url = null;
            if (existing.image)
                oldAssetToDelete = existing.image;
        }
        else {
            patch.video = uploaded.path;
            patch.video_url = null;
            if (existing.video)
                oldAssetToDelete = existing.video;
        }
    }
    else if (existing.media_type === 'image' && image_url) {
        patch.image_url = image_url;
        patch.image = null;
        if (existing.image)
            oldAssetToDelete = existing.image;
    }
    else if (existing.media_type === 'video' && video_url) {
        patch.video_url = video_url;
        patch.video = null;
        if (existing.video)
            oldAssetToDelete = existing.video;
    }
    const result = await GalleryServices.updateGallery(id, patch);
    if (oldAssetToDelete) {
        (0, deleteCloudinaryFiles_1.deleteCloudinaryFiles)(oldAssetToDelete, existing.media_type);
    }
    (0, sendResponse_1.default)(res, {
        status: http_status_1.default.OK,
        success: true,
        message: 'Gallery item updated successfully',
        data: result,
    });
});
exports.deleteGallery = (0, catchAsync_1.default)(async (req, res) => {
    const { id } = req.params;
    await GalleryServices.deleteGallery(id);
    (0, sendResponse_1.default)(res, {
        status: http_status_1.default.OK,
        success: true,
        message: 'Gallery item deleted successfully',
        data: null,
    });
});
exports.deleteBulkGallery = (0, catchAsync_1.default)(async (req, res) => {
    const { ids } = req.body;
    const result = await GalleryServices.deleteBulkGallery(ids);
    (0, sendResponse_1.default)(res, {
        status: http_status_1.default.OK,
        success: true,
        message: `${result.count} gallery item(s) deleted successfully`,
        data: {
            not_found_ids: result.not_found_ids,
        },
    });
});
