import { Clock, User, AlertCircle } from "lucide-react";
import { OutingRequest } from "@/services/outingService";
import { cn } from "@/lib/utils";

interface LateReturnLogProps {
  outings: OutingRequest[];
  limit?: number;
}

export const LateReturnLog = ({ outings, limit }: LateReturnLogProps) => {
  const displayList = limit ? outings.slice(0, limit) : outings;

  if (displayList.length === 0) {
    return (
      <div className="text-center py-6 border border-dashed border-border rounded-xl">
        <p className="text-xs text-muted-foreground">No late returns recorded.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {displayList.map((o) => (
        <div 
          key={o.id} 
          className="group relative overflow-hidden rounded-xl bg-card border border-border p-3 transition-all hover:border-orange-500/30 hover:shadow-md hover:shadow-orange-500/5"
        >
          {/* Accent glow for late returns */}
          <div className="absolute -left-1 top-0 bottom-0 w-1 bg-orange-500" />
          
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-bold text-foreground">
              <User className="h-4 w-4 text-orange-500" />
              <span>{o.studentName}</span>
              <span className="text-[10px] font-normal text-muted-foreground px-1.5 py-0.5 rounded-full bg-secondary">
                Room {o.roomNo}
              </span>
            </div>
            {o.minutesLate && (
              <span className="flex items-center gap-1 text-[10px] font-black uppercase text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded-full">
                <AlertCircle className="h-3 w-3" />
                {o.minutesLate} MIN LATE
              </span>
            )}
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span>
                Returned: <span className="font-medium text-foreground">
                  {o.returnTimestamp?.toDate?.()?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) ?? "—"}
                </span>
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="opacity-50">—</span>
              <span>
                Deadline was: <span className="font-medium text-foreground">{o.toDate} {o.toTime}</span>
              </span>
            </div>
          </div>
          
          {o.destination && (
            <div className="mt-2 text-[10px] text-muted-foreground flex items-center gap-1">
              <span className="uppercase font-bold tracking-wider">Destination:</span>
              <span className="italic">"{o.destination}"</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
