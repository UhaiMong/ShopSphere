import { Router } from 'express';
import { reviewController } from './review.controller';
import { protect } from '../../middleware/auth.middleware';
import { createReviewSchema } from './review.validator';
import { validate } from '../../middleware/validate.middleware';

export const reviewRouter = Router();
reviewRouter.get('/:productId', reviewController.getProductReviews);
reviewRouter.post('/:productId', protect, validate(createReviewSchema), reviewController.create);
reviewRouter.patch('/:id/helpful', protect, reviewController.toggleHelpful);
reviewRouter.delete('/:id', protect, reviewController.remove);
