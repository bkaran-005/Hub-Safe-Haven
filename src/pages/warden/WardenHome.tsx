import { NotificationBell } from "@/components/NotificationBell";
import { LogOut, AlertTriangle, MapPin, MessageSquare, Users, Loader2 } from "lucide-react";
import { usePendingOutings } from "@/hooks/usePendingOutings";
import { useComplaints } from "@/hooks/useComplaints";
import { useAuth } from "@/contexts/AuthContext";

const WardenHome = () => {
  const { profile, logout } = useAuth();
  const { pendingOutings, loading: loadingOutings } = usePendingOutings();
  const { complaints, loading: loadingComplaints } = useComplaints();
  
  const openComplaintsCount = complaints.filter((c) => c.status === "open" || c.status === "in_progress").length;
  const studentsOutCount = 0; 

  const isLoading = loadingOutings || loadingComplaints;

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center p-6 text-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Loading dashboard data...</p>
          <p className="text-xs text-muted-foreground max-w-xs">
            If this takes too long, please check your <b>Browser Console (F12)</b> for a Firestore index link!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Warden Dashboard</h1>
          <p className="text-sm text-muted-foreground">{profile?.name || "Warden"}</p>
        </div>
        <div className="flex items-center gap-2">
          <NotificationBell count={pendingOutings.length} />
          <button 
            onClick={() => logout()}
            className="p-2 rounded-full border border-border bg-card text-status-rejected transition-colors hover:bg-status-rejected/10"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg bg-card border border-border p-3 text-center">
          <MapPin className="mx-auto h-5 w-5 text-status-pending mb-1" />
          <p className="text-lg font-bold text-foreground">{pendingOutings.length}</p>
          <p className="text-[10px] text-muted-foreground">Pending</p>
        </div>
        <div className="rounded-lg bg-card border border-border p-3 text-center">
          <MessageSquare className="mx-auto h-5 w-5 text-status-rejected mb-1" />
          <p className="text-lg font-bold text-foreground">{openComplaintsCount}</p>
          <p className="text-[10px] text-muted-foreground">Complaints</p>
        </div>
        <div className="rounded-lg bg-card border border-border p-3 text-center">
          <Users className="mx-auto h-5 w-5 text-warden mb-1" />
          <p className="text-lg font-bold text-foreground">{studentsOutCount}</p>
          <p className="text-[10px] text-muted-foreground">Out Today</p>
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-foreground">Recent Activity</h2>
        <div className="space-y-2">
          {pendingOutings.slice(0, 5).map((o) => (
            <div key={o.id} className="flex items-center justify-between rounded-lg bg-card border border-border p-3">
              <div>
                <p className="text-sm text-foreground">{o.studentName} — {o.destination}</p>
                <p className="text-xs text-muted-foreground">Room {o.roomNo}</p>
              </div>
              <span className="text-xs font-medium text-status-pending">
                {o.status}
              </span>
            </div>
          ))}
          {pendingOutings.length === 0 && (
            <p className="text-xs text-center text-muted-foreground py-4">No pending activity</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default WardenHome;
