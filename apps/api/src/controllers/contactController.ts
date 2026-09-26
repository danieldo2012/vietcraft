import { Request, Response } from 'express';
import { ContactMessage } from '../models/ContactMessage';
import { sendSuccess, sendError } from '../utils/response';
import { logger } from '../utils/logger';
import { contactSchema } from '@vietcraft/shared';

export const submitContact = async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = contactSchema.parse(req.body);
    const message = await ContactMessage.create(validatedData);

    logger.info(`[ContactForm] Saved message #${message._id} from ${message.name} <${message.email}>: ${message.subject}`);

    sendSuccess(
      res,
      { received: true, id: message._id },
      'Thank you for your message. Our team will get back to you shortly.',
      201
    );
  } catch (err: any) {
    sendError(res, err.errors ? err.errors[0].message : err.message, 400);
  }
};

export const getContactMessages = async (_req: Request, res: Response): Promise<void> => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    sendSuccess(res, messages, 'Contact messages retrieved successfully');
  } catch (err: any) {
    sendError(res, err.message, 500);
  }
};

export const markContactMessageRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const message = await ContactMessage.findByIdAndUpdate(id, { isRead: true }, { new: true });
    if (!message) {
      sendError(res, 'Contact message not found', 404);
      return;
    }
    sendSuccess(res, message, 'Contact message marked as read');
  } catch (err: any) {
    sendError(res, err.message, 500);
  }
};
