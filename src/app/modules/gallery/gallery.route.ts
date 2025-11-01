import express from 'express';
import auth from '../../middlewares/auth.middleware';
import file from '../../middlewares/file.middleware';
import validation from '../../middlewares/validation.middleware';
import * as GalleryControllers from './gallery.controller';
import { folderMapWithYearMonth } from './gallery.utils';
import * as GalleryValidations from './gallery.validation';

const router = express.Router();

// GET - Public
router.get('/public', GalleryControllers.getPublicGallery);

// GET - Admin
router.get('/', auth('admin', 'super-admin'), GalleryControllers.getAllGallery);
router.get('/:id', auth('admin', 'super-admin'), GalleryControllers.getGalleryById);

// POST
router.post(
  '/',
  auth('admin', 'super-admin'),
  file(
    {
      name: 'image',
      folder: folderMapWithYearMonth.image,
      size: 10_000_000, // 10MB
      maxCount: 1,
      allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
    },
    {
      name: 'video',
      folder: folderMapWithYearMonth.video,
      size: 100_000_000, // 100MB
      maxCount: 1,
      allowedTypes: ['video/mp4', 'video/webm', 'video/ogg'],
    },
  ),
  validation(GalleryValidations.createGalleryValidationSchema),
  GalleryControllers.createGallery,
);

// PATCH
router.patch(
  '/:id',
  auth('admin', 'super-admin'),
  file(
    {
      name: 'image',
      folder: folderMapWithYearMonth.image,
      size: 10_000_000, // 10MB
      maxCount: 1,
      allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
    },
    {
      name: 'video',
      folder: folderMapWithYearMonth.video,
      size: 100_000_000, // 100MB
      maxCount: 1,
      allowedTypes: ['video/mp4', 'video/webm', 'video/ogg'],
    },
  ),
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

