import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useAuth } from "@/contexts/AuthContext";
import { watchTodayAttendance, markAttendance } from "@/services/attendanceService";
import { db, collection, getDocs, query, where } from "@/lib/firebase";
import { CalendarDays, CheckCircle2, XCircle, RefreshCw, Users, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

interface Student {
  uid: string;
  name: string;
  roomNo: string;
}

// Generate a daily code — changes every day, same for everyone on same day
const getDailyCode = (date: string) => {
  // Simple deterministic code based on date
  const base = date.replace(/-/g, "");
  return `ATTEND_${base}_HSH`;
};

const WardenAttendance = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const today = new Date().toISOString().split("T")[0];
  const dailyCode = getDailyCode(today);

  const [students, setStudents] = useState<Student[]>([]);
  const [presentIds, setPresentIds] = useState<Set<string>>(new Set());
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [windowOpen, setWindowOpen] = useState(true);
  const [tab, setTab] = useState<"qr" | "list">("qr");

  // Load all resident students
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const q = query(collection(db, "users"), where("role", "in", ["resident", "Resident"]));
        const snap = await getDocs(q);
        const list = snap.docs.map(d => ({
          uid: d.id,
          name: d.data().name ?? d.data().Name ?? "Unknown",
          roomNo: d.data().roomNo ?? d.data()["Room NO."] ?? "N/A",
        }));
        setStudents(list.sort((a, b) => a.roomNo.localeCompare(b.roomNo)));
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingStudents(false);
      }
    };
    fetchStudents();
  }, []);

  // Watch today's attendance live
  useEffect(() => {
    const unsubscribe = watchTodayAttendance(today, (records) => {
      const ids = new Set(records.filter(r => r.present).map(r => r.studentId));
      setPresentIds(ids);
    });
    return () => unsubscribe();
  }, [today]);

  const handleManualToggle = async (studentId: string, currentlyPresent: boolean) => {
    try {
      await markAttendance(studentId, today, !currentlyPresent, profile?.uid ?? "warden");
      toast({
        title: !currentlyPresent ? "Marked Present" : "Marked Absent",
        description: `Attendance updated.`,
      });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const presentCount = presentIds.size;
  const totalCount = students.length;

  return (
    <div className="pb-24 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Attendance</h1>
          <p className="text-xs text-muted-foreground">{new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}</p>
        </div>
        <div className={cn(
          "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
          windowOpen ? "bg-status-approved/20 text-status-approved" : "bg-secondary text-muted-foreground"
        )}>
          <Clock className="h-3 w-3" />
          {windowOpen ? "Window Open" : "Window Closed"}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-card border border-border p-3 text-center">
          <p className="text-2xl font-bold text-status-approved">{presentCount}</p>
          <p className="text-[10px] text-muted-foreground">Present</p>
        </div>
        <div className="rounded-xl bg-card border border-border p-3 text-center">
          <p className="text-2xl font-bold text-status-rejected">{totalCount - presentCount}</p>
          <p className="text-[10px] text-muted-foreground">Absent</p>
        </div>
        <div className="rounded-xl bg-card border border-border p-3 text-center">
          <p className="text-2xl font-bold text-foreground">{totalCount}</p>
          <p className="text-[10px] text-muted-foreground">Total</p>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-2 rounded-xl bg-secondary/40 p-1">
        {([["qr", "Show QR"], ["list", "Student List"]] as const).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={cn(
              "flex-1 rounded-lg py-2 text-xs font-semibold transition-all",
              tab === id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* QR Tab */}
      {tab === "qr" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="rounded-xl border border-border bg-card p-4 space-y-3 text-center">
            <p className="text-xs text-muted-foreground">
              Display this QR code for students to scan and mark themselves present.
            </p>

            <div className="flex justify-center">
              <div className={cn(
                "rounded-2xl bg-white p-6 border-4 transition-all",
                windowOpen ? "border-status-approved/50 shadow-lg shadow-status-approved/10" : "border-border opacity-50"
              )}>
                <QRCodeSVG
                  value={dailyCode}
                  size={200}
                  bgColor="white"
                  fgColor="#111111"
                  level="H"
                />
              </div>
            </div>

            <p className="text-[10px] font-mono text-muted-foreground/50">{dailyCode}</p>
            <p className="text-xs text-muted-foreground">Valid for: {today}</p>
          </div>

          <Button
            variant="outline"
            className={cn("w-full gap-2", windowOpen ? "border-status-rejected/30 text-status-rejected hover:bg-status-rejected/10" : "border-status-approved/30 text-status-approved hover:bg-status-approved/10")}
            onClick={() => setWindowOpen(w => !w)}
          >
            {windowOpen ? <XCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
            {windowOpen ? "Close Attendance Window" : "Reopen Attendance Window"}
          </Button>

          <div className="rounded-xl border border-border bg-card p-4 space-y-2">
            <p className="text-xs font-semibold text-foreground flex items-center gap-2">
              <Users className="h-4 w-4 text-warden" /> Recently Marked Present
            </p>
            {students.filter(s => presentIds.has(s.uid)).length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-3">No one has scanned yet</p>
            ) : (
              students.filter(s => presentIds.has(s.uid)).slice(0, 5).map(s => (
                <div key={s.uid} className="flex items-center justify-between">
                  <span className="text-sm text-foreground">{s.name}</span>
                  <span className="text-xs text-muted-foreground">Room {s.roomNo}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Student List Tab */}
      {tab === "list" && (
        <div className="space-y-2 animate-in fade-in duration-200">
          <p className="text-xs text-muted-foreground">Tap to manually override attendance for any student.</p>
          {loadingStudents ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : students.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">No students found.</div>
          ) : (
            students.map(s => {
              const isPresent = presentIds.has(s.uid);
              return (
                <div key={s.uid} className={cn(
                  "flex items-center justify-between rounded-xl border p-3 transition-colors",
                  isPresent ? "bg-status-approved/5 border-status-approved/20" : "bg-card border-border"
                )}>
                  <div>
                    <p className="text-sm font-medium text-foreground">{s.name}</p>
                    <p className="text-[10px] text-muted-foreground">Room {s.roomNo}</p>
                  </div>
                  <button
                    onClick={() => handleManualToggle(s.uid, isPresent)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all active:scale-95",
                      isPresent
                        ? "bg-status-approved/20 text-status-approved"
                        : "bg-secondary text-muted-foreground"
                    )}
                  >
                    {isPresent
                      ? <><CheckCircle2 className="h-3.5 w-3.5" /> Present</>
                      : <><XCircle className="h-3.5 w-3.5" /> Absent</>
                    }
                  </button>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default WardenAttendance;
