import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Please provide a valid email address').toLowerCase().trim(),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

export const seoSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  ogImage: z.string().optional(),
  canonicalUrl: z.string().optional()
}).optional();

export const materialSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').trim(),
  slug: z.string().min(2, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  shortDescription: z.string().min(5, 'Short description must be at least 5 characters'),
  coverImage: z.string().min(1, 'Cover image is required'),
  icon: z.string().optional(),
  displayOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
  craftingTechniques: z.array(z.string()).optional(),
  originRegions: z.array(z.string()).optional(),
  seo: seoSchema
});

export const categorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').trim(),
  slug: z.string().min(2, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  description: z.string().optional(),
  displayOrder: z.number().int().default(0),
  isActive: z.boolean().default(true)
});

export const productImageSchema = z.object({
  url: z.string().url('Image URL must be valid'),
  alt: z.string().min(1, 'Alt text is required'),
  isPrimary: z.boolean().default(false)
});

export const productSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').trim(),
  slug: z.string().min(3, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  shortDescription: z.string().min(5, 'Short description must be at least 5 characters'),
  images: z.array(productImageSchema).min(1, 'At least one image is required'),
  material: z.string().min(1, 'Material is required'),
  category: z.string().min(1, 'Category is required'),
  asin: z.string().min(10, 'ASIN must be at least 10 characters').max(10, 'ASIN must be 10 characters').regex(/^[A-Z0-9]{10}$/, 'ASIN must be a 10-character alphanumeric string').toUpperCase(),
  affiliateUrl: z.string().url('Affiliate URL must be a valid URL').optional().or(z.literal('')),
  productUrl: z.string().url('Product URL must be a valid URL').optional().or(z.literal('')),
  price: z.number().positive('Price must be greater than 0'),
  currency: z.string().default('USD'),
  priceSource: z.enum(['manual_entry', 'amazon_paapi', 'direct_import']).default('manual_entry'),
  featured: z.boolean().default(false),
  status: z.enum(['active', 'draft', 'archived']).default('active'),
  tags: z.array(z.string()).default([]),
  dimensions: z.object({
    height: z.number().optional(),
    width: z.number().optional(),
    depth: z.number().optional(),
    unit: z.string().default('in')
  }).optional(),
  seo: seoSchema.optional()
});

export const postSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').trim(),
  slug: z.string().min(3, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  excerpt: z.string().min(10, 'Excerpt must be at least 10 characters'),
  content: z.string().min(20, 'Content must be at least 20 characters'),
  featuredImage: z.string().url('Featured image must be a valid URL'),
  author: z.object({
    name: z.string().min(2, 'Author name is required'),
    avatar: z.string().optional(),
    bio: z.string().optional()
  }),
  material: z.string().optional(),
  tags: z.array(z.string()).default([]),
  readingTime: z.number().int().positive().default(5),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  publishedAt: z.string().optional(),
  relatedArticles: z.array(z.string()).optional(),
  relatedProducts: z.array(z.string()).optional(),
  seo: seoSchema.optional()
});

const idOrPopulated = z.union([
  z.string(),
  z.object({ _id: z.any().optional(), id: z.any().optional() }).passthrough().transform((val) => {
    const idVal = val._id || val.id;
    return idVal ? String(idVal) : '';
  })
]);

export const heroSlideSchema = z.object({
  _id: z.any().optional(),
  id: z.any().optional(),
  title: z.string().min(2, 'Title is required'),
  subtitle: z.string().min(2, 'Subtitle is required'),
  buttonText: z.string().min(1, 'Button text is required'),
  buttonUrl: z.string().min(1, 'Button URL is required'),
  image: z.string().min(1, 'Image is required'),
  displayOrder: z.number().int().default(0)
});

export const homepageSchema = z.object({
  heroSlides: z.array(heroSlideSchema).min(1, 'At least one hero slide is required'),
  materialSection: z.object({
    headline: z.string().min(2, 'Headline is required'),
    subheadline: z.string().min(2, 'Subheadline is required'),
    enabledMaterialIds: z.array(idOrPopulated).optional()
  }),
  featuredProductIds: z.array(idOrPopulated).default([]),
  aboutSection: z.object({
    title: z.string().min(2, 'Title is required'),
    body: z.string().min(10, 'Body is required'),
    quote: z.string().min(5, 'Quote is required'),
    quoteAuthor: z.string().min(2, 'Quote author is required'),
    image: z.string().min(1, 'Image is required'),
    buttonText: z.string().optional().default('Read Our Story'),
    buttonUrl: z.string().optional().default('/about')
  }),
  newsletterSection: z.object({
    headline: z.string().min(2, 'Headline is required'),
    subheadline: z.string().min(2, 'Subheadline is required'),
    buttonText: z.string().min(1, 'Button text is required')
  }).optional(),
  footerSection: z.object({
    brandBio: z.string().min(10, 'Brand bio is required'),
    contactEmail: z.string().email('Invalid email'),
    copyrightText: z.string().min(2, 'Copyright text is required'),
    socialLinks: z.object({
      instagram: z.string().optional(),
      pinterest: z.string().optional(),
      facebook: z.string().optional(),
      twitter: z.string().optional()
    }).optional()
  }).optional(),
  sectionOrder: z.array(z.string()).default(['hero', 'materials', 'featuredProducts', 'about', 'newsletter']),
  isPublished: z.boolean().default(true)
});

