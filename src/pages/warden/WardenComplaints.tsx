import { complaints } from "@/data/dummyData";
import { StatusBadge } from "@/components/StatusBadge";
import { Clock, User } from "lucide-react";

const slaHours: Record<string, number> = { open: 24, "in-progress": 12 };

const WardenComplaints = () => (
  <div className="space-y-4 pb-20 p-4">
    <h1 className="text-xl font-bold text-foreground">Complaints</h1>
    <div className="space-y-3">
      {complaints.map((c) => {
        const hours = slaHours[c.status];
        return (
          <div key={c.id} className="rounded-lg bg-card border border-border p-4 space-y-2">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">{c.anonymous ? "Anonymous" : c.student}</span>
                {!c.anonymous && <span className="text-xs text-muted-foreground">Room {c.room}</span>}
              </div>
              <StatusBadge status={c.status} />
            </div>
            <span className="text-xs font-medium text-warden bg-warden/20 rounded-full px-2 py-0.5">{c.category}</span>
            <p className="text-sm text-foreground">{c.description}</p>
            {hours && (
              <div className="flex items-center gap-1 text-xs text-status-pending">
                <Clock className="h-3 w-3" /> {hours}h SLA remaining
              </div>
            )}
          </div>
        );
      })}
    </div>
  </div>
);

export default WardenComplaints;
