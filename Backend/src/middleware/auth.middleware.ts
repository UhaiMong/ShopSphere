import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.config";
import { ApiError } from "../utils/ApiError";
import { IUserPayload, UserRole } from "../types";

//  Protect

export const protect = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return next(ApiError.unauthorized("No token provided"));
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as IUserPayload;
    req.user = decoded;
    next();
  } catch {
    next(ApiError.unauthorized("Invalid or expired token"));
  }
};

//  requireRole
// RBAC guard. Always chain AFTER protect().
//
// Usage:
//   router.delete('/products/:id', protect, requireRole('admin'), ...)

export const requireRole =
  (...roles: UserRole[]) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(ApiError.unauthorized());
    }
    if (!roles.includes(req.user.role)) {
      return next(
        ApiError.forbidden(
          `Role '${req.user.role}' is not authorized. Required: ${roles.join(" | ")}`,
        ),
      );
    }
    next();
  };

// optionalAuth

export const optionalAuth = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) return next();

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as IUserPayload;
    req.user = decoded;
  } catch {
    // Ignore invalide tokens for optional auth
  }
  next();
};
