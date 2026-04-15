import { useState, useCallback } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import {
  ScanLine, CheckCircle, User, MapPin, Clock,
  Loader2, AlertCircle, Camera, XCircle, ArrowLeft, LogIn, LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getOutingById, recordGateExit, recordGateReturn, OutingRequest } from "@/services/outingService";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ScanState = "idle" | "scanning" | "result" | "error";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  approved:  { label: "✅ Approved — Ready to Exit",  color: "text-status-approved" },
  exited:    { label: "🚶 Outside — Ready to Return",  color: "text-status-pending"  },
  returned:  { label: "🏠 Returned — Trip Complete",   color: "text-resident"        },
  rejected:  { label: "❌ Rejected by Warden",         color: "text-status-rejected" },
  pending:   { label: "⏳ Pending Approval",            color: "text-muted-foreground"},
};

/** Parse "YYYY-MM-DD" + "HH:MM" into a Date object */
const parseDateTime = (date: string, time: string): Date => {
  return new Date(`${date}T${time}:00`);
};

type TimingResult =
  | { ok: true; kind: "on_time";    message: string }
  | { ok: true; kind: "early_exit"; message: string }   // leaving before scheduled time — warn
  | { ok: false; kind: "no_pass";   message: string }   // trying to exit after deadline
  | { ok: false; kind: "late_return"; message: string; minutesLate: number } // returning past deadline
  | { ok: true; kind: "return_ok";  message: string };

/** Called when the warden is about to mark EXIT (status === "approved") */
const checkExitTiming = (o: OutingRequest): TimingResult => {
  const now      = new Date();
  const deadline = parseDateTime(o.toDate, o.toTime);    // return deadline
  const scheduledFrom = parseDateTime(o.fromDate, o.fromTime);

  // Only block if the entire outing window has expired
  if (now > deadline) {
    return {
      ok: false,
      kind: "no_pass",
      message: `Outing deadline has already passed (${o.toDate} ${o.toTime}). Exit should NOT be allowed.`
    };
  }

  // Informational: student is leaving before their scheduled departure — just warn
  if (now < scheduledFrom) {
    const minutesEarly = Math.round((scheduledFrom.getTime() - now.getTime()) / 60000);
    return {
      ok: true,
      kind: "early_exit",
      message: `Student is leaving ${minutesEarly} min before scheduled departure (${o.fromDate} ${o.fromTime}). Exit is still within the return window.`
    };
  }

  return { ok: true, kind: "on_time", message: "Timing is correct. Proceed." };
};

/** Called when the warden is about to mark RETURN (status === "exited") */
const checkReturnTiming = (o: OutingRequest): TimingResult => {
  const now      = new Date();
  const deadline = parseDateTime(o.toDate, o.toTime);

  if (now > deadline) {
    const minutesLate = Math.round((now.getTime() - deadline.getTime()) / 60000);
    return { ok: false, kind: "late_return", message: `Student is returning ${minutesLate} min late! Deadline was ${o.toDate} ${o.toTime}.`, minutesLate };
  }
  return { ok: true, kind: "return_ok", message: "Returned on time ✅" };
};


