"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulkPublicationOperationValidationSchema = exports.publicationOperationValidationSchema = exports.updateBulkPublicationValidationSchema = exports.updatePublicationValidationSchema = exports.createPublicationValidationSchema = void 0;
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
const authorsArray = zod_1.z.preprocess((val) => {
    if (!val)
        return [];
    return Array.isArray(val) ? val.filter(Boolean) : [val].filter(Boolean);
}, zod_1.z.array(zod_1.z.string()).optional());
// ----------------------------------------
// ✅ Create Publication Validation Schema
// ----------------------------------------
exports.createPublicationValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().trim().min(1, 'Title is required'),
        slug: zod_1.z.string().trim().min(1, 'Slug is required'),
        link: zod_1.z.string().trim().url('Invalid link URL').optional(),
        description: zod_1.z.string().trim().optional(),
        abstract: zod_1.z.string().trim().optional(),
        content: zod_1.z.string().trim().optional(),
        venue: zod_1.z.string().trim().optional(),
        publisher: zod_1.z.string().trim().optional(),
        journal: zod_1.z.string().trim().optional(),
        volume: zod_1.z.string().trim().optional(),
        code: zod_1.z.string().trim().optional(),
        doi: zod_1.z.string().trim().nullable().optional(),
        category: zod_1.z.string().trim().optional(),
        author: zod_1.z.string().trim().optional(),
        authors: authorsArray,
        thumbnail: zod_1.z.string().optional(),
        pdf: zod_1.z.string().nullable().optional(),
        images: imagesArray,
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
// ✅ Update Publication Validation Schema
// ----------------------------------------
exports.updatePublicationValidationSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: idSchema,
    }),
    body: zod_1.z.object({
        title: zod_1.z.string().trim().min(1).optional(),
        slug: zod_1.z.string().trim().min(1).optional(),
        link: zod_1.z.string().trim().url('Invalid link URL').optional(),
        description: zod_1.z.string().trim().optional(),
        abstract: zod_1.z.string().trim().min(1).optional(),
        content: zod_1.z.string().trim().min(1).optional(),
        venue: zod_1.z.string().trim().min(1).optional(),
        publisher: zod_1.z.string().trim().optional(),
        journal: zod_1.z.string().trim().optional(),
        volume: zod_1.z.string().trim().optional(),
        code: zod_1.z.string().trim().optional(),
        doi: zod_1.z.string().trim().nullable().optional(),
        category: zod_1.z.string().optional(),
        author: zod_1.z.string().trim().optional(),
        authors: authorsArray,
        thumbnail: zod_1.z.string().nullable().optional(),
        pdf: zod_1.z.string().nullable().optional(),
        images: imagesArray,
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
exports.updateBulkPublicationValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        ids: zod_1.z.array(idSchema).nonempty('At least one publication ID is required'),
        status: statusEnum.optional(),
    }),
});
// ----------------------------------------
// ✅ Single Publication Operation Validation
// ----------------------------------------
exports.publicationOperationValidationSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: idSchema,
    }),
});
// ----------------------------------------
// ✅ Bulk Publication Operation Validation
// ----------------------------------------
exports.bulkPublicationOperationValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        ids: zod_1.z.array(idSchema).nonempty('At least one publication ID is required'),
    }),
});
