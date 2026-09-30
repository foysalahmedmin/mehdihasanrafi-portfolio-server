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
      // Immutable: an item's type is fixed at creation. Replacing its media
      // with the wrong type is rejected at the controller level instead of
      // allowing a silent type switch that would orphan the old field.
      immutable: true,
    },
    image_url: {
      type: String,
      trim: true,
      default: null,
    },
    image: {
      type: String,
      trim: true,
      default: null,
    },
    video_url: {
      type: String,
      trim: true,
      default: null,
    },
    video: {
      type: String,
      trim: true,
      default: null,
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

// Every gallery item must actually have media of its own declared type —
// enforced once here at the document level (runs for both create and
// findOneAndUpdate-style updates via `runValidators`) rather than relying on
// scattered ad-hoc checks in each controller action.
gallerySchema.pre('validate', function (next) {
  if (this.media_type === 'image' && !this.image && !this.image_url) {
    return next(
      new Error('An image gallery item needs either an uploaded image or an image URL'),
    );
  }
  if (this.media_type === 'video' && !this.video && !this.video_url) {
    return next(
      new Error('A video gallery item needs either an uploaded video or a video URL'),
    );
  }
  next();
});

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
