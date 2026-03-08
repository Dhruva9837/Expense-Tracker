const User = require('../models/User');
const Settings = require('../models/Settings');
const { ROLES } = require('../config/constants');

const defaultSettings = [
  { key: 'defaultInterestRate', value: 12, description: 'Default annual interest rate (%)' },
  { key: 'defaultPenaltyRate', value: 2, description: 'Penalty rate per day on overdue EMI (%)' },
  { key: 'defaultTenure', value: 12, description: 'Default loan tenure in months' },
  { key: 'maxLoanAmount', value: 1000000, description: 'Maximum allowable loan amount' },
  { key: 'companyName', value: 'Pahel Finance', description: 'Company name for reports' },
  { key: 'currency', value: 'INR', description: 'Currency symbol' },
];

const logger = require('../utils/logger');

const seed = async () => {
  // Seed Admin User
  const adminEmail = process.env.SEED_ADMIN_EMAIL;
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;

  const adminData = {
    name: 'Super Admin',
    email: adminEmail,
    password: adminPassword,
    role: ROLES.ADMIN,
    isActive: true
  };

  const existingAdmin = await User.findOne({ email: adminEmail });
  if (!existingAdmin) {
    await User.create(adminData);
    logger.info(`[Seed] Admin user created: ${adminEmail}`);
  } else {
    // Optional: Ensure password matches for demo purposes
    existingAdmin.password = adminPassword;
    await existingAdmin.save();
    logger.info(`[Seed] Admin user credentials ensured: ${adminEmail}`);
  }

  // Seed default settings
  for (const setting of defaultSettings) {
    await Settings.findOneAndUpdate({ key: setting.key }, setting, { upsert: true, new: true });
  }
  logger.info('[Seed] Default settings initialized');
};

module.exports = seed;
