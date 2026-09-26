import { Request, Response } from 'express';
import { Post } from '../models/Post';
import { Product } from '../models/Product';
import { Material } from '../models/Material';
import { Category } from '../models/Category';
import { sendSuccess } from '../utils/response';

export const unifiedSearch = async (req: Request, res: Response): Promise<void> => {
  const {
    q = '',
    type = 'all',
    material,
    category,
    page = 1,
    limit = 12
  } = req.query as any;

  const searchQuery = (q as string).trim();
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 12));
  const skip = (pageNum - 1) * limitNum;

  // Resolve material & category filters if provided
  let materialFilterId: any = null;
  let categoryFilterId: any = null;

  if (material) {
    const matDoc = await Material.findOne({
      $or: [{ slug: material }, { name: { $regex: material, $options: 'i' } }]
    });
    if (matDoc) materialFilterId = matDoc._id;
  }

  if (category) {
    const catDoc = await Category.findOne({
      $or: [{ slug: category }, { name: { $regex: category, $options: 'i' } }]
    });
    if (catDoc) categoryFilterId = catDoc._id;
  }

  const postFilter: any = { status: 'published' };
  const productFilter: any = { status: 'active' };

  if (materialFilterId) {
    postFilter.material = materialFilterId;
    productFilter.material = materialFilterId;
  }

  if (categoryFilterId) {
    productFilter.category = categoryFilterId;
  }

  if (searchQuery) {
    const regex = new RegExp(searchQuery, 'i');
    postFilter.$or = [
      { title: { $regex: regex } },
      { excerpt: { $regex: regex } },
      { tags: { $in: [regex] } }
    ];
    productFilter.$or = [
      { title: { $regex: regex } },
      { description: { $regex: regex } },
      { shortDescription: { $regex: regex } },
      { tags: { $in: [regex] } }
    ];
  }

  let articles: any[] = [];
  let products: any[] = [];
  let totalArticles = 0;
  let totalProducts = 0;

  if (type === 'all' || type === 'articles') {
    [articles, totalArticles] = await Promise.all([
      Post.find(postFilter)
        .sort({ publishedAt: -1, createdAt: -1 })
        .skip(type === 'articles' ? skip : 0)
        .limit(type === 'articles' ? limitNum : 6)
        .populate('material', 'name slug'),
      Post.countDocuments(postFilter)
    ]);
  }

  if (type === 'all' || type === 'products') {
    [products, totalProducts] = await Promise.all([
      Product.find(productFilter)
        .sort({ featured: -1, createdAt: -1 })
        .skip(type === 'products' ? skip : 0)
        .limit(type === 'products' ? limitNum : 8)
        .populate('material', 'name slug')
        .populate('category', 'name slug'),
      Product.countDocuments(productFilter)
    ]);
  }

  const totalResults = totalArticles + totalProducts;

  sendSuccess(
    res,
    {
      articles,
      products,
      totalArticles,
      totalProducts
    },
    'Search results retrieved',
    200,
    {
      q: searchQuery,
      type,
      page: pageNum,
      limit: limitNum,
      total: totalResults,
      totalPages: Math.ceil(totalResults / limitNum)
    }
  );
};
