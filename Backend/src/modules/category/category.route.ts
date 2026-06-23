import { Router } from 'express';
import { categoryController } from './category.controller';
import { protect, requireRole } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { createCategorySchema, updateCategorySchema } from './category.validator';

// Router
export const categoryRouter = Router();

categoryRouter.get('/', categoryController.getAll);
categoryRouter.get('/:slug', categoryController.getOne);

categoryRouter.post(
  '/',
  protect,
  requireRole('admin', 'superadmin'),
  validate(createCategorySchema),
  categoryController.create,
);
categoryRouter.put(
  '/:id',
  protect,
  requireRole('admin', 'superadmin'),
  validate(updateCategorySchema),
  categoryController.update,
);
categoryRouter.delete(
  '/:id',
  protect,
  requireRole('admin', 'superadmin'),
  categoryController.remove,
);
