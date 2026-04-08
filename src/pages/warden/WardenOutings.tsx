import { useState } from "react";
import { useAllOutings } from "@/hooks/useAllOutings";
import { approveOuting, rejectOuting } from "@/services/outingService";
import { StatusBadge } from "@/components/StatusBadge";
import { Check, X, MapPin, Clock, User, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

const WardenOutings = () => {
  const [tab, setTab] = useState<"pending" | "history">("pending");
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { outings, loading } = useAllOutings();
  const { toast } = useToast();

  const pending = outings.filter((o) => o.status === "pending");
  const history = outings.filter((o) => o.status !== "pending");

  const list = tab === "pending" ? pending : history;

  const handleApprove = async (id: string) => {
    setIsProcessing(true);
    try {
      await approveOuting(id, "Approved by Warden");
      toast({ title: "Approved", description: "Outing request approved successfully." });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectId || !rejectReason.trim()) return;
    setIsProcessing(true);
    try {
      await rejectOuting(rejectId, rejectReason);
      setRejectId(null);
      setRejectReason("");
      toast({ title: "Rejected", description: "Outing request rejected." });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-20 p-4">
      <h1 className="text-xl font-bold text-foreground">Outings</h1>

      <div className="flex gap-2">
        {(["pending", "history"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "rounded-full px-4 py-1.5 text-xs font-medium transition-colors capitalize",
              tab === t ? "bg-warden text-warden-foreground" : "bg-secondary text-muted-foreground"
            )}
          >
            {t} {t === "pending" && pending.length > 0 && `(${pending.length})`}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {list.map((o) => (
          <div key={o.id} className="rounded-lg bg-card border border-border p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">{o.studentName}</span>
                <span className="text-xs text-muted-foreground">Room {o.roomNo}</span>
              </div>
              <StatusBadge status={o.status} />
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-3 w-3 text-warden" />
              <span className="text-sm text-foreground">{o.destination}</span>
            </div>
            <p className="text-xs text-muted-foreground">{o.reason}</p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {o.fromDate} {o.fromTime} — {o.toDate} {o.toTime}
            </div>
            {tab === "pending" && (
              <div className="flex gap-2 pt-1">
                <Button 
                  size="sm" 
                  className="flex-1 bg-status-approved hover:bg-status-approved/80 gap-1"
                  onClick={() => handleApprove(o.id!)}
                  disabled={isProcessing}
                >
                  <Check className="h-3 w-3" /> Approve
                </Button>
                <Button 
                  size="sm" 
                  variant="destructive" 
                  className="flex-1 gap-1" 
                  onClick={() => setRejectId(o.id!)}
                  disabled={isProcessing}
                >
                  <X className="h-3 w-3" /> Reject
                </Button>
              </div>
            )}
            {o.wardenNote && (
              <div className="rounded bg-secondary p-2 mt-2">
                <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Warden's Note</p>
                <p className="text-xs text-foreground italic">"{o.wardenNote}"</p>
              </div>
            )}
          </div>
        ))}
        {list.length === 0 && (
          <div className="text-center py-10 opacity-50">
            <p className="text-sm">No outings found in this category.</p>
          </div>
        )}
      </div>

      <Dialog open={!!rejectId} onOpenChange={() => setRejectId(null)}>
        <DialogContent className="bg-card border-border max-w-sm">
          <DialogHeader><DialogTitle>Reject Reason</DialogTitle></DialogHeader>
          <Textarea 
            className="bg-secondary" 
            placeholder="Why are you rejecting this request?" 
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
          <Button 
            variant="destructive" 
            onClick={handleReject}
            disabled={isProcessing || !rejectReason.trim()}
          >
            {isProcessing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Reject Request
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WardenOutings;
