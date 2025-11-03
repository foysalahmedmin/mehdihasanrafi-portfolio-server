import { Flattener } from 'flattener-kit';
import httpStatus from 'http-status';
import AppError from '../../builder/AppError';
import AppQuery from '../../builder/AppQuery';
import { deleteFiles } from '../../utils/deleteFiles';
import { Project } from './project.model';
import { TProject } from './project.type';

export const createProject = async (payload: TProject): Promise<TProject> => {
  const created_project = await Project.create(payload);

  return created_project.toObject();
};

export const getPublicProject = async (slug: string): Promise<TProject> => {
  const result = await Project.findOne({
    slug: slug,
    status: 'published',
  }).lean();

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Project not found');
  }
  return result;
};

export const getPublicBulkProjects = async (
  query: Record<string, unknown>,
): Promise<{
  data: TProject[];
  meta: { total: number; page: number; limit: number };
}> => {
  const ProjectQuery = new AppQuery<TProject>(Project.find(), query)
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
      'author',
      'category',
      'tags',
      'status',
      'published_at',
      'is_featured',
    ])
    .tap((q) => q.lean());

  const result = await ProjectQuery.execute();
  return result;
};

export const updateProject = async (
  id: string,
  payload: Partial<
    Pick<
      TProject,
      | 'title'
      | 'slug'
      | 'description'
      | 'content'
      | 'thumbnail'
      | 'images'
      | 'tags'
      | 'category'
      | 'author'
      | 'status'
      | 'is_featured'
      | 'published_at'
      | 'read_time'
      | 'link'
    >
  >,
): Promise<TProject> => {
  const data = await Project.findOne({ _id: id }).lean();
  if (!data) {
    throw new AppError(httpStatus.NOT_FOUND, 'Project not found');
  }

  const update: Partial<TProject> = { ...payload };

  // === File cleanup using utility ===
  if (payload?.thumbnail !== data.thumbnail && data.thumbnail) {
    deleteFiles(data.thumbnail, 'projects/images');
    update.thumbnail = payload.thumbnail || '';
  }

  if (data.images?.length) {
    const oldImages = data.images || [];
    const newImages = payload.images || [];

    const imagesToDelete = oldImages.filter(
      (oldImage) => !newImages.includes(oldImage),
    );

    if (imagesToDelete.length > 0) {
      deleteFiles(imagesToDelete, 'projects/images');
    }
  }

  const flatten = Flattener.flatten(update, { safe: true });

  const result = await Project.findByIdAndUpdate(id, flatten, {
    new: true,
    runValidators: true,
  }).lean();

  return result!;
};

export const updateBulkProjects = async (
  ids: string[],
  payload: Partial<Pick<TProject, 'status'>>,
): Promise<{
  count: number;
  not_found_ids: string[];
}> => {
  const allProjects = await Project.find({ _id: { $in: ids } }).lean();
  const foundIds = allProjects.map((project) => project._id.toString());
  const notFoundIds = ids.filter((id) => !foundIds.includes(id));

  const result = await Project.updateMany(
    { _id: { $in: foundIds } },
    { ...payload },
  );

  return {
    count: result.modifiedCount,
    not_found_ids: notFoundIds,
  };
};

export const deleteProjectPermanent = async (id: string): Promise<void> => {
  const project = await Project.findById(id)
    .setOptions({ bypassDeleted: true })
    .lean();
  if (!project) {
    throw new AppError(httpStatus.NOT_FOUND, 'Project not found');
  }

  // === File cleanup using utility ===
  deleteFiles(project?.thumbnail, 'projects/images');
  deleteFiles(project?.images, 'projects/images');

  await Project.findByIdAndDelete(id).setOptions({ bypassDeleted: true });
};

export const deleteBulkProjectsPermanent = async (
  ids: string[],
): Promise<{
  count: number;
  not_found_ids: string[];
}> => {
  const allProjects = await Project.find({
    _id: { $in: ids },
    is_deleted: true,
  })
    .setOptions({ bypassDeleted: true })
    .lean();
  const foundIds = allProjects.map((project) => project._id.toString());
  const notFoundIds = ids.filter((id) => !foundIds.includes(id));

  await Project.deleteMany({
    _id: { $in: foundIds },
    is_deleted: true,
  }).setOptions({ bypassDeleted: true });

  return {
    count: foundIds.length,
    not_found_ids: notFoundIds,
  };
};
