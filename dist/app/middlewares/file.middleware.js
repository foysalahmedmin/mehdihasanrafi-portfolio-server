"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_status_1 = __importDefault(require("http-status"));
const multer_1 = __importDefault(require("multer"));
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
const AppError_1 = __importDefault(require("../builder/AppError"));
const catchAsync_1 = __importDefault(require("../utils/catchAsync"));
// Uploads are held in memory (never written to disk — the only option that
// works on a serverless host like Vercel, whose filesystem is read-only /
// ephemeral) and streamed straight to Cloudinary.
const storage = multer_1.default.memoryStorage();
const file = (...files) => {
    const configByField = new Map(files.map((f) => [f.name, f]));
    const globalMaxSize = Math.max(...files.map((f) => f.size || 5_000_000));
    const fileFilter = (_req, uploadedFile, cb) => {
        const config = configByField.get(uploadedFile.fieldname);
        if (!config) {
            return cb(new AppError_1.default(http_status_1.default.BAD_REQUEST, `Unexpected field "${uploadedFile.fieldname}"`));
        }
        if (config.allowedTypes &&
            !config.allowedTypes.includes(uploadedFile.mimetype)) {
            return cb(new AppError_1.default(http_status_1.default.BAD_REQUEST, `Invalid file type for field "${uploadedFile.fieldname}"`));
        }
        cb(null, true);
    };
    const upload = (0, multer_1.default)({
        storage,
        limits: { fileSize: globalMaxSize },
        fileFilter,
    }).fields(files.map((f) => ({
        name: f.name,
        maxCount: f.maxCount || 1,
    })));
    return (0, catchAsync_1.default)(async (req, res, next) => {
        upload(req, res, async (err) => {
            if (err) {
                return next(new AppError_1.default(http_status_1.default.BAD_REQUEST, err.message || 'File upload error'));
            }
            try {
                const uploadedFiles = req.files;
                // Enforce true per-field max size — multer's `limits.fileSize` is a
                // single ceiling shared by every field, so a smaller per-field
                // `size` (e.g. 10MB images next to 100MB videos) isn't actually
                // enforced by multer itself.
                if (uploadedFiles) {
                    for (const config of files) {
                        if (!config.size)
                            continue;
                        for (const uploadedFile of uploadedFiles[config.name] || []) {
                            if (uploadedFile.size > config.size) {
                                throw new AppError_1.default(http_status_1.default.BAD_REQUEST, `"${uploadedFile.originalname}" exceeds the maximum size for field "${config.name}"`);
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
                    throw new AppError_1.default(http_status_1.default.BAD_REQUEST, `At least ${missing[0].minCount} file(s) required for: ${fields}`);
                }
                // Upload every received file to Cloudinary. The result is written
                // back onto the same Multer file object so controllers barely
                // change: `file.path` becomes the full Cloudinary URL (in place of
                // a local disk path) and `file.filename` becomes the Cloudinary
                // `public_id` (in place of a local filename) — used later to delete
                // the asset.
                if (uploadedFiles) {
                    const uploadTasks = [];
                    for (const config of files) {
                        for (const uploadedFile of uploadedFiles[config.name] || []) {
                            uploadTasks.push((async () => {
                                const dataUri = `data:${uploadedFile.mimetype};base64,${uploadedFile.buffer.toString('base64')}`;
                                const result = await cloudinary_1.default.uploader.upload(dataUri, {
                                    folder: config.folder,
                                    resource_type: config.resourceType || 'auto',
                                });
                                uploadedFile.path = result.secure_url;
                                uploadedFile.filename = result.public_id;
                            })());
                        }
                    }
                    await Promise.all(uploadTasks);
                }
                next();
            }
            catch (error) {
                next(error);
            }
        });
    });
};
exports.default = file;
