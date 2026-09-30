import httpStatus from 'http-status';
import AppError from '../../builder/AppError';
import AppQuery from '../../builder/AppQuery';
import { deleteFiles } from '../../utils/deleteFiles';
import { folderForStoredPath } from './gallery.utils';
import { Gallery } from './gallery.model';
import { TGallery, TGalleryItemInput, TUpdateGallery } from './gallery.type';

const GALLERY_FIELDS: (keyof TGallery)[] = [
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
];

// Creates every item of a batch (one document per uploaded file, plus at
// most one for an image_url and one for a video_url) in a single insert.
export const createGalleryBatch = async (
  items: TGalleryItemInput[],
): Promise<TGallery[]> => {
  const created = await Gallery.insertMany(items);
  return created.map((doc) => doc.toObject());
};

// The next free `order` value, so a newly created batch is appended after
// whatever already exists instead of colliding at 0.
export const getNextOrder = async (): Promise<number> => {
  const top = await Gallery.findOne().sort('-order').select('order').lean();
  return (top?.order ?? -1) + 1;
};

// Admin listing — every item regardless of active status, for management.
export const getAllGallery = async (
  query: Record<string, unknown>,
): Promise<{
  data: TGallery[];
  meta: { total: number; page: number; limit: number };
}> => {
  const mergedQuery = { sort: 'order', ...query };
  const GalleryQuery = new AppQuery<TGallery>(Gallery.find(), mergedQuery)
    .search(['caption'])
    .filter(['media_type', 'is_active'])
    .sort(['order'])
    .paginate()
    .fields(GALLERY_FIELDS)
    .tap((q) => q.lean());

  return GalleryQuery.execute();
};

// Public listing — only active items, ordered the way the admin arranged
// them (ascending `order`, the field the admin UI actually exposes).
export const getPublicGallery = async (
  query: Record<string, unknown>,
): Promise<{
  data: TGallery[];
  meta: { total: number; page: number; limit: number };
}> => {
  const mergedQuery = { sort: 'order', ...query };
  const GalleryQuery = new AppQuery<TGallery>(
    Gallery.find({ is_active: true }),
    mergedQuery,
  )
    .search(['caption'])
    .filter(['media_type'])
    .sort(['order'])
    .paginate()
    .fields(GALLERY_FIELDS)
    .tap((q) => q.lean());

  return GalleryQuery.execute();
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
  const gallery = await Gallery.findById(id).lean();

  if (!gallery) {
    throw new AppError(httpStatus.NOT_FOUND, 'Gallery item not found');
  }

  if (gallery.image) {
    deleteFiles(gallery.image, folderForStoredPath('image'));
  }
  if (gallery.video) {
    deleteFiles(gallery.video, folderForStoredPath('video'));
  }

  await Gallery.findByIdAndDelete(id);
};

export const deleteBulkGallery = async (
  ids: string[],
): Promise<{ count: number; not_found_ids: string[] }> => {
  const galleries = await Gallery.find({ _id: { $in: ids } }).lean();
  const foundIds = galleries.map((g) => g._id.toString());
  const notFoundIds = ids.filter((id) => !foundIds.includes(id));

  const images = galleries.filter((g) => g.image).map((g) => g.image!);
  const videos = galleries.filter((g) => g.video).map((g) => g.video!);

  if (images.length) deleteFiles(images, folderForStoredPath('image'));
  if (videos.length) deleteFiles(videos, folderForStoredPath('video'));

  await Gallery.deleteMany({ _id: { $in: foundIds } });

  return { count: foundIds.length, not_found_ids: notFoundIds };
};
