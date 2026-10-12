"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCloudinaryFiles = void 0;
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
// Cloudinary URLs look like:
//   https://res.cloudinary.com/<cloud>/<resource_type>/upload/v<version>/<public_id>.<ext>
// The public_id is everything between "/upload/v<digits>/" and the final
// extension (and itself may contain "/", since it includes the folder).
const extractPublicId = (url) => {
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[a-zA-Z0-9]+)?$/);
    return match?.[1] || null;
};
// Deletes one or more previously-uploaded Cloudinary assets by their stored
// secure_url. Best-effort: logs and swallows failures rather than throwing,
// matching how the old local-disk file cleanup behaved (never blocks the
// main DB operation on a cleanup failure).
const deleteCloudinaryFiles = async (urls, resourceType = 'image') => {
    if (!urls || (Array.isArray(urls) && urls.length === 0))
        return;
    const list = Array.isArray(urls) ? urls : [urls];
    await Promise.all(list.map(async (url) => {
        if (!url)
            return;
        const publicId = extractPublicId(url);
        if (!publicId) {
            console.warn(`⚠️ Could not parse Cloudinary public_id from: ${url}`);
            return;
        }
        try {
            await cloudinary_1.default.uploader.destroy(publicId, {
                resource_type: resourceType === 'auto' ? 'image' : resourceType,
            });
            console.log(`🗑️ Deleted Cloudinary asset: ${publicId}`);
        }
        catch (err) {
            console.error(`❌ Failed to delete Cloudinary asset: ${publicId}`, err?.message);
        }
    }));
};
exports.deleteCloudinaryFiles = deleteCloudinaryFiles;
