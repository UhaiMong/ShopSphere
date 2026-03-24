import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";
import { logger } from "../utils/logger";

// requestId
// Attaches a unique ID to every request for distributed tracing.

export const requestId = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const id = (req.headers["x-request-id"] as string) ?? uuidv4();
  req.requestId = id;
  res.setHeader("X-Request-Id", id);
  next();
};

// httpLogger

export const httpLogger = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    const level =
      res.statusCode >= 500 ? "error" : res.statusCode >= 400 ? "warn" : "info";
    logger[level]({
      requestId: req.requestId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.headers["user-agent"],
      ip: req.ip,
    });
  });

  next();
};
