"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBulkNewsPermanent = exports.deleteNewsPermanent = exports.updateBulkNews = exports.updateNews = exports.getPublicBulkNews = exports.getPublicNews = exports.createNews = void 0;
const flattener_kit_1 = require("flattener-kit");
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../builder/AppError"));
const AppQuery_1 = __importDefault(require("../../builder/AppQuery"));
const deleteCloudinaryFiles_1 = require("../../utils/deleteCloudinaryFiles");
const news_model_1 = require("./news.model");
const createNews = async (payload) => {
    const created_news = await news_model_1.News.create(payload);
    return created_news.toObject();
};
exports.createNews = createNews;
const getPublicNews = async (slug) => {
    const result = await news_model_1.News.findOne({ slug: slug }).lean();
    if (!result) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'News not found');
    }
    return result;
};
exports.getPublicNews = getPublicNews;
const getPublicBulkNews = async (query) => {
    const NewsQuery = new AppQuery_1.default(news_model_1.News.find(), query)
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
exports.getPublicBulkNews = getPublicBulkNews;
const updateNews = async (id, payload) => {
    const data = await news_model_1.News.findOne({ _id: id }).lean();
    if (!data) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'News not found');
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
    const result = await news_model_1.News.findByIdAndUpdate(id, flatten, {
        new: true,
        runValidators: true,
    }).lean();
    return result;
};
exports.updateNews = updateNews;
const updateBulkNews = async (ids, payload) => {
    const allNews = await news_model_1.News.find({ _id: { $in: ids } }).lean();
    const foundIds = allNews.map((news) => news._id.toString());
    const notFoundIds = ids.filter((id) => !foundIds.includes(id));
    const result = await news_model_1.News.updateMany({ _id: { $in: foundIds } }, { ...payload });
    return {
        count: result.modifiedCount,
        not_found_ids: notFoundIds,
    };
};
exports.updateBulkNews = updateBulkNews;
const deleteNewsPermanent = async (id) => {
    const news = await news_model_1.News.findById(id)
        .setOptions({ bypassDeleted: true })
        .lean();
    if (!news) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'News not found');
    }
    // === File cleanup using utility ===
    (0, deleteCloudinaryFiles_1.deleteCloudinaryFiles)(news?.thumbnail, 'image');
    (0, deleteCloudinaryFiles_1.deleteCloudinaryFiles)(news?.images, 'image');
    await news_model_1.News.findByIdAndDelete(id).setOptions({ bypassDeleted: true });
};
exports.deleteNewsPermanent = deleteNewsPermanent;
const deleteBulkNewsPermanent = async (ids) => {
    const allNews = await news_model_1.News.find({
        _id: { $in: ids },
        is_deleted: true,
    })
        .setOptions({ bypassDeleted: true })
        .lean();
    const foundIds = allNews.map((news) => news._id.toString());
    const notFoundIds = ids.filter((id) => !foundIds.includes(id));
    await news_model_1.News.deleteMany({
        _id: { $in: foundIds },
        is_deleted: true,
    }).setOptions({ bypassDeleted: true });
    return {
        count: foundIds.length,
        not_found_ids: notFoundIds,
    };
};
exports.deleteBulkNewsPermanent = deleteBulkNewsPermanent;
