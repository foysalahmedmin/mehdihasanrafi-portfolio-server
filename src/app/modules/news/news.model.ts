import mongoose, { Schema } from 'mongoose';
import { TNewsDocument, TNewsModel } from './news.type';

const newsSchema = new Schema<TNewsDocument>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    link: {
      type: String,
    },

    description: {
      type: String,
      trim: true,
    },

    content: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      required: true,
    },

    author: {
      type: String,
      required: true,
    },

    thumbnail: {
      type: String,
    },

    images: {
      type: [String],
      default: [],
    },

    video: {
      type: String,
    },

    youtube: {
      type: String,
    },

    tags: {
      type: [String],
      default: [],
    },

    status: {
      type: String,
      enum: ['draft', 'pending', 'published', 'archived'],
      default: 'draft',
    },

    is_featured: {
      type: Boolean,
      default: false,
    },

    published_at: {
      type: Date,
      required: function () {
        return this.status === 'published';
      },
      default: function (this: TNewsDocument) {
        return this.status === 'published' ? new Date() : undefined;
      },
    },

    read_time: {
      type: String,
    },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

newsSchema.index({ slug: 1 });
newsSchema.index({ title: 1 });
newsSchema.index({ status: 1 });
newsSchema.index({ is_featured: 1 });

newsSchema.index({ created_at: -1 });
newsSchema.index({ published_at: -1 });

newsSchema.index({ title: 1, description: 1 });

newsSchema.methods.toJSON = function () {
  const News = this.toObject();
  return News;
};

export const News = mongoose.model<TNewsDocument, TNewsModel>(
  'News',
  newsSchema,
);
