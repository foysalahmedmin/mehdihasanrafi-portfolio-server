import { dirYearMonth } from '../../utils/dirYearMonth';

export const folderMap = {
  thumbnail: 'publications/images',
  image: 'publications/images',
  pdf: 'publications/pdfs',
  file: 'publications/files',
  seo: 'publications/seo/images',
};

export const folderMapWithYearMonth = {
  thumbnail: 'publications/images' + '/' + dirYearMonth().suffix,
  image: 'publications/images' + '/' + dirYearMonth().suffix,
  pdf: 'publications/pdfs' + '/' + dirYearMonth().suffix,
  file: 'publications/files' + '/' + dirYearMonth().suffix,
  seo: 'publications/seo/images' + '/' + dirYearMonth().suffix,
};

export const fileType = (mimeType: string) => {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType === 'application/pdf') return 'pdf';
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
    case 'pdf':
      return {
        ...baseConfig,
        name: 'file',
        folder: folderMapWithYearMonth.pdf,
        allowedTypes: ['application/pdf'],
        size: 20_000_000, // 20MB for PDFs
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
