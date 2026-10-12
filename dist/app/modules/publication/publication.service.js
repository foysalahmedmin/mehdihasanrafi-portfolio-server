"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBulkPublicationsPermanent = exports.deletePublicationPermanent = exports.updateBulkPublications = exports.updatePublication = exports.getPublicBulkPublications = exports.getPublicPublication = exports.createPublication = void 0;
const flattener_kit_1 = require("flattener-kit");
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../builder/AppError"));
const AppQuery_1 = __importDefault(require("../../builder/AppQuery"));
const deleteCloudinaryFiles_1 = require("../../utils/deleteCloudinaryFiles");
const publication_model_1 = require("./publication.model");
const createPublication = async (payload) => {
    const created_publication = await publication_model_1.Publication.create(payload);
    return created_publication.toObject();
};
exports.createPublication = createPublication;
const getPublicPublication = async (slug) => {
    const result = await publication_model_1.Publication.findOne({
        slug: slug,
    }).lean();
    if (!result) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Publication not found');
    }
    return result;
};
exports.getPublicPublication = getPublicPublication;
const getPublicBulkPublications = async (query) => {
    const PublicationQuery = new AppQuery_1.default(publication_model_1.Publication.find(), query)
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
        'read_time',
        'link',
    ])
        .tap((q) => q.lean());
    const result = await PublicationQuery.execute();
    return result;
};
exports.getPublicBulkPublications = getPublicBulkPublications;
const updatePublication = async (id, payload) => {
    const data = await publication_model_1.Publication.findOne({ _id: id }).lean();
    if (!data) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Publication not found');
    }
    const update = { ...payload };
    // === File cleanup using utility ===
    if (payload?.thumbnail !== undefined &&
        payload.thumbnail !== data.thumbnail &&
        data.thumbnail) {
        (0, deleteCloudinaryFiles_1.deleteCloudinaryFiles)(data.thumbnail, 'image');
        update.thumbnail = payload.thumbnail || '';
    }
    if (payload?.pdf !== undefined &&
        payload.pdf !== data.pdf &&
        data.pdf) {
        (0, deleteCloudinaryFiles_1.deleteCloudinaryFiles)(data.pdf, 'raw');
        update.pdf = payload.pdf || null;
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
    const result = await publication_model_1.Publication.findByIdAndUpdate(id, flatten, {
        new: true,
        runValidators: true,
    }).lean();
    return result;
};
exports.updatePublication = updatePublication;
const updateBulkPublications = async (ids, payload) => {
    const allPublications = await publication_model_1.Publication.find({ _id: { $in: ids } }).lean();
    const foundIds = allPublications.map((publication) => publication._id.toString());
    const notFoundIds = ids.filter((id) => !foundIds.includes(id));
    const result = await publication_model_1.Publication.updateMany({ _id: { $in: foundIds } }, { ...payload });
    return {
        count: result.modifiedCount,
        not_found_ids: notFoundIds,
    };
};
exports.updateBulkPublications = updateBulkPublications;
const deletePublicationPermanent = async (id) => {
    const publication = await publication_model_1.Publication.findById(id)
        .setOptions({ bypassDeleted: true })
        .lean();
    if (!publication) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Publication not found');
    }
    // === File cleanup using utility ===
    if (publication?.thumbnail)
        (0, deleteCloudinaryFiles_1.deleteCloudinaryFiles)(publication.thumbnail, 'image');
    if (publication?.pdf)
        (0, deleteCloudinaryFiles_1.deleteCloudinaryFiles)(publication.pdf, 'raw');
    if (publication?.images)
        (0, deleteCloudinaryFiles_1.deleteCloudinaryFiles)(publication.images, 'image');
    await publication_model_1.Publication.findByIdAndDelete(id).setOptions({ bypassDeleted: true });
};
exports.deletePublicationPermanent = deletePublicationPermanent;
const deleteBulkPublicationsPermanent = async (ids) => {
    const allPublications = await publication_model_1.Publication.find({
        _id: { $in: ids },
        is_deleted: true,
    })
        .setOptions({ bypassDeleted: true })
        .lean();
    const foundIds = allPublications.map((publication) => publication._id.toString());
    const notFoundIds = ids.filter((id) => !foundIds.includes(id));
    await publication_model_1.Publication.deleteMany({
        _id: { $in: foundIds },
        is_deleted: true,
    }).setOptions({ bypassDeleted: true });
    return {
        count: foundIds.length,
        not_found_ids: notFoundIds,
    };
};
exports.deleteBulkPublicationsPermanent = deleteBulkPublicationsPermanent;
