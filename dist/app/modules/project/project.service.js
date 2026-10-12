"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBulkProjectsPermanent = exports.deleteProjectPermanent = exports.updateBulkProjects = exports.updateProject = exports.getPublicBulkProjects = exports.getPublicProject = exports.createProject = void 0;
const flattener_kit_1 = require("flattener-kit");
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../builder/AppError"));
const AppQuery_1 = __importDefault(require("../../builder/AppQuery"));
const deleteCloudinaryFiles_1 = require("../../utils/deleteCloudinaryFiles");
const project_model_1 = require("./project.model");
const createProject = async (payload) => {
    const created_project = await project_model_1.Project.create(payload);
    return created_project.toObject();
};
exports.createProject = createProject;
const getPublicProject = async (slug) => {
    const result = await project_model_1.Project.findOne({
        slug: slug,
    }).lean();
    if (!result) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Project not found');
    }
    return result;
};
exports.getPublicProject = getPublicProject;
const getPublicBulkProjects = async (query) => {
    const ProjectQuery = new AppQuery_1.default(project_model_1.Project.find(), query)
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
        'read_time',
        'link',
    ])
        .tap((q) => q.lean());
    const result = await ProjectQuery.execute();
    return result;
};
exports.getPublicBulkProjects = getPublicBulkProjects;
const updateProject = async (id, payload) => {
    const data = await project_model_1.Project.findOne({ _id: id }).lean();
    if (!data) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Project not found');
    }
    const update = { ...payload };
    // === File cleanup using utility ===
    if (payload?.thumbnail !== undefined &&
        payload.thumbnail !== data.thumbnail &&
        data.thumbnail) {
        (0, deleteCloudinaryFiles_1.deleteCloudinaryFiles)(data.thumbnail, 'image');
        update.thumbnail = payload.thumbnail || '';
    }
    if (data.images?.length) {
        const oldImages = data.images || [];
        const newImages = payload.images || [];
        const imagesToDelete = oldImages.filter((oldImage) => !newImages.includes(oldImage));
        if (imagesToDelete.length > 0) {
            (0, deleteCloudinaryFiles_1.deleteCloudinaryFiles)(imagesToDelete, 'image');
        }
    }
    const flatten = flattener_kit_1.Flattener.flatten(update, { safe: true });
    const result = await project_model_1.Project.findByIdAndUpdate(id, flatten, {
        new: true,
        runValidators: true,
    }).lean();
    return result;
};
exports.updateProject = updateProject;
const updateBulkProjects = async (ids, payload) => {
    const allProjects = await project_model_1.Project.find({ _id: { $in: ids } }).lean();
    const foundIds = allProjects.map((project) => project._id.toString());
    const notFoundIds = ids.filter((id) => !foundIds.includes(id));
    const result = await project_model_1.Project.updateMany({ _id: { $in: foundIds } }, { ...payload });
    return {
        count: result.modifiedCount,
        not_found_ids: notFoundIds,
    };
};
exports.updateBulkProjects = updateBulkProjects;
const deleteProjectPermanent = async (id) => {
    const project = await project_model_1.Project.findById(id)
        .setOptions({ bypassDeleted: true })
        .lean();
    if (!project) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Project not found');
    }
    // === File cleanup using utility ===
    (0, deleteCloudinaryFiles_1.deleteCloudinaryFiles)(project?.thumbnail, 'image');
    (0, deleteCloudinaryFiles_1.deleteCloudinaryFiles)(project?.images, 'image');
    await project_model_1.Project.findByIdAndDelete(id).setOptions({ bypassDeleted: true });
};
exports.deleteProjectPermanent = deleteProjectPermanent;
const deleteBulkProjectsPermanent = async (ids) => {
    const allProjects = await project_model_1.Project.find({
        _id: { $in: ids },
        is_deleted: true,
    })
        .setOptions({ bypassDeleted: true })
        .lean();
    const foundIds = allProjects.map((project) => project._id.toString());
    const notFoundIds = ids.filter((id) => !foundIds.includes(id));
    await project_model_1.Project.deleteMany({
        _id: { $in: foundIds },
        is_deleted: true,
    }).setOptions({ bypassDeleted: true });
    return {
        count: foundIds.length,
        not_found_ids: notFoundIds,
    };
};
exports.deleteBulkProjectsPermanent = deleteBulkProjectsPermanent;
