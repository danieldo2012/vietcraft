import mongoose, { Document, Schema, Model } from 'mongoose';
import { FooterSettings as IFooterSettings } from '@vietcraft/shared';

export interface IFooterSettingsDocument extends Omit<IFooterSettings, '_id'>, Document {}

const FooterLinkSchema = new Schema(
  {
    id: { type: String, required: true },
    label: { type: String, required: true },
    url: { type: String, required: true },
    openInNewTab: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 }
  },
  { _id: false }
);

const FooterColumnSchema = new Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    order: { type: Number, default: 0 },
    links: { type: [FooterLinkSchema], default: [] }
  },
  { _id: false }
);

const SocialLinkSchema = new Schema(
  {
    platform: { type: String, required: true },
    label: { type: String, required: true },
    url: { type: String, required: true },
    icon: { type: String },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 }
  },
  { _id: false }
);

const FooterSettingsSchema = new Schema<IFooterSettingsDocument>(
  {
    logo: { type: String, default: '' },
    logoAlt: { type: String, default: 'VietCraft' },
    description: {
      type: String,
      default:
        'Discover natural beauty, thoughtful living, and timeless home decor inspired by Vietnam.'
    },
    columns: { type: [FooterColumnSchema], default: [] },
    socialLinks: { type: [SocialLinkSchema], default: [] },
    contactInformation: {
      email: { type: String, default: 'hello@vietcraft.com' },
      phone: { type: String, default: '+1 (800) 555-CRAFT' },
      address: {
        type: String,
        default: 'Hanoi Artisan Guild, Vietnam & Distribution Center, USA'
      },
      businessHours: { type: String, default: 'Mon - Fri: 9:00 AM - 6:00 PM EST' }
    },
    newsletter: {
      title: { type: String, default: 'Join Our Slow Living Journal' },
      description: {
        type: String,
        default: 'Weekly artisanal features, craft village stories, and mindful interior inspirations.'
      },
      placeholder: { type: String, default: 'Enter your email address' },
      buttonLabel: { type: String, default: 'Subscribe' },
      successMessage: {
        type: String,
        default: 'Thank you for subscribing to the VietCraft journal!'
      },
      errorMessage: {
        type: String,
        default: 'Could not subscribe. Please try again.'
      },
      privacyText: { type: String, default: 'Zero spam. Unsubscribe anytime.' }
    },
    copyright: {
      copyrightText: {
        type: String,
        default:
          '© 2026 VietCraft. Handcrafted with reverence for Vietnamese artisans. All rights reserved.'
      }
    },
    legalLinks: { type: [FooterLinkSchema], default: [] }
  },
  {
    timestamps: true
  }
);

export const FooterSettings: Model<IFooterSettingsDocument> = mongoose.model<IFooterSettingsDocument>(
  'FooterSettings',
  FooterSettingsSchema
);
