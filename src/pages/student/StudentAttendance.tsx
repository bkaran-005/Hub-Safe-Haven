import { useState, useCallback } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { useAuth } from "@/contexts/AuthContext";
import { markAttendance } from "@/services/attendanceService";
import { CheckCircle2, XCircle, QrCode, Loader2, CalendarDays, ScanLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { useAttendance } from "@/hooks/useAttendance";

const getDailyCode = (date: string) => {
  const base = date.replace(/-/g, "");
  return `ATTEND_${base}_HSH`;
};

type ScanStatus = "idle" | "scanning" | "success" | "error";

const StudentAttendance = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const today = new Date().toISOString().split("T")[0];
  const currentMonth = new Date().toISOString().slice(0, 7);
  const expectedCode = getDailyCode(today);

  const [status, setStatus] = useState<ScanStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [processing, setProcessing] = useState(false);

  const { attendance, stats, loading } = useAttendance(profile?.uid, currentMonth);
  const todayRecord = attendance.find(r => r.date === today);
  const alreadyMarked = !!todayRecord?.present;

  const handleScan = useCallback(async (result: string) => {
    if (processing || status === "success") return;

    if (result !== expectedCode) {
      setStatus("error");
      setErrorMsg("Invalid QR code. Make sure you're scanning today's attendance QR from the warden.");
      return;
    }

    setProcessing(true);
    try {
      await markAttendance(profile!.uid, today, true, "self_scan");
      setStatus("success");
      toast({ title: "Attendance marked!", description: "You've been marked present for today." });
    } catch (e: any) {
      setStatus("error");
      setErrorMsg(e.message);
    } finally {
      setProcessing(false);
    }
  }, [processing, status, expectedCode, profile, today]);

  // Calendar prep
  const firstOfMonth = new Date(`${currentMonth}-01`);
  const startOffset = firstOfMonth.getDay();
  const daysInMonth = new Date(firstOfMonth.getFullYear(), firstOfMonth.getMonth() + 1, 0).getDate();
  const calendarCells: { day: number; status: "present" | "absent" | "none" } | null[] = [];
  for (let i = 0; i < startOffset; i++) calendarCells.push(null);
  for (let i = 1; i <= daysInMonth; i++) {
    const dateStr = `${currentMonth}-${i.toString().padStart(2, "0")}`;
    const record = attendance.find(r => r.date === dateStr);
    calendarCells.push({ day: i, status: record ? (record.present ? "present" : "absent") : "none" });
  }

  return (
    <div className="pb-24 p-4 space-y-5">
      <div>
        <h1 className="text-xl font-bold text-foreground">Attendance</h1>
        <p className="text-xs text-muted-foreground">{new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}</p>
      </div>

      {/* Today's status */}
      <div className={cn(
        "rounded-xl border-2 p-4 flex items-center gap-3",
        alreadyMarked
          ? "bg-status-approved/10 border-status-approved/30"
          : "bg-secondary/30 border-border"
      )}>
        {alreadyMarked
          ? <CheckCircle2 className="h-6 w-6 text-status-approved shrink-0" />
          : <CalendarDays className="h-6 w-6 text-muted-foreground shrink-0" />
        }
        <div>
          <p className={cn("text-sm font-semibold", alreadyMarked ? "text-status-approved" : "text-foreground")}>
            {alreadyMarked ? "Present today ✓" : "Not marked yet"}
          </p>
          <p className="text-xs text-muted-foreground">
            {alreadyMarked ? "Your attendance has been recorded for today." : "Scan the warden's QR code to mark yourself present."}
          </p>
        </div>
      </div>

      {/* Scanner section */}
      {!alreadyMarked && (
        <div className="space-y-3">
          {status === "idle" && (
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="p-3 border-b border-border flex items-center gap-2">
                <ScanLine className="h-4 w-4 text-resident" />
                <p className="text-sm font-semibold text-foreground">Scan Attendance QR</p>
              </div>
              <div className="relative aspect-square max-h-64 w-full">
                <Scanner
                  onScan={(results) => {
                    if (results?.[0]?.rawValue) handleScan(results[0].rawValue);
                  }}
                  onError={(e) => {
                    setStatus("error");
                    setErrorMsg("Camera not available. Please allow camera access.");
                  }}
                  styles={{ container: { width: "100%", height: "100%" } }}
                />
              </div>
              <p className="text-[10px] text-center text-muted-foreground p-3">
                Point your camera at the QR code shown by the warden
              </p>
            </div>
          )}

          {status === "success" && (
            <div className="rounded-xl bg-status-approved/10 border-2 border-status-approved/30 p-6 flex flex-col items-center gap-3 text-center animate-in zoom-in-95">
              <CheckCircle2 className="h-12 w-12 text-status-approved" />
              <p className="text-lg font-bold text-status-approved">Attendance Marked!</p>
              <p className="text-xs text-muted-foreground">You've been marked present for {today}.</p>
            </div>
          )}

          {status === "error" && (
            <div className="rounded-xl bg-status-rejected/10 border-2 border-status-rejected/30 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-status-rejected shrink-0" />
                <p className="text-sm font-semibold text-status-rejected">Scan Failed</p>
              </div>
              <p className="text-xs text-muted-foreground">{errorMsg}</p>
              <Button variant="outline" size="sm" onClick={() => { setStatus("idle"); setErrorMsg(""); }}>
                Try Again
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Monthly stats */}
      {!loading && (
        <div className="rounded-xl bg-card border border-border p-4 space-y-1 text-center">
          <p className="text-3xl font-extrabold text-foreground">{Math.round(stats.percentage)}%</p>
          <p className="text-xs text-muted-foreground">Monthly Attendance — {stats.present} of {stats.total} days</p>
        </div>
      )}

      {/* Calendar */}
      {!loading && (
        <div className="rounded-xl bg-card border border-border p-4 space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {new Date().toLocaleString("default", { month: "long", year: "numeric" })}
          </p>
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {["S","M","T","W","T","F","S"].map((d, i) => (
              <span key={i} className="text-[10px] font-bold text-muted-foreground">{d}</span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {calendarCells.map((cell, idx) => (
              <div
                key={idx}
                className={cn(
                  "h-8 w-full rounded-lg flex items-center justify-center text-xs font-medium",
                  !cell ? "bg-transparent" :
                  (cell as any).status === "present" ? "bg-status-approved/20 text-status-approved" :
                  (cell as any).status === "absent"  ? "bg-status-rejected/20 text-status-rejected" :
                  "bg-secondary/50 text-muted-foreground"
                )}
              >
                {(cell as any)?.day}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-4 pt-1">
            {[["bg-status-approved/20 border-status-approved/30","Present"],["bg-status-rejected/20 border-status-rejected/30","Absent"],["bg-secondary/50 border-border","Not Marked"]].map(([cls, label]) => (
              <div key={label} className="flex items-center gap-1.5">
                <div className={cn("h-3 w-3 rounded-full border", cls)} />
                <span className="text-[10px] text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentAttendance;
