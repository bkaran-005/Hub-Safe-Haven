import { useState } from "react";
import { useAuth, Role } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { GraduationCap, Shield, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const roles: { role: Role; label: string; icon: React.ElementType; color: string; bg: string }[] = [
  { role: "student", label: "Student", icon: GraduationCap, color: "text-resident", bg: "border-resident/50 bg-resident/10" },
  { role: "warden", label: "Warden", icon: Shield, color: "text-warden", bg: "border-warden/50 bg-warden/10" },
  { role: "parent", label: "Parent", icon: Users, color: "text-parent", bg: "border-parent/50 bg-parent/10" },
];

const Login = () => {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;
    login(selectedRole);
    navigate(`/${selectedRole}`);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground">HostelHub</h1>
          <p className="mt-1 text-sm text-muted-foreground">Girls' Hostel Management</p>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">Select your role</p>
          <div className="grid grid-cols-3 gap-3">
            {roles.map((r) => {
              const Icon = r.icon;
              const active = selectedRole === r.role;
              return (
                <button
                  key={r.role}
                  onClick={() => setSelectedRole(r.role)}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all",
                    active ? r.bg : "border-border bg-card hover:border-muted-foreground/30"
                  )}
                >
                  <Icon className={cn("h-7 w-7", active ? r.color : "text-muted-foreground")} />
                  <span className={cn("text-xs font-medium", active ? r.color : "text-muted-foreground")}>{r.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <Input type="email" placeholder="Email address" defaultValue="priya@hostel.edu" className="bg-secondary" />
          <Input type="password" placeholder="Password" defaultValue="password" className="bg-secondary" />
          <Button type="submit" className="w-full" disabled={!selectedRole}>
            Log In
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Login;
