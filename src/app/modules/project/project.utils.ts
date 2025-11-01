import { dirYearMonth } from '../../utils/dirYearMonth';

export const folderMap = {
  thumbnail: 'projects/images',
  image: 'projects/images',
  file: 'projects/files',
  seo: 'projects/seo/images',
};

export const folderMapWithYearMonth = {
  thumbnail: 'projects/images' + '/' + dirYearMonth().suffix,
  image: 'projects/images' + '/' + dirYearMonth().suffix,
  file: 'projects/files' + '/' + dirYearMonth().suffix,
  seo: 'projects/seo/images' + '/' + dirYearMonth().suffix,
};

export const fileType = (mimeType: string) => {
  if (mimeType.startsWith('image/')) return 'image';
  return 'file';
};

export const getFileConfigByType = (type: string) => {
  const baseConfig = {
    size: 10_000_000, // 10MB default
    maxCount: 1,
    minCount: 1,
  };

  switch (type) {
    case 'image':
      return {
        ...baseConfig,
        name: 'file',
        folder: folderMapWithYearMonth.image,
        allowedTypes: [
          'image/jpeg',
          'image/png',
          'image/jpg',
          'image/gif',
          'image/webp',
        ],
        size: 5_000_000, // 5MB for images
      };
    case 'file':
      return {
        ...baseConfig,
        name: 'file',
        folder: folderMapWithYearMonth.file,
        allowedTypes: [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ],
        size: 15_000_000, // 15MB for documents
      };
    default:
      return {
        ...baseConfig,
        name: 'file',
        folder: folderMapWithYearMonth.file,
      };
  }
};

