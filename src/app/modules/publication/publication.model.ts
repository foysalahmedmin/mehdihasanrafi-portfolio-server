import mongoose, { Schema } from 'mongoose';
import { TPublicationDocument, TPublicationModel } from './publication.type';

const publicationSchema = new Schema<TPublicationDocument>(
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

    abstract: {
      type: String,
      required: true,
      trim: true,
    },

    content: {
      type: String,
      required: true,
    },

    venue: {
      type: String,
      required: true,
      trim: true,
    },

    publisher: {
      type: String,
      trim: true,
    },

    journal: {
      type: String,
      trim: true,
    },

    volume: {
      type: String,
      trim: true,
    },

    code: {
      type: String,
      trim: true,
    },

    doi: {
      type: String,
      default: null,
    },

    category: {
      type: String,
    },

    author: {
      type: String,
    },

    authors: {
      type: [String],
      default: [],
    },

    thumbnail: {
      type: String,
    },

    pdf: {
      type: String,
      default: null,
    },

    images: {
      type: [String],
      default: [],
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
      default: function (this: TPublicationDocument) {
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

publicationSchema.index({ slug: 1 });
publicationSchema.index({ title: 1 });
publicationSchema.index({ status: 1 });
publicationSchema.index({ is_featured: 1 });
publicationSchema.index({ doi: 1 });

publicationSchema.index({ created_at: -1 });
publicationSchema.index({ published_at: -1 });

publicationSchema.index({ title: 1, abstract: 1 });
publicationSchema.index({ venue: 1 });
publicationSchema.index({ journal: 1 });

publicationSchema.methods.toJSON = function () {
  const Publication = this.toObject();
  return Publication;
};

export const Publication = mongoose.model<
  TPublicationDocument,
  TPublicationModel
>('Publication', publicationSchema);
