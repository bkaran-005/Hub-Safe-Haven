import { attendanceData } from "@/data/dummyData";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ParentAttendance = () => {
  const dates = Object.entries(attendanceData).sort(([a], [b]) => a.localeCompare(b));
  const totalDays = dates.length;
  const presentDays = dates.filter(([, s]) => s === "present").length;
  const percentage = Math.round((presentDays / totalDays) * 100);

  const weeks: (typeof dates)[] = [];
  let currentWeek: typeof dates = [];
  const firstDay = new Date(dates[0][0]).getDay();
  for (let i = 0; i < firstDay; i++) currentWeek.push(["", "present"]);
  dates.forEach(([date, status]) => {
    currentWeek.push([date, status]);
    if (new Date(date).getDay() === 6) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });
  if (currentWeek.length) weeks.push(currentWeek);

  return (
    <div className="space-y-6 pb-20 p-4">
      <h1 className="text-xl font-bold text-foreground">Attendance</h1>

      <div className="rounded-lg bg-card border border-border p-6 text-center">
        <p className="text-4xl font-bold text-foreground">{percentage}%</p>
        <p className="text-sm text-muted-foreground mt-1">Monthly Attendance</p>
        <p className="text-xs text-muted-foreground">{presentDays} of {totalDays} days present</p>
      </div>

      <div className="rounded-lg bg-card border border-border p-4">
        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
            <span key={i} className="text-[10px] text-muted-foreground">{d}</span>
          ))}
        </div>
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 gap-1 mb-1">
            {week.map(([date, status], di) => (
              <div
                key={di}
                className={cn(
                  "h-7 w-full rounded-sm flex items-center justify-center text-[10px]",
                  !date ? "bg-transparent" :
                  status === "present" ? "bg-status-approved/30 text-status-approved" : "bg-status-rejected/30 text-status-rejected"
                )}
              >
                {date ? new Date(date).getDate() : ""}
              </div>
            ))}
            {Array.from({ length: 7 - week.length }).map((_, i) => (
              <div key={`empty-${i}`} className="h-7" />
            ))}
          </div>
        ))}
        <div className="flex items-center gap-4 mt-3 justify-center">
          <div className="flex items-center gap-1"><div className="h-3 w-3 rounded-sm bg-status-approved/30" /><span className="text-[10px] text-muted-foreground">Present</span></div>
          <div className="flex items-center gap-1"><div className="h-3 w-3 rounded-sm bg-status-rejected/30" /><span className="text-[10px] text-muted-foreground">Absent</span></div>
        </div>
      </div>

      <Button variant="outline" className="w-full gap-2">
        <Download className="h-4 w-4" /> Export Report
      </Button>
    </div>
  );
};

export default ParentAttendance;
