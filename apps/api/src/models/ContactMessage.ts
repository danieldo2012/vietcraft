import mongoose, { Document, Schema, Model } from 'mongoose';
import { ContactMessage as IContactMessage } from '@vietcraft/shared';

export interface IContactMessageDocument extends Omit<IContactMessage, '_id'>, Document {}

const ContactMessageSchema = new Schema<IContactMessageDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    subject: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    isRead: { type: Boolean, default: false, index: true }
  },
  {
    timestamps: true
  }
);

export const ContactMessage: Model<IContactMessageDocument> = mongoose.model<IContactMessageDocument>(
  'ContactMessage',
  ContactMessageSchema
);
