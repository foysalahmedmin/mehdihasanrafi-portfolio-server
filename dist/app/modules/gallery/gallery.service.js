"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBulkGallery = exports.deleteGallery = exports.updateGallery = exports.getGallery = exports.getPublicGallery = exports.getAllGallery = exports.getNextOrder = exports.createGalleryBatch = void 0;
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../builder/AppError"));
const AppQuery_1 = __importDefault(require("../../builder/AppQuery"));
const deleteCloudinaryFiles_1 = require("../../utils/deleteCloudinaryFiles");
const gallery_model_1 = require("./gallery.model");
const GALLERY_FIELDS = [
    'caption',
    'media_type',
    'image_url',
    'image',
    'video_url',
    'video',
    'order',
    'is_active',
    'created_at',
    'updated_at',
];
// Creates every item of a batch (one document per uploaded file, plus at
// most one for an image_url and one for a video_url) in a single insert.
const createGalleryBatch = async (items) => {
    const created = await gallery_model_1.Gallery.insertMany(items);
    return created.map((doc) => doc.toObject());
};
exports.createGalleryBatch = createGalleryBatch;
// The next free `order` value, so a newly created batch is appended after
// whatever already exists instead of colliding at 0.
const getNextOrder = async () => {
    const top = await gallery_model_1.Gallery.findOne().sort('-order').select('order').lean();
    return (top?.order ?? -1) + 1;
};
exports.getNextOrder = getNextOrder;
// Admin listing — every item regardless of active status, for management.
const getAllGallery = async (query) => {
    const mergedQuery = { sort: 'order', ...query };
    const GalleryQuery = new AppQuery_1.default(gallery_model_1.Gallery.find(), mergedQuery)
        .search(['caption'])
        .filter(['media_type', 'is_active'])
        .sort(['order'])
        .paginate()
        .fields(GALLERY_FIELDS)
        .tap((q) => q.lean());
    return GalleryQuery.execute();
};
exports.getAllGallery = getAllGallery;
// Public listing — only active items, ordered the way the admin arranged
// them (ascending `order`, the field the admin UI actually exposes).
const getPublicGallery = async (query) => {
    const mergedQuery = { sort: 'order', ...query };
    const GalleryQuery = new AppQuery_1.default(gallery_model_1.Gallery.find({ is_active: true }), mergedQuery)
        .search(['caption'])
        .filter(['media_type'])
        .sort(['order'])
        .paginate()
        .fields(GALLERY_FIELDS)
        .tap((q) => q.lean());
    return GalleryQuery.execute();
};
exports.getPublicGallery = getPublicGallery;
const getGallery = async (id) => {
    const result = await gallery_model_1.Gallery.findById(id).lean();
    if (!result) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Gallery item not found');
    }
    return result;
};
exports.getGallery = getGallery;
const updateGallery = async (id, payload) => {
    const result = await gallery_model_1.Gallery.findByIdAndUpdate(id, payload, {
        new: true,
        runValidators: true,
    }).lean();
    if (!result) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Gallery item not found');
    }
    return result;
};
exports.updateGallery = updateGallery;
const deleteGallery = async (id) => {
    const gallery = await gallery_model_1.Gallery.findById(id).lean();
    if (!gallery) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Gallery item not found');
    }
    if (gallery.image) {
        (0, deleteCloudinaryFiles_1.deleteCloudinaryFiles)(gallery.image, 'image');
    }
    if (gallery.video) {
        (0, deleteCloudinaryFiles_1.deleteCloudinaryFiles)(gallery.video, 'video');
    }
    await gallery_model_1.Gallery.findByIdAndDelete(id);
};
exports.deleteGallery = deleteGallery;
const deleteBulkGallery = async (ids) => {
    const galleries = await gallery_model_1.Gallery.find({ _id: { $in: ids } }).lean();
    const foundIds = galleries.map((g) => g._id.toString());
    const notFoundIds = ids.filter((id) => !foundIds.includes(id));
    const images = galleries.filter((g) => g.image).map((g) => g.image);
    const videos = galleries.filter((g) => g.video).map((g) => g.video);
    if (images.length)
        (0, deleteCloudinaryFiles_1.deleteCloudinaryFiles)(images, 'image');
    if (videos.length)
        (0, deleteCloudinaryFiles_1.deleteCloudinaryFiles)(videos, 'video');
    await gallery_model_1.Gallery.deleteMany({ _id: { $in: foundIds } });
    return { count: foundIds.length, not_found_ids: notFoundIds };
};
exports.deleteBulkGallery = deleteBulkGallery;
