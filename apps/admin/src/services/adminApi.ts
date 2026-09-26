import axios from 'axios';
import {
  ApiResponse,
  AuthResponse,
  Post,
  Product,
  AmazonScrapedProduct,
  Material,
  Category,
  HomepageConfig,
  HeaderSettings,
  FooterSettings,
  Page,
  SiteSettings,
  ContactMessage,
  NewsletterSubscriber
} from '@vietcraft/shared';

const adminClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor: attach token
adminClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('vc_admin_token') || localStorage.getItem('fl_admin_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: handle 401
adminClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('vc_admin_token');
      localStorage.removeItem('vc_admin_user');
      localStorage.removeItem('fl_admin_token');
      localStorage.removeItem('fl_admin_user');
      if (window.location.pathname !== '/admin/login') {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

export const adminApi = {
  // Auth
  login: async (credentials: { email: string; password: string }): Promise<AuthResponse> => {
    const res = await adminClient.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
    return res.data.data;
  },

  getMe: async (): Promise<any> => {
    const res = await adminClient.get<ApiResponse<any>>('/auth/me');
    return res.data.data;
  },

  logout: async (): Promise<void> => {
    try {
      await adminClient.post('/auth/logout');
    } finally {
      localStorage.removeItem('vc_admin_token');
      localStorage.removeItem('vc_admin_user');
      localStorage.removeItem('fl_admin_token');
      localStorage.removeItem('fl_admin_user');
    }
  },

  // Dashboard & Analytics
  getDashboardStats: async (): Promise<any> => {
    const res = await adminClient.get<ApiResponse<any>>('/admin/dashboard');
    return res.data.data;
  },

  getClickAnalytics: async (): Promise<any> => {
    const res = await adminClient.get<ApiResponse<any>>('/admin/clicks');
    return res.data.data;
  },

  // Posts
  getPosts: async (params?: any): Promise<{ posts: Post[]; meta: any }> => {
    const res = await adminClient.get<ApiResponse<Post[]>>('/posts/admin/all', { params });
    return {
      posts: res.data.data,
      meta: res.data.meta
    };
  },

  getPostById: async (id: string): Promise<Post> => {
    const res = await adminClient.get<ApiResponse<Post>>(`/posts/admin/${id}`);
    return res.data.data;
  },

  createPost: async (data: any): Promise<Post> => {
    const res = await adminClient.post<ApiResponse<Post>>('/posts', data);
    return res.data.data;
  },

  updatePost: async (id: string, data: any): Promise<Post> => {
    const res = await adminClient.put<ApiResponse<Post>>(`/posts/${id}`, data);
    return res.data.data;
  },

  deletePost: async (id: string): Promise<void> => {
    await adminClient.delete(`/posts/${id}`);
  },

  // Products
  getProducts: async (params?: any): Promise<{ products: Product[]; meta: any }> => {
    const res = await adminClient.get<ApiResponse<Product[]>>('/products/admin/all', { params });
    return {
      products: res.data.data,
      meta: res.data.meta
    };
  },

  getProductById: async (id: string): Promise<Product> => {
    const res = await adminClient.get<ApiResponse<Product>>(`/products/admin/${id}`);
    return res.data.data;
  },

  createProduct: async (data: any): Promise<Product> => {
    const res = await adminClient.post<ApiResponse<Product>>('/products', data);
    return res.data.data;
  },

  updateProduct: async (id: string, data: any): Promise<Product> => {
    const res = await adminClient.put<ApiResponse<Product>>(`/products/${id}`, data);
    return res.data.data;
  },

  deleteProduct: async (id: string): Promise<void> => {
    await adminClient.delete(`/products/${id}`);
  },

  scrapeAmazonProduct: async (url: string): Promise<AmazonScrapedProduct> => {
    const res = await adminClient.post<ApiResponse<AmazonScrapedProduct>>('/products/admin/scrape-amazon', { url });
    return res.data.data;
  },

  // Materials
  getMaterials: async (): Promise<Material[]> => {
    const res = await adminClient.get<ApiResponse<Material[]>>('/materials/admin/all');
    return res.data.data;
  },

  createMaterial: async (data: any): Promise<Material> => {
    const res = await adminClient.post<ApiResponse<Material>>('/materials', data);
    return res.data.data;
  },

  updateMaterial: async (id: string, data: any): Promise<Material> => {
    const res = await adminClient.put<ApiResponse<Material>>(`/materials/${id}`, data);
    return res.data.data;
  },

  deleteMaterial: async (id: string): Promise<void> => {
    await adminClient.delete(`/materials/${id}`);
  },

  // Categories
  getCategories: async (): Promise<Category[]> => {
    const res = await adminClient.get<ApiResponse<Category[]>>('/categories/admin/all');
    return res.data.data;
  },

  createCategory: async (data: any): Promise<Category> => {
    const res = await adminClient.post<ApiResponse<Category>>('/categories', data);
    return res.data.data;
  },

  updateCategory: async (id: string, data: any): Promise<Category> => {
    const res = await adminClient.put<ApiResponse<Category>>(`/categories/${id}`, data);
    return res.data.data;
  },

  deleteCategory: async (id: string): Promise<void> => {
    await adminClient.delete(`/categories/${id}`);
  },

  // Header CMS
  getHeaderSettings: async (): Promise<HeaderSettings> => {
    const res = await adminClient.get<ApiResponse<HeaderSettings>>('/header');
    return res.data.data;
  },

  updateHeaderSettings: async (data: HeaderSettings): Promise<HeaderSettings> => {
    const res = await adminClient.put<ApiResponse<HeaderSettings>>('/header', data);
    return res.data.data;
  },

  // Footer CMS
  getFooterSettings: async (): Promise<FooterSettings> => {
    const res = await adminClient.get<ApiResponse<FooterSettings>>('/footer');
    return res.data.data;
  },

  updateFooterSettings: async (data: FooterSettings): Promise<FooterSettings> => {
    const res = await adminClient.put<ApiResponse<FooterSettings>>('/footer', data);
    return res.data.data;
  },

  // Pages CMS
  getPages: async (): Promise<Page[]> => {
    const res = await adminClient.get<ApiResponse<Page[]>>('/pages');
    return res.data.data;
  },

  getPageBySlug: async (slug: string): Promise<Page> => {
    const res = await adminClient.get<ApiResponse<Page>>(`/pages/${slug}`);
    return res.data.data;
  },

  createPage: async (data: Partial<Page>): Promise<Page> => {
    const res = await adminClient.post<ApiResponse<Page>>('/pages', data);
    return res.data.data;
  },

  updatePage: async (id: string, data: Partial<Page>): Promise<Page> => {
    const res = await adminClient.put<ApiResponse<Page>>(`/pages/${id}`, data);
    return res.data.data;
  },

  deletePage: async (id: string): Promise<void> => {
    await adminClient.delete(`/pages/${id}`);
  },

  // Homepage CMS
  getHomepage: async (): Promise<HomepageConfig> => {
    const res = await adminClient.get<ApiResponse<HomepageConfig>>('/homepage/admin');
    return res.data.data;
  },

  updateHomepage: async (data: any): Promise<HomepageConfig> => {
    const res = await adminClient.put<ApiResponse<HomepageConfig>>('/homepage/admin', data);
    return res.data.data;
  },

  // Settings
  getSettings: async (): Promise<SiteSettings> => {
    const res = await adminClient.get<ApiResponse<SiteSettings>>('/settings/admin');
    return res.data.data;
  },

  updateSettings: async (data: any): Promise<SiteSettings> => {
    const res = await adminClient.put<ApiResponse<SiteSettings>>('/settings/admin', data);
    return res.data.data;
  },

  // Contact Messages
  getContactMessages: async (): Promise<ContactMessage[]> => {
    const res = await adminClient.get<ApiResponse<ContactMessage[]>>('/contact');
    return res.data.data;
  },

  markContactRead: async (id: string): Promise<ContactMessage> => {
    const res = await adminClient.patch<ApiResponse<ContactMessage>>(`/contact/${id}/read`);
    return res.data.data;
  },

  // Newsletter Subscribers
  getNewsletterSubscribers: async (page = 1, limit = 25): Promise<{ subscribers: NewsletterSubscriber[]; meta: any }> => {
    const res = await adminClient.get<ApiResponse<NewsletterSubscriber[]>>('/newsletter/admin', {
      params: { page, limit }
    });
    return {
      subscribers: res.data.data,
      meta: res.data.meta
    };
  },

  // Upload
  uploadImage: async (file: File): Promise<{ url: string; publicId: string }> => {
    const formData = new FormData();
    formData.append('image', file);
    const res = await adminClient.post<ApiResponse<{ url: string; publicId: string }>>('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data.data;
  }
};

