import { Router } from 'express';
import { protect } from '../../middleware/auth.middleware';
import { userController } from './user.controller';
import { validate } from '../../middleware/validate.middleware';
import { addressSchema, updateProfileSchema } from './user.validator';
import { processImages, upload } from '../../middleware/upload.middleware';
export const userRouter = Router();
userRouter.use(protect);

// Profile
userRouter.get('/me', userController.getProfile);
userRouter.patch('/me', validate(updateProfileSchema), userController.updateProfile);
userRouter.post(
  '/me/avatar',
  upload.single('avatar'),
  processImages('avatars'),
  userController.updateAvatar,
);

// Addresses
userRouter.post('/me/addresses', validate(addressSchema), userController.addAddress);
userRouter.put(
  '/me/addresses/:addressId',
  validate(addressSchema.partial()),
  userController.updateAddress,
);
userRouter.delete('/me/addresses/:addressId', userController.removeAddress);
