import { Document, Model, Types } from 'mongoose';

export type TStatus = 'draft' | 'pending' | 'published' | 'archived';

export type TPublication = {
  title: string;
  slug: string;
  link?: string;
  thumbnail?: string;
  read_time?: string;
  venue?: string;
  abstract: string;
  content?: string;
  publisher?: string;
  journal?: string;
  volume?: string;
  code?: string;
  doi?: string | null;
  category?: string;
  author?: string;
  authors?: string[];
  description?: string;
  pdf?: string | null;
  images?: string[];
  tags?: string[];
  status?: TStatus;
  is_featured?: boolean;
  published_at?: Date;
};

export interface TPublicationDocument extends TPublication, Document {
  _id: Types.ObjectId;
}

export type TPublicationModel = Model<TPublicationDocument>;
