import { useState, useRef, useEffect } from "react";
import { Bell, X, Info, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface NotificationItem {
  id?: string;
  title: string;
  body?: string;
  type?: "announcement" | "outing";
}

interface NotificationBellProps {
  count?: number;
  items?: NotificationItem[];
  label?: string;
  storageKey?: string; // unique key per role/page
}

export const NotificationBell = ({
  count = 0,
  items = [],
  label = "Notifications",
  storageKey = "notif_seen_count",
}: NotificationBellProps) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Read last seen count from localStorage
  const getSeenCount = () => parseInt(localStorage.getItem(storageKey) ?? "0", 10);
  const [seenCount, setSeenCount] = useState(getSeenCount);

  // When count changes (new items arrive), re-read from storage
  useEffect(() => {
    setSeenCount(getSeenCount());
  }, [count, storageKey]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleOpen = () => {
    setOpen((o) => !o);
    // Persist that user has seen up to current count
    localStorage.setItem(storageKey, String(count));
    setSeenCount(count);
  };

  const unread = count > seenCount;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleOpen}
        className="relative p-2 rounded-full hover:bg-accent transition-colors"
        aria-label="Notifications"
      >
        <Bell className={cn("h-5 w-5", unread ? "text-foreground" : "text-muted-foreground")} />
        {unread && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-status-rejected text-[10px] font-bold text-white">
            {(count - seenCount) > 9 ? "9+" : count - seenCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 z-50 w-72 rounded-xl border border-border bg-card shadow-xl animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <p className="text-sm font-semibold text-foreground">{label}</p>
            <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="max-h-72 overflow-y-auto divide-y divide-border">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 gap-2 text-muted-foreground">
                <Bell className="h-6 w-6 opacity-30" />
                <p className="text-xs">No notifications</p>
              </div>
            ) : (
              items.map((item, i) => (
                <div key={item.id ?? i} className="flex items-start gap-3 px-4 py-3 hover:bg-accent/50 transition-colors">
                  <div className="mt-0.5 shrink-0">
                    {item.type === "outing"
                      ? <MapPin className="h-4 w-4 text-status-pending" />
                      : <Info className="h-4 w-4 text-resident" />
                    }
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground leading-tight">{item.title}</p>
                    {item.body && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{item.body}</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
