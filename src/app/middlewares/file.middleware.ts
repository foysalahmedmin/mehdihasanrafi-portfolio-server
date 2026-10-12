import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import multer, { FileFilterCallback } from 'multer';
import cloudinary from '../config/cloudinary';
import AppError from '../builder/AppError';
import catchAsync from '../utils/catchAsync';

export type TCloudinaryResourceType = 'image' | 'video' | 'raw' | 'auto';

type TFile = {
  name: string;
  // Cloudinary folder this field's files are uploaded into, e.g. "news/images".
  folder: string;
  resourceType?: TCloudinaryResourceType; // default 'auto'
  size?: number;
  maxCount?: number;
  minCount?: number;
  allowedTypes?: string[];
};

// Uploads are held in memory (never written to disk — the only option that
// works on a serverless host like Vercel, whose filesystem is read-only /
// ephemeral) and streamed straight to Cloudinary.
const storage = multer.memoryStorage();

const file = (...files: TFile[]) => {
  const configByField = new Map(files.map((f) => [f.name, f]));

  const globalMaxSize = Math.max(...files.map((f) => f.size || 5_000_000));

  const fileFilter = (
    _req: Request,
    uploadedFile: Express.Multer.File,
    cb: FileFilterCallback,
  ) => {
    const config = configByField.get(uploadedFile.fieldname);
    if (!config) {
      return cb(
        new AppError(
          httpStatus.BAD_REQUEST,
          `Unexpected field "${uploadedFile.fieldname}"`,
        ),
      );
    }

    if (
      config.allowedTypes &&
      !config.allowedTypes.includes(uploadedFile.mimetype)
    ) {
      return cb(
        new AppError(
          httpStatus.BAD_REQUEST,
          `Invalid file type for field "${uploadedFile.fieldname}"`,
        ),
      );
    }

    cb(null, true);
  };

  const upload = multer({
    storage,
    limits: { fileSize: globalMaxSize },
    fileFilter,
  }).fields(
    files.map((f) => ({
      name: f.name,
      maxCount: f.maxCount || 1,
    })),
  );

  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    upload(req, res, async (err: any) => {
      if (err) {
        return next(
          new AppError(
            httpStatus.BAD_REQUEST,
            err.message || 'File upload error',
          ),
        );
      }

      try {
        const uploadedFiles = req.files as
          | Record<string, Express.Multer.File[]>
          | undefined;

        // Enforce true per-field max size — multer's `limits.fileSize` is a
        // single ceiling shared by every field, so a smaller per-field
        // `size` (e.g. 10MB images next to 100MB videos) isn't actually
        // enforced by multer itself.
        if (uploadedFiles) {
          for (const config of files) {
            if (!config.size) continue;
            for (const uploadedFile of uploadedFiles[config.name] || []) {
              if (uploadedFile.size > config.size) {
                throw new AppError(
                  httpStatus.BAD_REQUEST,
                  `"${uploadedFile.originalname}" exceeds the maximum size for field "${config.name}"`,
                );
              }
            }
          }
        }

        const missing = files.filter((f) => {
          const uploaded = uploadedFiles?.[f.name];
          return f.minCount && (!uploaded || uploaded.length < f.minCount);
        });
        if (missing.length) {
          const fields = missing.map((f) => `"${f.name}"`).join(', ');
          throw new AppError(
            httpStatus.BAD_REQUEST,
            `At least ${missing[0].minCount} file(s) required for: ${fields}`,
          );
        }

        // Upload every received file to Cloudinary. The result is written
        // back onto the same Multer file object so controllers barely
        // change: `file.path` becomes the full Cloudinary URL (in place of
        // a local disk path) and `file.filename` becomes the Cloudinary
        // `public_id` (in place of a local filename) — used later to delete
        // the asset.
        if (uploadedFiles) {
          const uploadTasks: Promise<void>[] = [];
          for (const config of files) {
            for (const uploadedFile of uploadedFiles[config.name] || []) {
              uploadTasks.push(
                (async () => {
                  const dataUri = `data:${uploadedFile.mimetype};base64,${uploadedFile.buffer.toString('base64')}`;
                  const result = await cloudinary.uploader.upload(dataUri, {
                    folder: config.folder,
                    resource_type: config.resourceType || 'auto',
                  });
                  (uploadedFile as Express.Multer.File & {
                    path: string;
                  }).path = result.secure_url;
                  uploadedFile.filename = result.public_id;
                })(),
              );
            }
          }
          await Promise.all(uploadTasks);
        }

        next();
      } catch (error) {
        next(error);
      }
    });
  });
};

export default file;
