import { Request, Response } from 'express';
import { Category } from '../models/Category';
import { sendError, sendSuccess } from '../utils/response';
import { slugify } from '../utils/slugify';

export const getCategories = async (req: Request, res: Response): Promise<void> => {
  const categories = await Category.find({ isActive: true }).sort({ displayOrder: 1, name: 1 });
  sendSuccess(res, categories, 'Categories retrieved');
};

export const adminGetCategories = async (req: Request, res: Response): Promise<void> => {
  const categories = await Category.find().sort({ displayOrder: 1, createdAt: -1 });
  sendSuccess(res, categories, 'All categories retrieved');
};

export const adminCreateCategory = async (req: Request, res: Response): Promise<void> => {
  const data = req.body;
  if (!data.slug && data.name) {
    data.slug = slugify(data.name);
  }

  const existing = await Category.findOne({ slug: data.slug });
  if (existing) {
    sendError(res, 'A category with this slug already exists', 409);
    return;
  }

  const category = await Category.create(data);
  sendSuccess(res, category, 'Category created successfully', 201);
};

export const adminUpdateCategory = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const data = req.body;

  if (data.slug) {
    const existing = await Category.findOne({ slug: data.slug, _id: { $ne: id } });
    if (existing) {
      sendError(res, 'A category with this slug already exists', 409);
      return;
    }
  }

  const category = await Category.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!category) {
    sendError(res, 'Category not found', 404);
    return;
  }

  sendSuccess(res, category, 'Category updated successfully');
};

export const adminDeleteCategory = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const category = await Category.findByIdAndDelete(id);
  if (!category) {
    sendError(res, 'Category not found', 404);
    return;
  }
  sendSuccess(res, null, 'Category deleted successfully');
};
