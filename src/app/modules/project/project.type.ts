import { Document, Model, Types } from 'mongoose';

export type TStatus = 'draft' | 'pending' | 'published' | 'archived';

export type TProject = {
  title: string;
  slug: string;
  link?: string;
  content: string;
  thumbnail?: string;
  read_time?: string;
  category: string;
  author?: string;
  description?: string;
  images?: string[];
  tags?: string[];
  status?: TStatus;
  is_featured?: boolean;
  published_at?: Date;
};

export interface TProjectDocument extends TProject, Document {
  _id: Types.ObjectId;
}

export type TProjectModel = Model<TProjectDocument>;

