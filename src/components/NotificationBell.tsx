import { Bell } from "lucide-react";

export const NotificationBell = ({ count = 3 }: { count?: number }) => (
  <button className="relative p-2">
    <Bell className="h-5 w-5 text-muted-foreground" />
    {count > 0 && (
      <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-status-rejected text-[10px] font-bold text-foreground">
        {count}
      </span>
    )}
  </button>
);
