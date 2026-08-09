import { cn } from '@/lib/utils';
import {
  Clock,
  Loader2,
  CheckCircle2,
  XCircle,
  PauseCircle,
} from 'lucide-react';

export type OrderStatus = 'pending' | 'processing' | 'completed' | 'rejected' | 'on_hold';

const statusConfig: Record<OrderStatus, { label: string; classes: string; icon: typeof Clock }> = {
  pending: { label: 'Pending', classes: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock },
  processing: { label: 'Processing', classes: 'bg-sky-50 text-sky-700 border-sky-200', icon: Loader2 },
  completed: { label: 'Completed', classes: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
  rejected: { label: 'Rejected', classes: 'bg-red-50 text-red-700 border-red-200', icon: XCircle },
  on_hold: { label: 'On Hold', classes: 'bg-slate-100 text-slate-600 border-slate-200', icon: PauseCircle },
};

export function StatusBadge({ status, className }: { status: OrderStatus; className?: string }) {
  const config = statusConfig[status];
  const Icon = config.icon;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium',
        config.classes,
        className
      )}
    >
      <Icon className={cn('h-3 w-3', status === 'processing' && 'animate-spin')} />
      {config.label}
    </span>
  );
}

export function PaymentStatusBadge({ status, className }: { status: 'pending' | 'approved' | 'rejected'; className?: string }) {
  const map = {
    pending: { label: 'Pending', classes: 'bg-amber-50 text-amber-700 border-amber-200' },
    approved: { label: 'Approved', classes: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    rejected: { label: 'Rejected', classes: 'bg-red-50 text-red-700 border-red-200' },
  };
  const config = map[status];
  return (
    <span className={cn('inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium', config.classes, className)}>
      {config.label}
    </span>
  );
}
