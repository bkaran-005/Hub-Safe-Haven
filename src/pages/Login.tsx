import { useState, useRef, useEffect } from "react";
import { Role, loginUser } from "@/services/authService";
import { seedInitialConfig, registerUserProfile } from "@/services/setupService";
import { auth, createUserWithEmailAndPassword } from "@/lib/firebase";
import {
  GraduationCap, Shield, Users, Loader2, Database,
  UserPlus, LogIn, Eye, EyeOff, QrCode, Bell,
  ClipboardList, UtensilsCrossed, MapPin, ShieldAlert, Menu, X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/ThemeToggle";

const roles: { role: Role; label: string; icon: React.ElementType; color: string; bg: string; accent: string; desc: string }[] = [
  { role: "resident", label: "Resident", icon: GraduationCap, color: "text-resident", bg: "border-resident bg-resident/10", accent: "bg-resident", desc: "Hostel student" },
  { role: "warden",   label: "Warden",   icon: Shield,        color: "text-warden",   bg: "border-warden bg-warden/10",     accent: "bg-warden",   desc: "Hostel staff"  },
  { role: "parent",   label: "Parent",   icon: Users,         color: "text-parent",   bg: "border-parent bg-parent/10",     accent: "bg-parent",   desc: "Guardian"      },
];

const features = [
  { icon: MapPin,          label: "Outing Management",  desc: "Digital outing approvals with real-time tracking and status updates.",      color: "text-resident",        bg: "bg-resident/10"        },
  { icon: QrCode,          label: "QR Gate Pass",        desc: "Secure hostel entry & exit verification via unique QR codes.",              color: "text-warden",          bg: "bg-warden/10"          },
  { icon: ClipboardList,   label: "Complaint Handling",  desc: "Raise and track complaints with photo evidence and resolution timeline.",   color: "text-parent",          bg: "bg-parent/10"          },
  { icon: UtensilsCrossed, label: "Mess Management",     desc: "Meal schedules, opt-ins, ratings and monthly fee payments.",               color: "text-status-approved", bg: "bg-status-approved/10" },
  { icon: Bell,            label: "Announcements",       desc: "Instant broadcast messages from warden to all students.",                  color: "text-status-pending",  bg: "bg-status-pending/10"  },
  { icon: ShieldAlert,     label: "SOS Emergency",       desc: "One-tap emergency alert with live GPS location sharing.",                  color: "text-status-rejected", bg: "bg-status-rejected/10" },
];

const Login = () => {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [roomNo, setRoomNo] = useState("");
  const [studentUid, setStudentUid] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  const { toast } = useToast();
  const formRef = useRef<HTMLDivElement>(null);
  const [formVisible, setFormVisible] = useState(false);

  // Hide navbar buttons when the form section is visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setFormVisible(entry.isIntersecting),
      { threshold: 0.1 }
    );
    if (formRef.current) observer.observe(formRef.current);
    return () => observer.disconnect();
  }, []);

  const scrollToForm = (m: "login" | "register" = "login") => {
    setMode(m);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) {
      toast({ title: "Select a role", description: "Please choose your role before signing in.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      await loginUser(email, password);
    } catch (error: any) {
      toast({ title: "Login failed", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole || !name || !email || !password) {
      toast({ title: "Incomplete form", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const profileData: any = { name, email, role: selectedRole };
      if (selectedRole === "resident") profileData.roomNo = roomNo;
      if (selectedRole === "parent") profileData.studentUid = studentUid;
      await registerUserProfile(userCredential.user.uid, profileData);
      toast({ title: "Account created", description: "Welcome to Hub-Safe-Haven!" });
    } catch (error: any) {
      toast({ title: "Registration failed", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSeed = async () => {
    setIsSeeding(true);
    try {
      await seedInitialConfig();
      toast({ title: "Done", description: "Database initialized." });
    } catch (error: any) {
      toast({ title: "Seed failed", description: error.message, variant: "destructive" });
    } finally {
      setIsSeeding(false);
    }
  };

  const activeRole = roles.find(r => r.role === selectedRole);

  return (
    <div className="min-h-screen bg-background">

      {/* ── NAVBAR ── */}
      <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-resident to-warden">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-foreground tracking-tight">Hub-Safe-Haven</span>
          </div>
          <div className={cn("flex items-center gap-2 transition-all duration-300", formVisible ? "opacity-0 pointer-events-none" : "opacity-100")}>
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
              onClick={() => scrollToForm("register")}
            >
              Register
            </Button>
            <Button
              size="sm"
              className="bg-resident hover:bg-resident/90 text-white gap-1.5"
              onClick={() => scrollToForm("login")}
            >
              <LogIn className="h-3.5 w-3.5" /> Sign In
            </Button>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-resident/10 blur-3xl" />
        <div className="pointer-events-none absolute top-0 right-0 h-72 w-72 rounded-full bg-warden/8 blur-3xl" />

        <div className="relative mx-auto max-w-4xl px-5 pt-20 pb-16 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-resident via-primary to-warden shadow-xl shadow-primary/20">
            <img
              src="/logo.png"
              alt="Hub-Safe-Haven"
              className="h-12 w-12 object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
                (e.target as HTMLImageElement).nextElementSibling?.classList.remove("hidden");
              }}
            />
            <Shield className="hidden h-10 w-10 text-white" />
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            Hub-Safe-Haven
          </h1>
          <p className="mt-3 text-base text-muted-foreground font-medium">
            Smart Hostel Management & Student Safety System
          </p>
          <p className="mt-3 mx-auto max-w-md text-sm text-muted-foreground/70 leading-relaxed">
            A unified platform connecting students, wardens, and parents — making hostel life safer, smarter, and more transparent.
          </p>

        </div>
      </div>

      {/* ── FEATURES ── */}
      <div className="mx-auto max-w-4xl px-5 pb-20">
        <p className="mb-6 text-center text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          Everything you need
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.label}
                className="flex gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:bg-accent/30"
              >
                <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", f.bg)}>
                  <Icon className={cn("h-5 w-5", f.color)} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{f.label}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── LOGIN / REGISTER FORM ── */}
      <div ref={formRef} className="border-t border-border bg-card/50">
        <div className="mx-auto max-w-md px-5 py-12">
          <p className="mb-6 text-center text-lg font-bold text-foreground">
            {mode === "login" ? "Welcome back" : "Create your account"}
          </p>

          <div className="rounded-2xl border border-border bg-card shadow-lg overflow-hidden">
            {/* Tabs */}
            <div className="grid grid-cols-2 border-b border-border">
              {(["login", "register"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={cn(
                    "flex items-center justify-center gap-2 py-3.5 text-sm font-semibold transition-colors",
                    mode === m
                      ? "bg-background text-foreground border-b-2 border-primary"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {m === "login"
                    ? <><LogIn className="h-4 w-4" /> Sign In</>
                    : <><UserPlus className="h-4 w-4" /> New Account</>
                  }
                </button>
              ))}
            </div>

            <div className="p-5 space-y-5">
              {/* Role selector */}
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">I am a</p>
                <div className="grid grid-cols-3 gap-2">
                  {roles.map((r) => {
                    const Icon = r.icon;
                    const active = selectedRole === r.role;
                    return (
                      <button
                        key={r.role}
                        onClick={() => setSelectedRole(r.role)}
                        className={cn(
                          "flex flex-col items-center gap-1.5 rounded-xl border-2 py-3 px-2 transition-all duration-200 active:scale-95",
                          active ? r.bg : "border-border bg-secondary/30 hover:border-muted-foreground/30"
                        )}
                      >
                        <Icon className={cn("h-5 w-5", active ? r.color : "text-muted-foreground")} />
                        <span className={cn("text-[10px] font-bold uppercase tracking-wide leading-none", active ? r.color : "text-muted-foreground")}>
                          {r.label}
                        </span>
                        <span className="text-[9px] leading-none text-muted-foreground/50">{r.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Form */}
              <form onSubmit={mode === "register" ? handleRegister : handleLogin} className="space-y-3">
                {mode === "register" && (
                  <>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Full Name</Label>
                      <Input placeholder="Your full name" value={name} onChange={(e) => setName(e.target.value)} className="bg-secondary/50 h-11" />
                    </div>
                    {selectedRole === "resident" && (
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Room Number</Label>
                        <Input placeholder="e.g. 204" value={roomNo} onChange={(e) => setRoomNo(e.target.value)} className="bg-secondary/50 h-11" />
                      </div>
                    )}
                    {selectedRole === "parent" && (
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Student UID</Label>
                        <Input placeholder="Paste student's UID" value={studentUid} onChange={(e) => setStudentUid(e.target.value)} className="bg-secondary/50 h-11 font-mono" />
                        <p className="text-[10px] text-muted-foreground pl-0.5">Found in the student's Profile page</p>
                      </div>
                    )}
                  </>
                )}

                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Email</Label>
                  <Input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-secondary/50 h-11" />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Password</Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-secondary/50 h-11 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className={cn(
                    "w-full h-11 mt-1 font-semibold gap-2 transition-all",
                    activeRole ? `${activeRole.accent} hover:opacity-90 text-white border-0` : ""
                  )}
                  disabled={!selectedRole || isLoading}
                >
                  {isLoading
                    ? <Loader2 className="h-4 w-4 animate-spin" />
                    : mode === "register"
                      ? <UserPlus className="h-4 w-4" />
                      : <LogIn className="h-4 w-4" />
                  }
                  {mode === "register" ? "Create Account" : "Sign In"}
                </Button>
              </form>
            </div>
          </div>

          {/* Dev seed */}
          <div className="mt-6 text-center">
            <button
              onClick={handleSeed}
              disabled={isSeeding}
              className="inline-flex items-center gap-1 text-[10px] text-muted-foreground/25 hover:text-muted-foreground/50 transition-colors"
            >
              {isSeeding ? <Loader2 className="h-3 w-3 animate-spin" /> : <Database className="h-3 w-3" />}
              Initialize database
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
