export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export const ORDER_STATUS_FLOW: { key: string; label: string; color: string }[] = [
  { key: 'pending', label: 'Pending', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  { key: 'confirmed', label: 'Confirmed', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { key: 'preparing', label: 'Preparing', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { key: 'ready', label: 'Ready', color: 'bg-teal-100 text-teal-700 border-teal-200' },
  { key: 'delivered', label: 'Delivered', color: 'bg-green-100 text-green-700 border-green-200' },
  { key: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-700 border-red-200' },
];

export function getStatusInfo(status: string) {
  return ORDER_STATUS_FLOW.find((s) => s.key === status) ?? ORDER_STATUS_FLOW[0];
}
