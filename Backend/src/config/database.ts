import mongoose from "mongoose";
import { logger } from "@/utils/logger.js";
import { env } from "@/config/env.config.js";

// Connection Options
const MONGOOSE_OPTIONS: mongoose.ConnectOptions = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4,
};

// Connect
export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(env.MONGO_URI, MONGOOSE_OPTIONS);
    logger.info(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error("MongoDB connection failed:", error);
    process.exit(1);
  }
};

// Graceful Disconnect
export const disconnectDB = async (): Promise<void> => {
  await mongoose.disconnect();
  logger.info("MongoDB disconnected");
};

// Connection Event Listeners
mongoose.connection.on("disconnected", () => {
  logger.warn("MongoDB disconnected — attempting reconnect...");
});

mongoose.connection.on("error", (err) => {
  logger.error("MongoDB error:", err);
});
