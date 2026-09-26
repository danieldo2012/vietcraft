export type UserRole = 'admin' | 'editor';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: {
    _id: string;
    name: string;
    email: string;
    role: UserRole;
    avatar?: string;
  };
  token: string;
}

export interface SeoMetadata {
  title?: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
  canonicalUrl?: string;
}

export interface Material {
  _id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  coverImage: string;
  icon?: string;
  displayOrder: number;
  isActive: boolean;
  craftingTechniques?: string[];
  originRegions?: string[];
  seo?: SeoMetadata;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductImage {
  url: string;
  alt: string;
  isPrimary: boolean;
}

export interface ProductDimensions {
  height?: number;
  width?: number;
  depth?: number;
  unit?: string;
}

export type ProductStatus = 'active' | 'draft' | 'archived';
export type PriceSource = 'manual_entry' | 'amazon_paapi' | 'direct_import';

export interface Product {
  _id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  images: ProductImage[];
  material: Material | string;
  category: Category | string;
  asin: string;
  affiliateUrl: string;
  productUrl?: string;
  price: number;
  currency: string;
  priceSource: PriceSource;
  lastChecked: string;
  featured: boolean;
  status: ProductStatus;
  tags: string[];
  dimensions?: ProductDimensions;
  seo?: SeoMetadata;
  createdAt: string;
  updatedAt: string;
}

export interface AmazonScrapedProduct {
  asin: string;
  title: string;
  price: number | null;
  currency: string;
  description: string;
  shortDescription: string;
  images: ProductImage[];
  affiliateUrl: string;
  priceSource: PriceSource;
  rawBullets?: string[];
  dimensions?: ProductDimensions;
}

export type PostStatus = 'draft' | 'published' | 'archived';

export interface PostAuthor {
  name: string;
  avatar?: string;
  bio?: string;
}

export interface Post {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  author: PostAuthor;
  material?: Material | string;
  tags: string[];
  readingTime: number;
  status: PostStatus;
  publishedAt?: string;
  relatedArticles?: (Post | string)[];
  relatedProducts?: (Product | string)[];
  seo?: SeoMetadata;
  createdAt: string;
  updatedAt: string;
}

export interface HeroSlide {
  _id?: string;
  id?: string;
  title: string;
  subtitle: string;
  buttonText: string;
  buttonUrl: string;
  image: string;
  displayOrder: number;
}

export interface MaterialSectionConfig {
  headline: string;
  subheadline: string;
  enabledMaterialIds?: (Material | string)[];
}

export interface AboutSectionConfig {
  title: string;
  body: string;
  quote: string;
  quoteAuthor: string;
  image: string;
  buttonText: string;
  buttonUrl: string;
}

export interface NewsletterSectionConfig {
  headline: string;
  subheadline: string;
  buttonText: string;
}

export interface FooterSectionConfig {
  brandBio: string;
  contactEmail: string;
  copyrightText: string;
  socialLinks: {
    instagram?: string;
    pinterest?: string;
    facebook?: string;
    twitter?: string;
  };
}

export interface HomepageConfig {
  _id?: string;
  heroSlides: HeroSlide[];
  materialSection: MaterialSectionConfig;
  featuredProductIds: (Product | string)[];
  aboutSection: AboutSectionConfig;
  newsletterSection: NewsletterSectionConfig;
  footerSection: FooterSectionConfig;
  sectionOrder: string[];
  isPublished: boolean;
  updatedAt?: string;
}

export interface NavigationItem {
  id: string;
  label: string;
  url: string;
  type: 'link' | 'dropdown';
  order: number;
  isActive: boolean;
  openInNewTab: boolean;
  children?: NavigationItem[];
}

export interface HeaderSettings {
  _id?: string;
  logo: string;
  logoText: string;
  logoAlt: string;
  logoUrl: string;
  showLogo: boolean;
  navigationItems: NavigationItem[];
  discoverMenu: {
    showDiscover: boolean;
    label: string;
    items: {
      label: string;
      url: string;
      materialSlug?: string;
      order: number;
      isActive: boolean;
    }[];
  };
  headerCTA: {
    showCTA: boolean;
    label: string;
    url: string;
  };
  searchSettings: {
    showSearch: boolean;
    searchPlaceholder: string;
    searchPageTitle: string;
    searchEmptyStateMessage: string;
  };
  stickyHeader: boolean;
  mobileMenu: boolean;
  updatedAt?: string;
}

export interface FooterLink {
  id: string;
  label: string;
  url: string;
  openInNewTab: boolean;
  isActive: boolean;
  order?: number;
}

export interface FooterColumn {
  id: string;
  title: string;
  order: number;
  links: FooterLink[];
}

export interface SocialLink {
  platform: string;
  label: string;
  url: string;
  icon?: string;
  isActive: boolean;
  order: number;
}

export interface FooterSettings {
  _id?: string;
  logo: string;
  logoAlt: string;
  description: string;
  columns: FooterColumn[];
  socialLinks: SocialLink[];
  contactInformation: {
    email: string;
    phone: string;
    address: string;
    businessHours: string;
  };
  newsletter: {
    title: string;
    description: string;
    placeholder: string;
    buttonLabel: string;
    successMessage: string;
    errorMessage: string;
    privacyText: string;
  };
  copyright: {
    copyrightText: string;
  };
  legalLinks: FooterLink[];
  updatedAt?: string;
}

export interface Page {
  _id: string;
  title: string;
  slug: string;
  content: string;
  featuredImage?: string;
  seoTitle?: string;
  seoDescription?: string;
  ogImage?: string;
  status: 'draft' | 'published' | 'archived';
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface HomepageSection {
  _id?: string;
  type: 'hero' | 'materials' | 'featured_products' | 'about' | 'newsletter' | 'custom';
  title: string;
  subtitle?: string;
  description?: string;
  content?: string;
  image?: string;
  images?: string[];
  button?: {
    label: string;
    url: string;
    isVisible: boolean;
  };
  items?: any[];
  displayOrder: number;
  isVisible: boolean;
  background?: string;
  layout?: string;
}

export interface SiteSettings {
  _id?: string;
  siteName: string;
  tagline: string;
  brandDescription: string;
  logo: string;
  logoAlt: string;
  favicon: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  socialLinks: SocialLink[];
  defaultTitle: string;
  defaultMetaDescription: string;
  defaultOGImage: string;
  twitterHandle: string;
  privacyPolicy: string;
  terms: string;
  affiliateDisclosure: string;
  googleAnalyticsId: string;
  metaPixelId: string;
  updatedAt?: string;
}

export interface NewsletterSubscriber {
  _id: string;
  email: string;
  status: 'subscribed' | 'unsubscribed';
  subscribedAt: string;
  unsubscribedAt?: string;
  tags?: string[];
  source?: string;
}

export interface AffiliateClickRecord {
  _id: string;
  productId: string | Product;
  asin: string;
  ipHash: string;
  userAgent?: string;
  referrer?: string;
  timestamp: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
    [key: string]: any;
  };
}

export interface SearchParams {
  q?: string;
  type?: 'all' | 'articles' | 'products';
  material?: string;
  category?: string;
  page?: number;
  limit?: number;
}

export interface SearchResult {
  articles: Post[];
  products: Product[];
  totalArticles: number;
  totalProducts: number;
}
