import { env } from '../config/env.config';
import mongoose from 'mongoose';
import { logger } from '../utils/logger';

// Connection Options
const MONGOOSE_OPTIONS: mongoose.ConnectOptions = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 15000,
  socketTimeoutMS: 45000,
  // family: 4,
};

// Connect
export const connectDB = async (): Promise<void> => {
  const uri = env.MONGO_URI;
  if (!uri) {
    logger.warn('Mongo URI missing');
    return;
  }
  try {
    const conn = await mongoose.connect(uri, MONGOOSE_OPTIONS);
    logger.info(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error('MongoDB connection failed:', error);
    process.exit(1);
  }
};

// Graceful Disconnect
export const disconnectDB = async (): Promise<void> => {
  await mongoose.disconnect();
  logger.info('MongoDB disconnected');
};

// Connection Event Listeners
// mongoose.connection.on('disconnected', async () => {
//   logger.warn('MongoDB disconnected — attempting reconnect...');

//   try {
//     await mongoose.connect(env.MONGO_URI, MONGOOSE_OPTIONS);
//     logger.info('MongoDB connected');
//   } catch (error) {
//     logger.error('Mongodb connection failed', error);
//     process.exit(1);
//   }
// });

// Add this state flag at the top
let isReconnecting = false;

mongoose.connection.on('disconnected', async () => {
  if (isReconnecting) return; // prevent loop
  isReconnecting = true;

  logger.warn('MongoDB disconnected — attempting reconnect...');

  try {
    await mongoose.connect(env.MONGO_URI!, MONGOOSE_OPTIONS);
    logger.info('MongoDB reconnected');
  } catch (error) {
    logger.error('MongoDB reconnect failed:', error);
  } finally {
    isReconnecting = false;
  }
});

mongoose.connection.on('error', (err) => {
  logger.error('MongoDB error:', err);
});
