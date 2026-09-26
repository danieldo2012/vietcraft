import { Request, Response } from 'express';
import { Page } from '../models/Page';
import { sendSuccess, sendError } from '../utils/response';
import { pageSchema } from '@vietcraft/shared';

export const getPages = async (req: Request, res: Response): Promise<void> => {
  try {
    const isUserAdmin = Boolean((req as any).user);
    const filter: any = {};
    if (!isUserAdmin) {
      filter.status = 'published';
    }
    const pages = await Page.find(filter).sort({ createdAt: -1 });
    sendSuccess(res, pages, 'Pages retrieved successfully');
  } catch (err: any) {
    sendError(res, err.message, 500);
  }
};

export const getPageBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    const isUserAdmin = Boolean((req as any).user);
    const filter: any = { slug: slug.toLowerCase() };
    if (!isUserAdmin) {
      filter.status = 'published';
    }
    const page = await Page.findOne(filter);
    if (!page) {
      sendError(res, 'Page not found', 404);
      return;
    }
    sendSuccess(res, page, 'Page retrieved successfully');
  } catch (err: any) {
    sendError(res, err.message, 500);
  }
};

export const createPage = async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = pageSchema.parse(req.body);
    const existing = await Page.findOne({ slug: validatedData.slug });
    if (existing) {
      sendError(res, 'A page with this slug already exists', 400);
      return;
    }
    const page = await Page.create(validatedData);
    sendSuccess(res, page, 'Page created successfully', 201);
  } catch (err: any) {
    sendError(res, err.errors ? err.errors[0].message : err.message, 400);
  }
};

export const updatePage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const validatedData = pageSchema.parse(req.body);

    const conflicting = await Page.findOne({ slug: validatedData.slug, _id: { $ne: id } });
    if (conflicting) {
      sendError(res, 'A page with this slug already exists', 400);
      return;
    }

    const page = await Page.findByIdAndUpdate(id, validatedData, { new: true });
    if (!page) {
      sendError(res, 'Page not found', 404);
      return;
    }
    sendSuccess(res, page, 'Page updated successfully');
  } catch (err: any) {
    sendError(res, err.errors ? err.errors[0].message : err.message, 400);
  }
};

export const deletePage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const page = await Page.findByIdAndDelete(id);
    if (!page) {
      sendError(res, 'Page not found', 404);
      return;
    }
    sendSuccess(res, null, 'Page deleted successfully');
  } catch (err: any) {
    sendError(res, err.message, 500);
  }
};
