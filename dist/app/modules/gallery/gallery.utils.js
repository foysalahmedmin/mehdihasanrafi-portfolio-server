"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.maxSizeFor = exports.detectMediaType = exports.GALLERY_FOLDER = exports.VIDEO_MAX_SIZE = exports.IMAGE_MAX_SIZE = exports.GALLERY_ALLOWED_TYPES = exports.VIDEO_MIME_TYPES = exports.IMAGE_MIME_TYPES = void 0;
exports.IMAGE_MIME_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
];
exports.VIDEO_MIME_TYPES = [
    'video/mp4',
    'video/webm',
    'video/ogg',
    'video/quicktime',
];
exports.GALLERY_ALLOWED_TYPES = [...exports.IMAGE_MIME_TYPES, ...exports.VIDEO_MIME_TYPES];
exports.IMAGE_MAX_SIZE = 10_000_000; // 10MB
exports.VIDEO_MAX_SIZE = 100_000_000; // 100MB
// Cloudinary destination — a single "files" field holds a mixed batch of
// images and videos; `resource_type: 'auto'` lets Cloudinary itself detect
// which each one is, so there's no need to pre-sort them into folders.
exports.GALLERY_FOLDER = 'gallery';
// Detects whether an uploaded file is an image or a video from its
// mimetype — used for the DB's own media_type field and size limits
// (Cloudinary's own type detection is independent of this).
const detectMediaType = (mimetype) => {
    if (exports.IMAGE_MIME_TYPES.includes(mimetype))
        return 'image';
    if (exports.VIDEO_MIME_TYPES.includes(mimetype))
        return 'video';
    return null;
};
exports.detectMediaType = detectMediaType;
const maxSizeFor = (mediaType) => mediaType === 'image' ? exports.IMAGE_MAX_SIZE : exports.VIDEO_MAX_SIZE;
exports.maxSizeFor = maxSizeFor;
