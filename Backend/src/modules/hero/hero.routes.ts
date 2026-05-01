import { Router } from 'express';
import { protect, requireRole } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { heroController } from './hero.controller';
import { createHeroSchema, updageHeroSchema } from './hero.validator';

export const heroRouter = Router();

// Public
heroRouter.get('/', heroController.getActived);

// Admin
heroRouter.get('/all', protect, requireRole('admin', 'superadmin'), heroController.getAll);
// Create
heroRouter.post(
  '/',
  protect,
  requireRole('admin', 'superadmin'),
  validate(createHeroSchema),
  heroController.create,
);

// Update
heroRouter.patch(
  '/:id',
  protect,
  requireRole('admin', 'superadmin'),
  validate(updageHeroSchema),
  heroController.updateHero,
);

// Soft delete
heroRouter.patch(
  '/:id/soft-delete',
  protect,
  requireRole('admin', 'superadmin'),
  heroController.softDelete,
);

// Permanent delete
heroRouter.delete(
  '/:id/permanent',
  protect,
  requireRole('admin', 'superadmin'),
  heroController.deleteHero,
);
