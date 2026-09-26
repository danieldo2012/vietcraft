import mongoose, { Document, Schema, Model } from 'mongoose';
import { SiteSettings as ISiteSettings } from '@vietcraft/shared';

export interface ISiteSettingsDocument extends Omit<ISiteSettings, '_id'>, Document {}

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

const SiteSettingsSchema = new Schema<ISiteSettingsDocument>(
  {
    siteName: { type: String, default: 'VietCraft' },
    tagline: { type: String, default: 'Natural Living & Vietnamese Craftsmanship' },
    brandDescription: {
      type: String,
      default:
        'Discover natural beauty, thoughtful living, and timeless home decor inspired by Vietnam.'
    },
    logo: { type: String, default: '' },
    logoAlt: { type: String, default: 'VietCraft' },
    favicon: { type: String, default: '' },
    contactEmail: { type: String, default: 'hello@vietcraft.com' },
    contactPhone: { type: String, default: '+1 (800) 555-CRAFT' },
    address: { type: String, default: 'Hanoi, Vietnam' },
    socialLinks: { type: [SocialLinkSchema], default: [] },
    defaultTitle: {
      type: String,
      default: 'VietCraft | Natural Home Decor & Vietnamese Craftsmanship'
    },
    defaultMetaDescription: {
      type: String,
      default:
        'Discover handcrafted Vietnamese home decor, organic materials, and mindful interior design.'
    },
    defaultOGImage: { type: String, default: '' },
    twitterHandle: { type: String, default: '@vietcraft' },
    privacyPolicy: { type: String, default: '' },
    terms: { type: String, default: '' },
    affiliateDisclosure: {
      type: String,
      default:
        'VietCraft is reader-supported. When you buy through links on our site, we may earn an affiliate commission at no extra cost to you.'
    },
    googleAnalyticsId: { type: String, default: '' },
    metaPixelId: { type: String, default: '' }
  },
  {
    timestamps: true
  }
);

export const SiteSettings: Model<ISiteSettingsDocument> = mongoose.model<ISiteSettingsDocument>(
  'SiteSettings',
  SiteSettingsSchema
);

// Backward compatibility alias for Setting
export const Setting = SiteSettings;
