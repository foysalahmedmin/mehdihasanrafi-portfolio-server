import { z } from 'zod';

const idSchema = z.string().refine((val) => /^[0-9a-fA-F]{24}$/.test(val), {
  message: 'Invalid ID format',
});

const mediaTypeEnum = z.enum(['image', 'video']);

export const createGalleryValidationSchema = z
  .object({
    body: z.object({
      caption: z.string().trim().max(500, 'Caption cannot exceed 500 characters').optional(),
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
    }),
  })
  .refine(
    (data) => {
      const { media_type, image_url, image, video_url, video } = data.body;
      if (media_type === 'image') {
        return !!(image_url || image);
      }
      if (media_type === 'video') {
        return !!(video_url || video);
      }
      return true;
    },
    {
      message: 'Either URL or file is required based on media type',
      path: ['body', 'media_type'],
    },
  );

export const updateGalleryValidationSchema = z
  .object({
    params: z.object({
      id: idSchema,
    }),
    body: z.object({
      caption: z.string().trim().max(500, 'Caption cannot exceed 500 characters').optional(),
      media_type: mediaTypeEnum.optional(),
      image_url: z.string().trim().url('Invalid image URL').optional().nullable(),
      image: z.string().optional().nullable(),
      video_url: z.string().trim().url('Invalid video URL').optional().nullable(),
      video: z.string().optional().nullable(),
      order: z.coerce.number().int().min(0).optional(),
      is_active: z
        .preprocess((val) => {
          if (val === 'true' || val === true) return true;
          if (val === 'false' || val === false) return false;
          return val;
        }, z.boolean())
        .optional(),
    }),
  })
  .refine(
    (data) => {
      const { media_type, image_url, image, video_url, video } = data.body;
      if (media_type === 'image') {
        if (media_type !== undefined && !image_url && !image) {
          return false;
        }
      }
      if (media_type === 'video') {
        if (media_type !== undefined && !video_url && !video) {
          return false;
        }
      }
      return true;
    },
    {
      message: 'Either URL or file is required based on media type',
      path: ['body', 'media_type'],
    },
  );

export const galleryOperationValidationSchema = z.object({
  params: z.object({
    id: idSchema,
  }),
});

export const bulkGalleryOperationValidationSchema = z.object({
  body: z.object({
    ids: z.array(idSchema).nonempty('At least one gallery ID is required'),
  }),
});

