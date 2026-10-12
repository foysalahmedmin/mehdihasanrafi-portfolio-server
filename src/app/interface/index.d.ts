import { JwtPayload } from 'jsonwebtoken';
import { TJwtPayload } from '../modules/auth/auth.type';

declare global {
  namespace Express {
    interface Request {
      user: JwtPayload & TJwtPayload;
      files?: Record<string, Express.Multer.File[] | Express.Multer.File>;
      file?: Express.Multer.File;
    }
  }
}
