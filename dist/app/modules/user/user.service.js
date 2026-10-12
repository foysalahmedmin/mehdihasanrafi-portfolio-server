"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.restoreUsers = exports.restoreUser = exports.deleteUsersPermanent = exports.deleteUsers = exports.deleteUserPermanent = exports.deleteUser = exports.updateUsers = exports.updateUser = exports.updateSelf = exports.getUsers = exports.getWritersUsers = exports.getUser = exports.getSelf = void 0;
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../builder/AppError"));
const AppQuery_1 = __importDefault(require("../../builder/AppQuery"));
const deleteCloudinaryFiles_1 = require("../../utils/deleteCloudinaryFiles");
const user_model_1 = require("./user.model");
const getSelf = async (user) => {
    const result = await user_model_1.User.findById(user._id).lean();
    if (!result) {
        throw new AppError_1.default(404, 'User not found');
    }
    return result;
};
exports.getSelf = getSelf;
const getUser = async (id) => {
    const result = await user_model_1.User.findById(id).lean();
    if (!result) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'User not found');
    }
    return result;
};
exports.getUser = getUser;
const getWritersUsers = async (query) => {
    const userQuery = new AppQuery_1.default(user_model_1.User.find({ role: { $in: ['admin', 'author'] } }), query)
        .search(['name', 'email'])
        .filter()
        .sort()
        .paginate()
        .fields()
        .tap((q) => q.lean());
    const result = await userQuery.execute();
    return result;
};
exports.getWritersUsers = getWritersUsers;
const getUsers = async (query) => {
    const userQuery = new AppQuery_1.default(user_model_1.User.find(), query)
        .search(['name', 'email', 'image'])
        .filter()
        .sort()
        .paginate()
        .fields()
        .tap((q) => q.lean());
    const result = await userQuery.execute();
    return result;
};
exports.getUsers = getUsers;
const updateSelf = async (user, payload) => {
    const data = await user_model_1.User.findById(user._id);
    if (!data) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'User not found');
    }
    if (payload.email && data.email !== payload.email) {
        const emailExists = await user_model_1.User.findOne({ email: payload.email }).lean();
        if (emailExists) {
            throw new AppError_1.default(http_status_1.default.CONFLICT, 'Email already exists');
        }
    }
    if (payload?.image !== undefined &&
        payload.image !== data.image &&
        data.image) {
        (0, deleteCloudinaryFiles_1.deleteCloudinaryFiles)(data.image, 'image');
        payload.image = payload.image || '';
    }
    const result = await user_model_1.User.findByIdAndUpdate(user._id, payload, {
        new: true,
        runValidators: true,
    });
    return result;
};
exports.updateSelf = updateSelf;
const updateUser = async (id, payload) => {
    const data = await user_model_1.User.findById(id);
    if (!data) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'User not found');
    }
    const updatedUser = await user_model_1.User.findByIdAndUpdate(id, payload, {
        new: true,
        runValidators: true,
    });
    return updatedUser;
};
exports.updateUser = updateUser;
const updateUsers = async (ids, payload) => {
    const users = await user_model_1.User.find({ _id: { $in: ids } }).lean();
    const foundIds = users.map((user) => user._id.toString());
    const notFoundIds = ids.filter((id) => !foundIds.includes(id));
    const result = await user_model_1.User.updateMany({ _id: { $in: foundIds } }, { ...payload });
    return {
        count: result.modifiedCount,
        not_found_ids: notFoundIds,
    };
};
exports.updateUsers = updateUsers;
const deleteUser = async (id) => {
    const user = await user_model_1.User.findById(id);
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'User not found');
    }
    await user.softDelete();
};
exports.deleteUser = deleteUser;
const deleteUserPermanent = async (id) => {
    const user = await user_model_1.User.findById(id).setOptions({ bypassDeleted: true });
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'User not found');
    }
    await user_model_1.User.findByIdAndDelete(id);
};
exports.deleteUserPermanent = deleteUserPermanent;
const deleteUsers = async (ids) => {
    const users = await user_model_1.User.find({ _id: { $in: ids } }).lean();
    const foundIds = users.map((user) => user._id.toString());
    const notFoundIds = ids.filter((id) => !foundIds.includes(id));
    await user_model_1.User.updateMany({ _id: { $in: foundIds } }, { is_deleted: true });
    return {
        count: foundIds.length,
        not_found_ids: notFoundIds,
    };
};
exports.deleteUsers = deleteUsers;
const deleteUsersPermanent = async (ids) => {
    const users = await user_model_1.User.find({ _id: { $in: ids } }).lean();
    const foundIds = users.map((user) => user._id.toString());
    const notFoundIds = ids.filter((id) => !foundIds.includes(id));
    await user_model_1.User.deleteMany({ _id: { $in: foundIds } }).setOptions({
        bypassDeleted: true,
    });
    return {
        count: foundIds.length,
        not_found_ids: notFoundIds,
    };
};
exports.deleteUsersPermanent = deleteUsersPermanent;
const restoreUser = async (id) => {
    const user = await user_model_1.User.findOneAndUpdate({ _id: id, is_deleted: true }, { is_deleted: false }, { new: true });
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'User not found or not deleted');
    }
    return user;
};
exports.restoreUser = restoreUser;
const restoreUsers = async (ids) => {
    const result = await user_model_1.User.updateMany({ _id: { $in: ids }, is_deleted: true }, { is_deleted: false });
    const restoredUsers = await user_model_1.User.find({ _id: { $in: ids } }).lean();
    const restoredIds = restoredUsers.map((user) => user._id.toString());
    const notFoundIds = ids.filter((id) => !restoredIds.includes(id));
    return {
        count: result.modifiedCount,
        not_found_ids: notFoundIds,
    };
};
exports.restoreUsers = restoreUsers;
