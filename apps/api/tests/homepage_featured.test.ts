import { describe, it, expect, vi, beforeEach } from 'vitest';

const state = vi.hoisted(() => ({
  homepageDoc: null as any,
  productCalls: [] as any[],
  liveProducts: [] as any[]
}));

vi.mock('../src/models/Homepage', () => ({
  Homepage: {
    findOne: vi.fn(() => ({ populate: vi.fn(async () => state.homepageDoc) }))
  }
}));

vi.mock('../src/models/Material', () => ({
  Material: {
    find: vi.fn(() => ({ sort: vi.fn(async () => [{ _id: 'mat-a' }, { _id: 'mat-b' }]) }))
  }
}));

vi.mock('../src/models/Product', () => ({
  Product: {
    find: vi.fn((query: any) => {
      const call: any = { query, sort: null, limit: null, populated: [] };
      state.productCalls.push(call);
      const chain: any = {
        sort: (s: any) => ((call.sort = s), chain),
        limit: (n: number) => ((call.limit = n), chain),
        populate: (p: string) => (call.populated.push(p), chain),
        then: (resolve: any) => resolve(state.liveProducts)
      };
      return chain;
    })
  }
}));

import { getHomepage, HOME_FEATURED_LIMIT } from '../src/controllers/homepageController';

const makeRes = () => {
  const res: any = {};
  res.status = vi.fn(() => res);
  res.json = vi.fn(() => res);
  return res;
};

describe('GET /api/homepage featured products', () => {
  beforeEach(() => {
    state.productCalls = [];
    state.liveProducts = [
      { _id: 'p-new', title: 'Newest featured' },
      { _id: 'p-old', title: 'Older featured' }
    ];
  });

  it('returns live featured products instead of the hand-picked list', async () => {
    state.homepageDoc = {
      toObject: () => ({
        heroSlides: [{ title: 'Hero' }],
        materialSection: { enabledMaterialIds: [{ _id: 'mat-1' }] },
        featuredProductIds: ['stale-1', 'stale-2']
      })
    };
    const res = makeRes();
    await getHomepage({} as any, res);

    const body = res.json.mock.calls[0][0];
    expect(body.success).toBe(true);
    expect(body.data.featuredProductIds.map((p: any) => p._id)).toEqual(['p-new', 'p-old']);
    expect(body.data.heroSlides).toEqual([{ title: 'Hero' }]);

    const call = state.productCalls[0];
    expect(call.query).toEqual({ status: 'active', featured: true });
    expect(call.sort).toEqual({ createdAt: -1 });
    expect(call.limit).toBe(HOME_FEATURED_LIMIT);
    expect(call.populated).toEqual(['material', 'category']);
  });

  it('shows all active materials when none are selected', async () => {
    state.homepageDoc = {
      toObject: () => ({ materialSection: { headline: 'H', enabledMaterialIds: [] }, featuredProductIds: [] })
    };
    const res = makeRes();
    await getHomepage({} as any, res);
    const data = res.json.mock.calls[0][0].data;
    expect(data.materialSection.headline).toBe('H');
    expect(data.materialSection.enabledMaterialIds.map((m: any) => m._id)).toEqual(['mat-a', 'mat-b']);
  });

  it('uses the same live featured list in the fallback (no homepage document yet)', async () => {
    state.homepageDoc = null;
    const res = makeRes();
    await getHomepage({} as any, res);
    const data = res.json.mock.calls[0][0].data;
    expect(data.featuredProductIds.map((p: any) => p._id)).toEqual(['p-new', 'p-old']);
    expect(state.productCalls[0].sort).toEqual({ createdAt: -1 });
  });

  it('returns an empty list when nothing is featured', async () => {
    state.liveProducts = [];
    state.homepageDoc = { toObject: () => ({ materialSection: { enabledMaterialIds: [{ _id: 'm' }] } }) };
    const res = makeRes();
    await getHomepage({} as any, res);
    expect(res.json.mock.calls[0][0].data.featuredProductIds).toEqual([]);
  });
});
