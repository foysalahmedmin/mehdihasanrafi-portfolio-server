import express from 'express';
import auth from '../../middlewares/auth.middleware';
import file from '../../middlewares/file.middleware';
import validation from '../../middlewares/validation.middleware';
import * as GalleryControllers from './gallery.controller';
import { GALLERY_ALLOWED_TYPES, VIDEO_MAX_SIZE, galleryUploadFolder } from './gallery.utils';
import * as GalleryValidations from './gallery.validation';

const router = express.Router();

// A single "files" field accepts any mix of images and videos in one
// request; each file's own mimetype decides its media_type and destination
// folder (see gallery.utils#galleryUploadFolder). The 100MB ceiling here is
// multer's shared limit — file.middleware then re-checks each file against
// its real per-type limit (10MB image / 100MB video) after upload.
const galleryUpload = (maxCount: number) =>
  file({
    name: 'files',
    folder: galleryUploadFolder,
    size: VIDEO_MAX_SIZE,
    maxCount,
    allowedTypes: GALLERY_ALLOWED_TYPES,
  });

// GET
// Public, unauthenticated listing — only active items, admin-ordered.
router.get('/public', GalleryControllers.getPublicGallery);
// Admin management listing — every item, regardless of status.
router.get('/', auth('admin', 'super-admin'), GalleryControllers.getAllGallery);
router.get(
  '/:id',
  auth('admin', 'super-admin'),
  validation(GalleryValidations.galleryOperationValidationSchema),
  GalleryControllers.getGalleryById,
);

// POST — batch create (any number of files, plus an optional image/video URL)
router.post(
  '/',
  auth('admin', 'super-admin'),
  galleryUpload(20),
  validation(GalleryValidations.createGalleryValidationSchema),
  GalleryControllers.createGallery,
);

// PATCH — update a single item (metadata, and/or replace its one media file/URL)
router.patch(
  '/:id',
  auth('admin', 'super-admin'),
  galleryUpload(1),
  validation(GalleryValidations.updateGalleryValidationSchema),
  GalleryControllers.updateGallery,
);

// DELETE
router.delete(
  '/bulk',
  auth('admin', 'super-admin'),
  validation(GalleryValidations.bulkGalleryOperationValidationSchema),
  GalleryControllers.deleteBulkGallery,
);
router.delete(
  '/:id',
  auth('admin', 'super-admin'),
  validation(GalleryValidations.galleryOperationValidationSchema),
  GalleryControllers.deleteGallery,
);

const GalleryRoutes = router;

export default GalleryRoutes;
