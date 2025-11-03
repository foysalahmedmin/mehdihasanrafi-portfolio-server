import { dirYearMonth } from '../../utils/dirYearMonth';

export const folderMapWithYearMonth = {
  image: 'gallery/images' + '/' + dirYearMonth('gallery/images').suffix,
  video: 'gallery/videos' + '/' + dirYearMonth('gallery/images').suffix,
};
