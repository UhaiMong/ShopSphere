import { Router } from 'express';
import { protect } from '../../middleware/auth.middleware';
import { wishlistController } from './wishlist.controller';

export const wishlistRouter = Router();
wishlistRouter.use(protect);
wishlistRouter.get('/', wishlistController.getWishlist);
wishlistRouter.post('/:productId', wishlistController.toggle);
wishlistRouter.get('/check/:productId', wishlistController.check);
