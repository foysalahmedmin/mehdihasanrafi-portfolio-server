"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulkNewsOperationValidationSchema = exports.newsOperationValidationSchema = exports.updateBulkNewsValidationSchema = exports.updateNewsValidationSchema = exports.createNewsValidationSchema = void 0;
const zod_1 = require("zod");
// Common reusable schemas
const idSchema = zod_1.z.string().refine((val) => /^[0-9a-fA-F]{24}$/.test(val), {
    message: 'Invalid ID format',
});
const statusEnum = zod_1.z.enum(['draft', 'pending', 'published', 'archived']);
const tagsArray = zod_1.z.preprocess((val) => {
    if (!val)
        return [];
    return Array.isArray(val) ? val.filter(Boolean) : [val].filter(Boolean);
}, zod_1.z.array(zod_1.z.string()).optional());
const imagesArray = zod_1.z.preprocess((val) => {
    if (!val)
        return [];
    return Array.isArray(val) ? val.filter(Boolean) : [val].filter(Boolean);
}, zod_1.z.array(zod_1.z.string()).optional());
// ----------------------------------------
// ✅ Create News Validation Schema
// ----------------------------------------
exports.createNewsValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().trim().min(1, 'Title is required'),
        slug: zod_1.z.string().trim().min(1, 'Slug is required'),
        link: zod_1.z.string().trim().url('Invalid link URL').optional(),
        description: zod_1.z.string().trim().optional(),
        content: zod_1.z.string().trim().min(1, 'Content is required'),
        category: zod_1.z.string().trim().min(1, 'Category is required'),
        author: zod_1.z.string().trim().min(1, 'Author is required'),
        thumbnail: zod_1.z.string().optional(),
        images: imagesArray,
        video: zod_1.z.string().optional(),
        youtube: zod_1.z.string().optional(),
        tags: tagsArray,
        status: statusEnum.optional(),
        is_featured: zod_1.z
            .preprocess((val) => {
            if (val === 'true' || val === true)
                return true;
            if (val === 'false' || val === false)
                return false;
            return val;
        }, zod_1.z.boolean())
            .optional(),
        published_at: zod_1.z.coerce.date().optional(),
        read_time: zod_1.z.string().optional(),
    }),
});
// ----------------------------------------
// ✅ Update News Validation Schema
// ----------------------------------------
exports.updateNewsValidationSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: idSchema,
    }),
    body: zod_1.z.object({
        title: zod_1.z.string().trim().min(1).optional(),
        slug: zod_1.z.string().trim().min(1).optional(),
        link: zod_1.z.string().trim().url('Invalid link URL').optional(),
        description: zod_1.z.string().trim().optional(),
        content: zod_1.z.string().trim().min(1).optional(),
        category: zod_1.z.string().optional(),
        author: zod_1.z.string().trim().optional(),
        thumbnail: zod_1.z.string().nullable().optional(),
        images: imagesArray,
        video: zod_1.z.string().optional(),
        youtube: zod_1.z.string().optional(),
        tags: tagsArray,
        status: statusEnum.optional(),
        is_featured: zod_1.z
            .preprocess((val) => {
            if (val === 'true' || val === true)
                return true;
            if (val === 'false' || val === false)
                return false;
            return val;
        }, zod_1.z.boolean())
            .optional(),
        published_at: zod_1.z.coerce.date().optional(),
        read_time: zod_1.z.string().optional(),
    }),
});
// ----------------------------------------
// ✅ Bulk Update Validation Schema
// ----------------------------------------
exports.updateBulkNewsValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        ids: zod_1.z.array(idSchema).nonempty('At least one news ID is required'),
        status: statusEnum.optional(),
    }),
});
// ----------------------------------------
// ✅ Single News Operation Validation
// ----------------------------------------
exports.newsOperationValidationSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: idSchema,
    }),
});
// ----------------------------------------
// ✅ Bulk News Operation Validation
// ----------------------------------------
exports.bulkNewsOperationValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        ids: zod_1.z.array(idSchema).nonempty('At least one news ID is required'),
    }),
});
