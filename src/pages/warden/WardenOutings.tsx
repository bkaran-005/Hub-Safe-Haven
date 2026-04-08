import { useState } from "react";
import { outings } from "@/data/dummyData";
import { StatusBadge } from "@/components/StatusBadge";
import { Check, X, MapPin, Clock, User } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const WardenOutings = () => {
  const [tab, setTab] = useState<"pending" | "history">("pending");
  const [rejectModal, setRejectModal] = useState<string | null>(null);
  const pending = outings.filter((o) => o.status === "pending");
  const history = outings.filter((o) => o.status !== "pending");

  const list = tab === "pending" ? pending : history;

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
                <span className="text-sm font-medium text-foreground">{o.student}</span>
                <span className="text-xs text-muted-foreground">Room {o.room}</span>
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
              {new Date(o.from).toLocaleString()} — {new Date(o.returnBy).toLocaleString()}
            </div>
            {tab === "pending" && (
              <div className="flex gap-2 pt-1">
                <Button size="sm" className="flex-1 bg-status-approved hover:bg-status-approved/80 gap-1">
                  <Check className="h-3 w-3" /> Approve
                </Button>
                <Button size="sm" variant="destructive" className="flex-1 gap-1" onClick={() => setRejectModal(o.id)}>
                  <X className="h-3 w-3" /> Reject
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>

      <Dialog open={!!rejectModal} onOpenChange={() => setRejectModal(null)}>
        <DialogContent className="bg-card border-border max-w-sm">
          <DialogHeader><DialogTitle>Reject Reason</DialogTitle></DialogHeader>
          <Textarea className="bg-secondary" placeholder="Why are you rejecting this request?" />
          <Button variant="destructive" onClick={() => setRejectModal(null)}>Reject Request</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WardenOutings;
