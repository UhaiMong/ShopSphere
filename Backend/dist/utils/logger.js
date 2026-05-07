"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const pino_1 = __importDefault(require("pino"));
// Logger
// production: JSON format for log aggregators (Datadog, CloudWatch)
// development: pretty-printed with colors
exports.logger = (0, pino_1.default)({
    level: process.env.NODE_ENV === "production" ? "info" : "debug",
    ...(process.env.NODE_ENV !== "production" && {
        transport: {
            target: "pino-pretty",
            options: {
                colorize: true,
                translateTime: "SYS:yyyy-mm-dd HH:MM:ss",
                ignore: "pid,hostname",
            },
        },
    }),
    serializers: {
        err: pino_1.default.stdSerializers.err,
        req: pino_1.default.stdSerializers.req,
        res: pino_1.default.stdSerializers.res,
    },
    base: {
        env: process.env.NODE_ENV,
        service: "shopsphere-api",
    },
});
//# sourceMappingURL=logger.js.map