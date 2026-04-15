import { useOverdueOutings } from "@/hooks/useOverdueOutings";
import { AlertTriangle, Phone, MapPin, Clock, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export const OverdueAlert = () => {
  const { overdueOutings } = useOverdueOutings();
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const visible = overdueOutings.filter((o) => !dismissed.has(o.id!));

  if (visible.length === 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] max-h-[60vh] overflow-y-auto">
      {visible.map((o) => (
        <div
          key={o.id}
          className="mx-auto max-w-lg border-b border-orange-500/30 bg-orange-950/95 backdrop-blur-md px-4 py-3 animate-in slide-in-from-top-2"
        >
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-500/20">
              <AlertTriangle className="h-5 w-5 text-orange-400 animate-pulse" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-orange-300">
                  ⚠ Student Overdue — {o.minutesOverdue} min late
                </p>
              </div>

              <p className="mt-0.5 text-base font-bold text-white leading-tight">
                {o.studentName}
                <span className="ml-2 text-xs font-normal text-orange-300/80">
                  Room {o.roomNo}
                </span>
              </p>

              <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="flex items-center gap-1 text-xs text-orange-200/70">
                  <MapPin className="h-3 w-3" />
                  {o.destination}
                </span>
                <span className="flex items-center gap-1 text-xs text-orange-200/70">
                  <Clock className="h-3 w-3" />
                  Was due by {o.toDate} {o.toTime}
                </span>
              </div>

              {/* Phone call action */}
              {o.phone && (
                <a
                  href={`tel:${o.phone}`}
                  className={cn(
                    "mt-2 inline-flex items-center gap-1.5 rounded-full bg-orange-500 px-3 py-1 text-xs font-bold text-white",
                    "hover:bg-orange-400 transition-colors active:scale-95"
                  )}
                >
                  <Phone className="h-3 w-3" />
                  Call Student
                </a>
              )}
            </div>

            {/* Dismiss */}
            <button
              onClick={() => setDismissed((prev) => new Set([...prev, o.id!]))}
              className="mt-0.5 shrink-0 rounded-full p-1 text-orange-400 hover:bg-orange-500/20 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
