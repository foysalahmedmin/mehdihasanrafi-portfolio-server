import mongoose, { Schema } from 'mongoose';
import { TGalleryDocument, TGalleryModel } from './gallery.type';

const gallerySchema = new Schema<TGalleryDocument>(
  {
    caption: {
      type: String,
      trim: true,
      maxlength: [500, 'Caption cannot exceed 500 characters'],
    },
    media_type: {
      type: String,
      enum: ['image', 'video'],
      required: [true, 'Media type is required'],
    },
    image_url: {
      type: String,
      trim: true,
      validate: {
        validator: function (this: TGalleryDocument, value: string) {
          if (this.media_type === 'image' && !this.image && !value) {
            return false;
          }
          return true;
        },
        message: 'Either image_url or image file is required for image type',
      },
    },
    image: {
      type: String,
      trim: true,
    },
    video_url: {
      type: String,
      trim: true,
      validate: {
        validator: function (this: TGalleryDocument, value: string) {
          if (this.media_type === 'video' && !this.video && !value) {
            return false;
          }
          return true;
        },
        message: 'Either video_url or video file is required for video type',
      },
    },
    video: {
      type: String,
      trim: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    is_active: {
      type: Boolean,
      default: true,
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

gallerySchema.index({ media_type: 1 });
gallerySchema.index({ is_active: 1 });
gallerySchema.index({ order: 1 });
gallerySchema.index({ created_at: -1 });

gallerySchema.methods.toJSON = function () {
  const gallery = this.toObject();
  return gallery;
};

export const Gallery = mongoose.model<TGalleryDocument, TGalleryModel>(
  'Gallery',
  gallerySchema,
);
