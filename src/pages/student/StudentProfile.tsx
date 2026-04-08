import { useAuth } from "@/contexts/AuthContext";
import { User, Mail, Phone, Home, LogOut, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

const StudentProfile = () => {
  const { profile, logout } = useAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    await logout();
    // Redirect is handled by AppRoutes
  };

  const info = [
    { icon: Mail, label: "Email", value: profile?.email },
    { icon: Phone, label: "Phone", value: profile?.phone || "Not provided" },
    { icon: Home, label: "Room", value: `Room ${profile?.roomNo || "N/A"}` },
    { icon: ShieldCheck, label: "Parent Phone", value: profile?.parentPhone || "Not provided" },
  ];

  return (
    <div className="space-y-6 pb-20 p-4">
      <h1 className="text-xl font-bold text-foreground">Profile</h1>

      <div className="flex flex-col items-center gap-3">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-resident/20">
          <User className="h-10 w-10 text-resident" />
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold text-foreground">{profile?.name}</p>
          <p className="text-sm text-muted-foreground capitalize">{profile?.role}</p>
        </div>
      </div>

      <div className="rounded-lg bg-card border border-border divide-y divide-border">
        {info.map((i) => {
          const Icon = i.icon;
          return (
            <div key={i.label} className="flex items-center gap-3 p-4">
              <Icon className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-[10px] uppercase font-bold text-muted-foreground">{i.label}</p>
                <p className="text-sm text-foreground">{i.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-lg bg-resident/5 border border-resident/20 p-4 space-y-2">
        <p className="text-xs font-semibold text-resident uppercase">Share your ID with Parents</p>
        <div className="flex items-center justify-between gap-2 rounded-md bg-background border border-border p-2">
          <code className="text-[10px] text-muted-foreground truncate">{profile?.uid}</code>
          <button 
            onClick={() => {
              navigator.clipboard.writeText(profile?.uid || "");
              toast({ title: "Copied!", description: "Share this ID with your parents." });
            }}
            className="text-[10px] font-bold text-resident hover:underline whitespace-nowrap"
          >
            COPY ID
          </button>
        </div>
        <p className="text-[9px] text-muted-foreground italic">Parents need this ID to link their account to yours.</p>
      </div>

      <Button variant="destructive" className="w-full gap-2" onClick={handleLogout}>
        <LogOut className="h-4 w-4" /> Log Out
      </Button>
    </div>
  );
};

export default StudentProfile;
