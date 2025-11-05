import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import * as NewsServices from './news.service';

export const createNews = catchAsync(async (req, res) => {
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

  const result = await NewsServices.createNews(payload);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'News created successfully',
    data: result,
  });
});

export const getPublicNews = catchAsync(async (req, res) => {
  const { slug } = req.params;

  const result = await NewsServices.getPublicNews(slug);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'News retrieved successfully',
    data: result,
  });
});

export const getPublicBulkNews = catchAsync(async (req, res) => {
  const result = await NewsServices.getPublicBulkNews(req.query);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'All News are retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

export const updateNews = catchAsync(async (req, res) => {
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
  const result = await NewsServices.updateNews(id, payload);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'News updated successfully',
    data: result,
  });
});

export const updateBulkNews = catchAsync(async (req, res) => {
  const { ids, ...payload } = req.body;
  const result = await NewsServices.updateBulkNews(ids, payload);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'All News are updated successfully',
    data: result,
  });
});

export const deleteNewsPermanent = catchAsync(async (req, res) => {
  const { id } = req.params;
  await NewsServices.deleteNewsPermanent(id);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'News permanently deleted successfully',
    data: null,
  });
});

export const deleteBulkNewsPermanent = catchAsync(async (req, res) => {
  const { ids } = req.body;
  const result = await NewsServices.deleteBulkNewsPermanent(ids);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: `${result.count} News are permanently deleted successfully`,
    data: {
      not_found_ids: result.not_found_ids,
    },
  });
});
