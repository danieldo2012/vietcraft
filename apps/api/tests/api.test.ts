import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { connectDB, disconnectDB } from '../src/config/db';
import { Application } from 'express';
import { User, Material, Category, Product, Post } from '../src/models';

let app: Application;
let adminToken: string;
let createdMaterialId: string;
let createdCategoryId: string;
let createdProductId: string;
let createdPostId: string;

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  await connectDB();
  app = createApp();

  // Create an admin user for testing
  await User.deleteMany({});
  const admin = await User.create({
    name: 'Test Admin',
    email: 'testadmin@vietcraft.com',
    password: 'Password123!',
    role: 'admin'
  });

  // Perform login to acquire JWT token
  const res = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'testadmin@vietcraft.com',
      password: 'Password123!'
    });

  adminToken = res.body.data.token;
});

afterAll(async () => {
  await disconnectDB();
});

describe('1. Authentication & Authorization', () => {
  it('should reject login with wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'testadmin@vietcraft.com', password: 'WrongPassword' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should allow login with valid credentials and return JWT', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'testadmin@vietcraft.com', password: 'Password123!' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.role).toBe('admin');
  });

  it('should access protected /api/auth/me with Bearer token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe('testadmin@vietcraft.com');
  });

  it('should reject access to protected routes without token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });
});

describe('2. Material CRUD API', () => {
  it('should create a new material when authenticated as admin', async () => {
    const res = await request(app)
      .post('/api/materials')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Test Rattan Medium',
        slug: 'test-rattan-medium',
        shortDescription: 'Flexible stalks from river valleys.',
        description: 'Comprehensive artisanal lore for split rattan framing.',
        coverImage: 'https://images.unsplash.com/photo-1594040226829-7f251ab46d80',
        displayOrder: 1,
        isActive: true,
        craftingTechniques: ['Hand-splitting', 'Smoking'],
        originRegions: ['Chương Mỹ']
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.slug).toBe('test-rattan-medium');
    createdMaterialId = res.body.data._id;
  });

  it('should retrieve active materials via public GET /api/materials', async () => {
    const res = await request(app).get('/api/materials');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.some((m: any) => m.slug === 'test-rattan-medium')).toBe(true);
  });

  it('should retrieve material by slug via public GET /api/materials/:slug', async () => {
    const res = await request(app).get('/api/materials/test-rattan-medium');
    expect(res.status).toBe(200);
    expect(res.body.data.material.name).toBe('Test Rattan Medium');
  });
});

describe('3. Category CRUD API', () => {
  it('should create a category via admin endpoint', async () => {
    const res = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Lighting Vessels',
        slug: 'lighting-vessels',
        description: 'Pendant lamps and floor fixtures',
        displayOrder: 0,
        isActive: true
      });

    expect(res.status).toBe(201);
    expect(res.body.data.slug).toBe('lighting-vessels');
    createdCategoryId = res.body.data._id;
  });

  it('should list active categories via public GET /api/categories', async () => {
    const res = await request(app).get('/api/categories');
    expect(res.status).toBe(200);
    expect(res.body.data.some((c: any) => c.slug === 'lighting-vessels')).toBe(true);
  });
});

describe('4. Product CRUD & Affiliate Tracking API', () => {
  it('should reject product creation with invalid ASIN', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Invalid ASIN Product',
        slug: 'invalid-asin-product',
        shortDescription: 'Short summary',
        description: 'Detailed description of the product',
        asin: 'INVALID', // Not 10 chars
        affiliateUrl: 'https://www.amazon.com/dp/INVALID?tag=vietcraft-20',
        price: 99.0,
        material: createdMaterialId,
        category: createdCategoryId,
        images: [{ url: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15', alt: 'Test', isPrimary: true }]
      });

    expect(res.status).toBe(400);
  });

  it('should create product with valid ASIN and format', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Artisan Bamboo Lantern',
        slug: 'artisan-bamboo-lantern',
        shortDescription: 'Warm ambient glow hand-woven from bamboo.',
        description: 'Authentic split bamboo lantern handcrafted in northern craft guilds.',
        asin: 'B09X1K87B2',
        affiliateUrl: 'https://www.amazon.com/dp/B09X1K87B2?tag=vietcraft-20',
        price: 85.0,
        material: createdMaterialId,
        category: createdCategoryId,
        images: [{ url: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15', alt: 'Lantern', isPrimary: true }],
        featured: true,
        status: 'active',
        tags: ['bamboo', 'lantern', 'lighting']
      });

    expect(res.status).toBe(201);
    expect(res.body.data.asin).toBe('B09X1K87B2');
    createdProductId = res.body.data._id;
  });

  it('should list products with filters via GET /api/products', async () => {
    const res = await request(app).get('/api/products?material=test-rattan-medium');
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.meta.total).toBeGreaterThan(0);
  });

  it('should record affiliate click and return outbound Amazon link', async () => {
    const res = await request(app).post(`/api/products/${createdProductId}/click`);
    expect(res.status).toBe(200);
    expect(res.body.data.affiliateUrl).toContain('amazon.com/dp/B09X1K87B2');
    expect(res.body.data.disclosure).toBeDefined();
  });
});

