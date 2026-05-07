"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reviewRouter = void 0;
const express_1 = require("express");
// import { Review, Wishlist } from "../../models/Cart.Review.Wishlist.model";
const Order_model_1 = require("../../models/Order.model");
const Product_model_1 = require("../../models/Product.model");
const ApiResponse_1 = require("../../utils/ApiResponse");
const ApiError_1 = require("../../utils/ApiError");
const catchAsync_1 = require("../../utils/catchAsync");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const validate_middleware_1 = require("../../middleware/validate.middleware");
const ApiResponse_2 = require("../../utils/ApiResponse");
const zod_1 = require("zod");
const Review_model_1 = require("@/models/Review.model");
// REVIEWS
const createReviewSchema = zod_1.z.object({
    rating: zod_1.z.number().int().min(1).max(5),
    title: zod_1.z.string().max(100).trim().optional(),
    body: zod_1.z.string().min(10).max(2000).trim(),
});
const reviewController = {
    // GET /reviews/:productId
    getProductReviews: (0, catchAsync_1.catchAsync)(async (req, res) => {
        const { page, limit, skip } = (0, ApiResponse_2.parsePagination)(req.query);
        const sort = req.query.sort === "helpful" ? { helpfulCount: -1 } : { createdAt: -1 };
        const [reviews, total] = await Promise.all([
            Review_model_1.Review.find({ product: req.params.productId, isApproved: true })
                .populate("user", "name avatar")
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .lean(),
            Review_model_1.Review.countDocuments({
                product: req.params.productId,
                isApproved: true,
            }),
        ]);
        ApiResponse_1.ApiResponse.paginated(res, reviews, (0, ApiResponse_2.getPaginationMeta)(total, page, limit));
    }),
    // POST /reviews/:productId  (protected)
    create: (0, catchAsync_1.catchAsync)(async (req, res) => {
        const { productId } = req.params;
        // Verify product exists
        const product = await Product_model_1.Product.findById(productId);
        if (!product)
            throw ApiError_1.ApiError.notFound("Product");
        // Check if already reviewed
        const existing = await Review_model_1.Review.findOne({
            user: req.user._id,
            product: productId,
        });
        if (existing)
            throw ApiError_1.ApiError.conflict("You have already reviewed this product");
        // Check if verified purchase
        const hasPurchased = await Order_model_1.Order.exists({
            user: req.user._id,
            "items.product": productId,
            status: "delivered",
        });
        const review = await Review_model_1.Review.create({
            user: req.user._id,
            product: productId,
            isVerifiedPurchase: Boolean(hasPurchased),
            ...req.body,
        });
        await review.populate("user", "name avatar");
        ApiResponse_1.ApiResponse.created(res, review, "Review submitted successfully");
    }),
    // PATCH /reviews/:id/helpful  (protected) — toggle vote
    toggleHelpful: (0, catchAsync_1.catchAsync)(async (req, res) => {
        const review = await Review_model_1.Review.findById(req.params.id);
        if (!review)
            throw ApiError_1.ApiError.notFound("Review");
        const userId = req.user._id;
        const hasVoted = review.helpfulVoters.some((v) => String(v) === userId);
        if (hasVoted) {
            review.helpfulVoters = review.helpfulVoters.filter((v) => String(v) !== userId);
            review.helpfulCount = Math.max(0, review.helpfulCount - 1);
        }
        else {
            review.helpfulVoters.push(userId);
            review.helpfulCount += 1;
        }
        await review.save();
        ApiResponse_1.ApiResponse.success(res, {
            helpful: !hasVoted,
            helpfulCount: review.helpfulCount,
        });
    }),
    // DELETE /reviews/:id  (own review or admin)
    remove: (0, catchAsync_1.catchAsync)(async (req, res) => {
        const review = await Review_model_1.Review.findById(req.params.id);
        if (!review)
            throw ApiError_1.ApiError.notFound("Review");
        const isOwner = String(review.user) === req.user._id;
        const isAdmin = ["admin", "superadmin"].includes(req.user.role);
        if (!isOwner && !isAdmin)
            throw ApiError_1.ApiError.forbidden();
        await review.deleteOne();
        ApiResponse_1.ApiResponse.success(res, null, "Review deleted");
    }),
};
exports.reviewRouter = (0, express_1.Router)();
exports.reviewRouter.get("/:productId", reviewController.getProductReviews);
exports.reviewRouter.post("/:productId", auth_middleware_1.protect, (0, validate_middleware_1.validate)(createReviewSchema), reviewController.create);
exports.reviewRouter.patch("/:id/helpful", auth_middleware_1.protect, reviewController.toggleHelpful);
exports.reviewRouter.delete("/:id", auth_middleware_1.protect, reviewController.remove);
//# sourceMappingURL=review.controller.js.map