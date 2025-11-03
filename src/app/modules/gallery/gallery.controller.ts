import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import * as GalleryServices from './gallery.service';

export const createGallery = catchAsync(async (req, res) => {
  const files = req.files as Record<string, Express.Multer.File[]>;

  const imageFile = files?.['image']?.[0] || '';
  const imageFilePath = imageFile ? imageFile.path.replace(/\\/g, '/') : '';
  const imagePath = imageFilePath
    ? imageFilePath.split('/').slice(-3).join('/')
    : '';

  const videoFile = files?.['video']?.[0] || '';
  const videoFilePath = videoFile ? videoFile.path.replace(/\\/g, '/') : '';
  const videoPath = videoFilePath
    ? videoFilePath.split('/').slice(-3).join('/')
    : '';

  const { ...rest } = req.body || {};

  const payload = {
    ...rest,
    ...(imagePath && { image: imagePath }),
    ...(videoPath && { video: videoPath }),
  };

  const result = await GalleryServices.createGallery(payload);
  sendResponse(res, {
    status: httpStatus.CREATED,
    success: true,
    message: 'Gallery item created successfully',
    data: result,
  });
});

export const getAllGallery = catchAsync(async (req, res) => {
  const result = await GalleryServices.getAllGallery(req.query);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Gallery retrieved successfully',
    data: result.data,
    meta: result.meta,
  });
});

export const getGalleryById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await GalleryServices.getGallery(id);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Gallery item retrieved successfully',
    data: result,
  });
});

export const updateGallery = catchAsync(async (req, res) => {
  const { id } = req.params;
  const files = req.files as Record<string, Express.Multer.File[]>;

  const imageFile = files['image']?.[0] || '';
  const imageFilePath = imageFile ? imageFile.path.replace(/\\/g, '/') : '';
  const imagePath = imageFilePath
    ? imageFilePath.split('/').slice(-3).join('/')
    : '';

  const videoFile = files['video']?.[0] || '';
  const videoFilePath = videoFile ? videoFile.path.replace(/\\/g, '/') : '';
  const videoPath = videoFilePath
    ? videoFilePath.split('/').slice(-3).join('/')
    : '';

  const { ...rest } = req.body || {};

  const payload: any = {
    ...rest,
    ...(imagePath && { image: imagePath, image_url: null }),
    ...(videoPath && { video: videoPath, video_url: null }),
  };

  // If setting URL, clear file path
  if (rest.image_url !== undefined && rest.image_url !== null) {
    payload.image = null;
  }
  if (rest.video_url !== undefined && rest.video_url !== null) {
    payload.video = null;
  }

  const result = await GalleryServices.updateGallery(id, payload);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Gallery item updated successfully',
    data: result,
  });
});

export const deleteGallery = catchAsync(async (req, res) => {
  const { id } = req.params;
  await GalleryServices.deleteGallery(id);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Gallery item deleted successfully',
    data: null,
  });
});

export const deleteBulkGallery = catchAsync(async (req, res) => {
  const { ids } = req.body;
  await GalleryServices.deleteBulkGallery(ids);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Gallery items deleted successfully',
    data: null,
  });
});
