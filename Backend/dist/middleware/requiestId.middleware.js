"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.httpLogger = exports.requestId = void 0;
const uuid_1 = require("uuid");
const logger_1 = require("../utils/logger");
// requestId
// Attaches a unique ID to every request for distributed tracing.
const requestId = (req, res, next) => {
    const id = req.headers["x-request-id"] ?? (0, uuid_1.v4)();
    req.requestId = id;
    res.setHeader("X-Request-Id", id);
    next();
};
exports.requestId = requestId;
// httpLogger
const httpLogger = (req, res, next) => {
    const start = Date.now();
    res.on("finish", () => {
        const duration = Date.now() - start;
        const level = res.statusCode >= 500 ? "error" : res.statusCode >= 400 ? "warn" : "info";
        logger_1.logger[level]({
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
exports.httpLogger = httpLogger;
//# sourceMappingURL=requiestId.middleware.js.map