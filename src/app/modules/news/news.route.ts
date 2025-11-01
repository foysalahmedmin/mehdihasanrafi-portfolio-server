import express from 'express';
import auth from '../../middlewares/auth.middleware';
import file from '../../middlewares/file.middleware';
import validation from '../../middlewares/validation.middleware';
import * as NewsControllers from './news.controller';
import { folderMapWithYearMonth } from './news.utils';
import * as NewsValidations from './news.validation';

const router = express.Router();

// GET
router.get('/', NewsControllers.getPublicBulkNews);
router.get('/:slug', NewsControllers.getPublicNews);

// PATCH
router.patch(
  '/bulk',
  auth('admin'),
  validation(NewsValidations.updateBulkNewsValidationSchema),
  NewsControllers.updateBulkNews,
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
      name: 'images',
      folder: folderMapWithYearMonth.image,
      size: 5_000_000,
      maxCount: 4,
      allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    },
  ),
  validation(NewsValidations.updateNewsValidationSchema),
  NewsControllers.updateNews,
);

// DELETE
router.delete(
  '/bulk/permanent',
  auth('admin'),
  validation(NewsValidations.bulkNewsOperationValidationSchema),
  NewsControllers.deleteBulkNewsPermanent,
);
router.delete(
  '/:id/permanent',
  auth('admin'),
  validation(NewsValidations.newsOperationValidationSchema),
  NewsControllers.deleteNewsPermanent,
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
      name: 'images',
      folder: folderMapWithYearMonth.image,
      size: 5_000_000,
      maxCount: 4,
      allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    },
  ),
  validation(NewsValidations.createNewsValidationSchema),
  NewsControllers.createNews,
);

const NewsRoutes = router;

export default NewsRoutes;
