import { dirYearMonth } from '../../utils/dirYearMonth';
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

// Detects whether an uploaded file is an image or a video from its mimetype.
// Returns null for anything else (should already be blocked by multer's
// allowedTypes filter, but kept as a safety net).
export const detectMediaType = (mimetype: string): TMediaType | null => {
  if (IMAGE_MIME_TYPES.includes(mimetype)) return 'image';
  if (VIDEO_MIME_TYPES.includes(mimetype)) return 'video';
  return null;
};

export const maxSizeFor = (mediaType: TMediaType): number =>
  mediaType === 'image' ? IMAGE_MAX_SIZE : VIDEO_MAX_SIZE;

export const folderFor = (mediaType: TMediaType): string =>
  `gallery/${mediaType === 'image' ? 'images' : 'videos'}/${dirYearMonth().suffix}`;

// Resolves the upload destination folder per-file, based on the file's own
// mimetype, so a single "files" field can hold a mixed batch of images and
// videos and still land each one in the right dated subfolder. Also
// recomputes the year/month at request time (not at route-definition time),
// so a long-running server doesn't keep writing into the month it booted in.
export const galleryUploadFolder = (file: { mimetype: string }): string => {
  const mediaType = detectMediaType(file.mimetype) ?? 'image';
  return folderFor(mediaType);
};

export const folderForStoredPath = (mediaType: TMediaType): string =>
  mediaType === 'image' ? 'gallery/images' : 'gallery/videos';
