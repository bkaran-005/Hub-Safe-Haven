import { useAuth } from "@/contexts/AuthContext";
import { useStudentForParent } from "@/hooks/useStudentForParent";
import { useOutings } from "@/hooks/useOutings";
import { MapPin, Clock, AlertTriangle, CheckCircle2, LogOut, LogIn, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_COLOR: Record<string, string> = {
  approved:      "bg-status-approved/20 text-status-approved border-status-approved/30",
  exited:        "bg-warden/20 text-warden border-warden/30",
  returned:      "bg-resident/20 text-resident border-resident/30",
  returned_late: "bg-orange-500/20 text-orange-500 border-orange-500/40",
};

const STATUS_ICON: Record<string, React.ElementType> = {
  approved:      CheckCircle2,
  exited:        LogOut,
  returned:      LogIn,
  returned_late: AlertTriangle,
};

const STATUS_LABEL: Record<string, string> = {
  approved:      "Approved — Not yet left",
  exited:        "Currently Outside",
  returned:      "Returned on Time",
  returned_late: "Returned Late",
};

const ParentOutings = () => {
  const { profile } = useAuth();
  const { student, loading: loadingStudent } = useStudentForParent(profile?.uid);
  const { outings, loading: loadingOutings } = useOutings(student?.uid);

  // Only show approved/active trips (filter out pending and rejected)
  const studentOutings = outings.filter(
    (o) => o.status !== "pending" && o.status !== "rejected"
  );

  if (loadingStudent || loadingOutings) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-20 p-4">
      <div>
        <h1 className="text-xl font-bold text-foreground">Outings Log</h1>
        {student && <p className="text-sm text-muted-foreground">{student.name}'s activity</p>}
      </div>

      <div className="relative border-l-2 border-border ml-4 space-y-6 pl-6 pt-2">
        {studentOutings.map((o) => {
          const isLate  = o.status === "returned_late";
          const Icon    = STATUS_ICON[o.status] ?? CheckCircle2;
          const colors  = STATUS_COLOR[o.status] ?? "bg-card border-border";
          const label   = STATUS_LABEL[o.status] ?? o.status;

          return (
            <div key={o.id} className="relative">
              {/* timeline dot */}
              <div className={cn(
                "absolute -left-[1.9rem] top-3 h-3.5 w-3.5 rounded-full border-2 border-background",
                isLate ? "bg-orange-500" : "bg-parent"
              )} />

              <div className={cn(
                "rounded-xl border p-4 space-y-3",
                isLate ? "border-orange-500/40 bg-orange-500/5" : "bg-card border-border"
              )}>
                {/* header */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-parent shrink-0" />
                    <span className="text-sm font-semibold text-foreground">{o.destination}</span>
                  </div>
                  <div className={cn(
                    "flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold border",
                    colors
                  )}>
                    <Icon className="h-3 w-3" />
                    {label}
                  </div>
                </div>

                {/* schedule */}
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3 shrink-0" />
                  Scheduled: {o.fromDate} {o.fromTime} — {o.toDate} {o.toTime}
                </div>

                {/* timestamps */}
                <div className="grid grid-cols-2 gap-2 text-[10px] font-semibold uppercase text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <LogOut className="h-3 w-3 text-warden" />
                    Exit: {o.exitTimestamp?.toDate?.()?.toLocaleTimeString?.() ?? "—"}
                  </div>
                  <div className="flex items-center gap-1">
                    <LogIn className="h-3 w-3 text-resident" />
                    Return: {o.returnTimestamp?.toDate?.()?.toLocaleTimeString?.() ?? "Not yet"}
                  </div>
                </div>

                {/* late alert */}
                {isLate && (
                  <div className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 rounded-lg px-3 py-2">
                    <AlertTriangle className="h-4 w-4 text-orange-500 shrink-0" />
                    <p className="text-xs font-bold text-orange-500">
                      {o.minutesLate
                        ? `Returned ${o.minutesLate} min past deadline`
                        : "Late return recorded"}
                    </p>
                  </div>
                )}
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
