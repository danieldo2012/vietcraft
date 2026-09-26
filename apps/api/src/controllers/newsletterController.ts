import { Request, Response } from 'express';
import { Newsletter } from '../models/Newsletter';
import { sendSuccess } from '../utils/response';

export const subscribe = async (req: Request, res: Response): Promise<void> => {
  const { email, source = 'website' } = req.body;

  const existing = await Newsletter.findOne({ email: email.toLowerCase() });
  if (existing) {
    if (existing.status === 'unsubscribed') {
      existing.status = 'subscribed';
      existing.subscribedAt = new Date();
      existing.unsubscribedAt = undefined;
      await existing.save();
    }
    sendSuccess(res, { email: existing.email }, 'Thank you for subscribing to VietCraft!');
    return;
  }

  const subscriber = await Newsletter.create({
    email: email.toLowerCase(),
    source
  });

  sendSuccess(res, { email: subscriber.email }, 'Thank you for subscribing to VietCraft!', 201);
};

export const adminGetSubscribers = async (req: Request, res: Response): Promise<void> => {
  const { page = 1, limit = 25 } = req.query as any;

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 25));
  const skip = (pageNum - 1) * limitNum;

  const [subscribers, total] = await Promise.all([
    Newsletter.find().sort({ subscribedAt: -1 }).skip(skip).limit(limitNum),
    Newsletter.countDocuments()
  ]);

  sendSuccess(res, subscribers, 'Newsletter subscribers retrieved', 200, {
    page: pageNum,
    limit: limitNum,
    total,
    totalPages: Math.ceil(total / limitNum)
  });
};
