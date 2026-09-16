import { getStatusInfo } from '@/lib/format';

export default function OrderStatusBadge({ status }: { status: string }) {
  const info = getStatusInfo(status);
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${info.color}`}>
      {info.label}
    </span>
  );
}
