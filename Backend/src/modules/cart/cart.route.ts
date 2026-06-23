import { Router } from 'express';
import { protect } from '../../middleware/auth.middleware';
import { cartController } from './cart.controller';
import { validate } from '../../middleware/validate.middleware';
import { addItemSchema, updateItemSchema } from './cart.validator';

// Router
export const cartRouter = Router();

cartRouter.use(protect); // All cart routes require auth

cartRouter.get('/', cartController.getCart);
cartRouter.post('/items', validate(addItemSchema), cartController.addItem);
cartRouter.patch('/items/:itemId', validate(updateItemSchema), cartController.updateItem);
cartRouter.delete('/items/:itemId', cartController.removeItem);
cartRouter.delete('/', cartController.clearCart);
