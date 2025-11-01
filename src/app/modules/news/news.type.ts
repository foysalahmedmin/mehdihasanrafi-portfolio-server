import { Document, Model, Types } from 'mongoose';

export type TStatus = 'draft' | 'pending' | 'published' | 'archived';

export type TNews = {
  title: string;
  slug: string;
  link?: string;
  description?: string;
  content: string;
  category?: Types.ObjectId;
  author?: Types.ObjectId;
  thumbnail?: string;
  images?: string[];
  video?: string;
  youtube?: string;
  tags?: string[];
  status?: TStatus;
  is_featured?: boolean;
  published_at?: Date;
  read_time?: string;
};

export interface TNewsDocument extends TNews, Document {
  _id: Types.ObjectId;
}

export type TNewsModel = Model<TNewsDocument>;
