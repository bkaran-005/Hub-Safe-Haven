import { useState } from "react";
import { ScanLine, CheckCircle, User, MapPin, Clock, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { getOutingById, recordGateExit, recordGateReturn, OutingRequest } from "@/services/outingService";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const WardenGateScan = () => {
  const [scannedId, setScannedId] = useState("");
  const [outing, setOuting] = useState<OutingRequest | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  
  const { toast } = useToast();

  const handleScan = async () => {
    if (!scannedId.trim()) return;
    setLoading(true);
    setError(null);
    setOuting(null);
    try {
      const data = await getOutingById(scannedId);
      if (data) {
        setOuting(data);
      } else {
        setError("Invalid Outing ID. Record not found.");
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async () => {
    if (!outing) return;
    setProcessing(true);
    try {
      if (outing.status === "approved") {
        await recordGateExit(outing.id!);
        toast({ title: "Exit Recorded", description: `${outing.studentName} has marked exit.` });
      } else if (outing.status === "exited") {
        await recordGateReturn(outing.id!);
        toast({ title: "Return Recorded", description: `${outing.studentName} has marked return.` });
      }
      // Refresh data
      const updated = await getOutingById(outing.id!);
      setOuting(updated);
    } catch (e: any) {
      toast({ title: "Action Failed", description: e.message, variant: "destructive" });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-5rem)] flex-col items-center justify-center p-4 pb-20">
      {!outing ? (
        <div className="relative flex flex-col items-center gap-6 w-full max-w-xs">
          <div className="relative h-64 w-64 rounded-2xl border-2 border-dashed border-warden/50 bg-secondary/30 flex items-center justify-center">
            <div className="absolute inset-4 rounded-xl border-2 border-warden/30" />
            <ScanLine className={cn("h-16 w-16 text-warden", loading && "animate-spin")} />
          </div>
          <p className="text-sm text-muted-foreground">Enter Outing ID for Simulation</p>
          <div className="flex w-full gap-2">
            <Input 
              placeholder="e.g. outing_123" 
              value={scannedId} 
              onChange={(e) => setScannedId(e.target.value)}
              className="bg-secondary"
            />
            <Button onClick={handleScan} disabled={loading || !scannedId.trim()}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Scan"}
            </Button>
          </div>
          {error && (
            <div className="flex items-center gap-2 text-xs text-status-rejected animate-in fade-in">
              <AlertCircle className="h-4 w-4" /> {error}
            </div>
          )}
        </div>
      ) : (
        <div className={cn("w-full max-w-sm rounded-2xl bg-card border border-border p-6 space-y-4 animate-in slide-in-from-bottom-4")}>
          <div className="flex items-center gap-2 text-status-approved">
            <CheckCircle className="h-6 w-6" />
            <span className="font-semibold capitalize">{outing.status === "approved" ? "Verified - Ready for Exit" : outing.status === "exited" ? "Verified - Ready for Return" : outing.status}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-resident/20">
              <User className="h-6 w-6 text-resident" />
            </div>
            <div>
              <p className="font-medium text-foreground">{outing.studentName}</p>
              <p className="text-xs text-muted-foreground">Room {outing.roomNo}</p>
            </div>
          </div>
          <div className="space-y-2 border-t border-border pt-3">
            <div className="flex items-center gap-2 text-sm text-foreground">
              <MapPin className="h-4 w-4 text-warden" /> {outing.destination}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" /> Return by {outing.toDate} {outing.toTime}
            </div>
          </div>
          <div className="flex gap-2">
            {(outing.status === "approved" || outing.status === "exited") && (
              <Button 
                onClick={handleAction} 
                disabled={processing}
                className="flex-1 bg-status-approved hover:bg-status-approved/80 text-foreground"
              >
                {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Mark {outing.status === "approved" ? "Exit" : "Return"}
              </Button>
            )}
            <Button variant="secondary" onClick={() => setOuting(null)} className="flex-1">Scan Another</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WardenGateScan;
