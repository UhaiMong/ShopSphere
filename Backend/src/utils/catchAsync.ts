import { Request, Response, NextFunction, RequestHandler } from "express";

// catchAsync
// Usage:
//   router.get('/products', catchAsync(productController.getAll));

export const catchAsync = (fn: RequestHandler): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
