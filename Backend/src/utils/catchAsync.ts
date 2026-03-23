import { Request, Response, NextFunction, RequestHandler } from "express";

// ─── catchAsync ────────────────────────────────────────────────────────────────
// Wraps async route handlers so you never need try/catch in controllers.
// Any thrown error (ApiError or native Error) is forwarded to the global
// error middleware via next(err).
//
// Usage:
//   router.get('/products', catchAsync(productController.getAll));

export const catchAsync = (fn: RequestHandler): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
