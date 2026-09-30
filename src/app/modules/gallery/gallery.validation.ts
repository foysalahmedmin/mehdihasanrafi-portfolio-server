import { z } from 'zod';

// ID schema (MongoDB ObjectId)
const idSchema = z.string().refine((val) => /^[0-9a-fA-F]{24}$/.test(val), {
  message: 'Invalid ID format',
});

const boolField = z.preprocess((val) => {
  if (val === 'true' || val === true) return true;
  if (val === 'false' || val === false) return false;
  return val;
}, z.boolean());

// CREATE — accepts any number of uploaded files (handled by multer, not
// validated here) plus optional single external URLs. `media_type` is no
// longer a client input: it is inferred per uploaded file from its mimetype,
// and an `image_url`/`video_url` inherently says which type it is.
export const createGalleryValidationSchema = z.object({
  body: z.object({
    caption: z
      .string()
      .trim()
      .max(500, 'Caption cannot exceed 500 characters')
      .optional(),
    image_url: z.string().trim().url('Invalid image URL').optional(),
    video_url: z.string().trim().url('Invalid video URL').optional(),
    is_active: boolField.optional(),
  }),
});

// UPDATE — a single item's metadata, and/or a replacement for its media
// (one new file, or a URL matching its existing type). Whether a field is
// actually applied is decided in the controller: an absent field is always
// left untouched, so there is no way for a routine metadata-only edit to
// accidentally clear the media.
export const updateGalleryValidationSchema = z.object({
  params: z.object({
    id: idSchema,
  }),
  body: z.object({
    caption: z
      .string()
      .trim()
      .max(500, 'Caption cannot exceed 500 characters')
      .optional(),
    image_url: z.string().trim().url('Invalid image URL').optional(),
    video_url: z.string().trim().url('Invalid video URL').optional(),
    order: z.coerce.number().int().min(0).optional(),
    is_active: boolField.optional(),
  }),
});

// Single gallery operation schema (e.g., delete or fetch)
export const galleryOperationValidationSchema = z.object({
  params: z.object({
    id: idSchema,
  }),
});

// Bulk gallery operation schema (delete multiple, etc.)
export const bulkGalleryOperationValidationSchema = z.object({
  body: z.object({
    ids: z.array(idSchema).nonempty('At least one gallery ID is required'),
  }),
});
