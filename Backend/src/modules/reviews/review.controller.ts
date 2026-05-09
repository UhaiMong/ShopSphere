import { Router, Request, Response } from 'express';
// import { Review, Wishlist } from "../../models/Cart.Review.Wishlist.model";
import { Order } from '../../models/Order.model';
import { Product } from '../../models/Product.model';
import { ApiResponse } from '../../utils/ApiResponse';
import { ApiError } from '../../utils/ApiError';
import { catchAsync } from '../../utils/catchAsync';
import { protect } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { parsePagination, getPaginationMeta } from '../../utils/ApiResponse';
import { z } from 'zod';
import { Review } from '../../models/Review.model';

// REVIEWS

const createReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().max(100).trim().optional(),
  body: z.string().min(10).max(2000).trim(),
});

const reviewController = {
  // GET /reviews/:productId
  getProductReviews: catchAsync(async (req: Request, res: Response) => {
    const { page, limit, skip } = parsePagination(req.query);
    const sort: any = req.query.sort === 'helpful' ? { helpfulCount: -1 } : { createdAt: -1 };

    const [reviews, total] = await Promise.all([
      Review.find({ product: req.params.productId, isApproved: true })
        .populate('user', 'name avatar')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Review.countDocuments({
        product: req.params.productId,
        isApproved: true,
      }),
    ]);

    ApiResponse.paginated(res, reviews, getPaginationMeta(total, page, limit));
  }),

  // POST /reviews/:productId  (protected)
  create: catchAsync(async (req: Request, res: Response) => {
    const { productId } = req.params;

    // Verify product exists
    const product = await Product.findById(productId);
    if (!product) throw ApiError.notFound('Product');

    // Check if already reviewed
    const existing = await Review.findOne({
      user: req.user!._id,
      product: productId,
    });
    if (existing) throw ApiError.conflict('You have already reviewed this product');

    // Check if verified purchase
    const hasPurchased = await Order.exists({
      user: req.user!._id,
      'items.product': productId,
      status: 'delivered',
    });

    const review = await Review.create({
      user: req.user!._id,
      product: productId,
      isVerifiedPurchase: Boolean(hasPurchased),
      ...req.body,
    });

    await review.populate('user', 'name avatar');
    ApiResponse.created(res, review, 'Review submitted successfully');
  }),

  // PATCH /reviews/:id/helpful  (protected) — toggle vote
  toggleHelpful: catchAsync(async (req: Request, res: Response) => {
    const review = await Review.findById(req.params.id);
    if (!review) throw ApiError.notFound('Review');

    const userId = req.user!._id;
    const hasVoted = review.helpfulVoters.some((v) => String(v) === userId);

    if (hasVoted) {
      review.helpfulVoters = review.helpfulVoters.filter((v) => String(v) !== userId) as any;
      review.helpfulCount = Math.max(0, review.helpfulCount - 1);
    } else {
      review.helpfulVoters.push(userId as any);
      review.helpfulCount += 1;
    }

    await review.save();
    ApiResponse.success(res, {
      helpful: !hasVoted,
      helpfulCount: review.helpfulCount,
    });
  }),

  // DELETE /reviews/:id  (own review or admin)
  remove: catchAsync(async (req: Request, res: Response) => {
    const review = await Review.findById(req.params.id);
    if (!review) throw ApiError.notFound('Review');

    const isOwner = String(review.user) === req.user!._id;
    const isAdmin = ['admin', 'superadmin'].includes(req.user!.role);

    if (!isOwner && !isAdmin) throw ApiError.forbidden();

    await review.deleteOne();
    ApiResponse.success(res, null, 'Review deleted');
  }),
};

export const reviewRouter = Router();
reviewRouter.get('/:productId', reviewController.getProductReviews);
reviewRouter.post('/:productId', protect, validate(createReviewSchema), reviewController.create);
reviewRouter.patch('/:id/helpful', protect, reviewController.toggleHelpful);
reviewRouter.delete('/:id', protect, reviewController.remove);
