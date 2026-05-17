import { useAuth } from "@/contexts/AuthContext";
import { Role } from "@/services/authService";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, MapPin, MessageSquare, UtensilsCrossed, User, ScanLine, Megaphone, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs: Record<Role, { label: string; icon: React.ElementType; path: string }[]> = {
  resident: [
    { label: "Home",       icon: Home,           path: "/student" },
    { label: "Outings",    icon: MapPin,          path: "/student/outings" },
    { label: "Complaints", icon: MessageSquare,   path: "/student/complaints" },
    { label: "Mess",       icon: UtensilsCrossed, path: "/student/mess" },
    { label: "Attendance", icon: CalendarDays,    path: "/student/attendance" },
    { label: "Profile",    icon: User,            path: "/student/profile" },
  ],
  warden: [
    { label: "Home",       icon: Home,           path: "/warden" },
    { label: "Outings",    icon: MapPin,          path: "/warden/outings" },
    { label: "Complaints", icon: MessageSquare,   path: "/warden/complaints" },
    { label: "Gate",       icon: ScanLine,        path: "/warden/gate-scan" },
    { label: "Attendance", icon: CalendarDays,    path: "/warden/attendance" },
    { label: "Mess",       icon: UtensilsCrossed, path: "/warden/mess" },
    { label: "Announce",   icon: Megaphone,       path: "/warden/announcements" },
  ],
  parent: [
    { label: "Home",       icon: Home,         path: "/parent" },
    { label: "Outings",    icon: MapPin,        path: "/parent/outings" },
    { label: "Attendance", icon: CalendarDays,  path: "/parent/attendance" },
  ],
};

const accentMap: Record<Role, string> = {
  resident: "text-resident",
  warden: "text-warden",
  parent: "text-parent",
};

export const BottomNav = () => {
  const { role } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!role) return null;
  const items = tabs[role];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-md safe-bottom">
      {role === "warden" ? (
        // Warden has 7 tabs — horizontally scrollable
        <div className="flex items-center overflow-x-auto no-scrollbar px-1 py-2 max-w-lg mx-auto">
          {items.map((tab) => {
            const homePath = items[0].path;
            const isActive = location.pathname === tab.path ||
              (tab.path !== homePath && location.pathname.startsWith(tab.path));
            const Icon = tab.icon;
            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-3 py-1 text-xs transition-colors shrink-0 min-w-[60px]",
                  isActive ? accentMap[role] : "text-muted-foreground hover:text-foreground"
                )}
                title={tab.label}
              >
                <Icon className={cn("h-5 w-5", isActive && "scale-110 transition-transform")} />
                <span className="text-[10px]">{tab.label}</span>
              </button>
            );
          })}
        </div>
      ) : (
        // Student (6 tabs) and Parent (3 tabs) — symmetric, equal width
        <div className="flex items-center py-2 max-w-lg mx-auto w-full">
          {items.map((tab) => {
            const homePath = items[0].path;
            const isActive = location.pathname === tab.path ||
              (tab.path !== homePath && location.pathname.startsWith(tab.path));
            const Icon = tab.icon;
            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className={cn(
                  "flex flex-1 flex-col items-center gap-0.5 py-1 text-xs transition-colors",
                  isActive ? accentMap[role] : "text-muted-foreground hover:text-foreground"
                )}
                title={tab.label}
              >
                <Icon className={cn("h-5 w-5", isActive && "scale-110 transition-transform")} />
                <span className="text-[10px]">{tab.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </nav>
  );
};
