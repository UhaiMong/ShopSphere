"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wishlistRouter = void 0;
const express_1 = require("express");
const Product_model_1 = require("../../models/Product.model");
const ApiResponse_1 = require("../../utils/ApiResponse");
const ApiError_1 = require("../../utils/ApiError");
const catchAsync_1 = require("../../utils/catchAsync");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const Wishlist_model_1 = require("../../models/Wishlist.model");
// ═══════════════════════════════════════════════════════════════════════════════
// WISHLIST
// ═══════════════════════════════════════════════════════════════════════════════
const wishlistController = {
    // GET /wishlist  (protected)
    getWishlist: (0, catchAsync_1.catchAsync)(async (req, res) => {
        const wishlist = await Wishlist_model_1.Wishlist.findOne({ user: req.user._id }).populate({
            path: 'products',
            select: 'name slug thumbnail price comparePrice stock avgRating isActive',
            match: { isActive: true },
        });
        ApiResponse_1.ApiResponse.success(res, {
            products: wishlist?.products ?? [],
            count: wishlist?.products?.length ?? 0,
        });
    }),
    // POST /wishlist/:productId  (protected) — toggle
    toggle: (0, catchAsync_1.catchAsync)(async (req, res) => {
        const { productId } = req.params;
        const product = await Product_model_1.Product.findById(productId);
        if (!product)
            throw ApiError_1.ApiError.notFound('Product');
        let wishlist = await Wishlist_model_1.Wishlist.findOne({ user: req.user._id });
        if (!wishlist) {
            wishlist = new Wishlist_model_1.Wishlist({ user: req.user._id, products: [] });
        }
        const isInWishlist = wishlist.products.some((p) => String(p) === productId);
        if (isInWishlist) {
            wishlist.products = wishlist.products.filter((p) => String(p) !== productId);
        }
        else {
            wishlist.products.push(productId);
        }
        await wishlist.save();
        ApiResponse_1.ApiResponse.success(res, {
            inWishlist: !isInWishlist,
            message: isInWishlist ? 'Removed from wishlist' : 'Added to wishlist',
        });
    }),
    // GET /wishlist/check/:productId  (protected)
    check: (0, catchAsync_1.catchAsync)(async (req, res) => {
        const wishlist = await Wishlist_model_1.Wishlist.findOne({ user: req.user._id });
        const inWishlist = wishlist?.products.some((p) => String(p) === req.params.productId) ?? false;
        ApiResponse_1.ApiResponse.success(res, { inWishlist });
    }),
};
exports.wishlistRouter = (0, express_1.Router)();
exports.wishlistRouter.use(auth_middleware_1.protect);
exports.wishlistRouter.get('/', wishlistController.getWishlist);
exports.wishlistRouter.post('/:productId', wishlistController.toggle);
exports.wishlistRouter.get('/check/:productId', wishlistController.check);
//# sourceMappingURL=wishlist.controller.js.map