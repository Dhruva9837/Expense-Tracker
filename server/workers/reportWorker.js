const { Worker } = require('bullmq');
const { redisClient } = require('../services/redisService');
const logger = require('../utils/logger');
// In a real scenario, you'd import the actual report generation logic here
// const { generateDailyReportPDF } = require('../services/reportService');

const worker = new Worker('report-tasks', async (job) => {
  const { type, data } = job.data;
  logger.info(`Processing report job: ${job.id} (Type: ${type})`);

  try {
    // Simulate heavy work
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // Logic for report generation would go here
    // const result = await generateDailyReportPDF(data);

    logger.info(`Report job completed: ${job.id}`);
    return { success: true, message: 'Report generated successfully' };
  } catch (err) {
    logger.error(`Error processing report job ${job.id}`, err);
    throw err;
  }
}, {
  connection: redisClient,
});

// Handle BullMQ connection errors silently
worker.on('error', (err) => {
  if (err.message.includes('ECONNREFUSED')) {
    // Silently ignore connection errors for worker as it's optional background task
    return;
  }
  logger.error('Report Worker Error', err);
});

worker.on('failed', (job, err) => {
  logger.error(`Job failed: ${job.id}`, err);
});

module.exports = worker;
