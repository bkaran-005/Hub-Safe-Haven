import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Role, loginUser } from "@/services/authService";
import { seedInitialConfig, registerUserProfile } from "@/services/setupService";
import { auth as firebaseAuth } from "@/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { GraduationCap, Shield, Users, Loader2, Database, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";

const roles: { role: Role; label: string; icon: React.ElementType; color: string; bg: string }[] = [
  { role: "resident", label: "Resident", icon: GraduationCap, color: "text-resident", bg: "border-resident/50 bg-resident/10" },
  { role: "warden", label: "Warden", icon: Shield, color: "text-warden", bg: "border-warden/50 bg-warden/10" },
  { role: "parent", label: "Parent", icon: Users, color: "text-parent", bg: "border-parent/50 bg-parent/10" },
];

const Login = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [roomNo, setRoomNo] = useState("");
  const [studentUid, setStudentUid] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) {
      toast({ title: "Role Required", description: "Please select your role.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      await loginUser(email, password);
    } catch (error: any) {
      toast({ title: "Login Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole || !name || !email || !password) {
      toast({ title: "Incomplete", description: "Please fill all fields.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
      const profileData: any = {
        name,
        email,
        role: selectedRole,
      };
      if (selectedRole === "resident") {
        profileData.roomNo = roomNo;
      } else if (selectedRole === "parent") {
        profileData.studentUid = studentUid;
      }
      
      await registerUserProfile(userCredential.user.uid, profileData);
      toast({ title: "Account Created", description: "You have been registered and logged in." });
    } catch (error: any) {
      toast({ title: "Registration Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSeed = async () => {
    setIsSeeding(true);
    try {
      await seedInitialConfig();
      toast({ title: "Success", description: "Database initialized with default settings." });
    } catch (error: any) {
      toast({ title: "Seed Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm space-y-8 animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground tracking-tight">HostelHub</h1>
          <p className="mt-1 text-sm text-muted-foreground italic">Girls' Hostel Management</p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">Select your role</p>
            <button 
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-xs font-semibold text-resident hover:underline"
            >
              {isRegistering ? "Existing user? Log in" : "New? Create profile"}
            </button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {roles.map((r) => {
              const Icon = r.icon;
              const active = selectedRole === r.role;
              return (
                <button
                  key={r.role}
                  onClick={() => setSelectedRole(r.role)}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all active:scale-95",
                    active ? r.bg : "border-border bg-card hover:border-muted-foreground/30"
                  )}
                >
                  <Icon className={cn("h-7 w-7", active ? r.color : "text-muted-foreground")} />
                  <span className={cn("text-[10px] uppercase font-bold", active ? r.color : "text-muted-foreground")}>{r.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-4">
          {isRegistering && (
            <>
              <div className="space-y-1">
                <Label className="text-xs">Full Name</Label>
                <Input placeholder="Your Name" value={name} onChange={(e) => setName(e.target.value)} className="bg-secondary" />
              </div>
              {selectedRole === "resident" && (
                <div className="space-y-1">
                  <Label className="text-xs">Room Number</Label>
                  <Input placeholder="e.g. 204" value={roomNo} onChange={(e) => setRoomNo(e.target.value)} className="bg-secondary" />
                </div>
              )}
              {selectedRole === "parent" && (
                <div className="space-y-1">
                  <Label className="text-xs">Student ID (UID)</Label>
                  <Input 
                    placeholder="Paste Student UID here" 
                    value={studentUid} 
                    onChange={(e) => setStudentUid(e.target.value)} 
                    className="bg-secondary" 
                  />
                  <p className="text-[10px] text-muted-foreground px-1">Found in the Student's Profile page</p>
                </div>
              )}
            </>
          )}
          <div className="space-y-1">
            <Label className="text-xs">Email Address</Label>
            <Input type="email" placeholder="email@hostel.edu" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-secondary" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Password</Label>
            <Input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="bg-secondary" />
          </div>
          
          <Button type="submit" className="w-full h-11" disabled={!selectedRole || isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (isRegistering ? <UserPlus className="mr-2 h-4 w-4" /> : null)}
            {isRegistering ? "Register Account" : "Log In"}
          </Button>
        </form>

        <div className="pt-8 border-t border-border/50 text-center">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-[10px] text-muted-foreground hover:text-foreground h-auto p-1"
            onClick={handleSeed}
            disabled={isSeeding}
          >
            {isSeeding ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Database className="h-3 w-3 mr-1" />}
            DEV: INITIALIZE DATABASE SETTINGS
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Login;
