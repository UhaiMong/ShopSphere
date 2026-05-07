"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.disconnectDB = exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const logger_js_1 = require("@/utils/logger.js");
const env_config_js_1 = require("@/config/env.config.js");
// Connection Options
const MONGOOSE_OPTIONS = {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    family: 4,
};
// Connect
const connectDB = async () => {
    try {
        const conn = await mongoose_1.default.connect(env_config_js_1.env.MONGO_URI, MONGOOSE_OPTIONS);
        logger_js_1.logger.info(`MongoDB connected: ${conn.connection.host}`);
    }
    catch (error) {
        logger_js_1.logger.error("MongoDB connection failed:", error);
        process.exit(1);
    }
};
exports.connectDB = connectDB;
// Graceful Disconnect
const disconnectDB = async () => {
    await mongoose_1.default.disconnect();
    logger_js_1.logger.info("MongoDB disconnected");
};
exports.disconnectDB = disconnectDB;
// Connection Event Listeners
mongoose_1.default.connection.on("disconnected", () => {
    logger_js_1.logger.warn("MongoDB disconnected — attempting reconnect...");
});
mongoose_1.default.connection.on("error", (err) => {
    logger_js_1.logger.error("MongoDB error:", err);
});
//# sourceMappingURL=database.js.map