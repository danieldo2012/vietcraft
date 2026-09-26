import mongoose, { Document, Schema, Model } from 'mongoose';
import { HeaderSettings as IHeaderSettings, NavigationItem } from '@vietcraft/shared';

export interface IHeaderSettingsDocument extends Omit<IHeaderSettings, '_id'>, Document {}

const NavigationItemSchema = new Schema<NavigationItem>(
  {
    id: { type: String, required: true },
    label: { type: String, required: true },
    url: { type: String, required: true },
    type: { type: String, enum: ['link', 'dropdown'], default: 'link' },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    openInNewTab: { type: Boolean, default: false },
    children: { type: [Schema.Types.Mixed], default: [] }
  },
  { _id: false }
);

const HeaderSettingsSchema = new Schema<IHeaderSettingsDocument>(
  {
    logo: { type: String, default: '' },
    logoText: { type: String, default: 'VietCraft' },
    logoAlt: { type: String, default: 'VietCraft Natural Decor' },
    logoUrl: { type: String, default: '/' },
    showLogo: { type: Boolean, default: true },
    navigationItems: { type: [NavigationItemSchema], default: [] },
    discoverMenu: {
      showDiscover: { type: Boolean, default: true },
      label: { type: String, default: 'Discover' },
      items: [
        {
          label: { type: String, required: true },
          url: { type: String, required: true },
          materialSlug: { type: String },
          order: { type: Number, default: 0 },
          isActive: { type: Boolean, default: true }
        }
      ]
    },
    headerCTA: {
      showCTA: { type: Boolean, default: true },
      label: { type: String, default: 'Explore Journal' },
      url: { type: String, default: '/articles' }
    },
    searchSettings: {
      showSearch: { type: Boolean, default: true },
      searchPlaceholder: { type: String, default: 'Search handcrafted items, articles, materials...' },
      searchPageTitle: { type: String, default: 'Search VietCraft Collection' },
      searchEmptyStateMessage: { type: String, default: 'No handcrafted results found matching your inquiry.' }
    },
    stickyHeader: { type: Boolean, default: true },
    mobileMenu: { type: Boolean, default: true }
  },
  {
    timestamps: true
  }
);

export const HeaderSettings: Model<IHeaderSettingsDocument> = mongoose.model<IHeaderSettingsDocument>(
  'HeaderSettings',
  HeaderSettingsSchema
);
