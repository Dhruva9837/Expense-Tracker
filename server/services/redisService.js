const Redis = require('ioredis');
const logger = require('../utils/logger');

const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

const redisClient = new Redis(redisUrl, {
  maxRetriesPerRequest: null, // Required for BullMQ
  enableOfflineQueue: false,  // Don't queue commands if Redis is down
  showFriendlyErrorStack: false,
  retryStrategy(times) {
    // Increase delay between retries to reduce terminal noise
    return Math.min(times * 500, 10000);
  },
});

let isConnected = false;
let isSilent = false;

redisClient.on('error', (err) => {
  // Aggressively silence connection errors to keep terminal clean
  if (err.code === 'ECONNREFUSED' || err.message.includes('ECONNREFUSED')) {
    if (!isSilent) {
      logger.debug('Redis server not found, operating in standalone mode');
      isSilent = true;
    }
    isConnected = false;
    return;
  }

  if (isConnected) {
    logger.error('Redis Client Error', err);
    isConnected = false;
    isSilent = false;
  }
});

redisClient.on('connect', () => {
  logger.info('Redis Client Connected');
  isConnected = true;
  isSilent = false;
});

redisClient.on('reconnecting', () => {
  if (isConnected) {
    logger.info('Redis Client Reconnecting...');
    isConnected = false;
  }
});

const connectRedis = async () => {
  logger.info(`Initial Redis status: ${redisClient.status}`);
};

const getCache = async (key) => {
  if (!isConnected) return null;
  try {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    // Only log if it's not a connection error (which is handled by event listener)
    if (err.message.indexOf('Stream isn\'t writeable') === -1) {
      logger.error(`Error getting cache for key ${key}`, err);
    }
    return null;
  }
};

const setCache = async (key, value, duration = 3600) => {
  if (!isConnected) return;
  try {
    await redisClient.set(key, JSON.stringify(value), 'EX', duration);
  } catch (err) {
    if (err.message.indexOf('Stream isn\'t writeable') === -1) {
      logger.error(`Error setting cache for key ${key}`, err);
    }
  }
};

const delCache = async (key) => {
  if (!isConnected) return;
  try {
    await redisClient.del(key);
  } catch (err) {
    if (err.message.indexOf('Stream isn\'t writeable') === -1) {
      logger.error(`Error deleting cache for key ${key}`, err);
    }
  }
};

module.exports = {
  redisClient,
  connectRedis,
  getCache,
  setCache,
  delCache,
};
