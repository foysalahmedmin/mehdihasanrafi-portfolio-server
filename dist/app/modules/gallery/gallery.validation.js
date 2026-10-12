"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulkGalleryOperationValidationSchema = exports.galleryOperationValidationSchema = exports.updateGalleryValidationSchema = exports.createGalleryValidationSchema = void 0;
const zod_1 = require("zod");
// ID schema (MongoDB ObjectId)
const idSchema = zod_1.z.string().refine((val) => /^[0-9a-fA-F]{24}$/.test(val), {
    message: 'Invalid ID format',
});
const boolField = zod_1.z.preprocess((val) => {
    if (val === 'true' || val === true)
        return true;
    if (val === 'false' || val === false)
        return false;
    return val;
}, zod_1.z.boolean());
// CREATE — accepts any number of uploaded files (handled by multer, not
// validated here) plus optional single external URLs. `media_type` is no
// longer a client input: it is inferred per uploaded file from its mimetype,
// and an `image_url`/`video_url` inherently says which type it is.
exports.createGalleryValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        caption: zod_1.z
            .string()
            .trim()
            .max(500, 'Caption cannot exceed 500 characters')
            .optional(),
        image_url: zod_1.z.string().trim().url('Invalid image URL').optional(),
        video_url: zod_1.z.string().trim().url('Invalid video URL').optional(),
        is_active: boolField.optional(),
    }),
});
// UPDATE — a single item's metadata, and/or a replacement for its media
// (one new file, or a URL matching its existing type). Whether a field is
// actually applied is decided in the controller: an absent field is always
// left untouched, so there is no way for a routine metadata-only edit to
// accidentally clear the media.
exports.updateGalleryValidationSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: idSchema,
    }),
    body: zod_1.z.object({
        caption: zod_1.z
            .string()
            .trim()
            .max(500, 'Caption cannot exceed 500 characters')
            .optional(),
        image_url: zod_1.z.string().trim().url('Invalid image URL').optional(),
        video_url: zod_1.z.string().trim().url('Invalid video URL').optional(),
        order: zod_1.z.coerce.number().int().min(0).optional(),
        is_active: boolField.optional(),
    }),
});
// Single gallery operation schema (e.g., delete or fetch)
exports.galleryOperationValidationSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: idSchema,
    }),
});
// Bulk gallery operation schema (delete multiple, etc.)
exports.bulkGalleryOperationValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        ids: zod_1.z.array(idSchema).nonempty('At least one gallery ID is required'),
    }),
});
