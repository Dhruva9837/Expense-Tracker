const { Queue } = require('bullmq');
const { redisClient } = require('../services/redisService');
const logger = require('../utils/logger');

const reportQueue = new Queue('report-tasks', {
  connection: redisClient,
});

const addReportJob = async (type, data) => {
  try {
    const job = await reportQueue.add('generate-report', { type, data }, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
    });
    logger.info(`Report job added to queue: ${job.id}`);
    return job;
  } catch (err) {
    if (err.message.includes('ECONNREFUSED') || err.message.includes('Stream isn\'t writeable')) {
      // Don't throw if it's just a redis connection issue, we've already logged it in the service
      return null;
    }
    logger.error('Error adding report job to queue', err);
    throw err;
  }
};

// Handle connection errors silently
reportQueue.on('error', (err) => {
  if (err.message.includes('ECONNREFUSED')) return;
  logger.error('Report Queue Error', err);
});

module.exports = {
  reportQueue,
  addReportJob,
};
