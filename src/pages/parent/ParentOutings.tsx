import { useAuth } from "@/contexts/AuthContext";
import { useStudentForParent } from "@/hooks/useStudentForParent";
import { useOutings } from "@/hooks/useOutings";
import { MapPin, Clock, AlertTriangle, Loader2 } from "lucide-react";

const ParentOutings = () => {
  const { profile } = useAuth();
  const { student, loading: loadingStudent } = useStudentForParent(profile?.uid);
  const { outings, loading: loadingOutings } = useOutings(student?.uid);

  const studentOutings = outings.filter((o) => o.status !== "pending" && o.status !== "rejected");

  if (loadingStudent || loadingOutings) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-20 p-4">
      <h1 className="text-xl font-bold text-foreground">Outings Timeline</h1>

      <div className="relative border-l-2 border-border ml-4 space-y-6 pl-6 pt-2">
        {studentOutings.map((o) => {
          // Check if late: returnTimestamp exists and is after toTime/toDate
          // Simplified for now: just check if it has a returned status or exited
          const isLate = o.lateAlertSent;
          
          return (
            <div key={o.id} className="relative">
              <div className="absolute -left-[1.85rem] top-1 h-3 w-3 rounded-full bg-parent border-2 border-background" />
              <div className={`rounded-lg bg-card border p-4 space-y-2 ${isLate ? "border-status-rejected/50" : "border-border"}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-parent" />
                    <span className="text-sm font-medium text-foreground">{o.destination}</span>
                  </div>
                  {isLate && <AlertTriangle className="h-4 w-4 text-status-rejected" />}
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px] text-muted-foreground uppercase font-bold">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" /> Exit: {o.exitTimestamp?.toDate().toLocaleTimeString() || "—"}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" /> Return: {o.returnTimestamp?.toDate().toLocaleTimeString() || "Pending"}
                  </div>
                </div>
                {isLate && <p className="text-xs text-status-rejected font-medium">Late return alert triggered</p>}
                <p className="text-[10px] text-muted-foreground">{o.fromDate}</p>
              </div>
            </div>
          );
        })}
        {studentOutings.length === 0 && (
          <p className="text-sm text-muted-foreground pt-4">No outing history available.</p>
        )}
      </div>
    </div>
  );
};

export default ParentOutings;
