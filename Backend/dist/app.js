"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const compression_1 = __importDefault(require("compression"));
const express_mongo_sanitize_1 = __importDefault(require("express-mongo-sanitize"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const env_config_1 = require("./config/env.config");
const error_middleware_1 = require("./middleware/error.middleware");
const requiestId_middleware_1 = require("./middleware/requiestId.middleware");
// Route imports
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const cart_controller_1 = require("./modules/cart/cart.controller");
const order_controller_1 = require("./modules/orders/order.controller");
const user_controller_1 = require("./modules/users/user.controller");
const category_controller_1 = require("./modules/category/category.controller");
const review_controller_1 = require("./modules/reviews/review.controller");
const wishlist_controller_1 = require("./modules/wishlist/wishlist.controller");
const product_routes_1 = require("./modules/products/product.routes");
const media_routes_1 = require("./modules/media/media.routes");
const hero_routes_1 = require("./modules/hero/hero.routes");
// App Factory
const createApp = () => {
    const app = (0, express_1.default)();
    // Trust proxy (needed behind Nginx / load balancer for real IP)
    app.set('trust proxy', 1);
    // Security Headers
    app.use((0, helmet_1.default)({
        crossOriginEmbedderPolicy: false,
        contentSecurityPolicy: env_config_1.env.NODE_ENV === 'production',
    }));
    // CORS
    app.use((0, cors_1.default)({
        origin: (origin, callback) => {
            const allowed = [env_config_1.env.CLIENT_URL, env_config_1.env.CLIENT_URL.replace('3000', '3001')];
            if (!origin || allowed.includes(origin)) {
                callback(null, true);
            }
            else {
                callback(new Error(`CORS: Origin ${origin} not allowed`));
            }
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
    }));
    // Global Rate Limiter
    app.use('/api', (0, express_rate_limit_1.default)({
        windowMs: env_config_1.env.RATE_LIMIT_WINDOW_MS,
        max: env_config_1.env.RATE_LIMIT_MAX,
        standardHeaders: true,
        legacyHeaders: false,
        message: {
            success: false,
            message: 'Too many requests. Please try again later.',
        },
    }));
    // ── Body Parsers
    app.use(express_1.default.json({ limit: '10mb' }));
    app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
    app.use((0, cookie_parser_1.default)());
    // NoSQL Injection Prevention
    // Strips $ and . from user input to prevent MongoDB operator injection
    app.use((0, express_mongo_sanitize_1.default)());
    // Compression
    app.use((0, compression_1.default)());
    // Request Logging
    app.use(requiestId_middleware_1.requestId);
    app.use(requiestId_middleware_1.httpLogger);
    //  Health Check
    // Used by Docker, Kubernetes liveness probes, and CI smoke tests
    app.get('/health', (_req, res) => {
        res.status(200).json({
            status: 'ok',
            service: 'shopsphere-api',
            timestamp: new Date().toISOString(),
            environment: env_config_1.env.NODE_ENV,
        });
    });
    // API Routes
    const API = '/api/v1';
    app.use(`${API}/auth`, auth_routes_1.default);
    app.use(`${API}/products`, product_routes_1.productRouter);
    app.use(`${API}/categories`, category_controller_1.categoryRouter);
    app.use(`${API}/cart`, cart_controller_1.cartRouter);
    app.use(`${API}/orders`, order_controller_1.orderRouter);
    app.use(`${API}/reviews`, review_controller_1.reviewRouter);
    app.use(`${API}/wishlist`, wishlist_controller_1.wishlistRouter);
    app.use(`${API}/users`, user_controller_1.userRouter);
    app.use(`${API}/media`, media_routes_1.mediaRouter);
    app.use(`${API}/hero`, hero_routes_1.heroRouter);
    //  Admin Routes
    app.use(`${API}/admin/orders`, order_controller_1.adminOrderRouter);
    app.use(`${API}/admin/users`, user_controller_1.adminUserRouter);
    // 404 Handler
    app.use(error_middleware_1.notFoundHandler);
    // Global Error Handler
    // Must be last — Express identifies error middleware by 4 params (err, req, res, next)
    app.use(error_middleware_1.errorHandler);
    return app;
};
exports.createApp = createApp;
//# sourceMappingURL=app.js.map