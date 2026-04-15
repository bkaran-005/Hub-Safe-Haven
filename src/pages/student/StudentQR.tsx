import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useAuth } from "@/contexts/AuthContext";
import { useOutings } from "@/hooks/useOutings";
import {
  MapPin, Clock, Loader2, AlertCircle,
  CheckCircle2, LogOut, LogIn, QrCode,
  ChevronLeft, ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const STATUS_CONFIG = {
  pending:  { label: "Pending Approval",    color: "text-status-pending",  bg: "bg-status-pending/10",  icon: Clock        },
  approved: { label: "Approved — Show QR",  color: "text-status-approved", bg: "bg-status-approved/10", icon: CheckCircle2 },
  rejected: { label: "Rejected",            color: "text-status-rejected", bg: "bg-status-rejected/10", icon: AlertCircle  },
  exited:   { label: "You are Outside",     color: "text-warden",          bg: "bg-warden/10",          icon: LogOut       },
  returned: { label: "Returned Safely",     color: "text-resident",        bg: "bg-resident/10",        icon: LogIn        },
};

const StudentQR = () => {
  const { profile } = useAuth();
  const { outings, loading } = useOutings(profile?.uid);
  const [selectedIdx, setSelectedIdx] = useState(0);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Active outings — each gets its own unique QR
  const activeOutings = outings.filter(
    (o) => o.status === "approved" || o.status === "exited"
  );

  const currentOuting = activeOutings[selectedIdx] ?? null;
  const cfg = currentOuting ? STATUS_CONFIG[currentOuting.status] : null;
  const StatusIcon = cfg?.icon;

  return (
    <div className="flex min-h-[calc(100vh-5rem)] flex-col items-center justify-center space-y-5 p-4 pb-24">

      {/* Header */}
      <div className="text-center space-y-1">
        <div className="flex items-center justify-center gap-2">
          <QrCode className="h-5 w-5 text-resident" />
          <h1 className="text-xl font-bold text-foreground">Gate Pass</h1>
        </div>
        <p className="text-xs text-muted-foreground">Show this QR code to the Warden at the gate</p>
      </div>

      {/* QR Card */}
      <div className={cn(
        "rounded-3xl bg-white p-8 shadow-xl border-4 transition-all duration-300",
        currentOuting ? "border-status-approved/60 shadow-status-approved/20" : "border-border/50"
      )}>
        {currentOuting ? (
          <QRCodeSVG
            value={currentOuting.id!}
            size={200}
            bgColor="white"
            fgColor="#111111"
            level="H"
          />
        ) : (
          <div className="h-[200px] w-[200px] flex flex-col items-center justify-center text-center gap-3 text-muted-foreground rounded-xl">
            <AlertCircle className="h-12 w-12 opacity-20" />
            <div>
              <p className="text-xs font-bold uppercase tracking-wider">No Active Pass</p>
              <p className="text-[10px] opacity-60 mt-1">Submit an outing request first</p>
            </div>
          </div>
        )}
      </div>

      {/* Multi-pass navigator */}
      {activeOutings.length > 1 && (
        <div className="flex items-center gap-3">
          <Button
            variant="outline" size="icon"
            onClick={() => setSelectedIdx(i => Math.max(0, i - 1))}
            disabled={selectedIdx === 0}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-xs text-muted-foreground font-medium">
            Pass {selectedIdx + 1} of {activeOutings.length}
          </span>
          <Button
            variant="outline" size="icon"
            onClick={() => setSelectedIdx(i => Math.min(activeOutings.length - 1, i + 1))}
            disabled={selectedIdx === activeOutings.length - 1}
            className="h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Status badge */}
      {cfg && currentOuting && StatusIcon && (
        <div className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold",
          cfg.bg, cfg.color
        )}>
          <StatusIcon className="h-4 w-4" />
          {cfg.label}
        </div>
      )}

      {/* Trip details */}
      {currentOuting ? (
        <div className="w-full max-w-xs rounded-2xl bg-card border border-border p-4 space-y-3 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-resident shrink-0" />
            <span className="text-sm font-medium text-foreground">{currentOuting.destination}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3 shrink-0" />
            <span>
              {currentOuting.fromDate} {currentOuting.fromTime} — {currentOuting.toDate} {currentOuting.toTime}
            </span>
          </div>
          {currentOuting.wardenNote && (
            <p className="text-[10px] italic text-muted-foreground border-t border-border pt-2">
              Warden note: "{currentOuting.wardenNote}"
            </p>
          )}

          {/* Timestamps */}
          {(currentOuting.exitTimestamp || currentOuting.returnTimestamp) && (
            <div className="border-t border-border pt-2 space-y-1">
              {currentOuting.exitTimestamp && (
                <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <LogOut className="h-3 w-3" />
                  Exited: {currentOuting.exitTimestamp?.toDate?.()?.toLocaleString?.() ?? "recorded"}
                </p>
              )}
              {currentOuting.returnTimestamp && (
                <p className="text-[10px] text-resident flex items-center gap-1">
                  <LogIn className="h-3 w-3" />
                  Returned: {currentOuting.returnTimestamp?.toDate?.()?.toLocaleString?.() ?? "recorded"}
                </p>
              )}
            </div>
          )}

          {/* Outing ID hint for manual scan */}
          <p className="text-[9px] text-muted-foreground/40 font-mono break-all border-t border-border pt-2">
            ID: {currentOuting.id}
          </p>
        </div>
      ) : (
        <p className="text-xs text-center text-muted-foreground max-w-[220px]">
          Request an outing and wait for Warden approval to see your gate pass QR
        </p>
      )}
    </div>
  );
};

export default StudentQR;
