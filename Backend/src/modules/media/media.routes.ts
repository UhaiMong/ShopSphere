import { Router } from 'express';
import { protect, requireRole } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { upload, processImages } from '../../middleware/upload.middleware';

import { mediaController } from './media.controller';
import { createMediaSchema, mediaQuerySchema, updatMediaSchema } from './media.validator';
import { mediaService } from './media.service';
// import { createMediaSchema } from "./media.validator";

export const mediaRouter = Router();

// ── Public

// ── Admin
mediaRouter.get(
  '/',
  protect,
  requireRole('admin', 'superadmin'),
  validate(mediaQuerySchema, 'query'),
  mediaController.getAll,
);
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
mediaRouter.delete('/:id', protect, requireRole('admin', 'superadmin'), mediaController.remove);

// Hard delete
mediaRouter.delete(
  '/:id/media',
  protect,
  requireRole('admin', 'superadmin'),
  mediaService.deleteMedia,
);
