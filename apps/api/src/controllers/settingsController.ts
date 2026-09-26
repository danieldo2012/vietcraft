import { Request, Response } from 'express';
import { SiteSettings } from '../models/SiteSettings';
import { AFFILIATE_DISCLOSURE, SITE_DEFAULTS, siteSettingsSchema } from '@vietcraft/shared';
import { sendSuccess, sendError } from '../utils/response';

const getDefaultSettings = () => ({
  siteName: SITE_DEFAULTS.siteName,
  tagline: 'Natural Living & Vietnamese Craftsmanship',
  brandDescription: SITE_DEFAULTS.brandDescription,
  logo: '',
  logoAlt: 'VietCraft Natural Decor',
  favicon: '',
  contactEmail: SITE_DEFAULTS.contactEmail,
  contactPhone: '+1 (800) 555-CRAFT',
  address: 'Hanoi, Vietnam',
  socialLinks: [
    { platform: 'Instagram', label: 'Instagram', url: SITE_DEFAULTS.socialLinks.instagram, isActive: true, order: 0 },
    { platform: 'Pinterest', label: 'Pinterest', url: SITE_DEFAULTS.socialLinks.pinterest, isActive: true, order: 1 },
    { platform: 'Facebook', label: 'Facebook', url: SITE_DEFAULTS.socialLinks.facebook, isActive: true, order: 2 },
    { platform: 'Twitter', label: 'Twitter', url: SITE_DEFAULTS.socialLinks.twitter, isActive: true, order: 3 }
  ],
  defaultTitle: 'VietCraft | Natural Home Decor & Vietnamese Craftsmanship',
  defaultMetaDescription: SITE_DEFAULTS.brandDescription,
  defaultOGImage: '',
  twitterHandle: '@vietcraft',
  privacyPolicy: '',
  terms: '',
  affiliateDisclosure: AFFILIATE_DISCLOSURE.full,
  googleAnalyticsId: '',
  metaPixelId: ''
});

export const getSettings = async (_req: Request, res: Response): Promise<void> => {
  try {
    let settings = await SiteSettings.findOne();
    if (!settings) {
      settings = await SiteSettings.create(getDefaultSettings());
    }
    sendSuccess(res, settings, 'Site settings retrieved');
  } catch (err: any) {
    sendError(res, err.message, 500);
  }
};

export const adminGetSettings = async (_req: Request, res: Response): Promise<void> => {
  try {
    let settings = await SiteSettings.findOne();
    if (!settings) {
      settings = await SiteSettings.create(getDefaultSettings());
    }
    sendSuccess(res, settings, 'Site settings retrieved for admin');
  } catch (err: any) {
    sendError(res, err.message, 500);
  }
};

export const adminUpdateSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = siteSettingsSchema.parse(req.body);
    let settings = await SiteSettings.findOne();
    if (!settings) {
      settings = await SiteSettings.create(validatedData);
    } else {
      settings = await SiteSettings.findByIdAndUpdate(settings._id, validatedData, {
        new: true,
        runValidators: true
      });
    }
    sendSuccess(res, settings, 'Site settings updated successfully');
  } catch (err: any) {
    sendError(res, err.errors ? err.errors[0].message : err.message, 400);
  }
};
