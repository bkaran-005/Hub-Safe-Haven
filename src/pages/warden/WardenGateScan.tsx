import { useState } from "react";
import { ScanLine, CheckCircle, User, MapPin, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const WardenGateScan = () => {
  const [scanned, setScanned] = useState(false);

  return (
    <div className="flex min-h-[calc(100vh-5rem)] flex-col items-center justify-center p-4 pb-20">
      {!scanned ? (
        <div className="relative flex flex-col items-center gap-6">
          <div className="relative h-64 w-64 rounded-2xl border-2 border-dashed border-warden/50 bg-secondary/30 flex items-center justify-center">
            <div className="absolute inset-4 rounded-xl border-2 border-warden/30" />
            <ScanLine className="h-16 w-16 text-warden animate-pulse" />
          </div>
          <p className="text-sm text-muted-foreground">Scan student QR code</p>
          <button
            onClick={() => setScanned(true)}
            className="rounded-lg bg-warden px-6 py-2 text-sm font-medium text-warden-foreground"
          >
            Simulate Scan
          </button>
        </div>
      ) : (
        <div className={cn("w-full max-w-sm rounded-2xl bg-card border border-border p-6 space-y-4 animate-in slide-in-from-bottom-4")}>
          <div className="flex items-center gap-2 text-status-approved">
            <CheckCircle className="h-6 w-6" />
            <span className="font-semibold">Verified</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-resident/20">
              <User className="h-6 w-6 text-resident" />
            </div>
            <div>
              <p className="font-medium text-foreground">Priya Sharma</p>
              <p className="text-xs text-muted-foreground">Room 204</p>
            </div>
          </div>
          <div className="space-y-2 border-t border-border pt-3">
            <div className="flex items-center gap-2 text-sm text-foreground">
              <MapPin className="h-4 w-4 text-warden" /> City Mall
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" /> Return by 6:00 PM
            </div>
          </div>
          <div className="flex gap-2">
            <button className="flex-1 rounded-lg bg-status-approved py-2 text-sm font-medium text-foreground">Mark Exit</button>
            <button onClick={() => setScanned(false)} className="flex-1 rounded-lg bg-secondary py-2 text-sm font-medium text-muted-foreground">Scan Again</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WardenGateScan;
