import { cn } from "@/lib/utils";

type StatusType = "pending" | "approved" | "rejected" | "resolved" | "open" | "in-progress";

const statusConfig: Record<StatusType, { label: string; className: string }> = {
  pending: { label: "Pending", className: "bg-status-pending/20 text-status-pending" },
  approved: { label: "Approved", className: "bg-status-approved/20 text-status-approved" },
  rejected: { label: "Rejected", className: "bg-status-rejected/20 text-status-rejected" },
  resolved: { label: "Resolved", className: "bg-status-resolved/20 text-status-resolved" },
  open: { label: "Open", className: "bg-status-rejected/20 text-status-rejected" },
  "in-progress": { label: "In Progress", className: "bg-status-pending/20 text-status-pending" },
};

export const StatusBadge = ({ status }: { status: string }) => {
  const config = statusConfig[status as StatusType] || statusConfig.pending;
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold", config.className)}>
      {config.label}
    </span>
  );
};
