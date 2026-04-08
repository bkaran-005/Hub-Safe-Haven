import { outings } from "@/data/dummyData";
import { MapPin, Clock, AlertTriangle } from "lucide-react";

const ParentOutings = () => {
  const studentOutings = outings.filter((o) => o.student === "Priya Sharma" && o.status === "approved");

  return (
    <div className="space-y-4 pb-20 p-4">
      <h1 className="text-xl font-bold text-foreground">Outings Timeline</h1>

      <div className="relative border-l-2 border-border ml-4 space-y-6 pl-6">
        {studentOutings.map((o) => {
          const isLate = o.returnTime && new Date(o.returnTime) > new Date(o.returnBy);
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
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" /> Exit: {o.exitTime ? new Date(o.exitTime).toLocaleTimeString() : "—"}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" /> Return: {o.returnTime ? new Date(o.returnTime).toLocaleTimeString() : "Pending"}
                  </div>
                </div>
                {isLate && <p className="text-xs text-status-rejected font-medium">Late return</p>}
                <p className="text-xs text-muted-foreground">{new Date(o.from).toLocaleDateString()}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ParentOutings;
