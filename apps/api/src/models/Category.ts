import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ICategoryDocument extends Document {
  name: string;
  slug: string;
  description?: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategoryDocument>(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
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
    }
  },
  {
    timestamps: true
  }
);

CategorySchema.index({ name: 'text', description: 'text' });

export const Category: Model<ICategoryDocument> = mongoose.model<ICategoryDocument>('Category', CategorySchema);
