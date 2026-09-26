import mongoose, { Document, Schema, Model } from 'mongoose';
import { SeoMetadata } from '@vietcraft/shared';

export interface IMaterialDocument extends Document {
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  coverImage: string;
  icon?: string;
  displayOrder: number;
  isActive: boolean;
  craftingTechniques: string[];
  originRegions: string[];
  seo?: SeoMetadata;
  createdAt: Date;
  updatedAt: Date;
}

const MaterialSchema = new Schema<IMaterialDocument>(
  {
    name: {
      type: String,
      required: [true, 'Material name is required'],
      trim: true
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    description: {
      type: String,
      required: [true, 'Description is required']
    },
    shortDescription: {
      type: String,
      required: [true, 'Short description is required']
    },
    coverImage: {
      type: String,
      required: [true, 'Cover image is required']
    },
    icon: {
      type: String,
      default: ''
    },
    displayOrder: {
      type: Number,
      default: 0,
      index: true
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },
    craftingTechniques: {
      type: [String],
      default: []
    },
    originRegions: {
      type: [String],
      default: []
    },
    seo: {
      title: String,
      description: String,
      keywords: [String],
      ogImage: String,
      canonicalUrl: String
    }
  },
  {
    timestamps: true
  }
);

MaterialSchema.index({ name: 'text', description: 'text', shortDescription: 'text' });

export const Material: Model<IMaterialDocument> = mongoose.model<IMaterialDocument>('Material', MaterialSchema);
