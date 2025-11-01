import express from 'express';
import auth from '../../middlewares/auth.middleware';
import file from '../../middlewares/file.middleware';
import validation from '../../middlewares/validation.middleware';
import * as ProjectControllers from './project.controller';
import { folderMapWithYearMonth } from './project.utils';
import * as ProjectValidations from './project.validation';

const router = express.Router();

// GET
router.get('/', ProjectControllers.getPublicBulkProjects);
router.get('/:slug', ProjectControllers.getPublicProject);

// PATCH
router.patch(
  '/bulk',
  auth('admin'),
  validation(ProjectValidations.updateBulkProjectValidationSchema),
  ProjectControllers.updateBulkProjects,
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
  validation(ProjectValidations.updateProjectValidationSchema),
  ProjectControllers.updateProject,
);

// DELETE
router.delete(
  '/bulk/permanent',
  auth('admin'),
  validation(ProjectValidations.bulkProjectOperationValidationSchema),
  ProjectControllers.deleteBulkProjectsPermanent,
);
router.delete(
  '/:id/permanent',
  auth('admin'),
  validation(ProjectValidations.projectOperationValidationSchema),
  ProjectControllers.deleteProjectPermanent,
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
  validation(ProjectValidations.createProjectValidationSchema),
  ProjectControllers.createProject,
);

const ProjectRoutes = router;

export default ProjectRoutes;

