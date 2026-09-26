import { Request, Response } from 'express';
import { Product } from '../models/Product';
import { Material } from '../models/Material';
import { Category } from '../models/Category';
import { amazonProductService } from '../services/AmazonProductService';
import { sendError, sendSuccess } from '../utils/response';
import { slugify } from '../utils/slugify';

export const getProducts = async (req: Request, res: Response): Promise<void> => {
  const {
    material,
    category,
    minPrice,
    maxPrice,
    featured,
    sort = 'newest',
    page = 1,
    limit = 12
  } = req.query as any;

  const query: any = { status: 'active' };

  if (material) {
    const matDoc = await Material.findOne({ slug: material });
    if (matDoc) {
      query.material = matDoc._id;
    }
  }

  if (category) {
    const catDoc = await Category.findOne({ slug: category });
    if (catDoc) {
      query.category = catDoc._id;
    }
  }

  if (featured === 'true') {
    query.featured = true;
  }

  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 12));
  const skip = (pageNum - 1) * limitNum;

  let sortOption: any = { createdAt: -1 };
  if (sort === 'featured') {
    sortOption = { featured: -1, createdAt: -1 };
  } else if (sort === 'price-asc') {
    sortOption = { price: 1 };
  } else if (sort === 'price-desc') {
    sortOption = { price: -1 };
  } else if (sort === 'newest') {
    sortOption = { createdAt: -1 };
  }

  const [products, total] = await Promise.all([
    Product.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum)
      .populate('material', 'name slug')
      .populate('category', 'name slug'),
    Product.countDocuments(query)
  ]);

  const totalPages = Math.ceil(total / limitNum);

  sendSuccess(
    res,
    products,
    'Products retrieved',
    200,
    {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages
    }
  );
};

export const getProductBySlug = async (req: Request, res: Response): Promise<void> => {
  const { slug } = req.params;
  const product = await Product.findOne({ slug, status: 'active' })
    .populate('material', 'name slug shortDescription coverImage')
    .populate('category', 'name slug');

  if (!product) {
    sendError(res, 'Product not found', 404);
    return;
  }

  // Find related products (same material or same category, excluding current product)
  const relatedProducts = await Product.find({
    status: 'active',
    _id: { $ne: product._id },
    $or: [{ material: product.material }, { category: product.category }]
  })
    .limit(4)
    .populate('material', 'name slug')
    .populate('category', 'name slug');

  sendSuccess(res, {
    product,
    relatedProducts
  }, 'Product details retrieved');
};

export const trackAffiliateClick = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const product = await Product.findById(id);

  if (!product) {
    sendError(res, 'Product not found', 404);
    return;
  }

  const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
  const userAgent = req.headers['user-agent'] || '';
  const referrer = req.headers['referer'] || '';

  // Non-blocking asynchronous tracking
  amazonProductService.trackClick({
    productId: product._id.toString(),
    asin: product.asin,
    ip,
    userAgent,
    referrer
  });

  const affiliateUrl = amazonProductService.buildAffiliateUrl(product.asin);

  sendSuccess(res, {
    affiliateUrl,
    asin: product.asin,
    disclosure: amazonProductService.getDisclosures().short
  }, 'Click tracked successfully');
};

export const adminGetProducts = async (req: Request, res: Response): Promise<void> => {
  const {
    status,
    category,
    material,
    featured,
    search,
    page = 1,
    limit = 20
  } = req.query as any;

  const query: any = {};
  if (status) query.status = status;
  if (category) query.category = category;
  if (material) query.material = material;
  if (featured !== undefined) query.featured = featured === 'true';
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { asin: { $regex: search, $options: 'i' } }
    ];
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (pageNum - 1) * limitNum;

  const [products, total] = await Promise.all([
    Product.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('material', 'name slug')
      .populate('category', 'name slug'),
    Product.countDocuments(query)
  ]);

  sendSuccess(res, products, 'Products retrieved for admin', 200, {
    page: pageNum,
    limit: limitNum,
    total,
    totalPages: Math.ceil(total / limitNum)
  });
};

export const adminGetProductById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const product = await Product.findById(id)
    .populate('material', 'name slug')
    .populate('category', 'name slug');

  if (!product) {
    sendError(res, 'Product not found', 404);
    return;
  }

  sendSuccess(res, product, 'Product retrieved');
};

export const adminCreateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = req.body;

    if (!data.slug && data.title) {
      data.slug = slugify(data.title);
    }

    const existingSlug = await Product.findOne({ slug: data.slug });
    if (existingSlug) {
      sendError(res, 'A product with this slug already exists', 409);
      return;
    }

    if (data.asin) {
      data.asin = data.asin.trim().toUpperCase();
      if (!amazonProductService.isValidAsin(data.asin)) {
        sendError(res, 'Invalid Amazon ASIN format. ASIN must be a 10-character alphanumeric string.', 400);
        return;
      }
      if (!data.affiliateUrl) {
        data.affiliateUrl = amazonProductService.buildAffiliateUrl(data.asin);
      }
    }

    const product = await Product.create(data);
    sendSuccess(res, product, 'Product created successfully', 201);
  } catch (err: any) {
    sendError(res, err.errors ? Object.values(err.errors).map((e: any) => e.message).join(', ') : err.message, 400);
  }
};

export const adminUpdateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const data = req.body;

    if (data.slug) {
      const existing = await Product.findOne({ slug: data.slug, _id: { $ne: id } });
      if (existing) {
        sendError(res, 'A product with this slug already exists', 409);
        return;
      }
    }

    if (data.asin) {
      data.asin = data.asin.trim().toUpperCase();
      if (!amazonProductService.isValidAsin(data.asin)) {
        sendError(res, 'Invalid Amazon ASIN format', 400);
        return;
      }
    }

    const product = await Product.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!product) {
      sendError(res, 'Product not found', 404);
      return;
    }

    sendSuccess(res, product, 'Product updated successfully');
  } catch (err: any) {
    sendError(res, err.errors ? Object.values(err.errors).map((e: any) => e.message).join(', ') : err.message, 400);
  }
};

export const adminDeleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      sendError(res, 'Product not found', 404);
      return;
    }
    sendSuccess(res, null, 'Product deleted successfully');
  } catch (err: any) {
    sendError(res, err.message, 400);
  }
};

export const adminScrapeAmazonProduct = async (req: Request, res: Response): Promise<void> => {
  const { url } = req.body;

  if (!url || typeof url !== 'string' || !url.trim()) {
    sendError(res, 'Amazon URL or ASIN is required', 400);
    return;
  }

  try {
    const scrapedData = await amazonProductService.scrapeProductByUrlOrAsin(url);
    sendSuccess(res, scrapedData, 'Amazon product data fetched successfully');
  } catch (error: any) {
    sendError(res, error.message || 'Failed to fetch Amazon product data', 400);
  }
};
