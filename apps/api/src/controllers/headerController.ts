import { Request, Response } from 'express';
import { HeaderSettings } from '../models/HeaderSettings';
import { Material } from '../models/Material';
import { sendSuccess, sendError } from '../utils/response';
import { headerSettingsSchema } from '@vietcraft/shared';

const getDefaultHeader = async () => {
  const materials = await Material.find({ isActive: true }).sort({ displayOrder: 1 });
  const discoverItems = materials.map((m, idx) => ({
    label: m.name,
    url: `/discover/${m.slug}`,
    materialSlug: m.slug,
    order: idx,
    isActive: true
  }));

  return {
    logo: '',
    logoText: 'VietCraft',
    logoAlt: 'VietCraft Natural Living',
    logoUrl: '/',
    showLogo: true,
    navigationItems: [
      { id: 'nav-home', label: 'Home', url: '/', type: 'link', order: 0, isActive: true, openInNewTab: false },
      { id: 'nav-discover', label: 'Discover', url: '/discover', type: 'dropdown', order: 1, isActive: true, openInNewTab: false },
      { id: 'nav-products', label: 'Products', url: '/products', type: 'link', order: 2, isActive: true, openInNewTab: false },
      { id: 'nav-articles', label: 'Journal', url: '/articles', type: 'link', order: 3, isActive: true, openInNewTab: false },
      { id: 'nav-about', label: 'About Us', url: '/about', type: 'link', order: 4, isActive: true, openInNewTab: false }
    ],
    discoverMenu: {
      showDiscover: true,
      label: 'Discover',
      items: discoverItems
    },
    headerCTA: {
      showCTA: true,
      label: 'Explore Journal',
      url: '/articles'
    },
    searchSettings: {
      showSearch: true,
      searchPlaceholder: 'Search handcrafted items, articles, materials...',
      searchPageTitle: 'Search VietCraft Collection',
      searchEmptyStateMessage: 'No handcrafted results found matching your inquiry.'
    },
    stickyHeader: true,
    mobileMenu: true
  };
};

export const getHeaderSettings = async (_req: Request, res: Response): Promise<void> => {
  try {
    let header = await HeaderSettings.findOne();
    if (!header) {
      const defaultHeader = await getDefaultHeader();
      header = await HeaderSettings.create(defaultHeader);
    }
    sendSuccess(res, header, 'Header settings retrieved successfully');
  } catch (err: any) {
    sendError(res, err.message, 500);
  }
};

export const updateHeaderSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = headerSettingsSchema.parse(req.body);
    let header = await HeaderSettings.findOne();
    if (!header) {
      header = await HeaderSettings.create(validatedData);
    } else {
      Object.assign(header, validatedData);
      await header.save();
    }
    sendSuccess(res, header, 'Header settings updated successfully');
  } catch (err: any) {
    sendError(res, err.errors ? err.errors[0].message : err.message, 400);
  }
};

export const getNavigationSettings = async (_req: Request, res: Response): Promise<void> => {
  try {
    let header = await HeaderSettings.findOne();
    if (!header) {
      const defaultHeader = await getDefaultHeader();
      header = await HeaderSettings.create(defaultHeader);
    }
    sendSuccess(
      res,
      {
        navigationItems: header.navigationItems,
        discoverMenu: header.discoverMenu,
        headerCTA: header.headerCTA
      },
      'Navigation settings retrieved successfully'
    );
  } catch (err: any) {
    sendError(res, err.message, 500);
  }
};

export const updateNavigationSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const { navigationItems, discoverMenu, headerCTA } = req.body;
    let header = await HeaderSettings.findOne();
    if (!header) {
      const defaultHeader = await getDefaultHeader();
      header = await HeaderSettings.create(defaultHeader);
    }
    if (navigationItems !== undefined) header.navigationItems = navigationItems;
    if (discoverMenu !== undefined) header.discoverMenu = discoverMenu;
    if (headerCTA !== undefined) header.headerCTA = headerCTA;
    await header.save();
    sendSuccess(
      res,
      {
        navigationItems: header.navigationItems,
        discoverMenu: header.discoverMenu,
        headerCTA: header.headerCTA
      },
      'Navigation settings updated successfully'
    );
  } catch (err: any) {
    sendError(res, err.message, 400);
  }
};

