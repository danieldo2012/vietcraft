import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { connectDB, disconnectDB } from '../src/config/db';
import { Application } from 'express';
import { User, Material, Category } from '../src/models';

let app: Application;
let adminToken: string;
let testMaterialId: string;
let testCategoryId: string;
let e2eArticleId: string;
let e2eProductId: string;

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  await connectDB();
  app = createApp();

  // Create initial admin user
  await User.deleteMany({});
  await User.create({
    name: 'E2E Admin User',
    email: 'admin.e2e@vietcraft.com',
    password: 'Password123!',
    role: 'admin'
  });

  // Create base material & category for testing
  const mat = await Material.create({
    name: 'Ceramics E2E',
    slug: 'ceramics-e2e',
    shortDescription: 'Red River silt earthenware.',
    description: 'Ancestral clay throwing from Bát Tràng.',
    coverImage: 'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c',
    isActive: true
  });
  testMaterialId = mat._id.toString();

  const cat = await Category.create({
    name: 'Vases E2E',
    slug: 'vases-e2e',
    description: 'Ceramic vessels and urns',
    isActive: true
  });
  testCategoryId = cat._id.toString();
});

afterAll(async () => {
  await disconnectDB();
});

describe('Critical Full-Stack End-to-End User & Admin Journeys', () => {
  it('E2E Flow 1: Admin logs in successfully and retrieves token', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin.e2e@vietcraft.com',
        password: 'Password123!'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    adminToken = res.body.data.token;
  });

  it('E2E Flow 2: Admin creates a draft article', async () => {
    const res = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'The Soul of Red River Stoneware',
        slug: 'the-soul-of-red-river-stoneware',
        excerpt: 'An intimate journey into the wood-fired kilns of northern craft guilds.',
        content: '<p>The scent of smoldering pine wood and wet silt clay fills the narrow alleyways...</p>',
        featuredImage: 'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c',
        author: { name: 'Mai Nguyen' },
        material: testMaterialId,
        tags: ['ceramics', 'craft', 'slow living'],
        status: 'draft'
      });

    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe('draft');
    e2eArticleId = res.body.data._id;
  });

  it('E2E Flow 3: Verify draft article is NOT visible to public visitors', async () => {
    const res = await request(app).get('/api/articles');
    expect(res.status).toBe(200);
    const exists = res.body.data.some((a: any) => a._id === e2eArticleId);
    expect(exists).toBe(false);
  });

  it('E2E Flow 4: Admin publishes article and public visitor reads it', async () => {
    // Admin publishes
    const updateRes = await request(app)
      .put(`/api/posts/${e2eArticleId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'published' });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.data.status).toBe('published');

    // Public visitor retrieves by slug
    const publicRes = await request(app).get('/api/articles/the-soul-of-red-river-stoneware');
    expect(publicRes.status).toBe(200);
    expect(publicRes.body.data.post.title).toBe('The Soul of Red River Stoneware');
    expect(publicRes.body.data.post.status).toBe('published');
  });

  it('E2E Flow 5: Admin creates a new Amazon affiliate product with ASIN', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Celadon Crackle Ceramic Urn',
        slug: 'celadon-crackle-ceramic-urn',
        shortDescription: 'Ancestral crackle glaze pottery vessel.',
        description: 'Wheel-thrown stoneware finished with natural wood-ash flux.',
        asin: 'B08J45MN91',
        affiliateUrl: 'https://www.amazon.com/dp/B08J45MN91?tag=vietcraft-20',
        price: 92.0,
        material: testMaterialId,
        category: testCategoryId,
        images: [{ url: 'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c', alt: 'Urn', isPrimary: true }],
        featured: true,
        status: 'active',
        tags: ['ceramics', 'vases', 'centerpiece']
      });

    expect(res.status).toBe(201);
    expect(res.body.data.asin).toBe('B08J45MN91');
    e2eProductId = res.body.data._id;
  });

  it('E2E Flow 6: Public visitor browses products and filters by material', async () => {
    const res = await request(app).get('/api/products?material=ceramics-e2e');
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0].slug).toBe('celadon-crackle-ceramic-urn');
  });

  it('E2E Flow 7: Public visitor performs unified search for product', async () => {
    const res = await request(app).get('/api/search?q=Celadon');
    expect(res.status).toBe(200);
    expect(res.body.data.products.some((p: any) => p.asin === 'B08J45MN91')).toBe(true);
  });

  it('E2E Flow 8: Public user clicks product Amazon affiliate link', async () => {
    const res = await request(app).post(`/api/products/${e2eProductId}/click`);
    expect(res.status).toBe(200);
    expect(res.body.data.affiliateUrl).toContain('amazon.com/dp/B08J45MN91');
    expect(res.body.data.disclosure).toBeDefined();
  });

  it('E2E Flow 9: Public visitor subscribes to slow living newsletter', async () => {
    const res = await request(app)
      .post('/api/newsletter/subscribe')
      .send({ email: 'mindful.e2e.tester@example.com', source: 'e2e_test' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe('mindful.e2e.tester@example.com');
  });
});
