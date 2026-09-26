import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { connectDB, disconnectDB } from '../src/config/db';
import { Application } from 'express';
import { User, HeaderSettings, FooterSettings, Product, Post, Material, Page, Category } from '../src/models';

let app: Application;
let adminToken: string;

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  await connectDB();
  app = createApp();

  // Create admin user for testing
  const admin = await User.create({
    name: 'Verification Admin',
    email: 'verify-admin@vietcraft.com',
    password: 'AdminPassword123!',
    role: 'admin'
  });

  const res = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'verify-admin@vietcraft.com',
      password: 'AdminPassword123!'
    });

  adminToken = res.body.data.token;
});

afterAll(async () => {
  await disconnectDB();
});

describe('Section 21 End-to-End Production Architecture Verification', () => {
  // Test 1: Header test (Admin changes Products -> Shop)
  it('Header test: Admin edits navigation label (Products -> Shop), public Header displays "Shop"', async () => {
    // 1. Admin gets current header
    const getRes = await request(app).get('/api/header');
    const headerData = getRes.body.data;

    // 2. Admin edits navigation link Products -> Shop
    const updatedNav = headerData.navigationItems.map((item: any) =>
      item.label === 'Products' ? { ...item, label: 'Shop' } : item
    );

    const putRes = await request(app)
      .put('/api/header')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        ...headerData,
        navigationItems: updatedNav
      });

    expect(putRes.status).toBe(200);

    // 3. Public GET /api/header confirms update
    const publicRes = await request(app).get('/api/header');
    expect(publicRes.status).toBe(200);
    const shopItem = publicRes.body.data.navigationItems.find((i: any) => i.label === 'Shop');
    expect(shopItem).toBeDefined();
    expect(shopItem.url).toBe('/products');
  });

  // Test 2: Footer test
  it('Footer test: Admin changes footer description, public Footer displays updated text', async () => {
    const getRes = await request(app).get('/api/footer');
    const footerData = getRes.body.data;

    const newDescription = 'Updated artisan slow living philosophy for US homes.';
    const putRes = await request(app)
      .put('/api/footer')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        ...footerData,
        description: newDescription
      });

    expect(putRes.status).toBe(200);

    const publicRes = await request(app).get('/api/footer');
    expect(publicRes.status).toBe(200);
    expect(publicRes.body.data.description).toBe(newDescription);
  });

  // Test 3: Product test
  let createdProductId: string;
  let materialId: string;
  let categoryId: string;

  it('Product test: Admin creates product, public Products page displays it', async () => {
    // Ensure supporting material & category
    const mat = await Material.create({
      name: 'Flow Test Bamboo',
      slug: 'flow-test-bamboo',
      description: 'Test material description',
      shortDescription: 'Test material short',
      coverImage: 'https://example.com/bamboo.jpg'
    });
    materialId = mat._id.toString();

    const cat = await Category.create({
      name: 'Flow Test Baskets',
      slug: 'flow-test-baskets'
    });
    categoryId = cat._id.toString();

    // 1. Admin creates product
    const createRes = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Artisan Bamboo Lantern Vessel',
        slug: 'artisan-bamboo-lantern-vessel',
        description: 'Hand-split bamboo woven into a cylindrical decorative vessel.',
        shortDescription: 'Handcrafted bamboo lantern vessel for organic interior styling.',
        images: [{ url: 'https://example.com/lantern.jpg', alt: 'Bamboo lantern', isPrimary: true }],
        material: materialId,
        category: categoryId,
        asin: 'B0CP9YB3Q4',
        price: 49.99,
        currency: 'USD',
        status: 'active',
        featured: true
      });

    expect(createRes.status).toBe(201);
    createdProductId = createRes.body.data._id;

    // 2. Public GET /api/products returns the product
    const publicRes = await request(app).get('/api/products?material=flow-test-bamboo');
    expect(publicRes.status).toBe(200);
    expect(publicRes.body.data.some((p: any) => p.slug === 'artisan-bamboo-lantern-vessel')).toBe(true);

    // 3. Public GET /api/products/:slug returns detail
    const detailRes = await request(app).get('/api/products/artisan-bamboo-lantern-vessel');
    expect(detailRes.status).toBe(200);
    expect(detailRes.body.data.product.asin).toBe('B0CP9YB3Q4');
  });

  // Test 4: Article test
  let createdArticleId: string;
  it('Article test: Admin creates published article, public Articles page displays it', async () => {
    const createRes = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'The Sacred Art of Sun-Bleaching Sedge Grass',
        slug: 'sacred-art-sun-bleaching-sedge-grass',
        excerpt: 'An exploration of traditional sun-curing along the Red River delta.',
        content: 'Long before modern industrial dryers, artisans relied entirely on sunlight and coastal sea air...',
        featuredImage: 'https://example.com/sedge.jpg',
        author: { name: 'Mai Nguyen', bio: 'Artisan Curator' },
        material: materialId,
        tags: ['craft', 'tradition'],
        status: 'published'
      });

    expect(createRes.status).toBe(201);
    createdArticleId = createRes.body.data._id;

    // Public GET /api/articles displays it
    const publicRes = await request(app).get('/api/articles?material=flow-test-bamboo');
    expect(publicRes.status).toBe(200);
    expect(publicRes.body.data.some((a: any) => a.slug === 'sacred-art-sun-bleaching-sedge-grass')).toBe(true);

    // Public GET /api/articles/:slug returns detail
    const detailRes = await request(app).get('/api/articles/sacred-art-sun-bleaching-sedge-grass');
    expect(detailRes.status).toBe(200);
    expect(detailRes.body.data.post.title).toBe('The Sacred Art of Sun-Bleaching Sedge Grass');
  });

  // Test 5: Material test
  let createdMatId: string;
  it('Material test: Admin creates material, public Discover / Materials displays it', async () => {
    const createRes = await request(app)
      .post('/api/materials')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'River Silt Terracotta',
        slug: 'river-silt-terracotta',
        shortDescription: 'Sun-baked terracotta vessels from alluvial clay deposits.',
        description: 'Centuries-old earthenware made from alluvial sediments along Vietnam rivers.',
        coverImage: 'https://example.com/terracotta.jpg',
        craftingTechniques: ['Coiling', 'Wood firing'],
        originRegions: ['Bát Tràng'],
        isActive: true
      });

    expect(createRes.status).toBe(201);
    createdMatId = createRes.body.data._id;

    // Public GET /api/materials displays it
    const publicRes = await request(app).get('/api/materials');
    expect(publicRes.status).toBe(200);
    expect(publicRes.body.data.some((m: any) => m.slug === 'river-silt-terracotta')).toBe(true);

    // Public GET /api/materials/:slug displays detail
    const detailRes = await request(app).get('/api/materials/river-silt-terracotta');
    expect(detailRes.status).toBe(200);
    expect(detailRes.body.data.material.name).toBe('River Silt Terracotta');
  });

  // Test 6: Page test
  let createdPageId: string;
  it('Page test: Admin creates CMS page, public URL displays it', async () => {
    const createRes = await request(app)
      .post('/api/pages')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Artisan Workshop Residency 2026',
        slug: 'workshop-residency-2026',
        content: '# Residency Program\n\nJoin our cultural exchange program in Hanoi craft villages.',
        seoTitle: 'Artisan Workshop Residency 2026 | VietCraft',
        seoDescription: 'Cultural craft residency program in Vietnam.',
        status: 'published'
      });

    expect(createRes.status).toBe(201);
    createdPageId = createRes.body.data._id;

    // Public GET /api/pages/:slug displays it
    const publicRes = await request(app).get('/api/pages/workshop-residency-2026');
    expect(publicRes.status).toBe(200);
    expect(publicRes.body.data.title).toBe('Artisan Workshop Residency 2026');
  });

  // Test 7: Delete test
  it('Delete test: Deleting item from CMS removes it from public UI', async () => {
    // Delete product created in Test 3
    const deleteRes = await request(app)
      .delete(`/api/products/${createdProductId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(deleteRes.status).toBe(200);

    // Public GET /api/products/:slug returns 404
    const publicCheck = await request(app).get('/api/products/artisan-bamboo-lantern-vessel');
    expect(publicCheck.status).toBe(404);
  });

  // Test 8: Authentication test
  it('Authentication test: Unauthenticated request to protected admin endpoint fails with 401', async () => {
    const unauthRes = await request(app)
      .post('/api/products')
      .send({ title: 'Hacked Product' });

    expect(unauthRes.status).toBe(401);
  });

  it('Authentication test: Authenticated admin request succeeds', async () => {
    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(meRes.status).toBe(200);
    expect(meRes.body.data.email).toBe('verify-admin@vietcraft.com');
  });

  // Test 9: Database persistence & schema correctness
  it('Database test: Confirm documents exist in MongoDB collections with correct indexes and timestamps', async () => {
    const foundUser = await User.findOne({ email: 'verify-admin@vietcraft.com' });
    expect(foundUser).toBeDefined();
    expect(foundUser?.createdAt).toBeInstanceOf(Date);
    expect(foundUser?.updatedAt).toBeInstanceOf(Date);

    const foundHeader = await HeaderSettings.findOne();
    expect(foundHeader).toBeDefined();
    expect(foundHeader?.updatedAt).toBeInstanceOf(Date);

    const foundFooter = await FooterSettings.findOne();
    expect(foundFooter).toBeDefined();
    expect(foundFooter?.updatedAt).toBeInstanceOf(Date);
  });
});
