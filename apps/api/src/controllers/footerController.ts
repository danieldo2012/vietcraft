import { Request, Response } from 'express';
import { FooterSettings } from '../models/FooterSettings';
import { sendSuccess, sendError } from '../utils/response';
import { footerSettingsSchema } from '@vietcraft/shared';

const getDefaultFooter = () => ({
  logo: '',
  logoAlt: 'VietCraft Natural Decor',
  description:
    'Discover natural beauty, thoughtful living, and timeless home decor inspired by Vietnam. We curate authentic artisanal craftsmanship—rattan, ceramics, lacquer, and wild silk—for mindful living spaces across the United States.',
  columns: [
    {
      id: 'col-explore',
      title: 'Explore',
      order: 0,
      links: [
        { id: 'link-products', label: 'All Decor Items', url: '/products', openInNewTab: false, isActive: true },
        { id: 'link-discover', label: 'Discover Materials', url: '/discover', openInNewTab: false, isActive: true },
        { id: 'link-journal', label: 'Artisan Journal', url: '/articles', openInNewTab: false, isActive: true }
      ]
    },
    {
      id: 'col-materials',
      title: 'Materials',
      order: 1,
      links: [
        { id: 'link-rattan', label: 'Rattan & Bamboo', url: '/discover/rattan-bamboo', openInNewTab: false, isActive: true },
        { id: 'link-ceramics', label: 'Ceramics', url: '/discover/ceramics', openInNewTab: false, isActive: true },
        { id: 'link-lacquer', label: 'Lacquer', url: '/discover/lacquer', openInNewTab: false, isActive: true },
        { id: 'link-wood', label: 'Wood', url: '/discover/wood', openInNewTab: false, isActive: true },
        { id: 'link-woven', label: 'Woven Fibers', url: '/discover/woven-fibers', openInNewTab: false, isActive: true },
        { id: 'link-silk', label: 'Silk', url: '/discover/silk', openInNewTab: false, isActive: true }
      ]
    },
    {
      id: 'col-about',
      title: 'About & Legal',
      order: 2,
      links: [
        { id: 'link-about', label: 'Our Story', url: '/about', openInNewTab: false, isActive: true },
        { id: 'link-affiliate', label: 'Affiliate Disclosure', url: '/affiliate-disclosure', openInNewTab: false, isActive: true },
        { id: 'link-privacy', label: 'Privacy Policy', url: '/privacy-policy', openInNewTab: false, isActive: true },
        { id: 'link-terms', label: 'Terms of Service', url: '/terms', openInNewTab: false, isActive: true }
      ]
    }
  ],
  socialLinks: [
    { platform: 'Instagram', label: 'VietCraft Instagram', url: 'https://instagram.com/vietcrafthome', icon: 'Instagram', isActive: true, order: 0 },
    { platform: 'Pinterest', label: 'VietCraft Pinterest', url: 'https://pinterest.com/vietcrafthome', icon: 'Sparkles', isActive: true, order: 1 },
    { platform: 'Facebook', label: 'VietCraft Facebook', url: 'https://facebook.com/vietcrafthome', icon: 'Facebook', isActive: true, order: 2 }
  ],
  contactInformation: {
    email: 'hello@vietcraft.com',
    phone: '+1 (800) 555-CRAFT',
    address: 'Hanoi Artisan Guild, Vietnam & Distribution Center, USA',
    businessHours: 'Mon - Fri: 9:00 AM - 6:00 PM EST'
  },
  newsletter: {
    title: 'Join Our Slow Living Community',
    description: 'Weekly curated essays on ancient craft villages, slow interiors, and intentional living.',
    placeholder: 'Enter your email address',
    buttonLabel: 'Subscribe',
    successMessage: 'Thank you for joining our slow living community!',
    errorMessage: 'Subscription failed. Please try again.',
    privacyText: 'Zero spam. Unsubscribe anytime.'
  },
  copyright: {
    copyrightText: '© 2026 VietCraft. Handcrafted with reverence for Vietnamese artisans. All rights reserved.'
  },
  legalLinks: [
    { id: 'leg-affiliate', label: 'Affiliate Disclosure', url: '/affiliate-disclosure', openInNewTab: false, isActive: true },
    { id: 'leg-privacy', label: 'Privacy Policy', url: '/privacy-policy', openInNewTab: false, isActive: true },
    { id: 'leg-terms', label: 'Terms of Service', url: '/terms', openInNewTab: false, isActive: true }
  ]
});

export const getFooterSettings = async (_req: Request, res: Response): Promise<void> => {
  try {
    let footer = await FooterSettings.findOne();
    if (!footer) {
      footer = await FooterSettings.create(getDefaultFooter());
    }
    sendSuccess(res, footer, 'Footer settings retrieved successfully');
  } catch (err: any) {
    sendError(res, err.message, 500);
  }
};

export const updateFooterSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = footerSettingsSchema.parse(req.body);
    let footer = await FooterSettings.findOne();
    if (!footer) {
      footer = await FooterSettings.create(validatedData);
    } else {
      Object.assign(footer, validatedData);
      await footer.save();
    }
    sendSuccess(res, footer, 'Footer settings updated successfully');
  } catch (err: any) {
    sendError(res, err.errors ? err.errors[0].message : err.message, 400);
  }
};
