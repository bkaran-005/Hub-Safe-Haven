import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useAuth } from "@/contexts/AuthContext";
import { useOutings } from "@/hooks/useOutings";
import { useNavigate } from "react-router-dom";
import {
  MapPin, Clock, Loader2, AlertCircle,
  CheckCircle2, LogOut, LogIn, QrCode,
  Plus, XCircle, HourglassIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const STATUS_CONFIG: Record<string, {
  label: string;
  color: string;
  bg: string;
  border: string;
  icon: React.ElementType;
  showQR: boolean;
}> = {
  pending: {
    label: "Pending Approval",
    color: "text-status-pending",
    bg: "bg-status-pending/10",
    border: "border-status-pending/30",
    icon: HourglassIcon,
    showQR: false,
  },
  approved: {
    label: "Approved — Show QR at Gate",
    color: "text-status-approved",
    bg: "bg-status-approved/10",
    border: "border-status-approved/40",
    icon: CheckCircle2,
    showQR: true,
  },
  rejected: {
    label: "Request Rejected",
    color: "text-status-rejected",
    bg: "bg-status-rejected/10",
    border: "border-status-rejected/30",
    icon: XCircle,
    showQR: false,
  },
  exited: {
    label: "You are Outside",
    color: "text-warden",
    bg: "bg-warden/10",
    border: "border-warden/30",
    icon: LogOut,
    showQR: true,
  },
  returned: {
    label: "Returned Safely",
    color: "text-resident",
    bg: "bg-resident/10",
    border: "border-resident/30",
    icon: LogIn,
    showQR: false,
  },
  returned_late: {
    label: "Returned Late",
    color: "text-orange-500",
    bg: "bg-orange-500/10",
    border: "border-orange-500/30",
    icon: AlertCircle,
    showQR: false,
  },
};

const StudentQR = () => {
  const { profile } = useAuth();
  const { outings, loading } = useOutings(profile?.uid);
  const navigate = useNavigate();
  const [selectedIdx, setSelectedIdx] = useState(0);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show all outings sorted newest first
  const allOutings = [...outings].sort((a, b) => {
    const tA = a.createdAt?.toMillis?.() ?? 0;
    const tB = b.createdAt?.toMillis?.() ?? 0;
    return tB - tA;
  });

  if (allOutings.length === 0) {
    return (
      <div className="flex min-h-[calc(100vh-5rem)] flex-col items-center justify-center gap-4 p-4 pb-24 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
          <QrCode className="h-8 w-8 text-muted-foreground/40" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">No outing requests yet</p>
          <p className="text-xs text-muted-foreground mt-1 max-w-[220px]">
            Submit an outing request first. Once approved, your gate pass QR will appear here.
          </p>
        </div>
        <Button
          onClick={() => navigate("/student/outings")}
          className="gap-2 bg-resident hover:bg-resident/90 text-white"
        >
          <Plus className="h-4 w-4" /> Request Outing
        </Button>
      </div>
    );
  }

  const currentOuting = allOutings[selectedIdx];
  const cfg = STATUS_CONFIG[currentOuting?.status] ?? STATUS_CONFIG.pending;
  const StatusIcon = cfg.icon;

  return (
    <div className="pb-24 p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <QrCode className="h-5 w-5 text-resident" />
        <h1 className="text-xl font-bold text-foreground">Gate Pass</h1>
      </div>

      {/* Outing selector tabs if multiple */}
      {allOutings.length > 1 && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {allOutings.map((o, i) => {
            const c = STATUS_CONFIG[o.status] ?? STATUS_CONFIG.pending;
            return (
              <button
                key={o.id}
                onClick={() => setSelectedIdx(i)}
                className={cn(
                  "shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold border transition-all",
                  selectedIdx === i
                    ? `${c.bg} ${c.color} ${c.border}`
                    : "bg-secondary text-muted-foreground border-border"
                )}
              >
                {o.destination} · {o.fromDate}
              </button>
            );
          })}
        </div>
      )}

      {/* Status banner */}
      <div className={cn(
        "flex items-center gap-3 rounded-xl border-2 p-3",
        cfg.bg, cfg.border
      )}>
        <StatusIcon className={cn("h-5 w-5 shrink-0", cfg.color)} />
        <p className={cn("text-sm font-semibold", cfg.color)}>{cfg.label}</p>
      </div>

      {/* QR Code — only shown for approved/exited */}
      {cfg.showQR ? (
        <div className="flex flex-col items-center gap-3">
          <div className={cn(
            "rounded-3xl bg-white p-8 shadow-xl border-4 transition-all duration-300",
            currentOuting.status === "approved"
              ? "border-status-approved/60 shadow-status-approved/20"
              : "border-warden/40 shadow-warden/10"
          )}>
            <QRCodeSVG
              value={currentOuting.id!}
              size={200}
              bgColor="white"
              fgColor="#111111"
              level="H"
            />
          </div>
          <p className="text-xs text-muted-foreground text-center">
            Show this QR to the warden at the gate
          </p>
          <p className="text-[9px] font-mono text-muted-foreground/30 break-all text-center max-w-xs">
            {currentOuting.id}
          </p>
        </div>
      ) : currentOuting.status === "pending" ? (
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-status-pending/10 border-2 border-status-pending/20">
            <HourglassIcon className="h-8 w-8 text-status-pending animate-pulse" />
          </div>
          <p className="text-sm text-muted-foreground max-w-[220px]">
            Waiting for warden approval. Your QR will appear here once approved.
          </p>
        </div>
      ) : currentOuting.status === "rejected" ? (
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-status-rejected/10 border-2 border-status-rejected/20">
            <XCircle className="h-8 w-8 text-status-rejected" />
          </div>
          <p className="text-sm text-muted-foreground max-w-[220px]">
            This request was rejected by the warden.
          </p>
          {currentOuting.wardenNote && (
            <div className="rounded-xl bg-status-rejected/5 border border-status-rejected/20 px-4 py-3 max-w-xs">
              <p className="text-xs text-muted-foreground italic">"{currentOuting.wardenNote}"</p>
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/student/outings")}
            className="gap-2 mt-1"
          >
            <Plus className="h-3.5 w-3.5" /> Submit New Request
          </Button>
        </div>
      ) : (
        /* returned / returned_late */
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <div className={cn(
            "flex h-20 w-20 items-center justify-center rounded-full border-2",
            cfg.bg, cfg.border
          )}>
            <StatusIcon className={cn("h-8 w-8", cfg.color)} />
          </div>
          <p className="text-sm text-muted-foreground">This outing has been completed.</p>
        </div>
      )}

      {/* Trip details card */}
      <div className="rounded-2xl bg-card border border-border p-4 space-y-3">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-resident shrink-0" />
          <span className="text-sm font-semibold text-foreground">{currentOuting.destination}</span>
        </div>
        <p className="text-xs text-muted-foreground">{currentOuting.reason}</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-3 w-3 shrink-0" />
          <span>{currentOuting.fromDate} {currentOuting.fromTime} — {currentOuting.toDate} {currentOuting.toTime}</span>
        </div>

        {(currentOuting.exitTimestamp || currentOuting.returnTimestamp) && (
          <div className="border-t border-border pt-3 space-y-1.5">
            {currentOuting.exitTimestamp && (
              <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                <LogOut className="h-3 w-3 text-warden" />
                Exited: {currentOuting.exitTimestamp?.toDate?.()?.toLocaleString?.() ?? "recorded"}
              </p>
            )}
            {currentOuting.returnTimestamp && (
              <p className="text-[11px] text-resident flex items-center gap-1.5">
                <LogIn className="h-3 w-3" />
                Returned: {currentOuting.returnTimestamp?.toDate?.()?.toLocaleString?.() ?? "recorded"}
              </p>
            )}
            {currentOuting.minutesLate && (
              <p className="text-[11px] text-orange-500 font-semibold">
                ⚠ Returned {currentOuting.minutesLate} min late
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentQR;
