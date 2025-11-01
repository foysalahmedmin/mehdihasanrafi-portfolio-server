import mongoose, { Schema } from 'mongoose';
import { TProjectDocument, TProjectModel } from './project.type';

const projectSchema = new Schema<TProjectDocument>(
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
    },

    thumbnail: {
      type: String,
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
      default: function (this: TProjectDocument) {
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

projectSchema.index({ slug: 1 }, { unique: true });
projectSchema.index({ title: 1 });
projectSchema.index({ status: 1 });
projectSchema.index({ is_featured: 1 });

projectSchema.index({ created_at: -1 });
projectSchema.index({ published_at: -1 });

projectSchema.index({ title: 1, description: 1 });

projectSchema.methods.toJSON = function () {
  const Project = this.toObject();
  return Project;
};

export const Project = mongoose.model<TProjectDocument, TProjectModel>(
  'Project',
  projectSchema,
);

