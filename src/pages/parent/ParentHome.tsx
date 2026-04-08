import { NotificationBell } from "@/components/NotificationBell";
import { LogOut, User, MapPin, Clock, AlertTriangle, CheckCircle, Info, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useStudentForParent } from "@/hooks/useStudentForParent";
import { useOutings } from "@/hooks/useOutings";
import { useAnnouncements } from "@/hooks/useAnnouncements";

const ParentHome = () => {
  const { profile, logout } = useAuth();
  const { student, loading: loadingStudent } = useStudentForParent(profile?.uid);
  const { outings, loading: loadingOutings } = useOutings(student?.uid);
  const { announcements, loading: loadingAnnouncements } = useAnnouncements();

  const lastOuting = outings.find((o) => (o.status === "approved" || o.status === "exited") && !o.returnTimestamp);
  const isOutside = lastOuting?.status === "exited";

  const isLoading = loadingStudent || loadingOutings || loadingAnnouncements;

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">Parent Dashboard</h1>
        <div className="flex items-center gap-2">
          <NotificationBell count={announcements.length} />
          <button 
            onClick={() => logout()}
            className="p-2 rounded-full border border-border bg-card text-status-rejected transition-colors hover:bg-status-rejected/10"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="rounded-lg bg-card border border-border p-4 flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-parent/20">
          <User className="h-7 w-7 text-parent" />
        </div>
        <div>
          <p className="font-semibold text-foreground">{student?.name || "Student"}</p>
          <p className="text-sm text-muted-foreground">Room {student?.roomNo || "N/A"}</p>
        </div>
      </div>

      <div className={`rounded-lg border p-4 flex items-center gap-3 ${isOutside ? "bg-status-pending/10 border-status-pending/30" : "bg-status-approved/10 border-status-approved/30"}`}>
        {isOutside ? <MapPin className="h-5 w-5 text-status-pending" /> : <CheckCircle className="h-5 w-5 text-status-approved" />}
        <div>
          <p className={`text-sm font-medium ${isOutside ? "text-status-pending" : "text-status-approved"}`}>
            {isOutside ? `Outside — ${lastOuting?.destination}` : "Inside hostel"}
          </p>
          {isOutside && lastOuting && (
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" /> Since {lastOuting.exitTimestamp?.toDate().toLocaleTimeString() || "Recently"}
            </p>
          )}
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-foreground">Recent Announcements</h2>
        <div className="space-y-2">
          {announcements.slice(0, 3).map((a) => (
            <div key={a.id} className="flex items-start gap-3 rounded-lg bg-card border border-border p-3">
              <Info className="h-4 w-4 text-resident mt-0.5" />
              <div>
                <p className="text-sm text-foreground font-medium">{a.title}</p>
                <p className="text-xs text-muted-foreground line-clamp-1">{a.body}</p>
              </div>
            </div>
          ))}
          {announcements.length === 0 && (
            <p className="text-xs text-center text-muted-foreground py-4">No recent announcements</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParentHome;
