import { Flattener } from 'flattener-kit';
import httpStatus from 'http-status';
import AppError from '../../builder/AppError';
import AppQuery from '../../builder/AppQuery';
import { deleteFiles } from '../../utils/deleteFiles';
import { Publication } from './publication.model';
import { TPublication } from './publication.type';

export const createPublication = async (
  payload: TPublication,
): Promise<TPublication> => {
  const created_publication = await Publication.create(payload);

  return created_publication.toObject();
};

export const getPublicPublication = async (
  slug: string,
): Promise<TPublication> => {
  const result = await Publication.findOne({
    slug: slug,
    status: 'published',
  }).lean();

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Publication not found');
  }
  return result;
};

export const getPublicBulkPublications = async (
  query: Record<string, unknown>,
): Promise<{
  data: TPublication[];
  meta: { total: number; page: number; limit: number };
}> => {
  const PublicationQuery = new AppQuery<TPublication>(Publication.find(), query)
    .search(['title', 'abstract', 'description'])
    .filter()
    .sort()
    .paginate()
    .fields([
      'title',
      'slug',
      'description',
      'abstract',
      'content',
      'thumbnail',
      'venue',
      'publisher',
      'journal',
      'volume',
      'doi',
      'author',
      'authors',
      'category',
      'tags',
      'pdf',
      'status',
      'published_at',
      'is_featured',
    ])
    .tap((q) => q.lean());

  const result = await PublicationQuery.execute();
  return result;
};

export const updatePublication = async (
  id: string,
  payload: Partial<
    Pick<
      TPublication,
      | 'title'
      | 'slug'
      | 'description'
      | 'abstract'
      | 'content'
      | 'venue'
      | 'publisher'
      | 'journal'
      | 'volume'
      | 'code'
      | 'doi'
      | 'thumbnail'
      | 'pdf'
      | 'images'
      | 'tags'
      | 'category'
      | 'author'
      | 'authors'
      | 'status'
      | 'is_featured'
      | 'published_at'
      | 'read_time'
      | 'link'
    >
  >,
): Promise<TPublication> => {
  const data = await Publication.findOne({ _id: id }).lean();
  if (!data) {
    throw new AppError(httpStatus.NOT_FOUND, 'Publication not found');
  }

  const update: Partial<TPublication> = { ...payload };

  // === File cleanup using utility ===
  if (payload?.thumbnail !== data.thumbnail && data.thumbnail) {
    deleteFiles(data.thumbnail, 'publications/images');
    update.thumbnail = payload.thumbnail || '';
  }

  if (payload?.pdf !== data.pdf && data.pdf) {
    deleteFiles(data.pdf, 'publications/pdfs');
    update.pdf = payload.pdf || null;
  }

  if (data.images?.length) {
    const oldImages = data.images || [];
    const newImages = payload.images || [];

    const imagesToDelete = oldImages.filter(
      (oldImage) => !newImages.includes(oldImage),
    );

    if (imagesToDelete.length > 0) {
      deleteFiles(imagesToDelete, 'publications/images');
    }
  }

  const flatten = Flattener.flatten(update, { safe: true });

  const result = await Publication.findByIdAndUpdate(id, flatten, {
    new: true,
    runValidators: true,
  }).lean();

  return result!;
};

export const updateBulkPublications = async (
  ids: string[],
  payload: Partial<Pick<TPublication, 'status'>>,
): Promise<{
  count: number;
  not_found_ids: string[];
}> => {
  const allPublications = await Publication.find({ _id: { $in: ids } }).lean();
  const foundIds = allPublications.map((publication) =>
    publication._id.toString(),
  );
  const notFoundIds = ids.filter((id) => !foundIds.includes(id));

  const result = await Publication.updateMany(
    { _id: { $in: foundIds } },
    { ...payload },
  );

  return {
    count: result.modifiedCount,
    not_found_ids: notFoundIds,
  };
};

export const deletePublicationPermanent = async (id: string): Promise<void> => {
  const publication = await Publication.findById(id)
    .setOptions({ bypassDeleted: true })
    .lean();
  if (!publication) {
    throw new AppError(httpStatus.NOT_FOUND, 'Publication not found');
  }

  // === File cleanup using utility ===
  if (publication?.thumbnail)
    deleteFiles(publication.thumbnail, 'publications/images');
  if (publication?.pdf) deleteFiles(publication.pdf, 'publications/pdfs');
  if (publication?.images)
    deleteFiles(publication.images, 'publications/images');

  await Publication.findByIdAndDelete(id).setOptions({ bypassDeleted: true });
};

export const deleteBulkPublicationsPermanent = async (
  ids: string[],
): Promise<{
  count: number;
  not_found_ids: string[];
}> => {
  const allPublications = await Publication.find({
    _id: { $in: ids },
    is_deleted: true,
  })
    .setOptions({ bypassDeleted: true })
    .lean();
  const foundIds = allPublications.map((publication) =>
    publication._id.toString(),
  );
  const notFoundIds = ids.filter((id) => !foundIds.includes(id));

  await Publication.deleteMany({
    _id: { $in: foundIds },
    is_deleted: true,
  }).setOptions({ bypassDeleted: true });

  return {
    count: foundIds.length,
    not_found_ids: notFoundIds,
  };
};
