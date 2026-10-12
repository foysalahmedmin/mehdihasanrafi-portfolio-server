"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailVerification = exports.emailVerificationSource = exports.resetPassword = exports.forgetPassword = exports.changePassword = exports.refreshToken = exports.signup = exports.signin = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../builder/AppError"));
const config_1 = __importDefault(require("../../config"));
const sendEmail_1 = require("../../utils/sendEmail");
const user_model_1 = require("../user/user.model");
const auth_utils_1 = require("./auth.utils");
const signin = async (payload) => {
    const user = await user_model_1.User.isUserExistByEmail(payload.email);
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'User not found!');
    }
    if (user?.is_deleted) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'User is deleted!');
    }
    if (user?.status == 'blocked') {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'User is blocked!');
    }
    if (!(await bcrypt_1.default.compare(payload?.password, user?.password))) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'Password do not matched!');
    }
    const jwtPayload = {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        ...(user?.image && { image: user?.image }),
    };
    const accessToken = (0, auth_utils_1.createToken)(jwtPayload, config_1.default.jwt_access_secret, config_1.default.jwt_access_secret_expires_in);
    const refreshToken = (0, auth_utils_1.createToken)(jwtPayload, config_1.default.jwt_refresh_secret, config_1.default.jwt_refresh_secret_expires_in);
    return {
        access_token: accessToken,
        refresh_token: refreshToken,
        info: jwtPayload,
    };
};
exports.signin = signin;
const signup = async (payload) => {
    const isExist = await user_model_1.User.isUserExistByEmail(payload.email);
    if (isExist) {
        throw new AppError_1.default(http_status_1.default.CONFLICT, 'User already exists!');
    }
    const user = await user_model_1.User.create(payload);
    if (!user) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, 'Failed to create user!');
    }
    const jwtPayload = {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        ...(user?.image && { image: user?.image }),
    };
    const accessToken = (0, auth_utils_1.createToken)(jwtPayload, config_1.default.jwt_access_secret, config_1.default.jwt_access_secret_expires_in);
    const refreshToken = (0, auth_utils_1.createToken)(jwtPayload, config_1.default.jwt_refresh_secret, config_1.default.jwt_refresh_secret_expires_in);
    return {
        access_token: accessToken,
        refresh_token: refreshToken,
        info: jwtPayload,
    };
};
exports.signup = signup;
const refreshToken = async (token) => {
    const { email, iat } = (0, auth_utils_1.verifyToken)(token, config_1.default.jwt_refresh_secret);
    if (!email || typeof iat !== 'number') {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, 'You do not have the necessary permissions to access this resource.');
    }
    const user = await user_model_1.User.isUserExistByEmail(email);
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'User not found!');
    }
    if (user?.is_deleted) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'User is deleted!');
    }
    if (user?.status == 'blocked') {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'User is blocked!');
    }
    if (user?.password_changed_at && user.isPasswordChanged(iat)) {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, 'You do not have the necessary permissions to access this resource.');
    }
    const jwtPayload = {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        ...(user?.image && { image: user?.image }),
    };
    const accessToken = (0, auth_utils_1.createToken)(jwtPayload, config_1.default.jwt_access_secret, config_1.default.jwt_access_secret_expires_in);
    return {
        access_token: accessToken,
        info: jwtPayload,
    };
};
exports.refreshToken = refreshToken;
const changePassword = async (user, payload) => {
    // `user` here is the decoded JWT payload (_id/name/email/role/image only)
    // — it never carries a password hash, so the current-password check must
    // re-fetch the real user document to compare against.
    const dbUser = await user_model_1.User.isUserExist(user._id);
    if (!dbUser) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'User not found!');
    }
    if (!(await bcrypt_1.default.compare(payload?.current_password, dbUser.password))) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'Password do not matched!');
    }
    const hashedNewPassword = await bcrypt_1.default.hash(payload.new_password, Number(config_1.default.bcrypt_salt_rounds));
    const result = await user_model_1.User.findOneAndUpdate({
        email: user.email,
        role: user.role,
    }, {
        password: hashedNewPassword,
        password_changed_at: new Date(),
    }, {
        new: true,
        runValidators: true,
    });
    return result;
};
exports.changePassword = changePassword;
const forgetPassword = async (payload) => {
    const user = await user_model_1.User.isUserExistByEmail(payload.email);
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'User not found!');
    }
    if (user?.is_deleted) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'User is deleted!');
    }
    if (user?.status == 'blocked') {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'User is blocked!');
    }
    const jwtPayload = {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
    };
    const resetToken = (0, auth_utils_1.createToken)(jwtPayload, config_1.default.jwt_reset_password_secret, config_1.default.jwt_reset_password_secret_expires_in || '10m');
    const link = `${config_1.default.reset_password_ui_link}?id=${user.email}&token=${resetToken}`;
    const content = `<a href="${link}">Click here to reset your password</a>`;
    (0, sendEmail_1.sendEmail)({
        to: user.email,
        subject: 'Mehdi Hasan Rafi - Portfolio Password Change Link',
        text: 'Reset your password within 10 minuets',
        html: content,
    });
};
exports.forgetPassword = forgetPassword;
const resetPassword = async (payload, token) => {
    const decoded = (0, auth_utils_1.verifyToken)(token, config_1.default.jwt_reset_password_secret);
    if (!decoded?.email) {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, 'You do not have the necessary permissions to access this resource.');
    }
    const { email } = decoded;
    const user = await user_model_1.User.isUserExistByEmail(email);
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'User not found!');
    }
    if (user?.is_deleted) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'User is deleted!');
    }
    if (user?.status == 'blocked') {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'User is blocked!');
    }
    const { _id } = user;
    const hashedPassword = await bcrypt_1.default.hash(payload.password, Number(config_1.default.bcrypt_salt_rounds));
    const result = await user_model_1.User.findByIdAndUpdate(_id, {
        password: hashedPassword,
        password_changed_at: new Date(),
    }, {
        new: true,
        runValidators: true,
    });
    return result;
};
exports.resetPassword = resetPassword;
const emailVerificationSource = async (user) => {
    const jwtPayload = {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
    };
    const resetToken = (0, auth_utils_1.createToken)(jwtPayload, config_1.default.jwt_email_verification_secret, config_1.default.jwt_email_verification_secret_expires_in || '10m');
    const link = `${config_1.default.email_verification_ui_link}?id=${user.email}&token=${resetToken}`;
    const content = `<a href="${link}">Click here to verify your email</a>`;
    (0, sendEmail_1.sendEmail)({
        to: user.email,
        subject: 'Mehdi Hasan Rafi - Portfolio Email Verification Link',
        text: 'Verify your email within 10 minuets',
        html: content,
    });
};
exports.emailVerificationSource = emailVerificationSource;
const emailVerification = async (token) => {
    const decoded = (0, auth_utils_1.verifyToken)(token, config_1.default.jwt_email_verification_secret);
    if (!decoded?.email) {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, 'You do not have the necessary permissions to access this resource.');
    }
    const { email } = decoded;
    const user = await user_model_1.User.isUserExistByEmail(email);
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'User not found!');
    }
    if (user?.is_deleted) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'User is deleted!');
    }
    if (user?.status == 'blocked') {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'User is blocked!');
    }
    const { _id } = user;
    const result = await user_model_1.User.findByIdAndUpdate(_id, {
        is_verified: true,
    }, {
        new: true,
        runValidators: true,
    });
    return result;
};
exports.emailVerification = emailVerification;
