import dotenv from 'dotenv';
import path from 'path';

export type ExpiresIn = `${number}${'s' | 'm' | 'h' | 'd'}` | number;

dotenv.config({ path: path.join(process.cwd(), '.env') });

export default {
  node_dev: process.env.NODE_ENV as string,
  port: (process.env.PORT as string) || 5000,
  url:
    (process.env.URL as string) ||
    `http://localhost:${process.env.PORT || 5000}`,
  database_url: process.env.DATABASE_URL as string,
  front_end_url: process.env.FRONT_END_URL as string,
  bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS as string,
  default_password: process.env.DEFAULT_PASSWORD as string,
  jwt_access_secret: process.env.JWT_ACCESS_SECRET as string,
  jwt_access_secret_expires_in: process.env
    .JWT_ACCESS_SECRET_EXPIRES_IN as ExpiresIn,
  jwt_refresh_secret: process.env.JWT_REFRESH_SECRET as string,
  jwt_refresh_secret_expires_in: process.env
    .JWT_REFRESH_SECRET_EXPIRES_IN as ExpiresIn,
  jwt_reset_password_secret: process.env.JWT_RESET_PASSWORD_SECRET as string,
  jwt_reset_password_secret_expires_in: process.env
    .JWT_RESET_PASSWORD_SECRET_EXPIRES_IN as ExpiresIn,
  jwt_email_verification_secret: process.env
    .JWT_EMAIL_VERIFICATION_SECRET as string,
  jwt_email_verification_secret_expires_in: process.env
    .JWT_EMAIL_VERIFICATION_SECRET_EXPIRES_IN as ExpiresIn,
  reset_password_ui_link: process.env.RESET_PASSWORD_UI_LINK as string,
  email_verification_ui_link: process.env.EMAIL_VERIFICATION_UI_LINK as string,
  auth_user_email: process.env.AUTH_USER_EMAIL as string,
  auth_user_email_password: process.env.AUTH_USER_EMAIL_PASSWORD as string,
  cloudinary_cloud_name: process.env.CLOUDINARY_CLOUD_NAME as string,
  cloudinary_api_key: process.env.CLOUDINARY_API_KEY as string,
  cloudinary_api_secret: process.env.CLOUDINARY_API_SECRET as string,
};

// node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
// node -e "console.log(require('crypto').createHash('sha256').update('password' + 12).digest('hex'))"
