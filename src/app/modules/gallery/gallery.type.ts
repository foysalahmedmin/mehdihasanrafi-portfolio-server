import { Document, Model } from 'mongoose';

export type TMediaType = 'image' | 'video';

export type TGallery = {
  caption?: string;
  media_type: TMediaType;
  image_url?: string;
  image?: string;
  video_url?: string;
  video?: string;
  order?: number;
  is_active?: boolean;
  created_at?: Date;
  updated_at?: Date;
};

export interface TGalleryDocument extends TGallery, Document {}

export interface TGalleryModel extends Model<TGalleryDocument> {}

export type TCreateGallery = {
  caption?: string;
  media_type: TMediaType;
  image_url?: string;
  image?: string;
  video_url?: string;
  video?: string;
  order?: number;
  is_active?: boolean;
};

export type TUpdateGallery = Partial<TCreateGallery>;

