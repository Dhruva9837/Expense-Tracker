const ROLES = {
  ADMIN: 'admin',
  STAFF: 'staff',
  VIEWER: 'viewer',
};

const LOAN_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  CLOSED: 'closed',
  DEFAULTED: 'defaulted',
};

const PAYMENT_METHODS = {
  CASH: 'cash',
  ONLINE: 'online',
  CHEQUE: 'cheque',
  UPI: 'upi',
};

const EMI_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  OVERDUE: 'overdue',
  PARTIAL: 'partial',
};

const GROUP_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  CLOSED: 'closed',
};

const RISK_CATEGORY = {
  LOW: 'low',
  MODERATE: 'moderate',
  HIGH: 'high',
};

module.exports = { ROLES, LOAN_STATUS, PAYMENT_METHODS, EMI_STATUS, GROUP_STATUS, RISK_CATEGORY };
