"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCloudinaryFiles = void 0;
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
// Cloudinary URLs look like:
//   https://res.cloudinary.com/<cloud>/<resource_type>/upload/v<version>/<public_id>.<ext>
// The public_id is everything between "/upload/v<digits>/" and the end —
// except for `image`/`video`, where Cloudinary strips the extension off the
// public_id itself, so it has to be stripped here too. `raw` keeps its
// extension as part of the public_id, so leaving it in there is required —
// stripping it would target a non-existent asset and silently no-op.
const extractPublicId = (url, resourceType) => {
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+)$/);
    if (!match?.[1])
        return null;
    if (resourceType === 'raw')
        return match[1];
    return match[1].replace(/\.[a-zA-Z0-9]+$/, '');
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
        const normalizedType = resourceType === 'auto' ? 'image' : resourceType;
        const publicId = extractPublicId(url, normalizedType);
        if (!publicId) {
            console.warn(`⚠️ Could not parse Cloudinary public_id from: ${url}`);
            return;
        }
        try {
            const result = await cloudinary_1.default.uploader.destroy(publicId, {
                resource_type: normalizedType,
            });
            if (result?.result === 'ok') {
                console.log(`🗑️ Deleted Cloudinary asset: ${publicId}`);
            }
            else {
                console.warn(`⚠️ Cloudinary delete did not confirm removal for ${publicId}: ${result?.result}`);
            }
        }
        catch (err) {
            console.error(`❌ Failed to delete Cloudinary asset: ${publicId}`, err?.message);
        }
    }));
};
exports.deleteCloudinaryFiles = deleteCloudinaryFiles;
