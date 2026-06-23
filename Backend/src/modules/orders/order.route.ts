import { Router } from 'express';
import { protect, requireRole } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { createOrderSchema, updateOrderStatusSchema } from './order.validator';
import { orderController } from './order.controller';

// Router
export const orderRouter = Router();

// User routes
orderRouter.use(protect);
orderRouter.post('/', validate(createOrderSchema), orderController.create);
orderRouter.get('/', orderController.getUserOrders);
orderRouter.get('/:id', orderController.getOne);
orderRouter.patch('/:id/cancel', orderController.cancel);

// Admin routes
const adminRouter = Router();
adminRouter.use(protect, requireRole('admin', 'superadmin'));
adminRouter.get('/', orderController.adminGetAll);
adminRouter.get('/:id', orderController.adminGetOne);
adminRouter.patch(
  '/:id/status',
  validate(updateOrderStatusSchema),
  orderController.adminUpdateStatus,
);

export { adminRouter as adminOrderRouter };
