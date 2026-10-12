import { TMediaType } from './gallery.type';

export const IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
];

export const VIDEO_MIME_TYPES = [
  'video/mp4',
  'video/webm',
  'video/ogg',
  'video/quicktime',
];

export const GALLERY_ALLOWED_TYPES = [...IMAGE_MIME_TYPES, ...VIDEO_MIME_TYPES];

export const IMAGE_MAX_SIZE = 10_000_000; // 10MB
export const VIDEO_MAX_SIZE = 100_000_000; // 100MB

// Cloudinary destination — a single "files" field holds a mixed batch of
// images and videos; `resource_type: 'auto'` lets Cloudinary itself detect
// which each one is, so there's no need to pre-sort them into folders.
export const GALLERY_FOLDER = 'gallery';

// Detects whether an uploaded file is an image or a video from its
// mimetype — used for the DB's own media_type field and size limits
// (Cloudinary's own type detection is independent of this).
export const detectMediaType = (mimetype: string): TMediaType | null => {
  if (IMAGE_MIME_TYPES.includes(mimetype)) return 'image';
  if (VIDEO_MIME_TYPES.includes(mimetype)) return 'video';
  return null;
};

export const maxSizeFor = (mediaType: TMediaType): number =>
  mediaType === 'image' ? IMAGE_MAX_SIZE : VIDEO_MAX_SIZE;
