import mongoose, { Document, Schema, Model } from 'mongoose';

export interface INewsletterDocument extends Document {
  email: string;
  status: 'subscribed' | 'unsubscribed';
  subscribedAt: Date;
  unsubscribedAt?: Date;
  tags: string[];
  source?: string;
  createdAt: Date;
  updatedAt: Date;
}

const NewsletterSchema = new Schema<INewsletterDocument>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    status: {
      type: String,
      enum: ['subscribed', 'unsubscribed'],
      default: 'subscribed',
      index: true
    },
    subscribedAt: {
      type: Date,
      default: Date.now
    },
    unsubscribedAt: {
      type: Date
    },
    tags: {
      type: [String],
      default: ['general']
    },
    source: {
      type: String,
      default: 'website'
    }
  },
  {
    timestamps: true
  }
);

export const Newsletter: Model<INewsletterDocument> = mongoose.model<INewsletterDocument>('Newsletter', NewsletterSchema);
