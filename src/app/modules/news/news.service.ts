import { Flattener } from 'flattener-kit';
import httpStatus from 'http-status';
import AppError from '../../builder/AppError';
import AppQuery from '../../builder/AppQuery';
import { deleteFiles } from '../../utils/deleteFiles';
import { News } from './news.model';
import { TNews } from './news.type';

export const createNews = async (payload: TNews): Promise<TNews> => {
  const created_news = await News.create(payload);

  return created_news.toObject();
};

export const getPublicNews = async (slug: string): Promise<TNews> => {
  const result = await News.findOne({ slug: slug }).lean();

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'News not found');
  }
  return result;
};

export const getPublicBulkNews = async (
  query: Record<string, unknown>,
): Promise<{
  data: TNews[];
  meta: { total: number; page: number; limit: number };
}> => {
  const NewsQuery = new AppQuery<TNews>(News.find(), query)
    .search(['title', 'description'])
    .filter()
    .sort()
    .paginate()
    .fields([
      'title',
      'slug',
      'description',
      'content',
      'thumbnail',
      'video',
      'youtube',
      'author',
      'category',
      'tags',
      'status',
      'published_at',
      'is_featured',
      'read_time',
      'link',
    ])
    .tap((q) => q.lean());

  const result = await NewsQuery.execute();
  return result;
};

export const updateNews = async (
  id: string,
  payload: Partial<
    Pick<
      TNews,
      | 'title'
      | 'slug'
      | 'description'
      | 'content'
      | 'thumbnail'
      | 'images'
      | 'youtube'
      | 'tags'
      | 'category'
      | 'author'
      | 'status'
      | 'is_featured'
      | 'published_at'
    >
  >,
): Promise<TNews> => {
  const data = await News.findOne({ _id: id }).lean();
  if (!data) {
    throw new AppError(httpStatus.NOT_FOUND, 'News not found');
  }

  const update: Partial<TNews> = { ...payload };

  // === File cleanup using utility ===
  if (payload?.thumbnail !== data.thumbnail && data.thumbnail) {
    deleteFiles(data.thumbnail, 'news/images');
    update.thumbnail = payload.thumbnail || '';
  }

  if (data.images?.length) {
    const oldImages = data.images || [];
    const newImages = payload.images || [];

    const imagesToDelete = oldImages.filter(
      (oldImage) => !newImages.includes(oldImage),
    );

    if (imagesToDelete.length > 0) {
      deleteFiles(imagesToDelete, 'news/images');
    }
  }

  const flatten = Flattener.flatten(update, { safe: true });

  const result = await News.findByIdAndUpdate(id, flatten, {
    new: true,
    runValidators: true,
  }).lean();

  return result!;
};

export const updateBulkNews = async (
  ids: string[],
  payload: Partial<Pick<TNews, 'status'>>,
): Promise<{
  count: number;
  not_found_ids: string[];
}> => {
  const allNews = await News.find({ _id: { $in: ids } }).lean();
  const foundIds = allNews.map((news) => news._id.toString());
  const notFoundIds = ids.filter((id) => !foundIds.includes(id));

  const result = await News.updateMany(
    { _id: { $in: foundIds } },
    { ...payload },
  );

  return {
    count: result.modifiedCount,
    not_found_ids: notFoundIds,
  };
};

export const deleteNewsPermanent = async (id: string): Promise<void> => {
  const news = await News.findById(id)
    .setOptions({ bypassDeleted: true })
    .lean();
  if (!news) {
    throw new AppError(httpStatus.NOT_FOUND, 'News not found');
  }

  // === File cleanup using utility ===
  deleteFiles(news?.thumbnail, 'news/images');
  deleteFiles(news?.images, 'news/images');

  await News.findByIdAndDelete(id).setOptions({ bypassDeleted: true });
};

export const deleteBulkNewsPermanent = async (
  ids: string[],
): Promise<{
  count: number;
  not_found_ids: string[];
}> => {
  const allNews = await News.find({
    _id: { $in: ids },
    is_deleted: true,
  })
    .setOptions({ bypassDeleted: true })
    .lean();
  const foundIds = allNews.map((news) => news._id.toString());
  const notFoundIds = ids.filter((id) => !foundIds.includes(id));

  await News.deleteMany({
    _id: { $in: foundIds },
    is_deleted: true,
  }).setOptions({ bypassDeleted: true });

  return {
    count: foundIds.length,
    not_found_ids: notFoundIds,
  };
};
