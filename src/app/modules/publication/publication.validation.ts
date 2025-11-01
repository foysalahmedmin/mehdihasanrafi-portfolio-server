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

const authorsArray = z.preprocess((val) => {
  if (!val) return [];
  return Array.isArray(val) ? val.filter(Boolean) : [val].filter(Boolean);
}, z.array(z.string()).optional());

// ----------------------------------------
// ✅ Create Publication Validation Schema
// ----------------------------------------
export const createPublicationValidationSchema = z.object({
  body: z.object({
    title: z.string().trim().min(1, 'Title is required'),
    slug: z.string().trim().min(1, 'Slug is required'),
    link: z.string().trim().url('Invalid link URL').optional(),
    description: z.string().trim().optional(),
    abstract: z.string().trim().min(1, 'Abstract is required'),
    content: z.string().trim().min(1, 'Content is required'),
    venue: z.string().trim().min(1, 'Venue is required'),
    publisher: z.string().trim().optional(),
    journal: z.string().trim().optional(),
    volume: z.string().trim().optional(),
    code: z.string().trim().optional(),
    doi: z.string().trim().nullable().optional(),
    category: z.string().trim().optional(),
    author: z.string().trim().optional(),
    authors: authorsArray,

    thumbnail: z.string().optional(),
    pdf: z.string().nullable().optional(),
    images: imagesArray,

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
// ✅ Update Publication Validation Schema
// ----------------------------------------
export const updatePublicationValidationSchema = z.object({
  params: z.object({
    id: idSchema,
  }),
  body: z.object({
    title: z.string().trim().min(1).optional(),
    slug: z.string().trim().min(1).optional(),
    link: z.string().trim().url('Invalid link URL').optional(),
    description: z.string().trim().optional(),
    abstract: z.string().trim().min(1).optional(),
    content: z.string().trim().min(1).optional(),
    venue: z.string().trim().min(1).optional(),
    publisher: z.string().trim().optional(),
    journal: z.string().trim().optional(),
    volume: z.string().trim().optional(),
    code: z.string().trim().optional(),
    doi: z.string().trim().nullable().optional(),
    category: z.string().optional(),
    author: z.string().trim().optional(),
    authors: authorsArray,

    thumbnail: z.string().nullable().optional(),
    pdf: z.string().nullable().optional(),
    images: imagesArray,

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
export const updateBulkPublicationValidationSchema = z.object({
  body: z.object({
    ids: z.array(idSchema).nonempty('At least one publication ID is required'),
    status: statusEnum.optional(),
  }),
});

// ----------------------------------------
// ✅ Single Publication Operation Validation
// ----------------------------------------
export const publicationOperationValidationSchema = z.object({
  params: z.object({
    id: idSchema,
  }),
});

// ----------------------------------------
// ✅ Bulk Publication Operation Validation
// ----------------------------------------
export const bulkPublicationOperationValidationSchema = z.object({
  body: z.object({
    ids: z.array(idSchema).nonempty('At least one publication ID is required'),
  }),
});

