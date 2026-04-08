import { NotificationBell } from "@/components/NotificationBell";
import { studentData, recentAlerts, outings } from "@/data/dummyData";
import { User, MapPin, Clock, AlertTriangle, CheckCircle, Info } from "lucide-react";

const ParentHome = () => {
  const lastOuting = outings.find((o) => o.student === "Priya Sharma" && o.status === "approved" && o.exitTime && !o.returnTime);
  const isOutside = !!lastOuting;

  return (
    <div className="space-y-6 pb-20 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">Parent Dashboard</h1>
        <NotificationBell count={1} />
      </div>

      <div className="rounded-lg bg-card border border-border p-4 flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-parent/20">
          <User className="h-7 w-7 text-parent" />
        </div>
        <div>
          <p className="font-semibold text-foreground">{studentData.name}</p>
          <p className="text-sm text-muted-foreground">Room {studentData.room} • {studentData.course}</p>
        </div>
      </div>

      <div className={`rounded-lg border p-4 flex items-center gap-3 ${isOutside ? "bg-status-pending/10 border-status-pending/30" : "bg-status-approved/10 border-status-approved/30"}`}>
        {isOutside ? <MapPin className="h-5 w-5 text-status-pending" /> : <CheckCircle className="h-5 w-5 text-status-approved" />}
        <div>
          <p className={`text-sm font-medium ${isOutside ? "text-status-pending" : "text-status-approved"}`}>
            {isOutside ? `Outside — ${lastOuting.destination}` : "Inside hostel"}
          </p>
          {isOutside && lastOuting && (
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" /> Since {new Date(lastOuting.exitTime).toLocaleTimeString()} • Return by {new Date(lastOuting.returnBy).toLocaleTimeString()}
            </p>
          )}
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-foreground">Recent Alerts</h2>
        <div className="space-y-2">
          {recentAlerts.map((a) => (
            <div key={a.id} className="flex items-start gap-3 rounded-lg bg-card border border-border p-3">
              {a.type === "warning" ? <AlertTriangle className="h-4 w-4 text-status-pending mt-0.5" /> :
               a.type === "success" ? <CheckCircle className="h-4 w-4 text-status-approved mt-0.5" /> :
               <Info className="h-4 w-4 text-resident mt-0.5" />}
              <div>
                <p className="text-sm text-foreground">{a.message}</p>
                <p className="text-xs text-muted-foreground">{new Date(a.time).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ParentHome;
