import httpStatus from 'http-status';
import AppError from '../../builder/AppError';
import catchAsync from '../../utils/catchAsync';
import { deleteCloudinaryFiles } from '../../utils/deleteCloudinaryFiles';
import sendResponse from '../../utils/sendResponse';
import * as GalleryServices from './gallery.service';
import { TGalleryItemInput, TMediaType, TUpdateGallery } from './gallery.type';
import { detectMediaType, maxSizeFor } from './gallery.utils';

export const createGallery = catchAsync(async (req, res) => {
  // By this point file.middleware has already uploaded every file straight
  // to Cloudinary — `file.path` is each one's secure_url.
  const uploaded =
    ((req.files as Record<string, Express.Multer.File[]> | undefined)
      ?.files as Express.Multer.File[] | undefined) || [];
  const { caption, is_active, image_url, video_url } = req.body as {
    caption?: string;
    is_active?: boolean;
    image_url?: string;
    video_url?: string;
  };

  // Validate every uploaded file up front so a batch either fully succeeds
  // or fully fails — never partially creates items and leaves the rest as
  // orphaned Cloudinary assets.
  const fileItems: { media_type: TMediaType; url: string }[] = [];
  for (const uploadedFile of uploaded) {
    const mediaType = detectMediaType(uploadedFile.mimetype);
    if (!mediaType || uploadedFile.size > maxSizeFor(mediaType || 'image')) {
      await deleteCloudinaryFiles(
        uploaded.map((f) => f.path),
        'auto',
      );
      throw new AppError(
        httpStatus.BAD_REQUEST,
        mediaType
          ? `"${uploadedFile.originalname}" exceeds the ${mediaType} size limit`
          : `Unsupported file type: ${uploadedFile.originalname}`,
      );
    }
    fileItems.push({ media_type: mediaType, url: uploadedFile.path });
  }

  if (fileItems.length === 0 && !image_url && !video_url) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Provide at least one file, an image URL, or a video URL',
    );
  }

  let nextOrder = await GalleryServices.getNextOrder();
  const docs: TGalleryItemInput[] = fileItems.map((item) => ({
    media_type: item.media_type,
    ...(item.media_type === 'image'
      ? { image: item.url }
      : { video: item.url }),
    caption,
    is_active: is_active ?? true,
    order: nextOrder++,
  }));

  if (image_url) {
    docs.push({
      media_type: 'image',
      image_url,
      caption,
      is_active: is_active ?? true,
      order: nextOrder++,
    });
  }
  if (video_url) {
    docs.push({
      media_type: 'video',
      video_url,
      caption,
      is_active: is_active ?? true,
      order: nextOrder++,
    });
  }

  const result = await GalleryServices.createGalleryBatch(docs);

  sendResponse(res, {
    status: httpStatus.CREATED,
    success: true,
    message: `${result.length} gallery item${result.length === 1 ? '' : 's'} created successfully`,
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

export const getPublicGallery = catchAsync(async (req, res) => {
  const result = await GalleryServices.getPublicGallery(req.query);
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
  const uploaded = (
    (req.files as Record<string, Express.Multer.File[]> | undefined)
      ?.files as Express.Multer.File[] | undefined
  )?.[0];
  const { caption, is_active, order, image_url, video_url } = req.body as {
    caption?: string;
    is_active?: boolean;
    order?: number;
    image_url?: string;
    video_url?: string;
  };

  const existing = await GalleryServices.getGallery(id);

  const patch: TUpdateGallery = {};
  if (caption !== undefined) patch.caption = caption;
  if (is_active !== undefined) patch.is_active = is_active;
  if (order !== undefined) patch.order = order;

  // Only ever replace media when a genuinely new file or URL was given.
  // Anything else about this request (a caption edit, an order change, a
  // blank/untouched url field left over from the form) leaves the existing
  // image/video/image_url/video_url completely alone.
  let oldAssetToDelete: string | undefined;

  if (uploaded) {
    const detected = detectMediaType(uploaded.mimetype);
    if (detected !== existing.media_type) {
      await deleteCloudinaryFiles(uploaded.path, 'auto');
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `This item is a${existing.media_type === 'image' ? 'n image' : ' video'} — the replacement file must be too`,
      );
    }
    if (uploaded.size > maxSizeFor(detected)) {
      await deleteCloudinaryFiles(uploaded.path, 'auto');
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `"${uploaded.originalname}" exceeds the ${detected} size limit`,
      );
    }

    if (existing.media_type === 'image') {
      patch.image = uploaded.path;
      patch.image_url = null;
      if (existing.image) oldAssetToDelete = existing.image;
    } else {
      patch.video = uploaded.path;
      patch.video_url = null;
      if (existing.video) oldAssetToDelete = existing.video;
    }
  } else if (existing.media_type === 'image' && image_url) {
    patch.image_url = image_url;
    patch.image = null;
    if (existing.image) oldAssetToDelete = existing.image;
  } else if (existing.media_type === 'video' && video_url) {
    patch.video_url = video_url;
    patch.video = null;
    if (existing.video) oldAssetToDelete = existing.video;
  }

  const result = await GalleryServices.updateGallery(id, patch);

  if (oldAssetToDelete) {
    deleteCloudinaryFiles(oldAssetToDelete, existing.media_type);
  }

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
  const result = await GalleryServices.deleteBulkGallery(ids);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: `${result.count} gallery item(s) deleted successfully`,
    data: {
      not_found_ids: result.not_found_ids,
    },
  });
});
