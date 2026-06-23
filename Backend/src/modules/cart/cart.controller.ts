import { Router, type Request, type Response } from 'express';
import { ApiResponse } from '../../utils/ApiResponse';
import { ApiError } from '../../utils/ApiError';
import { catchAsync } from '../../utils/catchAsync';
import { protect } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';

import { cartService } from './cart.service';

//  Controller
export const cartController = {
  getCart: catchAsync(async (req: Request, res: Response) => {
    const cart = await cartService.getCart(req.user!._id);
    ApiResponse.success(res, cart);
  }),

  addItem: catchAsync(async (req: Request, res: Response) => {
    const cart = await cartService.addItem(req.user!._id, req.body);
    ApiResponse.success(res, cart, 'Item added to cart');
  }),

  updateItem: catchAsync(async (req: Request, res: Response) => {
    const { quantity } = req.body as { quantity: number };
    const itemId = req.params.itemId;
    if (!itemId) throw ApiError.badRequest('Item ID is required');
    const cart = await cartService.updateItem(req.user!._id, itemId, quantity);
    ApiResponse.success(res, cart, 'Cart updated');
  }),

  removeItem: catchAsync(async (req: Request, res: Response) => {
    const itemId = req.params.itemId;
    if (!itemId) throw ApiError.badRequest('Item ID is required');
    const cart = await cartService.removeItem(req.user!._id, itemId);
    ApiResponse.success(res, cart, 'Item removed');
  }),

  clearCart: catchAsync(async (req: Request, res: Response) => {
    await cartService.clearCart(req.user!._id);
    ApiResponse.success(res, null, 'Cart cleared');
  }),
};
