import { dirYearMonth } from '../../utils/dirYearMonth';

export const folderMapWithYearMonth = {
  image: 'gallery/images' + '/' + dirYearMonth().suffix,
  video: 'gallery/videos' + '/' + dirYearMonth().suffix,
};