export const navigationItemSchema = z.object({
  id: z.string(),
  label: z.string().min(1, 'Label is required'),
  url: z.string().min(1, 'URL is required'),
  type: z.enum(['link', 'dropdown']).default('link'),
  order: z.number().default(0),
  isActive: z.boolean().default(true),
  openInNewTab: z.boolean().default(false),
  children: z.array(z.any()).optional()
});

export const headerSettingsSchema = z.object({
  logo: z.string().default(''),
  logoText: z.string().default('VietCraft'),
  logoAlt: z.string().default('VietCraft Natural Decor'),
  logoUrl: z.string().default('/'),
  showLogo: z.boolean().default(true),
  navigationItems: z.array(navigationItemSchema).default([]),
  discoverMenu: z.object({
    showDiscover: z.boolean().default(true),
    label: z.string().default('Discover'),
    items: z.array(z.object({
      label: z.string(),
      url: z.string(),
      materialSlug: z.string().optional(),
      order: z.number().default(0),
      isActive: z.boolean().default(true)
    })).default([])
  }).default({
    showDiscover: true,
    label: 'Discover',
    items: []
  }),
  headerCTA: z.object({
    showCTA: z.boolean().default(true),
    label: z.string().default('Explore Journal'),
    url: z.string().default('/articles')
  }).default({
    showCTA: true,
    label: 'Explore Journal',
    url: '/articles'
  }),
  searchSettings: z.object({
    showSearch: z.boolean().default(true),
    searchPlaceholder: z.string().default('Search handcrafted items, articles, materials...'),
    searchPageTitle: z.string().default('Search VietCraft Collection'),
    searchEmptyStateMessage: z.string().default('No handcrafted results found matching your inquiry.')
  }).default({
    showSearch: true,
    searchPlaceholder: 'Search handcrafted items, articles, materials...',
    searchPageTitle: 'Search VietCraft Collection',
    searchEmptyStateMessage: 'No handcrafted results found matching your inquiry.'
  }),
  stickyHeader: z.boolean().default(true),
  mobileMenu: z.boolean().default(true)
});

export const footerLinkSchema = z.object({
  id: z.string(),
  label: z.string().min(1, 'Label is required'),
  url: z.string().min(1, 'URL is required'),
  openInNewTab: z.boolean().default(false),
  isActive: z.boolean().default(true),
  order: z.number().optional().default(0)
});

export const footerColumnSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Column title is required'),
  order: z.number().default(0),
  links: z.array(footerLinkSchema).default([])
});

export const socialLinkSchema = z.object({
  platform: z.string().min(1, 'Platform is required'),
  label: z.string().min(1, 'Label is required'),
  url: z.string().min(1, 'URL is required'),
  icon: z.string().optional(),
  isActive: z.boolean().default(true),
  order: z.number().default(0)
});

export const footerSettingsSchema = z.object({
  logo: z.string().default(''),
  logoAlt: z.string().default('VietCraft'),
  description: z.string().default('Discover natural beauty, thoughtful living, and timeless home decor inspired by Vietnam.'),
  columns: z.array(footerColumnSchema).default([]),
  socialLinks: z.array(socialLinkSchema).default([]),
  contactInformation: z.object({
    email: z.string().default('hello@vietcraft.com'),
    phone: z.string().default('+1 (800) 555-CRAFT'),
    address: z.string().default('Hanoi Artisan Guild, Vietnam & Distribution Center, USA'),
    businessHours: z.string().default('Mon - Fri: 9:00 AM - 6:00 PM EST')
  }).default({
    email: 'hello@vietcraft.com',
    phone: '+1 (800) 555-CRAFT',
    address: 'Hanoi Artisan Guild, Vietnam & Distribution Center, USA',
    businessHours: 'Mon - Fri: 9:00 AM - 6:00 PM EST'
  }),
  newsletter: z.object({
    title: z.string().default('Join Our Slow Living Journal'),
    description: z.string().default('Weekly artisanal features, craft village stories, and mindful interior inspirations.'),
    placeholder: z.string().default('Enter your email address'),
    buttonLabel: z.string().default('Subscribe'),
    successMessage: z.string().default('Thank you for subscribing to the VietCraft journal!'),
    errorMessage: z.string().default('Could not subscribe. Please try again.'),
    privacyText: z.string().default('Zero spam. Unsubscribe anytime.')
  }).default({
    title: 'Join Our Slow Living Journal',
    description: 'Weekly artisanal features, craft village stories, and mindful interior inspirations.',
    placeholder: 'Enter your email address',
    buttonLabel: 'Subscribe',
    successMessage: 'Thank you for subscribing to the VietCraft journal!',
    errorMessage: 'Could not subscribe. Please try again.',
    privacyText: 'Zero spam. Unsubscribe anytime.'
  }),
  copyright: z.object({
    copyrightText: z.string().default('© 2026 VietCraft. Handcrafted with reverence for Vietnamese artisans. All rights reserved.')
  }).default({
    copyrightText: '© 2026 VietCraft. Handcrafted with reverence for Vietnamese artisans. All rights reserved.'
  }),
  legalLinks: z.array(footerLinkSchema).default([])
});

