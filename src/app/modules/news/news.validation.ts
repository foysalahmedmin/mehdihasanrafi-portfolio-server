import { z } from 'zod';

// Common reusable schemas
const idSchema = z.string().refine((val) => /^[0-9a-fA-F]{24}$/.test(val), {
  message: 'Invalid ID format',
});

const statusEnum = z.enum(['draft', 'pending', 'published', 'archived']);

const tagsArray = z.preprocess((val) => {
  if (!val) return [];
  return Array.isArray(val) ? val.filter(Boolean) : [val].filter(Boolean);
}, z.array(z.string()).optional());

const imagesArray = z.preprocess((val) => {
  if (!val) return [];
  return Array.isArray(val) ? val.filter(Boolean) : [val].filter(Boolean);
}, z.array(z.string()).optional());

// ----------------------------------------
// ✅ Create News Validation Schema
// ----------------------------------------
export const createNewsValidationSchema = z.object({
  body: z.object({
    title: z.string().trim().min(1, 'Title is required'),
    slug: z.string().trim().min(1, 'Slug is required'),
    link: z.string().trim().url('Invalid link URL').optional(),
    description: z.string().trim().optional(),
    content: z.string().trim().min(1, 'Content is required'),
    category: z.string().trim().min(1, 'Category is required'),
    author: z.string().trim().min(1, 'Author is required'),

    thumbnail: z.string().optional(),
    images: imagesArray,
    video: z.string().optional(),
    youtube: z.string().optional(),

    tags: tagsArray,
    status: statusEnum.optional(),
    is_featured: z
      .preprocess((val) => {
        if (val === 'true' || val === true) return true;
        if (val === 'false' || val === false) return false;
        return val;
      }, z.boolean())
      .optional(),

    published_at: z.coerce.date().optional(),
    read_time: z.string().optional(),
  }),
});

// ----------------------------------------
// ✅ Update News Validation Schema
// ----------------------------------------
export const updateNewsValidationSchema = z.object({
  params: z.object({
    id: idSchema,
  }),
  body: z.object({
    title: z.string().trim().min(1).optional(),
    slug: z.string().trim().min(1).optional(),
    link: z.string().trim().url('Invalid link URL').optional(),
    description: z.string().trim().optional(),
    content: z.string().trim().min(1).optional(),
    category: z.string().optional(),
    author: z.string().trim().optional(),

    thumbnail: z.string().nullable().optional(),
    images: imagesArray,
    video: z.string().optional(),
    youtube: z.string().optional(),

    tags: tagsArray,
    status: statusEnum.optional(),
    is_featured: z
      .preprocess((val) => {
        if (val === 'true' || val === true) return true;
        if (val === 'false' || val === false) return false;
        return val;
      }, z.boolean())
      .optional(),

    published_at: z.coerce.date().optional(),
    read_time: z.string().optional(),
  }),
});

// ----------------------------------------
// ✅ Bulk Update Validation Schema
// ----------------------------------------
export const updateBulkNewsValidationSchema = z.object({
  body: z.object({
    ids: z.array(idSchema).nonempty('At least one news ID is required'),
    status: statusEnum.optional(),
  }),
});

// ----------------------------------------
// ✅ Single News Operation Validation
// ----------------------------------------
export const newsOperationValidationSchema = z.object({
  params: z.object({
    id: idSchema,
  }),
});

// ----------------------------------------
// ✅ Bulk News Operation Validation
// ----------------------------------------
export const bulkNewsOperationValidationSchema = z.object({
  body: z.object({
    ids: z.array(idSchema).nonempty('At least one news ID is required'),
  }),
});
