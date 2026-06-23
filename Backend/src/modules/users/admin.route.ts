import { Router } from 'express';
import { protect, requireRole } from '../../middleware/auth.middleware';
import { userController } from './user.controller';

// Admin
export const adminUserRouter = Router();
adminUserRouter.use(protect, requireRole('admin', 'superadmin'));
adminUserRouter.get('/', userController.adminGetAll);
adminUserRouter.patch('/:id/role', userController.adminUpdateRole);
adminUserRouter.patch('/:id/status', userController.adminToggleStatus);
