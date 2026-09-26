import mongoose, { Document, Schema, Model } from 'mongoose';
import { PriceSource, ProductDimensions, ProductImage, ProductStatus, SeoMetadata } from '@vietcraft/shared';

export interface IProductDocument extends Document {
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  images: ProductImage[];
  material: mongoose.Types.ObjectId;
  category: mongoose.Types.ObjectId;
  asin: string;
  affiliateUrl: string;
  productUrl?: string;
  price: number;
  currency: string;
  priceSource: PriceSource;
  lastChecked: Date;
  featured: boolean;
  status: ProductStatus;
  tags: string[];
  dimensions?: ProductDimensions;
  seo?: SeoMetadata;
  createdAt: Date;
  updatedAt: Date;
}

const ProductImageSchema = new Schema<ProductImage>(
  {
    url: { type: String, required: true },
    alt: { type: String, required: true },
    isPrimary: { type: Boolean, default: false }
  },
  { _id: false }
);

const ProductSchema = new Schema<IProductDocument>(
  {
    title: {
      type: String,
      required: [true, 'Product title is required'],
      trim: true,
      index: true
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
    images: {
      type: [ProductImageSchema],
      validate: [(val: ProductImage[]) => val.length > 0, 'At least one image is required']
    },
    material: {
      type: Schema.Types.ObjectId,
      ref: 'Material',
      required: [true, 'Material reference is required'],
      index: true
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category reference is required'],
      index: true
    },
    asin: {
      type: String,
      required: [true, 'ASIN is required'],
      uppercase: true,
      trim: true,
      index: true
    },
    affiliateUrl: {
      type: String,
      required: [true, 'Affiliate URL is required']
    },
    productUrl: {
      type: String,
      default: ''
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price must be positive']
    },
    currency: {
      type: String,
      default: 'USD'
    },
    priceSource: {
      type: String,
      enum: ['manual_entry', 'amazon_paapi', 'direct_import'],
      default: 'manual_entry'
    },
    lastChecked: {
      type: Date,
      default: Date.now
    },
    featured: {
      type: Boolean,
      default: false,
      index: true
    },
    status: {
      type: String,
      enum: ['active', 'draft', 'archived'],
      default: 'active',
      index: true
    },
    tags: {
      type: [String],
      default: [],
      index: true
    },
    dimensions: {
      height: Number,
      width: Number,
      depth: Number,
      unit: { type: String, default: 'in' }
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

ProductSchema.index({ status: 1, featured: -1, createdAt: -1 });
ProductSchema.index({ title: 'text', description: 'text', tags: 'text' });

export const Product: Model<IProductDocument> = mongoose.model<IProductDocument>('Product', ProductSchema);
