import express from 'express';
import auth from '../../middlewares/auth.middleware';
import file from '../../middlewares/file.middleware';
import validation from '../../middlewares/validation.middleware';
import * as PublicationControllers from './publication.controller';
import { folderMapWithYearMonth } from './publication.utils';
import * as PublicationValidations from './publication.validation';

const router = express.Router();

// GET
router.get('/', PublicationControllers.getPublicBulkPublications);
router.get('/:slug', PublicationControllers.getPublicPublication);

// PATCH
router.patch(
  '/bulk',
  auth('admin'),
  validation(PublicationValidations.updateBulkPublicationValidationSchema),
  PublicationControllers.updateBulkPublications,
);
router.patch(
  '/:id',
  auth('admin'),
  file(
    {
      name: 'thumbnail',
      folder: folderMapWithYearMonth.thumbnail,
      size: 5_000_000,
      maxCount: 1,
      allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    },
    {
      name: 'pdf',
      folder: folderMapWithYearMonth.pdf,
      size: 20_000_000,
      maxCount: 1,
      allowedTypes: ['application/pdf'],
    },
    {
      name: 'images',
      folder: folderMapWithYearMonth.image,
      size: 5_000_000,
      maxCount: 4,
      allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    },
  ),
  validation(PublicationValidations.updatePublicationValidationSchema),
  PublicationControllers.updatePublication,
);

// DELETE
router.delete(
  '/bulk/permanent',
  auth('admin'),
  validation(PublicationValidations.bulkPublicationOperationValidationSchema),
  PublicationControllers.deleteBulkPublicationsPermanent,
);
router.delete(
  '/:id/permanent',
  auth('admin'),
  validation(PublicationValidations.publicationOperationValidationSchema),
  PublicationControllers.deletePublicationPermanent,
);

// POST
router.post(
  '/',
  auth('admin', 'author'),
  file(
    {
      name: 'thumbnail',
      folder: folderMapWithYearMonth.thumbnail,
      size: 5_000_000,
      maxCount: 1,
      allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    },
    {
      name: 'pdf',
      folder: folderMapWithYearMonth.pdf,
      size: 20_000_000,
      maxCount: 1,
      allowedTypes: ['application/pdf'],
    },
    {
      name: 'images',
      folder: folderMapWithYearMonth.image,
      size: 5_000_000,
      maxCount: 4,
      allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    },
  ),
  validation(PublicationValidations.createPublicationValidationSchema),
  PublicationControllers.createPublication,
);

const PublicationRoutes = router;

export default PublicationRoutes;
