import type { Request, Response } from 'express';
import { User } from '../../models/User.model';
import { ApiResponse } from '../../utils/ApiResponse';
import { ApiError } from '../../utils/ApiError';
import { catchAsync } from '../../utils/catchAsync';
import { parsePagination, getPaginationMeta } from '../../utils/ApiResponse';

//  Controller
export const userController = {
  // GET /users/me
  getProfile: catchAsync(async (req: Request, res: Response) => {
    const user = await User.findById(req.user!._id);
    if (!user) throw ApiError.notFound('User');
    ApiResponse.success(res, user.toPublicJSON());
  }),

  // PATCH /users/me
  updateProfile: catchAsync(async (req: Request, res: Response) => {
    const user = await User.findByIdAndUpdate(
      req.user!._id,
      { $set: req.body },
      { new: true, runValidators: true },
    );
    if (!user) throw ApiError.notFound('User');
    ApiResponse.success(res, user.toPublicJSON(), 'Profile updated');
  }),

  // POST /users/me/avatar
  updateAvatar: catchAsync(async (req: Request, res: Response) => {
    const urls = (req as any).uploadedUrls as string[];
    if (!urls || urls.length === 0) throw ApiError.badRequest('No image uploaded');

    const user = await User.findByIdAndUpdate(req.user!._id, { avatar: urls[0] }, { new: true });
    ApiResponse.success(res, { avatar: user?.avatar }, 'Avatar updated');
  }),

  // ── Addresses

  // POST /users/me/addresses
  addAddress: catchAsync(async (req: Request, res: Response) => {
    const user = await User.findById(req.user!._id);
    if (!user) throw ApiError.notFound('User');

    if (user.addresses.length >= 5) {
      throw ApiError.badRequest('Maximum 5 addresses allowed');
    }

    // If new address is default, unset others
    if (req.body.isDefault) {
      user.addresses.forEach((addr) => {
        addr.isDefault = false;
      });
    }

    // If first address, make it default
    if (user.addresses.length === 0) req.body.isDefault = true;

    user.addresses.push(req.body);
    await user.save({ validateBeforeSave: false });
    ApiResponse.created(res, user.addresses, 'Address added');
  }),

  // PUT /users/me/addresses/:addressId
  updateAddress: catchAsync(async (req: Request, res: Response) => {
    const user = await User.findById(req.user!._id);
    if (!user) throw ApiError.notFound('User');
    const addressId = req.params.addressId;
    if (!addressId) throw ApiError.badRequest('Address Id is missing');
    const addr = user.addresses.id(addressId);
    if (!addr) throw ApiError.notFound('Address');

    if (req.body.isDefault) {
      user.addresses.forEach((a) => {
        a.isDefault = false;
      });
    }

    Object.assign(addr, req.body);
    await user.save({ validateBeforeSave: false });
    ApiResponse.success(res, user.addresses, 'Address updated');
  }),

  // DELETE /users/me/addresses/:addressId
  removeAddress: catchAsync(async (req: Request, res: Response) => {
    const user = await User.findById(req.user!._id);
    if (!user) throw ApiError.notFound('User');

    const addressId = req.params.addressId;
    if (!addressId) throw ApiError.badRequest('Address Id is missing');
    const addr = user.addresses.id(addressId);
    if (!addr) throw ApiError.notFound('Address');

    addr.deleteOne();
    await user.save({ validateBeforeSave: false });
    ApiResponse.success(res, user.addresses, 'Address removed');
  }),

  // ── Admin: User Management

  // GET /admin/users
  adminGetAll: catchAsync(async (req: Request, res: Response) => {
    const { page, limit, skip } = parsePagination(req.query);
    const filter: Record<string, unknown> = {};
    if (req.query.role) filter.role = req.query.role;
    if (req.query.isVerified) filter.isVerified = req.query.isVerified === 'true';
    if (req.query.search) {
      const rx = new RegExp(String(req.query.search), 'i');
      filter.$or = [{ name: rx }, { email: rx }];
    }

    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      User.countDocuments(filter),
    ]);

    ApiResponse.paginated(res, users, getPaginationMeta(total, page, limit));
  }),

  // PATCH /admin/users/:id/role
  adminUpdateRole: catchAsync(async (req: Request, res: Response) => {
    const { role } = req.body as { role: string };
    const validRoles = ['user', 'admin'];
    if (!validRoles.includes(role)) throw ApiError.badRequest('Invalid role');

    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    if (!user) throw ApiError.notFound('User');
    ApiResponse.success(res, user.toPublicJSON(), 'Role updated');
  }),

  // PATCH /admin/users/:id/status
  adminToggleStatus: catchAsync(async (req: Request, res: Response) => {
    const user = await User.findById(req.params.id);
    if (!user) throw ApiError.notFound('User');
    user.isActive = !user.isActive;
    await user.save({ validateBeforeSave: false });
    ApiResponse.success(
      res,
      { isActive: user.isActive },
      `User ${user.isActive ? 'activated' : 'deactivated'}`,
    );
  }),
};
