import { useAuth } from "@/contexts/AuthContext";
import { Role } from "@/services/authService";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, MapPin, MessageSquare, UtensilsCrossed, User, ScanLine, Megaphone, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs: Record<Role, { label: string; icon: React.ElementType; path: string }[]> = {
  resident: [
    { label: "Home", icon: Home, path: "/student" },
    { label: "Outings", icon: MapPin, path: "/student/outings" },
    { label: "Complaints", icon: MessageSquare, path: "/student/complaints" },
    { label: "Mess", icon: UtensilsCrossed, path: "/student/mess" },
    { label: "Profile", icon: User, path: "/student/profile" },
  ],
  warden: [
    { label: "Home", icon: Home, path: "/warden" },
    { label: "Outings", icon: MapPin, path: "/warden/outings" },
    { label: "Complaints", icon: MessageSquare, path: "/warden/complaints" },
    { label: "Gate Scan", icon: ScanLine, path: "/warden/gate-scan" },
    { label: "Mess", icon: UtensilsCrossed, path: "/warden/mess" },
    { label: "Announce", icon: Megaphone, path: "/warden/announcements" },
  ],
  parent: [
    { label: "Home", icon: Home, path: "/parent" },
    { label: "Outings", icon: MapPin, path: "/parent/outings" },
    { label: "Attendance", icon: CalendarDays, path: "/parent/attendance" },
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
      <div className="mx-auto flex max-w-lg items-center justify-around py-2">
        {items.map((tab) => {
          const isActive = location.pathname === tab.path || (tab.path !== `/${role}` && location.pathname.startsWith(tab.path));
          const Icon = tab.icon;
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1 text-xs transition-colors",
                isActive ? accentMap[role] : "text-muted-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
