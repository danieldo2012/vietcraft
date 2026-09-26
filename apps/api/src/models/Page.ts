import mongoose, { Document, Schema, Model } from 'mongoose';
import { Page as IPage } from '@vietcraft/shared';

export interface IPageDocument extends Omit<IPage, '_id'>, Document {}

const PageSchema = new Schema<IPageDocument>(
  {
    title: { type: String, required: true, trim: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    content: { type: String, required: true },
    featuredImage: { type: String, default: '' },
    seoTitle: { type: String, default: '' },
    seoDescription: { type: String, default: '' },
    ogImage: { type: String, default: '' },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'published',
      index: true
    },
    publishedAt: { type: String, default: () => new Date().toISOString() }
  },
  {
    timestamps: true
  }
);

PageSchema.index({ slug: 1, status: 1 });

export const Page: Model<IPageDocument> = mongoose.model<IPageDocument>('Page', PageSchema);
