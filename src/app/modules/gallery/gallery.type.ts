import { Document, Model, Types } from 'mongoose';

export type TMediaType = 'image' | 'video';

export type TGallery = {
  caption?: string;
  media_type: TMediaType;
  image_url?: string;
  image?: string;
  video_url?: string;
  video?: string;
  order: number;
  is_active: boolean;
  created_at?: Date;
  updated_at?: Date;
};

export interface TGalleryDocument extends TGallery, Document {
  _id: Types.ObjectId;
}

export interface TGalleryModel extends Model<TGalleryDocument> {}

// One resolved gallery document ready to insert, built from either an
// uploaded file (image/video) or an external URL.
export type TGalleryItemInput = {
  media_type: TMediaType;
  image?: string;
  image_url?: string;
  video?: string;
  video_url?: string;
  caption?: string;
  order: number;
  is_active: boolean;
};

// Partial update for a single existing item. Only fields explicitly present
// are ever touched by the service/controller — see gallery.controller.ts.
export type TUpdateGallery = {
  caption?: string;
  order?: number;
  is_active?: boolean;
  image?: string | null;
  image_url?: string | null;
  video?: string | null;
  video_url?: string | null;
};
