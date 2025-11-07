import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import * as ProjectServices from './project.service';

export const createProject = catchAsync(async (req, res) => {
  // Multer files type casting
  const files = req.files as Record<string, Express.Multer.File[]>;

  // Thumbnail filename
  const thumbnailFile = files['thumbnail']?.[0] || '';
  const thumbnailFilePath = thumbnailFile
    ? thumbnailFile.path.replace(/\\/g, '/')
    : '';
  const thumbnailPath = thumbnailFilePath
    ? thumbnailFilePath.split('/').slice(-3).join('/')
    : '';

  // Multiple images filenames
  const imagesFiles = files['images'] || [];
  const imagesPaths = imagesFiles?.map((f) => {
    const filePath = f?.path?.replace(/\\/g, '/');
    return filePath.split('/').slice(-3).join('/');
  });

  const { ...rest } = req.body || {};

  const payload = {
    ...rest,
    ...(thumbnailPath && { thumbnail: thumbnailPath }),
    ...(imagesPaths?.length > 0 && { images: imagesPaths }),
  };

  const result = await ProjectServices.createProject(payload);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Project created successfully',
    data: result,
  });
});

export const getPublicProject = catchAsync(async (req, res) => {
  const { slug } = req.params;
  const result = await ProjectServices.getPublicProject(slug);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Project retrieved successfully',
    data: result,
  });
});

export const getPublicBulkProjects = catchAsync(async (req, res) => {
  const result = await ProjectServices.getPublicBulkProjects(req.query);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'All Projects are retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

export const updateProject = catchAsync(async (req, res) => {
  // Multer files type casting
  const files = req.files as Record<string, Express.Multer.File[]>;

  // Thumbnail filename
  const thumbnailFile = files['thumbnail']?.[0] || '';
  const thumbnailFilePath = thumbnailFile
    ? thumbnailFile.path.replace(/\\/g, '/')
    : '';
  const thumbnailPath = thumbnailFilePath
    ? thumbnailFilePath.split('/').slice(-3).join('/')
    : '';

  // Multiple images filenames
  const imagesFiles = files['images'] || [];
  const imagesPaths = imagesFiles?.map((f) => {
    const filePath = f?.path?.replace(/\\/g, '/');
    return filePath.split('/').slice(-3).join('/');
  });

  const { ...rest } = req.body || {};

  const payload = {
    ...rest,
    ...(thumbnailFile && { thumbnail: thumbnailPath }),
    ...(imagesPaths?.length > 0 && { images: imagesPaths }),
  };

  const { id } = req.params;
  const result = await ProjectServices.updateProject(id, payload);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Project updated successfully',
    data: result,
  });
});

export const updateBulkProjects = catchAsync(async (req, res) => {
  const { ids, ...payload } = req.body;
  const result = await ProjectServices.updateBulkProjects(ids, payload);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'All Projects are updated successfully',
    data: result,
  });
});

export const deleteProjectPermanent = catchAsync(async (req, res) => {
  const { id } = req.params;
  await ProjectServices.deleteProjectPermanent(id);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Project permanently deleted successfully',
    data: null,
  });
});

export const deleteBulkProjectsPermanent = catchAsync(async (req, res) => {
  const { ids } = req.body;
  const result = await ProjectServices.deleteBulkProjectsPermanent(ids);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: `${result.count} Projects are permanently deleted successfully`,
    data: {
      not_found_ids: result.not_found_ids,
    },
  });
});
