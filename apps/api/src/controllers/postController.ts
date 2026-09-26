import { Request, Response } from 'express';
import { Post } from '../models/Post';
import { Material } from '../models/Material';
import { sendError, sendSuccess } from '../utils/response';
import { slugify } from '../utils/slugify';
import { calculateReadingTime } from '../utils/readingTime';

export const getPosts = async (req: Request, res: Response): Promise<void> => {
  const { material, tag, page = 1, limit = 9 } = req.query as any;

  const query: any = { status: 'published' };

  if (material) {
    const matDoc = await Material.findOne({ slug: material });
    if (matDoc) {
      query.material = matDoc._id;
    }
  }

  if (tag) {
    query.tags = tag;
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 9));
  const skip = (pageNum - 1) * limitNum;

  const [posts, total] = await Promise.all([
    Post.find(query)
      .sort({ publishedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('material', 'name slug'),
    Post.countDocuments(query)
  ]);

  sendSuccess(res, posts, 'Articles retrieved', 200, {
    page: pageNum,
    limit: limitNum,
    total,
    totalPages: Math.ceil(total / limitNum)
  });
};

export const getPostBySlug = async (req: Request, res: Response): Promise<void> => {
  const { slug } = req.params;
  const post = await Post.findOne({ slug, status: 'published' })
    .populate('material', 'name slug coverImage shortDescription')
    .populate({
      path: 'relatedArticles',
      match: { status: 'published' },
      select: 'title slug excerpt featuredImage publishedAt readingTime'
    })
    .populate({
      path: 'relatedProducts',
      match: { status: 'active' },
      select: 'title slug price currency images asin affiliateUrl'
    });

  if (!post) {
    sendError(res, 'Article not found', 404);
    return;
  }

  // If no manually curated related articles, query 3 articles from same material or latest
  let fallbackRelatedArticles = post.relatedArticles;
  if (!fallbackRelatedArticles || fallbackRelatedArticles.length === 0) {
    fallbackRelatedArticles = await Post.find({
      status: 'published',
      _id: { $ne: post._id },
      ...(post.material ? { material: post.material } : {})
    })
      .sort({ publishedAt: -1 })
      .limit(3)
      .select('title slug excerpt featuredImage publishedAt readingTime');
  }

  sendSuccess(res, {
    post,
    relatedArticles: fallbackRelatedArticles
  }, 'Article details retrieved');
};

export const adminGetPosts = async (req: Request, res: Response): Promise<void> => {
  const { status, material, search, page = 1, limit = 20 } = req.query as any;

  const query: any = {};
  if (status) query.status = status;
  if (material) query.material = material;
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { tags: { $regex: search, $options: 'i' } }
    ];
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (pageNum - 1) * limitNum;

  const [posts, total] = await Promise.all([
    Post.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('material', 'name slug'),
    Post.countDocuments(query)
  ]);

  sendSuccess(res, posts, 'Posts retrieved for admin', 200, {
    page: pageNum,
    limit: limitNum,
    total,
    totalPages: Math.ceil(total / limitNum)
  });
};

export const adminGetPostById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const post = await Post.findById(id)
    .populate('material', 'name slug')
    .populate('relatedArticles', 'title slug')
    .populate('relatedProducts', 'title slug asin');

  if (!post) {
    sendError(res, 'Post not found', 404);
    return;
  }

  sendSuccess(res, post, 'Post retrieved');
};

export const adminCreatePost = async (req: Request, res: Response): Promise<void> => {
  const data = req.body;

  if (!data.slug && data.title) {
    data.slug = slugify(data.title);
  }

  const existingSlug = await Post.findOne({ slug: data.slug });
  if (existingSlug) {
    sendError(res, 'A post with this slug already exists', 409);
    return;
  }

  if (data.content) {
    data.readingTime = calculateReadingTime(data.content);
  }

  if (data.status === 'published' && !data.publishedAt) {
    data.publishedAt = new Date();
  }

  const post = await Post.create(data);
  sendSuccess(res, post, 'Post created successfully', 201);
};

export const adminUpdatePost = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const data = req.body;

  if (data.slug) {
    const existing = await Post.findOne({ slug: data.slug, _id: { $ne: id } });
    if (existing) {
      sendError(res, 'A post with this slug already exists', 409);
      return;
    }
  }

  if (data.content) {
    data.readingTime = calculateReadingTime(data.content);
  }

  if (data.status === 'published' && !data.publishedAt) {
    data.publishedAt = new Date();
  }

  const post = await Post.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!post) {
    sendError(res, 'Post not found', 404);
    return;
  }

  sendSuccess(res, post, 'Post updated successfully');
};

export const adminDeletePost = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const post = await Post.findByIdAndDelete(id);
  if (!post) {
    sendError(res, 'Post not found', 404);
    return;
  }
  sendSuccess(res, null, 'Post deleted successfully');
};
