import { NotificationBell } from "@/components/NotificationBell";
import { StatusBadge } from "@/components/StatusBadge";
import { studentData, outings, complaints } from "@/data/dummyData";
import { useNavigate } from "react-router-dom";
import { MapPin, MessageSquare, CreditCard, QrCode, TrendingUp, AlertCircle, Wallet } from "lucide-react";

const StudentHome = () => {
  const navigate = useNavigate();
  const recentActivity = [
    ...outings.filter(o => o.student === "Priya Sharma").slice(0, 2).map(o => ({ id: o.id, type: "outing" as const, text: `Outing to ${o.destination}`, status: o.status, time: o.from })),
    ...complaints.filter(c => c.student === "Priya Sharma").slice(0, 1).map(c => ({ id: c.id, type: "complaint" as const, text: c.description.slice(0, 40) + "...", status: c.status, time: c.createdAt })),
  ];

  const quickActions = [
    { label: "Request Outing", icon: MapPin, action: () => navigate("/student/outings") },
    { label: "Raise Complaint", icon: MessageSquare, action: () => navigate("/student/complaints") },
    { label: "Pay Mess Fee", icon: CreditCard, action: () => navigate("/student/mess") },
    { label: "My QR Code", icon: QrCode, action: () => navigate("/student/qr") },
  ];

  return (
    <div className="space-y-6 pb-20 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Good morning, {studentData.name.split(" ")[0]}</h1>
          <span className="inline-flex items-center gap-1 rounded-md bg-resident/20 px-2 py-0.5 text-xs font-medium text-resident">
            Room {studentData.room}
          </span>
        </div>
        <NotificationBell count={3} />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg bg-card p-3 text-center border border-border">
          <TrendingUp className="mx-auto h-5 w-5 text-resident mb-1" />
          <p className="text-lg font-bold text-foreground">{studentData.attendance}%</p>
          <p className="text-[10px] text-muted-foreground">Attendance</p>
        </div>
        <div className="rounded-lg bg-card p-3 text-center border border-border">
          <AlertCircle className="mx-auto h-5 w-5 text-status-pending mb-1" />
          <p className="text-lg font-bold text-foreground">{studentData.pendingComplaints}</p>
          <p className="text-[10px] text-muted-foreground">Complaints</p>
        </div>
        <div className="rounded-lg bg-card p-3 text-center border border-border">
          <Wallet className="mx-auto h-5 w-5 text-status-approved mb-1" />
          <p className="text-lg font-bold text-foreground">₹{studentData.messBalance}</p>
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

      <div>
        <h2 className="mb-3 text-sm font-semibold text-foreground">Recent Activity</h2>
        <div className="space-y-2">
          {recentActivity.map((a) => (
            <div key={a.id + a.type} className="flex items-center justify-between rounded-lg bg-card border border-border p-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-foreground">{a.text}</p>
                <p className="text-xs text-muted-foreground">{new Date(a.time).toLocaleDateString()}</p>
              </div>
              <StatusBadge status={a.status} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentHome;