describe('5. Post / Journal CRUD API', () => {
  it('should create a post as draft by default', async () => {
    const res = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Mastering Bamboo Weaving in Modern Homes',
        slug: 'mastering-bamboo-weaving-in-modern-homes',
        excerpt: 'An editorial on how split bamboo brings organic warmth.',
        content: '<p>Long before plastic dominated, Vietnamese artisans developed intricate radial patterns...</p>',
        featuredImage: 'https://images.unsplash.com/photo-1594040226829-7f251ab46d80',
        author: { name: 'Linh Tran' },
        material: createdMaterialId,
        tags: ['bamboo', 'weaving', 'slow living'],
        status: 'draft'
      });

    expect(res.status).toBe(201);
    expect(res.body.data.readingTime).toBeGreaterThanOrEqual(1);
    createdPostId = res.body.data._id;
  });

  it('should NOT display draft posts in public GET /api/articles', async () => {
    const res = await request(app).get('/api/articles');
    expect(res.status).toBe(200);
    expect(res.body.data.some((p: any) => p._id === createdPostId)).toBe(false);
  });

  it('should publish the post and make it visible publicly', async () => {
    const updateRes = await request(app)
      .put(`/api/posts/${createdPostId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'published' });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.data.status).toBe('published');

    const publicRes = await request(app).get('/api/articles');
    expect(publicRes.body.data.some((p: any) => p._id === createdPostId)).toBe(true);
  });
});

describe('6. Unified Search API', () => {
  it('should return articles and products matching query string', async () => {
    const res = await request(app).get('/api/search?q=Bamboo');
    expect(res.status).toBe(200);
    expect(res.body.data.products.length).toBeGreaterThan(0);
    expect(res.body.meta.total).toBeGreaterThan(0);
  });
});

describe('7. Newsletter & Contact Form API', () => {
  it('should subscribe a new email to the newsletter', async () => {
    const res = await request(app)
      .post('/api/newsletter/subscribe')
      .send({ email: 'mindful.decor@example.com', source: 'test' });

    expect(res.status).toBe(201);
    expect(res.body.data.email).toBe('mindful.decor@example.com');
  });

  it('should gracefully handle duplicate newsletter subscription', async () => {
    const res = await request(app)
      .post('/api/newsletter/subscribe')
      .send({ email: 'mindful.decor@example.com', source: 'test' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should accept contact inquiries with valid payload', async () => {
    const res = await request(app)
      .post('/api/contact')
      .send({
        name: 'Sarah Parker',
        email: 'sarah.parker@example.com',
        subject: 'Artisan Collaboration',
        message: 'I would love to feature your Vietnamese ceramics in our design journal.'
      });

    expect(res.status).toBe(201);
    expect(res.body.data.received).toBe(true);
  });
});

describe('8. Header CMS Settings API', () => {
  it('should retrieve header settings via public GET /api/header', async () => {
    const res = await request(app).get('/api/header');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.logoText).toBeDefined();
    expect(Array.isArray(res.body.data.navigationItems)).toBe(true);
  });

  it('should reject updating header settings without authentication', async () => {
    const res = await request(app)
      .put('/api/header')
      .send({ logoText: 'Unauthorized Change' });
    expect(res.status).toBe(401);
  });

  it('should allow admin to update header settings', async () => {
    const getRes = await request(app).get('/api/header');
    const current = getRes.body.data;

    const updatedNav = current.navigationItems.map((item: any) =>
      item.label === 'Products' ? { ...item, label: 'Shop' } : item
    );

    const updateRes = await request(app)
      .put('/api/header')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        ...current,
        logoText: 'VietCraft Handcrafted',
        navigationItems: updatedNav
      });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.success).toBe(true);
    expect(updateRes.body.data.logoText).toBe('VietCraft Handcrafted');

    // Verify change is immediately reflected on public GET
    const publicRes = await request(app).get('/api/header');
    expect(publicRes.body.data.logoText).toBe('VietCraft Handcrafted');
    const shopItem = publicRes.body.data.navigationItems.find((n: any) => n.label === 'Shop');
    expect(shopItem).toBeDefined();
  });
});

describe('9. Footer CMS Settings API', () => {
  it('should retrieve footer settings via public GET /api/footer', async () => {
    const res = await request(app).get('/api/footer');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.description).toBeDefined();
    expect(Array.isArray(res.body.data.columns)).toBe(true);
  });

  it('should reject updating footer settings without authentication', async () => {
    const res = await request(app)
      .put('/api/footer')
      .send({ description: 'Unauthorized' });
    expect(res.status).toBe(401);
  });

  it('should allow admin to update footer description and copyright', async () => {
    const getRes = await request(app).get('/api/footer');
    const current = getRes.body.data;

    const updateRes = await request(app)
      .put('/api/footer')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        ...current,
        description: 'Updated mindful living decor inspired by northern Vietnamese villages.',
        copyright: {
          copyrightText: '© 2026 VietCraft. Mindfully Crafted.'
        }
      });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.success).toBe(true);
    expect(updateRes.body.data.description).toBe('Updated mindful living decor inspired by northern Vietnamese villages.');

    // Verify public endpoint reflects update
    const publicRes = await request(app).get('/api/footer');
    expect(publicRes.body.data.copyright.copyrightText).toBe('© 2026 VietCraft. Mindfully Crafted.');
  });
});

describe('10. Dynamic Pages CMS CRUD API', () => {
  let createdPageId: string;

  it('should reject page creation without authentication', async () => {
    const res = await request(app)
      .post('/api/pages')
      .send({
        title: 'Artisan Ethical Code',
        slug: 'artisan-ethical-code',
        content: 'Fair trade and ethical sourcing commitment.',
        status: 'published'
      });
    expect(res.status).toBe(401);
  });

  it('should create a dynamic page via admin endpoint', async () => {
    const res = await request(app)
      .post('/api/pages')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Artisan Ethical Code',
        slug: 'artisan-ethical-code',
        content: '## Ethical Craft Sourcing\n\nAll VietCraft products adhere strictly to ancestral fair wage standards.',
        excerpt: 'Our commitment to fair craft wages.',
        status: 'published',
        seoTitle: 'Artisan Ethical Code | VietCraft',
        seoDescription: 'Discover our ethical sourcing standards for Vietnamese craft.'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.slug).toBe('artisan-ethical-code');
    createdPageId = res.body.data._id;
  });

  it('should reject duplicate slug creation', async () => {
    const res = await request(app)
      .post('/api/pages')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Duplicate Page',
        slug: 'artisan-ethical-code',
        content: 'Duplicate content'
      });

    expect(res.status).toBe(400);
  });

  it('should list pages via public GET /api/pages', async () => {
    const res = await request(app).get('/api/pages');
    expect(res.status).toBe(200);
    expect(res.body.data.some((p: any) => p.slug === 'artisan-ethical-code')).toBe(true);
  });

  it('should retrieve published page by slug via GET /api/pages/:slug', async () => {
    const res = await request(app).get('/api/pages/artisan-ethical-code');
    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe('Artisan Ethical Code');
  });

  it('should update page via admin PUT /api/pages/:id', async () => {
    const res = await request(app)
      .put(`/api/pages/${createdPageId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'VietCraft Guild Ethical Code',
        slug: 'artisan-ethical-code',
        content: '## Updated Ethical Guidelines\n\nDirect support to master craftspeople.',
        status: 'published'
      });

    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe('VietCraft Guild Ethical Code');
  });

  it('should delete page via admin DELETE /api/pages/:id', async () => {
    const delRes = await request(app)
      .delete(`/api/pages/${createdPageId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(delRes.status).toBe(200);

    const getRes = await request(app).get('/api/pages/artisan-ethical-code');
    expect(getRes.status).toBe(404);
  });
});

describe('11. Global Site Settings API', () => {
  it('should retrieve public site settings via GET /api/settings', async () => {
    const res = await request(app).get('/api/settings');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.siteName).toBeDefined();
  });

  it('should reject updating site settings without authentication', async () => {
    const res = await request(app)
      .put('/api/settings')
      .send({ siteName: 'Hacked Site' });
    expect(res.status).toBe(401);
  });

  it('should allow admin to update site settings', async () => {
    const getRes = await request(app).get('/api/settings');
    const current = getRes.body.data;

    const updateRes = await request(app)
      .put('/api/settings')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        ...current,
        siteName: 'VietCraft Home Decor',
        tagline: 'Timeless Vietnamese Craftsmanship'
      });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.data.siteName).toBe('VietCraft Home Decor');
  });
});

describe('12. Contact Inquiries Admin API', () => {
  it('should reject fetching contact messages without authentication', async () => {
    const res = await request(app).get('/api/contact');
    expect(res.status).toBe(401);
  });

  it('should allow admin to list contact inquiries', async () => {
    const res = await request(app)
      .get('/api/contact')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.some((msg: any) => msg.email === 'sarah.parker@example.com')).toBe(true);
  });
});

describe('13. Amazon Product Scrape & Auto-Fill API', () => {
  it('should reject scraping Amazon product without authentication', async () => {
    const res = await request(app)
      .post('/api/products/admin/scrape-amazon')
      .send({ url: 'https://www.amazon.com/dp/B0CP9YB3Q4' });

    expect(res.status).toBe(401);
  });

  it('should reject scraping with empty URL', async () => {
    const res = await request(app)
      .post('/api/products/admin/scrape-amazon')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ url: '' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should reject scraping with invalid non-Amazon URL', async () => {
    const res = await request(app)
      .post('/api/products/admin/scrape-amazon')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ url: 'https://google.com' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should scrape product details from a valid Amazon ASIN or link', async () => {
    const res = await request(app)
      .post('/api/products/admin/scrape-amazon')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ url: 'https://www.amazon.com/dp/B0CP9YB3Q4' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const data = res.body.data;
    expect(data.asin).toBe('B0CP9YB3Q4');
    expect(data.title).toBeTruthy();
    expect(Array.isArray(data.images)).toBe(true);
    expect(data.images.length).toBeGreaterThan(0);
    expect(data.images[0].isPrimary).toBe(true);
    expect(data.affiliateUrl).toContain('B0CP9YB3Q4');
    expect(data.affiliateUrl).toContain('tag=');
    expect(data.priceSource).toBe('direct_import');
  }, 25000);
});

describe('14. Navigation, Site-Settings & Direct Homepage PUT API', () => {
  it('should return navigation settings on GET /api/navigation', async () => {
    const res = await request(app).get('/api/navigation');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.navigationItems)).toBe(true);
    expect(res.body.data.discoverMenu).toBeDefined();
  });

  it('should reject PUT /api/navigation without auth', async () => {
    const res = await request(app)
      .put('/api/navigation')
      .send({ navigationItems: [] });
    expect(res.status).toBe(401);
  });

  it('should allow admin to update navigation on PUT /api/navigation', async () => {
    const res = await request(app)
      .put('/api/navigation')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        navigationItems: [
          { id: 'nav-test', label: 'Shop', url: '/products', type: 'link', order: 0, isActive: true, openInNewTab: false }
        ]
      });
    expect(res.status).toBe(200);
    expect(res.body.data.navigationItems[0].label).toBe('Shop');
  });

  it('should return site settings on GET /api/site-settings', async () => {
    const res = await request(app).get('/api/site-settings');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.siteName).toBeDefined();
  });

  it('should reject PUT /api/site-settings without auth', async () => {
    const res = await request(app)
      .put('/api/site-settings')
      .send({ siteName: 'Updated Name' });
    expect(res.status).toBe(401);
  });

  it('should allow admin to update site settings on PUT /api/site-settings', async () => {
    const res = await request(app)
      .put('/api/site-settings')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        siteName: 'VietCraft Mindful Living',
        contactEmail: 'contact@vietcraft.com'
      });
    expect(res.status).toBe(200);
    expect(res.body.data.siteName).toBe('VietCraft Mindful Living');
  });

  it('should reject PUT /api/homepage without auth', async () => {
    const res = await request(app)
      .put('/api/homepage')
      .send({ heroSlides: [] });
    expect(res.status).toBe(401);
  });

  it('should allow admin to update homepage on PUT /api/homepage', async () => {
    const res = await request(app)
      .put('/api/homepage')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        heroSlides: [
          {
            title: 'Updated Test Hero',
            subtitle: 'New Subtitle',
            buttonText: 'Shop Now',
            buttonUrl: '/products',
            image: 'https://example.com/test.jpg'
          }
        ]
      });
    expect(res.status).toBe(200);
    expect(res.body.data.heroSlides[0].title).toBe('Updated Test Hero');
  });

  it('should accept populated objects in featuredProductIds and enabledMaterialIds on PUT /api/homepage/admin', async () => {
    const res = await request(app)
      .put('/api/homepage/admin')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        heroSlides: [
          {
            title: 'Populated Test Hero',
            subtitle: 'New Subtitle',
            buttonText: 'Shop Now',
            buttonUrl: '/products',
            image: 'https://example.com/test.jpg'
          }
        ],
        materialSection: {
          headline: 'Crafted Materials',
          subheadline: 'Natural mediums',
          enabledMaterialIds: [{ _id: '6ab63522afeee8b782b5ba3b', name: 'Rattan' }]
        },
        featuredProductIds: [{ _id: '6ab63522afeee8b782b5ba56', title: 'Bowl' }]
      });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});