const WardenGateScan = () => {
  const [scanState, setScanState] = useState<ScanState>("idle");
  const [outing, setOuting]       = useState<OutingRequest | null>(null);
  const [errorMsg, setErrorMsg]   = useState("");
  const [processing, setProcessing] = useState(false);
  const [manualId, setManualId]   = useState("");
  const [cameraError, setCameraError] = useState(false);
  const { toast } = useToast();

  /* ── helpers ─────────────────────────────────────────── */
  const resolve = useCallback(async (id: string) => {
    setScanState("scanning");
    try {
      const data = await getOutingById(id.trim());
      if (!data) {
        setErrorMsg("QR not recognised. No outing found for this code.");
        setScanState("error");
        return;
      }
      setOuting(data);
      setScanState("result");
    } catch (e: any) {
      setErrorMsg(e.message || "Failed to fetch outing details.");
      setScanState("error");
    }
  }, []);

  const handleCameraScan = useCallback((detections: { rawValue: string }[]) => {
    if (detections.length > 0 && scanState !== "result") {
      resolve(detections[0].rawValue);
    }
  }, [scanState, resolve]);

  const handleManualLookup = () => resolve(manualId);

  const handleAction = async () => {
    if (!outing?.id) return;
    setProcessing(true);
    try {
      if (outing.status === "approved") {
        await recordGateExit(outing.id);
        toast({ title: "Exit Recorded ✅", description: `${outing.studentName} has left the hostel.` });
      } else if (outing.status === "exited") {
        await recordGateReturn(outing.id, outing.toDate, outing.toTime);
        const deadline = new Date(`${outing.toDate}T${outing.toTime}:00`);
        const late = new Date() > deadline;
        toast({
          title: late ? "⚠️ Late Return Recorded" : "Return Recorded 🏠",
          description: late
            ? `${outing.studentName} returned past the deadline. Marked as LATE.`
            : `${outing.studentName} has returned safely.`,
          variant: late ? "destructive" : "default",
        });
      }
      const updated = await getOutingById(outing.id);
      setOuting(updated);
    } catch (e: any) {
      toast({ title: "Action Failed", description: e.message, variant: "destructive" });
    } finally {
      setProcessing(false);
    }
  };

  const reset = () => {
    setScanState("idle");
    setOuting(null);
    setErrorMsg("");
    setManualId("");
  };

  /* ── result card ─────────────────────────────────────── */
  if (scanState === "result" && outing) {
    const statusInfo = STATUS_LABELS[outing.status] ?? { label: outing.status, color: "text-foreground" };
    const canAct = outing.status === "approved" || outing.status === "exited";

    // ── timing checks ──────────────────────────────────────
    const timing = outing.status === "approved" ? checkExitTiming(outing)
                 : outing.status === "exited"   ? checkReturnTiming(outing)
                 : null;
    // Block the button only for expired pass; warn for early exit / late return
    const actionBlocked = timing !== null && !timing.ok && timing.kind === "no_pass";
    // Late return is flagged but the warden CAN still record it
    const isLateReturn  = timing !== null && !timing.ok && timing.kind === "late_return";
    const isEarlyExit   = timing !== null &&  timing.ok && timing.kind === "early_exit";

    return (
      <div className="flex min-h-[calc(100vh-5rem)] flex-col items-center justify-center p-4 pb-24 gap-4">
        <div className={cn(
          "w-full max-w-sm rounded-2xl bg-card border border-border p-6 space-y-5 animate-in slide-in-from-bottom-4"
        )}>
          {/* status */}
          <div className={cn("text-sm font-semibold", statusInfo.color)}>
            {statusInfo.label}
          </div>

          {/* student info */}
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-resident/20">
              <User className="h-7 w-7 text-resident" />
            </div>
            <div>
              <p className="font-bold text-lg text-foreground">{outing.studentName}</p>
              <p className="text-sm text-muted-foreground">Room {outing.roomNo}</p>
            </div>
          </div>

          {/* trip info */}
          <div className="space-y-2 border-t border-border pt-4">
            <div className="flex items-center gap-2 text-sm text-foreground">
              <MapPin className="h-4 w-4 text-warden shrink-0" />
              <span>{outing.destination}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3 shrink-0" />
              <span>{outing.fromDate} {outing.fromTime} — {outing.toDate} {outing.toTime}</span>
            </div>
            {outing.reason && (
              <p className="text-xs text-muted-foreground italic">"{outing.reason}"</p>
            )}
          </div>

          {/* ── timing alert ── */}
          {timing && (
            <div className={cn(
              "rounded-xl px-3 py-3 text-xs font-semibold flex items-start gap-2 border",
              timing.kind === "no_pass"
                ? "bg-status-rejected/10 border-status-rejected/40 text-status-rejected"
                : timing.kind === "late_return"
                  ? "bg-orange-500/10 border-orange-500/40 text-orange-500"
                  : timing.kind === "early_exit"
                    ? "bg-status-pending/10 border-status-pending/40 text-status-pending"
                    : "bg-status-approved/10 border-status-approved/30 text-status-approved"
            )}>
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{timing.message}</span>
            </div>
          )}

          {/* timestamps */}
          {(outing.exitTimestamp || outing.returnTimestamp) && (
            <div className="space-y-1 border-t border-border pt-3">
              {outing.exitTimestamp && (
                <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <LogOut className="h-3 w-3" /> Exited: {outing.exitTimestamp?.toDate?.()?.toLocaleString?.() ?? "—"}
                </p>
              )}
              {outing.returnTimestamp && (
                <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <LogIn className="h-3 w-3" /> Returned: {outing.returnTimestamp?.toDate?.()?.toLocaleString?.() ?? "—"}
                </p>
              )}
            </div>
          )}

          {/* actions */}
          <div className="flex flex-col gap-2 pt-1">
            {canAct && (
              <Button
                onClick={actionBlocked ? undefined : handleAction}
                disabled={processing || actionBlocked}
                className={cn(
                  "w-full gap-2 font-bold",
                  actionBlocked
                    ? "opacity-40 cursor-not-allowed"
                    : isLateReturn
                      ? "bg-orange-500 hover:bg-orange-600 text-white"
                      : outing.status === "approved"
                        ? "bg-status-approved hover:bg-status-approved/80 text-foreground"
                        : "bg-warden hover:bg-warden/80 text-white"
                )}
              >
                {processing && <Loader2 className="h-4 w-4 animate-spin" />}
                {outing.status === "approved" 
                  ? <><LogOut className="h-4 w-4" /> {isEarlyExit ? "Mark Exit (Early)" : "Mark Exit"}</> 
                  : <><LogIn className="h-4 w-4"/> {isLateReturn ? `Mark Return (${(timing as any).minutesLate} min late)` : "Mark Return"}</>}
              </Button>
            )}
            {actionBlocked && (
              <p className="text-[10px] text-center text-status-rejected font-semibold">Exit blocked — pass has expired</p>
            )}
            <Button variant="secondary" onClick={reset} className="w-full gap-2">
              <ScanLine className="h-4 w-4" /> Scan Another
            </Button>
          </div>
        </div>
      </div>
    );
  }

  /* ── error state ─────────────────────────────────────── */
  if (scanState === "error") {
    return (
      <div className="flex min-h-[calc(100vh-5rem)] flex-col items-center justify-center p-4 pb-24 gap-4">
        <div className="w-full max-w-xs rounded-2xl bg-card border border-status-rejected/30 p-6 text-center space-y-4">
          <XCircle className="mx-auto h-12 w-12 text-status-rejected" />
          <p className="text-sm font-semibold text-status-rejected">Scan Failed</p>
          <p className="text-xs text-muted-foreground">{errorMsg}</p>
          <Button onClick={reset} variant="secondary" className="w-full">Try Again</Button>
        </div>
      </div>
    );
  }

  /* ── scanning loader ─────────────────────────────────── */
  if (scanState === "scanning") {
    return (
      <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-warden" />
          <p className="text-sm text-muted-foreground">Looking up outing…</p>
        </div>
      </div>
    );
  }

  /* ── idle / camera ───────────────────────────────────── */
  return (
    <div className="flex min-h-[calc(100vh-5rem)] flex-col items-center justify-start pt-6 p-4 pb-24 gap-6">
      <div className="text-center">
        <h1 className="text-xl font-bold text-foreground">Gate Scanner</h1>
        <p className="text-xs text-muted-foreground">Point camera at student's QR code</p>
      </div>

      {/* Camera scanner */}
      {!cameraError ? (
        <div className="w-full max-w-xs rounded-2xl overflow-hidden border-2 border-warden/40 shadow-xl">
          <Scanner
            onScan={handleCameraScan}
            onError={(e) => {
              console.error("Camera error:", e);
              setCameraError(true);
            }}
            styles={{ container: { borderRadius: "1rem" } }}
            allowMultiple={false}
          />
        </div>
      ) : (
        <div className="w-full max-w-xs rounded-2xl border-2 border-dashed border-warden/40 bg-secondary/30 p-8 flex flex-col items-center gap-3 text-center">
          <Camera className="h-12 w-12 text-muted-foreground opacity-40" />
          <p className="text-xs text-muted-foreground font-medium">Camera unavailable</p>
          <p className="text-[10px] text-muted-foreground">
            Camera requires HTTPS or localhost. Use manual input below.
          </p>
        </div>
      )}

      {/* Manual fallback */}
      <div className="w-full max-w-xs space-y-2">
        <p className="text-xs text-center text-muted-foreground">— or enter Outing ID manually —</p>
        <div className="flex gap-2">
          <Input
            placeholder="Paste outing ID…"
            value={manualId}
            onChange={(e) => setManualId(e.target.value)}
            className="bg-secondary text-xs"
          />
          <Button onClick={handleManualLookup} disabled={!manualId.trim()} size="sm">
            Look up
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WardenGateScan;