export const pageSchema = z.object({
  title: z.string().min(2, 'Page title must be at least 2 characters'),
  slug: z.string().min(2, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  featuredImage: z.string().optional().or(z.literal('')),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  ogImage: z.string().optional(),
  status: z.enum(['draft', 'published', 'archived']).default('published'),
  publishedAt: z.string().optional()
});

export const siteSettingsSchema = z.object({
  siteName: z.string().min(2, 'Site name is required').default('VietCraft'),
  tagline: z.string().default('Natural Living & Vietnamese Craftsmanship'),
  brandDescription: z.string().default('Discover natural beauty, thoughtful living, and timeless home decor inspired by Vietnam.'),
  logo: z.string().optional().default(''),
  logoAlt: z.string().optional().default('VietCraft'),
  favicon: z.string().optional().default(''),
  contactEmail: z.string().email('Invalid email').default('hello@vietcraft.com'),
  contactPhone: z.string().optional().default('+1 (800) 555-CRAFT'),
  address: z.string().optional().default('Hanoi, Vietnam'),
  socialLinks: z.array(socialLinkSchema).default([]),
  defaultTitle: z.string().default('VietCraft | Natural Home Decor & Vietnamese Craftsmanship'),
  defaultMetaDescription: z.string().default('Discover handcrafted Vietnamese home decor, organic materials, and mindful interior design.'),
  defaultOGImage: z.string().optional().default(''),
  twitterHandle: z.string().optional().default('@vietcraft'),
  privacyPolicy: z.string().optional().default(''),
  terms: z.string().optional().default(''),
  affiliateDisclosure: z.string().optional().default(''),
  googleAnalyticsId: z.string().optional().default(''),
  metaPixelId: z.string().optional().default('')
});

export const homepageSectionSchema = z.object({
  type: z.enum(['hero', 'materials', 'featured_products', 'about', 'newsletter', 'custom']),
  title: z.string().min(2, 'Title is required'),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  content: z.string().optional(),
  image: z.string().optional(),
  images: z.array(z.string()).optional(),
  button: z.object({
    label: z.string(),
    url: z.string(),
    isVisible: z.boolean().default(true)
  }).optional(),
  items: z.array(z.any()).optional(),
  displayOrder: z.number().default(0),
  isVisible: z.boolean().default(true),
  background: z.string().optional(),
  layout: z.string().optional()
});

export const settingsSchema = z.object({
  siteName: z.string().min(2, 'Site name is required'),
  logo: z.string().optional(),
  favicon: z.string().optional(),
  brandDescription: z.string().min(10, 'Brand description is required'),
  socialLinks: z.object({
    instagram: z.string().optional(),
    pinterest: z.string().optional(),
    facebook: z.string().optional(),
    twitter: z.string().optional()
  }).optional(),
  contactEmail: z.string().email('Invalid email'),
  footerDescription: z.string().min(10, 'Footer description is required'),
  affiliateDisclosure: z.string().min(20, 'Affiliate disclosure is required'),
  defaultSeo: z.object({
    metaTitle: z.string().min(2, 'Meta title is required'),
    metaDescription: z.string().min(10, 'Meta description is required'),
    ogImage: z.string().optional(),
    keywords: z.array(z.string()).default([])
  }).optional()
});

export const newsletterSchema = z.object({
  email: z.string().email('Please enter a valid email address').toLowerCase().trim(),
  source: z.string().optional()
});

export const contactSchema = z.object({
  name: z.string().min(2, 'Name is required').trim(),
  email: z.string().email('Please enter a valid email address').toLowerCase().trim(),
  subject: z.string().min(3, 'Subject is required').trim(),
  message: z.string().min(10, 'Message must be at least 10 characters').trim()
});

export const searchQuerySchema = z.object({
  q: z.string().optional().default(''),
  type: z.enum(['all', 'articles', 'products']).optional().default('all'),
  material: z.string().optional(),
  category: z.string().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(12)
});
