import { Request, Response } from 'express';
import { Post } from '../models/Post';
import { Product } from '../models/Product';
import { Material } from '../models/Material';
import { Newsletter } from '../models/Newsletter';
import { AffiliateClick } from '../models/AffiliateClick';
import { sendSuccess } from '../utils/response';

export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
  const [
    publishedPostsCount,
    draftPostsCount,
    totalProductsCount,
    activeMaterialsCount,
    totalClicksCount,
    totalSubscribersCount,
    recentPosts,
    recentClicks
  ] = await Promise.all([
    Post.countDocuments({ status: 'published' }),
    Post.countDocuments({ status: 'draft' }),
    Product.countDocuments({ status: 'active' }),
    Material.countDocuments({ isActive: true }),
    AffiliateClick.countDocuments(),
    Newsletter.countDocuments({ status: 'subscribed' }),
    Post.find().sort({ createdAt: -1 }).limit(5).populate('material', 'name slug'),
    AffiliateClick.find().sort({ timestamp: -1 }).limit(10).populate('productId', 'title slug asin')
  ]);

  sendSuccess(res, {
    publishedPosts: publishedPostsCount,
    draftPosts: draftPostsCount,
    products: totalProductsCount,
    materials: activeMaterialsCount,
    affiliateClicks: totalClicksCount,
    newsletterSubscribers: totalSubscribersCount,
    recentPosts,
    recentClicks
  }, 'Dashboard statistics retrieved');
};

export const getClickAnalytics = async (req: Request, res: Response): Promise<void> => {
  // Aggregate clicks by ASIN / Product
  const clicksByProduct = await AffiliateClick.aggregate([
    {
      $group: {
        _id: '$productId',
        asin: { $first: '$asin' },
        clickCount: { $sum: 1 },
        lastClicked: { $max: '$timestamp' }
      }
    },
    { $sort: { clickCount: -1 } },
    { $limit: 20 },
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: '_id',
        as: 'product'
      }
    },
    { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 1,
        asin: 1,
        clickCount: 1,
        lastClicked: 1,
        title: '$product.title',
        slug: '$product.slug',
        price: '$product.price'
      }
    }
  ]);

  sendSuccess(res, clicksByProduct, 'Click analytics retrieved');
};
