import { z } from 'zod';

// ID schema (MongoDB ObjectId)
const idSchema = z.string().refine((val) => /^[0-9a-fA-F]{24}$/.test(val), {
  message: 'Invalid ID format',
});

// Media type enum
const mediaTypeEnum = z.enum(['image', 'video']);

// CREATE gallery schema
export const createGalleryValidationSchema = z.object({
  body: z
    .object({
      caption: z
        .string()
        .trim()
        .max(500, 'Caption cannot exceed 500 characters')
        .optional(),
      media_type: mediaTypeEnum,
      image_url: z.string().trim().url('Invalid image URL').optional(),
      image: z.string().optional(),
      video_url: z.string().trim().url('Invalid video URL').optional(),
      video: z.string().optional(),
      order: z.coerce.number().int().min(0).optional(),
      is_active: z
        .preprocess((val) => {
          if (val === 'true' || val === true) return true;
          if (val === 'false' || val === false) return false;
          return val;
        }, z.boolean())
        .optional(),
    })
    .superRefine((data, ctx) => {
      const { media_type, image_url, image, video_url, video } = data;
      if (media_type === 'image' && !image_url && !image) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Either image URL or file is required for image type',
          path: ['media_type'],
        });
      }
      if (media_type === 'video' && !video_url && !video) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Either video URL or file is required for video type',
          path: ['media_type'],
        });
      }
    }),
});

// UPDATE gallery schema
export const updateGalleryValidationSchema = z.object({
  params: z.object({
    id: idSchema,
  }),
  body: z
    .object({
      caption: z
        .string()
        .trim()
        .max(500, 'Caption cannot exceed 500 characters')
        .optional(),
      media_type: mediaTypeEnum.optional(),
      image_url: z
        .string()
        .trim()
        .url('Invalid image URL')
        .optional()
        .nullable(),
      image: z.string().optional().nullable(),
      video_url: z
        .string()
        .trim()
        .url('Invalid video URL')
        .optional()
        .nullable(),
      video: z.string().optional().nullable(),
      order: z.coerce.number().int().min(0).optional(),
      is_active: z
        .preprocess((val) => {
          if (val === 'true' || val === true) return true;
          if (val === 'false' || val === false) return false;
          return val;
        }, z.boolean())
        .optional(),
    })
    .superRefine((data, ctx) => {
      const { media_type, image_url, image, video_url, video } = data;
      if (media_type === 'image' && !image_url && !image) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Either image URL or file is required for image type',
          path: ['media_type'],
        });
      }
      if (media_type === 'video' && !video_url && !video) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Either video URL or file is required for video type',
          path: ['media_type'],
        });
      }
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
