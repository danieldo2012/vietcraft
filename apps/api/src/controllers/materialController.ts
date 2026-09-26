import { Request, Response } from 'express';
import { Material } from '../models/Material';
import { Post } from '../models/Post';
import { Product } from '../models/Product';
import { sendError, sendSuccess } from '../utils/response';
import { slugify } from '../utils/slugify';

export const getMaterials = async (req: Request, res: Response): Promise<void> => {
  const materials = await Material.find({ isActive: true }).sort({ displayOrder: 1, name: 1 });
  sendSuccess(res, materials, 'Materials retrieved');
};

export const getMaterialBySlug = async (req: Request, res: Response): Promise<void> => {
  const { slug } = req.params;
  const material = await Material.findOne({ slug, isActive: true });

  if (!material) {
    sendError(res, 'Material not found', 404);
    return;
  }

  // Fetch related published articles and products for this material
  const [articles, products] = await Promise.all([
    Post.find({ material: material._id, status: 'published' })
      .sort({ publishedAt: -1 })
      .limit(6)
      .populate('material', 'name slug'),
    Product.find({ material: material._id, status: 'active' })
      .sort({ featured: -1, createdAt: -1 })
      .limit(8)
      .populate('category', 'name slug')
  ]);

  sendSuccess(res, {
    material,
    articles,
    products
  }, 'Material details retrieved');
};

export const adminGetMaterials = async (req: Request, res: Response): Promise<void> => {
  const materials = await Material.find().sort({ displayOrder: 1, createdAt: -1 });
  sendSuccess(res, materials, 'All materials retrieved');
};

export const adminCreateMaterial = async (req: Request, res: Response): Promise<void> => {
  const data = req.body;
  if (!data.slug && data.name) {
    data.slug = slugify(data.name);
  }

  const existing = await Material.findOne({ slug: data.slug });
  if (existing) {
    sendError(res, 'A material with this slug already exists', 409);
    return;
  }

  const material = await Material.create(data);
  sendSuccess(res, material, 'Material created successfully', 201);
};

export const adminUpdateMaterial = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const data = req.body;

  if (data.slug) {
    const existing = await Material.findOne({ slug: data.slug, _id: { $ne: id } });
    if (existing) {
      sendError(res, 'A material with this slug already exists', 409);
      return;
    }
  }

  const material = await Material.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!material) {
    sendError(res, 'Material not found', 404);
    return;
  }

  sendSuccess(res, material, 'Material updated successfully');
};

export const adminDeleteMaterial = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const material = await Material.findByIdAndDelete(id);
  if (!material) {
    sendError(res, 'Material not found', 404);
    return;
  }
  sendSuccess(res, null, 'Material deleted successfully');
};
