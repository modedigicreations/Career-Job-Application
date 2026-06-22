import { cn, getStatusColor } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  label?: string;
}

export default function StatusBadge({ status, label }: StatusBadgeProps) {
  const displayLabel = label || status.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  return (
    <span className={cn('badge', getStatusColor(status))}>
      {displayLabel}
    </span>
  );
}
