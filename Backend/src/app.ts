import express, { Application, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import compression from "compression";
import mongoSanitize from "express-mongo-sanitize";
import rateLimit from "express-rate-limit";

import { env } from "./config/env.config";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware";
import { httpLogger, requestId } from "./middleware/requiestId.middleware";

// Route imports

import authRoutes from "./modules/auth/auth.routes";
import { cartRouter } from "./modules/cart/cart.controller";
import {
  orderRouter,
  adminOrderRouter,
} from "./modules/orders/order.controller";
import { userRouter, adminUserRouter } from "./modules/users/user.controller";
import { categoryRouter } from "./modules/category/category.controller";
import { reviewRouter } from "./modules/reviews/review.controller";
import { wishlistRouter } from "./modules/wishlist/wishlist.controller";
import { productRouter } from "./modules/products/product.routes";

// App Factory
export const createApp = (): Application => {
  const app = express();

  // Trust proxy (needed behind Nginx / load balancer for real IP)
  app.set("trust proxy", 1);

  // Security Headers
  app.use(
    helmet({
      crossOriginEmbedderPolicy: false,
      contentSecurityPolicy: env.NODE_ENV === "production",
    }),
  );

  // CORS

  app.use(
    cors({
      origin: (origin, callback) => {
        const allowed = [
          env.CLIENT_URL,
          env.CLIENT_URL.replace("3000", "3001"),
        ];

        if (!origin || allowed.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error(`CORS: Origin ${origin} not allowed`));
        }
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-Request-Id"],
    }),
  );

  // Global Rate Limiter
  app.use(
    "/api",
    rateLimit({
      windowMs: env.RATE_LIMIT_WINDOW_MS,
      max: env.RATE_LIMIT_MAX,
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        success: false,
        message: "Too many requests. Please try again later.",
      },
    }),
  );

  // ── Body Parsers

  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));
  app.use(cookieParser());

  // NoSQL Injection Prevention
  // Strips $ and . from user input to prevent MongoDB operator injection
  app.use(mongoSanitize());

  // Compression
  app.use(compression());

  // Request Logging
  app.use(requestId);
  app.use(httpLogger);

  //  Health Check
  // Used by Docker, Kubernetes liveness probes, and CI smoke tests
  app.get("/health", (_req: Request, res: Response) => {
    res.status(200).json({
      status: "ok",
      service: "shopsphere-api",
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
    });
  });

  // API Routes
  const API = "/api/v1";

  app.use(`${API}/auth`, authRoutes);
  app.use(`${API}/products`, productRouter);
  app.use(`${API}/categories`, categoryRouter);
  app.use(`${API}/cart`, cartRouter);
  app.use(`${API}/orders`, orderRouter);
  app.use(`${API}/reviews`, reviewRouter);
  app.use(`${API}/wishlist`, wishlistRouter);
  app.use(`${API}/users`, userRouter);

  //  Admin Routes
  app.use(`${API}/admin/orders`, adminOrderRouter);
  app.use(`${API}/admin/users`, adminUserRouter);

  // 404 Handler
  app.use(notFoundHandler);

  // Global Error Handler
  // Must be last — Express identifies error middleware by 4 params (err, req, res, next)
  app.use(errorHandler);

  return app;
};
