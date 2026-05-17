import { cn } from "@/lib/utils";
import { Clock, CheckCircle2, AlertCircle, LogOut, LogIn, XCircle, RotateCcw } from "lucide-react";

type StatusType = "pending" | "approved" | "rejected" | "resolved" | "open" | "in_progress" | "in-progress" | "exited" | "returned" | "returned_late";

const statusConfig: Record<string, { label: string; className: string; icon: React.ElementType }> = {
  pending:       { label: "Pending",       className: "bg-status-pending/20 text-status-pending",   icon: Clock        },
  approved:      { label: "Approved",      className: "bg-status-approved/20 text-status-approved", icon: CheckCircle2 },
  rejected:      { label: "Rejected",      className: "bg-status-rejected/20 text-status-rejected", icon: XCircle      },
  resolved:      { label: "Resolved",      className: "bg-status-resolved/20 text-status-resolved", icon: CheckCircle2 },
  open:          { label: "Open",          className: "bg-status-rejected/20 text-status-rejected", icon: AlertCircle  },
  in_progress:   { label: "In Progress",   className: "bg-status-pending/20 text-status-pending",   icon: RotateCcw    },
  "in-progress": { label: "In Progress",   className: "bg-status-pending/20 text-status-pending",   icon: RotateCcw    },
  exited:        { label: "Outside",       className: "bg-warden/20 text-warden",                   icon: LogOut       },
  returned:      { label: "Returned",      className: "bg-resident/20 text-resident",               icon: LogIn        },
  returned_late: { label: "Late Return",   className: "bg-orange-500/20 text-orange-500 font-bold", icon: AlertCircle  },
};

export const StatusBadge = ({ status }: { status: string }) => {
  const config = statusConfig[status] ?? statusConfig.pending;
  const Icon = config.icon;
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold", config.className)}>
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  );
};
