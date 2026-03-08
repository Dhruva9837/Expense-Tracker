export const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);

export const formatDate = (date) => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const formatDateTime = (date) => {
  if (!date) return '—';
  return new Date(date).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

export const capitalize = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : '';

export const getStatusColor = (status) => {
  const map = {
    active: 'badge-active',
    closed: 'badge-closed',
    pending: 'badge-pending',
    defaulted: 'badge-defaulted',
    overdue: 'badge-overdue',
    paid: 'badge-paid',
    partial: 'badge-partial',
  };
  return map[status] || 'badge-default';
};

export const monthName = (month) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months[month - 1] || '';
};
