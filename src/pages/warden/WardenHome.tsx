import { NotificationBell } from "@/components/NotificationBell";
import { LogOut, AlertTriangle, MapPin, MessageSquare, Users, Loader2, Utensils, Star, ChevronRight } from "lucide-react";
import { usePendingOutings } from "@/hooks/usePendingOutings";
import { useComplaints } from "@/hooks/useComplaints";
import { useMessRatings } from "@/hooks/useMessRatings";
import { useAuth } from "@/contexts/AuthContext";
import { useLateReturns } from "@/hooks/useLateReturns";
import { LateReturnLog } from "@/components/LateReturnLog";
import { cn } from "@/lib/utils";

const WardenHome = () => {
  const { profile, logout } = useAuth();
  const today = new Date().toISOString().split("T")[0];
  
  const { pendingOutings, loading: loadingOutings } = usePendingOutings();
  const { complaints, loading: loadingComplaints } = useComplaints();
  const { cumulativeStats, loading: loadingRatings } = useMessRatings(undefined, today);
  const { lateReturns, loading: loadingLate } = useLateReturns();
  
  const openComplaintsCount = complaints.filter((c) => c.status === "open" || c.status === "in_progress").length;
  const studentsOutCount = 0; 

  const isLoading = loadingOutings || loadingComplaints || loadingRatings || loadingLate;

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

      <div className="rounded-lg bg-card border border-border p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Utensils className="h-5 w-5 text-warden" />
            <h2 className="text-sm font-semibold text-foreground">Today's Mess Feedback</h2>
          </div>
          <button className="text-[10px] text-warden hover:underline flex items-center gap-1">
            VIEW ALL <ChevronRight className="h-3 w-3" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {(["breakfast", "lunch", "dinner"] as const).map((meal) => (
            <div key={meal} className="bg-secondary/30 rounded-lg p-2 text-center space-y-1">
              <p className="text-[10px] uppercase font-bold text-muted-foreground">{meal}</p>
              <div className="flex items-center justify-center gap-1">
                <Star className={cn("h-3 w-3", cumulativeStats[meal].count > 0 ? "fill-status-pending text-status-pending" : "text-muted-foreground")} />
                <span className="text-sm font-bold text-foreground">
                  {cumulativeStats[meal].count > 0 ? cumulativeStats[meal].avg : "-"}
                </span>
              </div>
              <p className="text-[9px] text-muted-foreground">{cumulativeStats[meal].count} reviews</p>
            </div>
          ))}
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="mb-3 text-sm font-semibold text-foreground flex items-center gap-2">
            <MapPin className="h-4 w-4 text-status-pending" />
            Pending Approvals
          </h2>
          <div className="space-y-2">
            {pendingOutings.slice(0, 3).map((o) => (
              <div key={o.id} className="flex items-center justify-between rounded-lg bg-card border border-border p-3">
                <div>
                  <p className="text-sm text-foreground font-medium">{o.studentName}</p>
                  <p className="text-[10px] text-muted-foreground">{o.destination}</p>
                </div>
                <span className="text-[10px] font-bold uppercase text-status-pending">
                  PENDING
                </span>
              </div>
            ))}
            {pendingOutings.length === 0 && (
              <p className="text-xs text-center text-muted-foreground py-4 border border-dashed rounded-lg">No pending activity</p>
            )}
          </div>
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold text-foreground flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-orange-500" />
            Late Return Logs
          </h2>
          <LateReturnLog outings={lateReturns} limit={3} />
        </div>
      </div>
    </div>
  );
};

export default WardenHome;
