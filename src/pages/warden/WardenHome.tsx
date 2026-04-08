import { NotificationBell } from "@/components/NotificationBell";
import { outings, complaints } from "@/data/dummyData";
import { AlertTriangle, MapPin, MessageSquare, Users } from "lucide-react";

const WardenHome = () => {
  const pendingOutings = outings.filter((o) => o.status === "pending");
  const openComplaints = complaints.filter((c) => c.status === "open" || c.status === "in-progress");
  const studentsOut = outings.filter((o) => o.status === "approved" && o.exitTime && !o.returnTime);
  const lateReturns = outings.filter((o) => o.status === "approved" && o.exitTime && !o.returnTime && new Date(o.returnBy) < new Date());

  return (
    <div className="space-y-6 pb-20 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Warden Dashboard</h1>
          <p className="text-sm text-muted-foreground">Mrs. Mehra</p>
        </div>
        <NotificationBell count={pendingOutings.length} />
      </div>

      {lateReturns.length > 0 && (
        <div className="flex items-center gap-2 rounded-lg bg-status-rejected/20 border border-status-rejected/30 p-3">
          <AlertTriangle className="h-5 w-5 text-status-rejected shrink-0" />
          <p className="text-sm text-status-rejected">{lateReturns.length} student(s) have not returned on time!</p>
        </div>
      )}

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg bg-card border border-border p-3 text-center">
          <MapPin className="mx-auto h-5 w-5 text-status-pending mb-1" />
          <p className="text-lg font-bold text-foreground">{pendingOutings.length}</p>
          <p className="text-[10px] text-muted-foreground">Pending</p>
        </div>
        <div className="rounded-lg bg-card border border-border p-3 text-center">
          <MessageSquare className="mx-auto h-5 w-5 text-status-rejected mb-1" />
          <p className="text-lg font-bold text-foreground">{openComplaints.length}</p>
          <p className="text-[10px] text-muted-foreground">Complaints</p>
        </div>
        <div className="rounded-lg bg-card border border-border p-3 text-center">
          <Users className="mx-auto h-5 w-5 text-warden mb-1" />
          <p className="text-lg font-bold text-foreground">{studentsOut.length}</p>
          <p className="text-[10px] text-muted-foreground">Out Today</p>
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-foreground">Recent Activity</h2>
        <div className="space-y-2">
          {outings.slice(0, 3).map((o) => (
            <div key={o.id} className="flex items-center justify-between rounded-lg bg-card border border-border p-3">
              <div>
                <p className="text-sm text-foreground">{o.student} — {o.destination}</p>
                <p className="text-xs text-muted-foreground">Room {o.room}</p>
              </div>
              <span className={`text-xs font-medium ${o.status === "pending" ? "text-status-pending" : o.status === "approved" ? "text-status-approved" : "text-status-rejected"}`}>
                {o.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WardenHome;
