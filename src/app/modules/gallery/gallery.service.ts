import httpStatus from 'http-status';
import AppError from '../../builder/AppError';
import AppQuery from '../../builder/AppQuery';
import { deleteFiles } from '../../utils/deleteFiles';
import { Gallery } from './gallery.model';
import { TCreateGallery, TGallery, TUpdateGallery } from './gallery.type';

export const createGallery = async (
  payload: TCreateGallery,
): Promise<TGallery> => {
  const created_gallery = await Gallery.create(payload);
  return created_gallery.toObject();
};

export const getPublicGallery = async (
  query: Record<string, unknown>,
): Promise<{
  data: TGallery[];
  meta: { total: number; page: number; limit: number };
}> => {
  const GalleryQuery = new AppQuery<TGallery>(
    Gallery.find({ is_active: true }),
    query,
  )
    .search(['caption'])
    .filter()
    .sort()
    .paginate()
    .fields([
      'caption',
      'media_type',
      'image_url',
      'image',
      'video_url',
      'video',
      'order',
      'is_active',
      'created_at',
      'updated_at',
    ])
    .tap((q) => q.lean());

  const result = await GalleryQuery.execute();

  return result;
};

export const getAllGallery = async (
  query: Record<string, unknown>,
): Promise<{
  data: TGallery[];
  meta: { total: number; page: number; limit: number };
}> => {
  const GalleryQuery = new AppQuery<TGallery>(Gallery.find(), query)
    .search(['caption'])
    .filter()
    .sort()
    .paginate()
    .fields([
      'caption',
      'media_type',
      'image_url',
      'image',
      'video_url',
      'video',
      'order',
      'is_active',
      'created_at',
      'updated_at',
    ])
    .tap((q) => q.lean());

  const result = await GalleryQuery.execute();

  return result;
};

export const getGallery = async (id: string): Promise<TGallery> => {
  const result = await Gallery.findById(id).lean();

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Gallery item not found');
  }

  return result;
};

export const updateGallery = async (
  id: string,
  payload: TUpdateGallery,
): Promise<TGallery> => {
  const result = await Gallery.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  }).lean();

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Gallery item not found');
  }

  return result;
};

export const deleteGallery = async (id: string): Promise<void> => {
  const gallery = await Gallery.findById(id);

  if (!gallery) {
    throw new AppError(httpStatus.NOT_FOUND, 'Gallery item not found');
  }

  // Delete associated files
  const filesToDelete: string[] = [];
  if (gallery.image) {
    filesToDelete.push(gallery.image);
  }
  if (gallery.video) {
    filesToDelete.push(gallery.video);
  }

  if (filesToDelete.length > 0) {
    await deleteFiles(filesToDelete);
  }

  await Gallery.findByIdAndDelete(id);
};

export const deleteBulkGallery = async (ids: string[]): Promise<void> => {
  const galleries = await Gallery.find({ _id: { $in: ids } });

  // Delete associated files
  const filesToDelete: string[] = [];
  galleries.forEach((gallery) => {
    if (gallery.image) {
      filesToDelete.push(gallery.image);
    }
    if (gallery.video) {
      filesToDelete.push(gallery.video);
    }
  });

  if (filesToDelete.length > 0) {
    await deleteFiles(filesToDelete);
  }

  await Gallery.deleteMany({ _id: { $in: ids } });
};
