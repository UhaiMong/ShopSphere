"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminUserRouter = exports.userRouter = void 0;
const express_1 = require("express");
const User_model_1 = require("../../models/User.model");
const ApiResponse_1 = require("../../utils/ApiResponse");
const ApiError_1 = require("../../utils/ApiError");
const catchAsync_1 = require("../../utils/catchAsync");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const validate_middleware_1 = require("../../middleware/validate.middleware");
const upload_middleware_1 = require("../../middleware/upload.middleware");
const ApiResponse_2 = require("../../utils/ApiResponse");
const zod_1 = require("zod");
// Validators
const updateProfileSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(60).trim().optional(),
    phone: zod_1.z
        .string()
        .regex(/^\+?[\d\s\-()]{7,15}$/)
        .optional(),
});
const addressSchema = zod_1.z.object({
    label: zod_1.z.string().max(20).optional(),
    fullName: zod_1.z.string().min(2),
    phone: zod_1.z.string().min(7),
    addressLine1: zod_1.z.string().min(5),
    addressLine2: zod_1.z.string().optional(),
    city: zod_1.z.string().min(2),
    state: zod_1.z.string().optional(),
    postalCode: zod_1.z.string().min(4),
    country: zod_1.z.string().min(2).default('BD'),
    isDefault: zod_1.z.boolean().default(false),
});
//  Controller
const userController = {
    // GET /users/me
    getProfile: (0, catchAsync_1.catchAsync)(async (req, res) => {
        const user = await User_model_1.User.findById(req.user._id);
        if (!user)
            throw ApiError_1.ApiError.notFound('User');
        ApiResponse_1.ApiResponse.success(res, user.toPublicJSON());
    }),
    // PATCH /users/me
    updateProfile: (0, catchAsync_1.catchAsync)(async (req, res) => {
        const user = await User_model_1.User.findByIdAndUpdate(req.user._id, { $set: req.body }, { new: true, runValidators: true });
        if (!user)
            throw ApiError_1.ApiError.notFound('User');
        ApiResponse_1.ApiResponse.success(res, user.toPublicJSON(), 'Profile updated');
    }),
    // POST /users/me/avatar
    updateAvatar: (0, catchAsync_1.catchAsync)(async (req, res) => {
        const urls = req.uploadedUrls;
        if (!urls || urls.length === 0)
            throw ApiError_1.ApiError.badRequest('No image uploaded');
        const user = await User_model_1.User.findByIdAndUpdate(req.user._id, { avatar: urls[0] }, { new: true });
        ApiResponse_1.ApiResponse.success(res, { avatar: user?.avatar }, 'Avatar updated');
    }),
    // ── Addresses
    // POST /users/me/addresses
    addAddress: (0, catchAsync_1.catchAsync)(async (req, res) => {
        const user = await User_model_1.User.findById(req.user._id);
        if (!user)
            throw ApiError_1.ApiError.notFound('User');
        if (user.addresses.length >= 5) {
            throw ApiError_1.ApiError.badRequest('Maximum 5 addresses allowed');
        }
        // If new address is default, unset others
        if (req.body.isDefault) {
            user.addresses.forEach((addr) => {
                addr.isDefault = false;
            });
        }
        // If first address, make it default
        if (user.addresses.length === 0)
            req.body.isDefault = true;
        user.addresses.push(req.body);
        await user.save({ validateBeforeSave: false });
        ApiResponse_1.ApiResponse.created(res, user.addresses, 'Address added');
    }),
    // PUT /users/me/addresses/:addressId
    updateAddress: (0, catchAsync_1.catchAsync)(async (req, res) => {
        const user = await User_model_1.User.findById(req.user._id);
        if (!user)
            throw ApiError_1.ApiError.notFound('User');
        const addr = user.addresses.id(req.params.addressId);
        if (!addr)
            throw ApiError_1.ApiError.notFound('Address');
        if (req.body.isDefault) {
            user.addresses.forEach((a) => {
                a.isDefault = false;
            });
        }
        Object.assign(addr, req.body);
        await user.save({ validateBeforeSave: false });
        ApiResponse_1.ApiResponse.success(res, user.addresses, 'Address updated');
    }),
    // DELETE /users/me/addresses/:addressId
    removeAddress: (0, catchAsync_1.catchAsync)(async (req, res) => {
        const user = await User_model_1.User.findById(req.user._id);
        if (!user)
            throw ApiError_1.ApiError.notFound('User');
        const addr = user.addresses.id(req.params.addressId);
        if (!addr)
            throw ApiError_1.ApiError.notFound('Address');
        addr.deleteOne();
        await user.save({ validateBeforeSave: false });
        ApiResponse_1.ApiResponse.success(res, user.addresses, 'Address removed');
    }),
    // ── Admin: User Management
    // GET /admin/users
    adminGetAll: (0, catchAsync_1.catchAsync)(async (req, res) => {
        const { page, limit, skip } = (0, ApiResponse_2.parsePagination)(req.query);
        const filter = {};
        if (req.query.role)
            filter.role = req.query.role;
        if (req.query.isVerified)
            filter.isVerified = req.query.isVerified === 'true';
        if (req.query.search) {
            const rx = new RegExp(String(req.query.search), 'i');
            filter.$or = [{ name: rx }, { email: rx }];
        }
        const [users, total] = await Promise.all([
            User_model_1.User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
            User_model_1.User.countDocuments(filter),
        ]);
        ApiResponse_1.ApiResponse.paginated(res, users, (0, ApiResponse_2.getPaginationMeta)(total, page, limit));
    }),
    // PATCH /admin/users/:id/role
    adminUpdateRole: (0, catchAsync_1.catchAsync)(async (req, res) => {
        const { role } = req.body;
        const validRoles = ['user', 'admin'];
        if (!validRoles.includes(role))
            throw ApiError_1.ApiError.badRequest('Invalid role');
        const user = await User_model_1.User.findByIdAndUpdate(req.params.id, { role }, { new: true });
        if (!user)
            throw ApiError_1.ApiError.notFound('User');
        ApiResponse_1.ApiResponse.success(res, user.toPublicJSON(), 'Role updated');
    }),
    // PATCH /admin/users/:id/status
    adminToggleStatus: (0, catchAsync_1.catchAsync)(async (req, res) => {
        const user = await User_model_1.User.findById(req.params.id);
        if (!user)
            throw ApiError_1.ApiError.notFound('User');
        user.isActive = !user.isActive;
        await user.save({ validateBeforeSave: false });
        ApiResponse_1.ApiResponse.success(res, { isActive: user.isActive }, `User ${user.isActive ? 'activated' : 'deactivated'}`);
    }),
};
// Router
exports.userRouter = (0, express_1.Router)();
exports.userRouter.use(auth_middleware_1.protect);
// Profile
exports.userRouter.get('/me', userController.getProfile);
exports.userRouter.patch('/me', (0, validate_middleware_1.validate)(updateProfileSchema), userController.updateProfile);
exports.userRouter.post('/me/avatar', upload_middleware_1.upload.single('avatar'), (0, upload_middleware_1.processImages)('avatars'), userController.updateAvatar);
// Addresses
exports.userRouter.post('/me/addresses', (0, validate_middleware_1.validate)(addressSchema), userController.addAddress);
exports.userRouter.put('/me/addresses/:addressId', (0, validate_middleware_1.validate)(addressSchema.partial()), userController.updateAddress);
exports.userRouter.delete('/me/addresses/:addressId', userController.removeAddress);
// Admin
exports.adminUserRouter = (0, express_1.Router)();
exports.adminUserRouter.use(auth_middleware_1.protect, (0, auth_middleware_1.requireRole)('admin', 'superadmin'));
exports.adminUserRouter.get('/', userController.adminGetAll);
exports.adminUserRouter.patch('/:id/role', userController.adminUpdateRole);
exports.adminUserRouter.patch('/:id/status', userController.adminToggleStatus);
//# sourceMappingURL=user.controller.js.map