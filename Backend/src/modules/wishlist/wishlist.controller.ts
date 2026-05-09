import { Router, Request, Response } from 'express';
import { Product } from '../../models/Product.model';
import { ApiResponse } from '../../utils/ApiResponse';
import { ApiError } from '../../utils/ApiError';
import { catchAsync } from '../../utils/catchAsync';
import { protect } from '../../middleware/auth.middleware';
import { Wishlist } from '../../models/Wishlist.model';
// ═══════════════════════════════════════════════════════════════════════════════
// WISHLIST
// ═══════════════════════════════════════════════════════════════════════════════

const wishlistController = {
  // GET /wishlist  (protected)
  getWishlist: catchAsync(async (req: Request, res: Response) => {
    const wishlist = await Wishlist.findOne({ user: req.user!._id }).populate({
      path: 'products',
      select: 'name slug thumbnail price comparePrice stock avgRating isActive',
      match: { isActive: true },
    });

    ApiResponse.success(res, {
      products: wishlist?.products ?? [],
      count: wishlist?.products?.length ?? 0,
    });
  }),

  // POST /wishlist/:productId  (protected) — toggle
  toggle: catchAsync(async (req: Request, res: Response) => {
    const { productId } = req.params;

    const product = await Product.findById(productId);
    if (!product) throw ApiError.notFound('Product');

    let wishlist = await Wishlist.findOne({ user: req.user!._id });
    if (!wishlist) {
      wishlist = new Wishlist({ user: req.user!._id, products: [] });
    }

    const isInWishlist = wishlist.products.some((p) => String(p) === productId);

    if (isInWishlist) {
      wishlist.products = wishlist.products.filter((p) => String(p) !== productId) as any;
    } else {
      wishlist.products.push(productId as any);
    }

    await wishlist.save();
    ApiResponse.success(res, {
      inWishlist: !isInWishlist,
      message: isInWishlist ? 'Removed from wishlist' : 'Added to wishlist',
    });
  }),

  // GET /wishlist/check/:productId  (protected)
  check: catchAsync(async (req: Request, res: Response) => {
    const wishlist = await Wishlist.findOne({ user: req.user!._id });
    const inWishlist = wishlist?.products.some((p) => String(p) === req.params.productId) ?? false;
    ApiResponse.success(res, { inWishlist });
  }),
};

export const wishlistRouter = Router();
wishlistRouter.use(protect);
wishlistRouter.get('/', wishlistController.getWishlist);
wishlistRouter.post('/:productId', wishlistController.toggle);
wishlistRouter.get('/check/:productId', wishlistController.check);
