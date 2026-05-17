import { useAuth } from "@/contexts/AuthContext";
import { useStudentForParent } from "@/hooks/useStudentForParent";
import { useAttendance } from "@/hooks/useAttendance";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const ParentAttendance = () => {
  const { profile } = useAuth();
  const currentMonth = new Date().toISOString().slice(0, 7);
  const { student, loading: loadingStudent } = useStudentForParent(profile?.uid);
  const { attendance, stats, loading: loadingAttendance } = useAttendance(student?.uid, currentMonth);

  if (loadingStudent || loadingAttendance) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Prep calendar (simplified for current month)
  const firstOfMonth = new Date(`${currentMonth}-01`);
  const startOffset = firstOfMonth.getDay();
  const daysInMonth = new Date(firstOfMonth.getFullYear(), firstOfMonth.getMonth() + 1, 0).getDate();
  
  const calendarCells = [];
  for (let i = 0; i < startOffset; i++) calendarCells.push(null);
  for (let i = 1; i <= daysInMonth; i++) {
    const dateStr = `${currentMonth}-${i.toString().padStart(2, '0')}`;
    const record = attendance.find(r => r.date === dateStr);
    calendarCells.push({ day: i, status: record ? (record.present ? 'present' : 'absent') : 'none' });
  }

  return (
    <div className="space-y-6 pb-20 p-4">
      <h1 className="text-xl font-bold text-foreground">Attendance</h1>

      <div className="rounded-xl bg-card border border-border p-6 text-center animate-in zoom-in-95">
        <p className="text-4xl font-bold text-foreground">{Math.round(stats.percentage)}%</p>
        <p className="text-sm text-muted-foreground mt-1">Monthly Attendance</p>
        <p className="text-xs text-muted-foreground">{stats.present} of {stats.total} days logged</p>
      </div>

      <div className="rounded-xl bg-card border border-border p-4">
        <div className="grid grid-cols-7 gap-1 text-center mb-4">
          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
            <span key={i} className="text-[10px] uppercase font-bold text-muted-foreground">{d}</span>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-2">
          {calendarCells.map((cell, idx) => (
            <div
              key={idx}
              className={cn(
                "h-8 w-full rounded-lg flex items-center justify-center text-xs font-medium transition-colors",
                !cell ? "bg-transparent" :
                cell.status === "present" ? "bg-status-approved/20 text-status-approved" : 
                cell.status === "absent" ? "bg-status-rejected/20 text-status-rejected" :
                "bg-secondary/50 text-muted-foreground"
              )}
            >
              {cell?.day}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-4 mt-6 justify-center">
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full bg-status-approved/20 border border-status-approved/30" />
            <span className="text-[10px] text-muted-foreground">Present</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full bg-status-rejected/20 border border-status-rejected/30" />
            <span className="text-[10px] text-muted-foreground">Absent</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full bg-secondary/50 border border-border" />
            <span className="text-[10px] text-muted-foreground">Not Marked</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParentAttendance;
