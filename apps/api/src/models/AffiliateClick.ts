import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IAffiliateClickDocument extends Document {
  productId: mongoose.Types.ObjectId;
  asin: string;
  ipHash: string;
  userAgent?: string;
  referrer?: string;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AffiliateClickSchema = new Schema<IAffiliateClickDocument>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true
    },
    asin: {
      type: String,
      required: true,
      index: true
    },
    ipHash: {
      type: String,
      required: true
    },
    userAgent: {
      type: String,
      default: ''
    },
    referrer: {
      type: String,
      default: ''
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  {
    timestamps: true
  }
);

AffiliateClickSchema.index({ timestamp: -1, asin: 1 });

export const AffiliateClick: Model<IAffiliateClickDocument> = mongoose.model<IAffiliateClickDocument>(
  'AffiliateClick',
  AffiliateClickSchema
);
