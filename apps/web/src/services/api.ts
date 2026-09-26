import axios from 'axios';
import {
  ApiResponse,
  HomepageConfig,
  HeaderSettings,
  FooterSettings,
  Page,
  SiteSettings,
  Material,
  Category,
  Product,
  Post,
  SearchResult,
  SearchParams
} from '@vietcraft/shared';

const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

export const api = {
  // Header CMS
  getHeader: async (): Promise<HeaderSettings> => {
    const res = await apiClient.get<ApiResponse<HeaderSettings>>('/header');
    return res.data.data;
  },

  // Footer CMS
  getFooter: async (): Promise<FooterSettings> => {
    const res = await apiClient.get<ApiResponse<FooterSettings>>('/footer');
    return res.data.data;
  },

  // Dynamic Pages CMS
  getPageBySlug: async (slug: string): Promise<Page> => {
    const res = await apiClient.get<ApiResponse<Page>>(`/pages/${slug}`);
    return res.data.data;
  },

  getPages: async (): Promise<Page[]> => {
    const res = await apiClient.get<ApiResponse<Page[]>>('/pages');
    return res.data.data;
  },

  // Homepage
  getHomepage: async (): Promise<HomepageConfig> => {
    const res = await apiClient.get<ApiResponse<HomepageConfig>>('/homepage');
    return res.data.data;
  },

  // Settings
  getSettings: async (): Promise<SiteSettings> => {
    const res = await apiClient.get<ApiResponse<SiteSettings>>('/settings');
    return res.data.data;
  },

  // Materials
  getMaterials: async (): Promise<Material[]> => {
    const res = await apiClient.get<ApiResponse<Material[]>>('/materials');
    return res.data.data;
  },

  getMaterialBySlug: async (
    slug: string
  ): Promise<{ material: Material; articles: Post[]; products: Product[] }> => {
    const res = await apiClient.get<ApiResponse<{ material: Material; articles: Post[]; products: Product[] }>>(
      `/materials/${slug}`
    );
    return res.data.data;
  },

  // Categories
  getCategories: async (): Promise<Category[]> => {
    const res = await apiClient.get<ApiResponse<Category[]>>('/categories');
    return res.data.data;
  },

  // Products
  getProducts: async (params: {
    material?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    sort?: string;
    featured?: boolean;
    page?: number;
    limit?: number;
  }): Promise<{ products: Product[]; meta: any }> => {
    const res = await apiClient.get<ApiResponse<Product[]>>('/products', { params });
    return {
      products: res.data.data,
      meta: res.data.meta
    };
  },

  getProductBySlug: async (
    slug: string
  ): Promise<{ product: Product; relatedProducts: Product[] }> => {
    const res = await apiClient.get<ApiResponse<{ product: Product; relatedProducts: Product[] }>>(
      `/products/${slug}`
    );
    return res.data.data;
  },

  trackAffiliateClick: async (
    productId: string
  ): Promise<{ affiliateUrl: string; asin: string; disclosure: string }> => {
    const res = await apiClient.post<ApiResponse<{ affiliateUrl: string; asin: string; disclosure: string }>>(
      `/products/${productId}/click`
    );
    return res.data.data;
  },

  // Articles / Posts
  getArticles: async (params?: {
    material?: string;
    tag?: string;
    page?: number;
    limit?: number;
  }): Promise<{ articles: Post[]; meta: any }> => {
    const res = await apiClient.get<ApiResponse<Post[]>>('/articles', { params });
    return {
      articles: res.data.data,
      meta: res.data.meta
    };
  },

  getArticleBySlug: async (
    slug: string
  ): Promise<{ post: Post; relatedArticles: Post[] }> => {
    const res = await apiClient.get<ApiResponse<{ post: Post; relatedArticles: Post[] }>>(
      `/articles/${slug}`
    );
    return res.data.data;
  },

  // Search
  search: async (params: SearchParams): Promise<{ results: SearchResult; meta: any }> => {
    const res = await apiClient.get<ApiResponse<SearchResult>>('/search', { params });
    return {
      results: res.data.data,
      meta: res.data.meta
    };
  },

  // Newsletter
  subscribeNewsletter: async (email: string, source = 'website'): Promise<{ email: string }> => {
    const res = await apiClient.post<ApiResponse<{ email: string }>>('/newsletter/subscribe', {
      email,
      source
    });
    return res.data.data;
  },

  // Contact
  submitContact: async (data: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }): Promise<{ received: boolean }> => {
    const res = await apiClient.post<ApiResponse<{ received: boolean }>>('/contact', data);
    return res.data.data;
  }
};
