import mongoose, { Document, Schema, Model } from 'mongoose';
import { PostAuthor, PostStatus, SeoMetadata } from '@vietcraft/shared';

export interface IPostDocument extends Document {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  author: PostAuthor;
  material?: mongoose.Types.ObjectId;
  tags: string[];
  readingTime: number;
  status: PostStatus;
  publishedAt?: Date;
  relatedArticles: mongoose.Types.ObjectId[];
  relatedProducts: mongoose.Types.ObjectId[];
  seo?: SeoMetadata;
  createdAt: Date;
  updatedAt: Date;
}

const PostAuthorSchema = new Schema<PostAuthor>(
  {
    name: { type: String, required: true },
    avatar: { type: String, default: '' },
    bio: { type: String, default: '' }
  },
  { _id: false }
);

const PostSchema = new Schema<IPostDocument>(
  {
    title: {
      type: String,
      required: [true, 'Post title is required'],
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
    excerpt: {
      type: String,
      required: [true, 'Excerpt is required']
    },
    content: {
      type: String,
      required: [true, 'Content is required']
    },
    featuredImage: {
      type: String,
      default: ''
    },
    author: {
      type: PostAuthorSchema,
      required: true
    },
    material: {
      type: Schema.Types.ObjectId,
      ref: 'Material',
      index: true
    },
    tags: {
      type: [String],
      default: [],
      index: true
    },
    readingTime: {
      type: Number,
      default: 5
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
      index: true
    },
    publishedAt: {
      type: Date,
      index: true
    },
    relatedArticles: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Post'
      }
    ],
    relatedProducts: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Product'
      }
    ],
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

PostSchema.index({ status: 1, publishedAt: -1 });
PostSchema.index({ title: 'text', excerpt: 'text', tags: 'text' });

export const Post: Model<IPostDocument> = mongoose.model<IPostDocument>('Post', PostSchema);
