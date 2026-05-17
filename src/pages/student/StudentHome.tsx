import { NotificationBell } from "@/components/NotificationBell";
import { StatusBadge } from "@/components/StatusBadge";
import { useNavigate } from "react-router-dom";
import { MapPin, MessageSquare, CreditCard, QrCode, TrendingUp, AlertCircle, Wallet, Loader2, LogOut, Info } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useOutings } from "@/hooks/useOutings";
import { useComplaints } from "@/hooks/useComplaints";
import { useAttendance } from "@/hooks/useAttendance";
import { useAnnouncements } from "@/hooks/useAnnouncements";
import { SOSButton } from "@/components/SOSButton";

import { ThemeToggle } from "@/components/ThemeToggle";

const StudentHome = () => {
  const { profile, logout } = useAuth();
  const navigate = useNavigate();
  
  const { outings, loading: loadingOutings } = useOutings(profile?.uid);
  const { complaints, loading: loadingComplaints } = useComplaints(profile?.uid);
  const { announcements, loading: loadingAnnouncements } = useAnnouncements();
  
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
  const { stats, loading: loadingAttendance } = useAttendance(profile?.uid, currentMonth);

  const pendingComplaintsCount = complaints.filter(c => c.status === "open" || c.status === "in_progress").length;

  const quickActions = [
    { label: "Request Outing", icon: MapPin, action: () => navigate("/student/outings") },
    { label: "Raise Complaint", icon: MessageSquare, action: () => navigate("/student/complaints") },
    { label: "Pay Mess Fee", icon: CreditCard, action: () => navigate("/student/mess") },
    { label: "My QR Code", icon: QrCode, action: () => navigate("/student/qr") },
  ];

  const isLoading = loadingOutings || loadingComplaints || loadingAttendance || loadingAnnouncements;

  // Show skeleton while loading instead of full-screen spinner
  if (isLoading) {
    return (
      <div className="space-y-6 pb-20 p-4 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-6 w-36 rounded-lg bg-secondary" />
            <div className="h-4 w-20 rounded-md bg-secondary" />
          </div>
          <div className="h-9 w-9 rounded-full bg-secondary" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[1,2,3].map(i => <div key={i} className="h-20 rounded-lg bg-secondary" />)}
        </div>
        <div className="grid grid-cols-4 gap-2">
          {[1,2,3,4].map(i => <div key={i} className="h-16 rounded-lg bg-secondary" />)}
        </div>
        <div className="h-12 rounded-lg bg-secondary" />
        <div className="space-y-2">
          {[1,2,3].map(i => <div key={i} className="h-14 rounded-lg bg-secondary" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Good day, {profile?.name?.split(" ")[0]}</h1>
          <span className="inline-flex items-center gap-1 rounded-md bg-resident/20 px-2 py-0.5 text-xs font-medium text-resident">
            Room {profile?.roomNo || "N/A"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <NotificationBell
            count={announcements.length}
            label="Announcements"
            storageKey="student_notif_seen"
            items={announcements.map(a => ({ id: a.id, title: a.title, body: a.body, type: "announcement" as const }))}
          />
          <ThemeToggle />
          <button
            onClick={() => logout()}
            className="p-2 rounded-full border border-border bg-card text-status-rejected transition-colors hover:bg-status-rejected/10"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg bg-card p-3 text-center border border-border">
          <TrendingUp className="mx-auto h-5 w-5 text-resident mb-1" />
          <p className="text-lg font-bold text-foreground">{Math.round(stats.percentage)}%</p>
          <p className="text-[10px] text-muted-foreground">Attendance</p>
        </div>
        <div className="rounded-lg bg-card p-3 text-center border border-border">
          <AlertCircle className="mx-auto h-5 w-5 text-status-pending mb-1" />
          <p className="text-lg font-bold text-foreground">{pendingComplaintsCount}</p>
          <p className="text-[10px] text-muted-foreground">Complaints</p>
        </div>
        <div className="rounded-lg bg-card p-3 text-center border border-border">
          <Wallet className="mx-auto h-5 w-5 text-status-approved mb-1" />
          <p className="text-lg font-bold text-foreground">₹0</p>
          <p className="text-[10px] text-muted-foreground">Mess Bal.</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {quickActions.map((a) => {
          const Icon = a.icon;
          return (
            <button key={a.label} onClick={a.action} className="flex flex-col items-center gap-1.5 rounded-lg bg-card border border-border p-3 text-center transition-colors hover:bg-accent">
              <Icon className="h-5 w-5 text-resident" />
              <span className="text-[10px] text-muted-foreground leading-tight">{a.label}</span>
            </button>
          );
        })}
      </div>

      <div className="pt-2">
        <SOSButton />
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-foreground">Recent Announcements</h2>
        <div className="space-y-2 mb-6">
          {announcements.slice(0, 3).map((a) => (
            <div key={a.id} className="flex items-start gap-3 rounded-lg bg-card border border-border p-3">
              <Info className="h-4 w-4 text-resident mt-0.5" />
              <div>
                <p className="text-sm text-foreground font-medium">{a.title}</p>
                <p className="text-xs text-muted-foreground line-clamp-2">{a.body}</p>
              </div>
            </div>
          ))}
          {announcements.length === 0 && (
            <p className="text-xs text-center text-muted-foreground py-4">No recent announcements</p>
          )}
        </div>

        <h2 className="mb-3 text-sm font-semibold text-foreground">Recent Activity</h2>
        <div className="space-y-2">
          {[...outings, ...complaints]
            .sort((a, b) => {
              const timeA = a.createdAt?.toMillis?.() || 0;
              const timeB = b.createdAt?.toMillis?.() || 0;
              return timeB - timeA;
            })
            .slice(0, 5)
            .map((item) => {
              const isOuting = 'destination' in item;
              return (
                <div key={item.id} className="flex items-center justify-between rounded-lg bg-card border border-border p-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-foreground">
                      {isOuting ? `Outing to ${item.destination}` : `Complaint: ${item.description}`}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {item.createdAt?.toDate?.().toLocaleDateString() || "Just now"}
                    </p>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
              );
            })}
          {outings.length === 0 && complaints.length === 0 && (
            <p className="text-xs text-center text-muted-foreground py-4">No recent activity</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentHome;
