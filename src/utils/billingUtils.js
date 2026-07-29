export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const calculateGST = (amount) => {
  if (!amount) return 0;
  return amount * 0.05;
};

export const generateInvoiceNumber = (bookingRef) => {
  const date = new Date();
  const year = date.getFullYear();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  const refSuffix = bookingRef ? bookingRef.slice(-4).toUpperCase() : random;
  return `INV-${year}-${refSuffix}`;
};

export const formatPaymentStatus = (status) => {
  if (!status) return 'Pending';
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
};

export const getStatusColor = (status) => {
  const s = status?.toLowerCase();
  if (s === 'paid' || s === 'completed' || s === 'success') return 'bg-green-100 text-green-700';
  if (s === 'pending' || s === 'processing') return 'bg-yellow-100 text-yellow-700';
  if (s === 'failed' || s === 'cancelled') return 'bg-red-100 text-red-700';
  return 'bg-slate-100 text-slate-700';
};

export const formatDate = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

export const formatDateTime = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};