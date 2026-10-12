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
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = __importDefault(require("../../middlewares/auth.middleware"));
const file_middleware_1 = __importDefault(require("../../middlewares/file.middleware"));
const validation_middleware_1 = __importDefault(require("../../middlewares/validation.middleware"));
const GalleryControllers = __importStar(require("./gallery.controller"));
const gallery_utils_1 = require("./gallery.utils");
const GalleryValidations = __importStar(require("./gallery.validation"));
const router = express_1.default.Router();
// A single "files" field accepts any mix of images and videos in one
// request; Cloudinary's resource_type "auto" tells images and videos apart
// on upload, so both share one folder. The 100MB ceiling here is multer's
// shared limit — the gallery controller then re-checks each file against
// its real per-type limit (10MB image / 100MB video) after upload.
const galleryUpload = (maxCount) => (0, file_middleware_1.default)({
    name: 'files',
    folder: gallery_utils_1.GALLERY_FOLDER,
    resourceType: 'auto',
    size: gallery_utils_1.VIDEO_MAX_SIZE,
    maxCount,
    allowedTypes: gallery_utils_1.GALLERY_ALLOWED_TYPES,
});
// GET
// Public, unauthenticated listing — only active items, admin-ordered.
router.get('/public', GalleryControllers.getPublicGallery);
// Admin management listing — every item, regardless of status.
router.get('/', (0, auth_middleware_1.default)('admin', 'super-admin'), GalleryControllers.getAllGallery);
router.get('/:id', (0, auth_middleware_1.default)('admin', 'super-admin'), (0, validation_middleware_1.default)(GalleryValidations.galleryOperationValidationSchema), GalleryControllers.getGalleryById);
// POST — batch create (any number of files, plus an optional image/video URL)
router.post('/', (0, auth_middleware_1.default)('admin', 'super-admin'), galleryUpload(20), (0, validation_middleware_1.default)(GalleryValidations.createGalleryValidationSchema), GalleryControllers.createGallery);
// PATCH — update a single item (metadata, and/or replace its one media file/URL)
router.patch('/:id', (0, auth_middleware_1.default)('admin', 'super-admin'), galleryUpload(1), (0, validation_middleware_1.default)(GalleryValidations.updateGalleryValidationSchema), GalleryControllers.updateGallery);
// DELETE
router.delete('/bulk', (0, auth_middleware_1.default)('admin', 'super-admin'), (0, validation_middleware_1.default)(GalleryValidations.bulkGalleryOperationValidationSchema), GalleryControllers.deleteBulkGallery);
router.delete('/:id', (0, auth_middleware_1.default)('admin', 'super-admin'), (0, validation_middleware_1.default)(GalleryValidations.galleryOperationValidationSchema), GalleryControllers.deleteGallery);
const GalleryRoutes = router;
exports.default = GalleryRoutes;
