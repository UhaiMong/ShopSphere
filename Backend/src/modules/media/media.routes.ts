import { Router } from 'express';
import { protect, requireRole } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { upload, processImages } from '../../middleware/upload.middleware';

import { mediaController } from './media.controller';
import { createMediaSchema, mediaQuerySchema, updatMediaSchema } from './media.validator';

export const mediaRouter = Router();

// ── Admin
mediaRouter.get(
  '/',
  protect,
  requireRole('admin', 'superadmin'),
  validate(mediaQuerySchema, 'query'),
  mediaController.getAll,
);
// Media post
mediaRouter.post(
  '/',
  protect,
  requireRole('admin', 'superadmin'),
  upload.single('imgURL'),
  processImages('media'),
  validate(createMediaSchema),
  mediaController.create,
);

mediaRouter.patch(
  '/:id',
  protect,
  requireRole('admin', 'superadmin'),
  upload.single('images'),
  processImages('media'),
  validate(updatMediaSchema),
  mediaController.updateByPatch,
);

// Soft delete
mediaRouter.put('/:id/trash', protect, requireRole('admin', 'superadmin'), mediaController.remove);
// Restore
mediaRouter.put(
  '/:id/restore',
  protect,
  requireRole('admin', 'superadmin'),
  mediaController.restore,
);

// Hard delete
mediaRouter.delete('/:id', protect, requireRole('admin', 'superadmin'), mediaController.delete);
