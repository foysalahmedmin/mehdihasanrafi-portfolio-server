import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import * as PublicationServices from './publication.service';

export const createPublication = catchAsync(async (req, res) => {
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

  // PDF filename
  const pdfFile = files['pdf']?.[0] || '';
  const pdfFilePath = pdfFile ? pdfFile.path.replace(/\\/g, '/') : '';
  const pdfPath = pdfFilePath
    ? pdfFilePath.split('/').slice(-3).join('/')
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
    ...(pdfPath && { pdf: pdfPath }),
    ...(imagesPaths?.length > 0 && { images: imagesPaths }),
  };

  const result = await PublicationServices.createPublication(payload);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Publication created successfully',
    data: result,
  });
});

export const getPublicPublication = catchAsync(async (req, res) => {
  const { slug } = req.params;
  const result = await PublicationServices.getPublicPublication(slug);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Publication retrieved successfully',
    data: result,
  });
});

export const getPublicBulkPublications = catchAsync(async (req, res) => {
  const result = await PublicationServices.getPublicBulkPublications(req.query);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'All Publications are retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

export const updatePublication = catchAsync(async (req, res) => {
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

  // PDF filename
  const pdfFile = files['pdf']?.[0] || '';
  const pdfFilePath = pdfFile ? pdfFile.path.replace(/\\/g, '/') : '';
  const pdfPath = pdfFilePath
    ? pdfFilePath.split('/').slice(-3).join('/')
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
    ...(pdfFile && { pdf: pdfPath }),
    ...(imagesPaths?.length > 0 && { images: imagesPaths }),
  };

  const { id } = req.params;
  const result = await PublicationServices.updatePublication(id, payload);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Publication updated successfully',
    data: result,
  });
});

export const updateBulkPublications = catchAsync(async (req, res) => {
  const { ids, ...payload } = req.body;
  const result = await PublicationServices.updateBulkPublications(ids, payload);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'All Publications are updated successfully',
    data: result,
  });
});

export const deletePublicationPermanent = catchAsync(async (req, res) => {
  const { id } = req.params;
  await PublicationServices.deletePublicationPermanent(id);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Publication permanently deleted successfully',
    data: null,
  });
});

export const deleteBulkPublicationsPermanent = catchAsync(async (req, res) => {
  const { ids } = req.body;
  const result =
    await PublicationServices.deleteBulkPublicationsPermanent(ids);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: `${result.count} Publications are permanently deleted successfully`,
    data: {
      not_found_ids: result.not_found_ids,
    },
  });
});

