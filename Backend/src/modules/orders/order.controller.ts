import type { Request, Response } from 'express';

import { ApiResponse } from '../../utils/ApiResponse';
import { ApiError } from '../../utils/ApiError';
import { catchAsync } from '../../utils/catchAsync';
import { z } from 'zod';
import { orderService } from './order.service';
import type { updateOrderStatusSchema } from './order.validator';

// Controller
export const orderController = {
  create: catchAsync(async (req: Request, res: Response) => {
    const order = await orderService.createFromCart(req.user!._id, req.body);
    ApiResponse.created(res, order, 'Order placed successfully');
  }),

  getUserOrders: catchAsync(async (req: Request, res: Response) => {
    const { orders, pagination } = await orderService.getUserOrders(req.user!._id, req.query);
    ApiResponse.paginated(res, orders, pagination);
  }),

  getOne: catchAsync(async (req: Request, res: Response) => {
    const orderId = req.params.id;
    if (!orderId) throw ApiError.badRequest('Order id is missing');
    const order = await orderService.getOrderById(orderId, req.user!._id);
    ApiResponse.success(res, order);
  }),

  cancel: catchAsync(async (req: Request, res: Response) => {
    const orderId = req.params.id;
    if (!orderId) throw ApiError.badRequest('Order id is missing');
    const order = await orderService.cancelOrder(orderId, req.user!._id);
    ApiResponse.success(res, order, 'Order cancelled successfully');
  }),

  //  Admin
  adminGetAll: catchAsync(async (req: Request, res: Response) => {
    const { orders, pagination } = await orderService.getAllOrders(req.query);
    ApiResponse.paginated(res, orders, pagination);
  }),

  adminGetOne: catchAsync(async (req: Request, res: Response) => {
    const orderId = req.params.id;
    if (!orderId) throw ApiError.badRequest('Order id is missing');
    const order = await orderService.getOrderById(orderId);
    ApiResponse.success(res, order);
  }),

  adminUpdateStatus: catchAsync(async (req: Request, res: Response) => {
    const { status, note } = req.body as z.infer<typeof updateOrderStatusSchema>;
    const orderId = req.params.id;
    if (!orderId) throw ApiError.badRequest('Order id is missing');
    const order = await orderService.updateStatus(orderId, status, note, req.user!._id);
    ApiResponse.success(res, order, `Order status updated to ${status}`);
  }),
};
