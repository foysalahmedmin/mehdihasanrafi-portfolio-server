"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.join(process.cwd(), '.env') });
exports.default = {
    node_dev: process.env.NODE_ENV,
    port: process.env.PORT || 5000,
    url: process.env.URL ||
        `http://localhost:${process.env.PORT || 5000}`,
    database_url: process.env.DATABASE_URL,
    front_end_url: process.env.FRONT_END_URL,
    bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS,
    default_password: process.env.DEFAULT_PASSWORD,
    jwt_access_secret: process.env.JWT_ACCESS_SECRET,
    jwt_access_secret_expires_in: process.env
        .JWT_ACCESS_SECRET_EXPIRES_IN,
    jwt_refresh_secret: process.env.JWT_REFRESH_SECRET,
    jwt_refresh_secret_expires_in: process.env
        .JWT_REFRESH_SECRET_EXPIRES_IN,
    jwt_reset_password_secret: process.env.JWT_RESET_PASSWORD_SECRET,
    jwt_reset_password_secret_expires_in: process.env
        .JWT_RESET_PASSWORD_SECRET_EXPIRES_IN,
    jwt_email_verification_secret: process.env
        .JWT_EMAIL_VERIFICATION_SECRET,
    jwt_email_verification_secret_expires_in: process.env
        .JWT_EMAIL_VERIFICATION_SECRET_EXPIRES_IN,
    reset_password_ui_link: process.env.RESET_PASSWORD_UI_LINK,
    email_verification_ui_link: process.env.EMAIL_VERIFICATION_UI_LINK,
    auth_user_email: process.env.AUTH_USER_EMAIL,
    auth_user_email_password: process.env.AUTH_USER_EMAIL_PASSWORD,
    cloudinary_cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    cloudinary_api_key: process.env.CLOUDINARY_API_KEY,
    cloudinary_api_secret: process.env.CLOUDINARY_API_SECRET,
};
// node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
// node -e "console.log(require('crypto').createHash('sha256').update('password' + 12).digest('hex'))"
