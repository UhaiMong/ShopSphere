import { Router } from 'express';
import { protect, requireRole, optionalAuth } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { createProductSchema, updateProductSchema, productQuerySchema } from './product.validator';
import { productController } from './product.controller';

export const productRouter = Router();

// Public
productRouter.get('/', validate(productQuerySchema, 'query'), productController.getAll);
productRouter.get('/featured', productController.getFeatured);
productRouter.get('/:idOrSlug', optionalAuth, productController.getOne);
productRouter.get('/:id/related', productController.getRelated);

// Admin
// Post
productRouter.post(
  '/',
  protect,
  requireRole('admin', 'superadmin'),
  validate(createProductSchema),
  productController.create,
);

// PUT
productRouter.put(
  '/:id',
  protect,
  requireRole('admin', 'superadmin'),
  validate(updateProductSchema),
  productController.update,
);
// PATCH:
productRouter.patch(
  '/:id/stock',
  protect,
  requireRole('admin', 'superadmin'),
  productController.updateStock,
);
// DELETE
productRouter.delete('/:id', protect, requireRole('admin', 'superadmin'), productController.remove);

productRouter.delete(
  '/:id/images',
  protect,
  requireRole('admin', 'superadmin'),
  productController.deleteImage,
);
