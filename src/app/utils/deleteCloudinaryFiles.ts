import cloudinary from '../config/cloudinary';
import { TCloudinaryResourceType } from '../middlewares/file.middleware';

// Cloudinary URLs look like:
//   https://res.cloudinary.com/<cloud>/<resource_type>/upload/v<version>/<public_id>.<ext>
// The public_id is everything between "/upload/v<digits>/" and the final
// extension (and itself may contain "/", since it includes the folder).
const extractPublicId = (url: string): string | null => {
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[a-zA-Z0-9]+)?$/);
  return match?.[1] || null;
};

// Deletes one or more previously-uploaded Cloudinary assets by their stored
// secure_url. Best-effort: logs and swallows failures rather than throwing,
// matching how the old local-disk file cleanup behaved (never blocks the
// main DB operation on a cleanup failure).
export const deleteCloudinaryFiles = async (
  urls?: string | string[] | null,
  resourceType: TCloudinaryResourceType = 'image',
): Promise<void> => {
  if (!urls || (Array.isArray(urls) && urls.length === 0)) return;
  const list = Array.isArray(urls) ? urls : [urls];

  await Promise.all(
    list.map(async (url) => {
      if (!url) return;
      const publicId = extractPublicId(url);
      if (!publicId) {
        console.warn(`⚠️ Could not parse Cloudinary public_id from: ${url}`);
        return;
      }
      try {
        await cloudinary.uploader.destroy(publicId, {
          resource_type: resourceType === 'auto' ? 'image' : resourceType,
        });
        console.log(`🗑️ Deleted Cloudinary asset: ${publicId}`);
      } catch (err: any) {
        console.error(
          `❌ Failed to delete Cloudinary asset: ${publicId}`,
          err?.message,
        );
      }
    }),
  );
};
