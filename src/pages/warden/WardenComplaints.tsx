import { useComplaints } from "@/hooks/useComplaints";
import { updateComplaintStatus, Complaint } from "@/services/complaintService";
import { StatusBadge } from "@/components/StatusBadge";
import { Clock, User, Loader2, CheckCircle, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";

const WardenComplaints = () => {
  const { complaints, loading } = useComplaints();
  const { toast } = useToast();
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleStatusUpdate = async (id: string, newStatus: Complaint["status"]) => {
    setProcessingId(id);
    try {
      await updateComplaintStatus(id, newStatus);
      toast({ title: "Status Updated", description: `Complaint moved to ${newStatus.replace("_", " ")}.` });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setProcessingId(null);
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
      <h1 className="text-xl font-bold text-foreground">All Complaints</h1>
      <div className="space-y-3">
        {complaints.map((c) => (
          <div key={c.id} className="rounded-lg bg-card border border-border p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">{c.isAnonymous ? "Anonymous" : c.studentName}</span>
                {!c.isAnonymous && <span className="text-xs text-muted-foreground">Room {c.roomNo}</span>}
              </div>
              <StatusBadge status={c.status} />
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-[10px] w-fit font-bold uppercase text-warden bg-warden/20 rounded-full px-2 py-0.5">{c.category}</span>
              <p className="text-sm text-foreground">{c.description}</p>
              {c.imageUrl && (
                <img src={c.imageUrl} alt="Complaint Attachment" className="w-full h-32 object-cover rounded-lg border border-border" />
              )}
            </div>
            
            <div className="flex gap-2 pt-2 border-t border-border mt-2">
              {c.status === "open" && (
                <Button 
                  size="sm" 
                  className="flex-1 gap-1"
                  onClick={() => handleStatusUpdate(c.id!, "in_progress")}
                  disabled={!!processingId}
                >
                  <Play className="h-3 w-3" /> Start Working
                </Button>
              )}
              {c.status === "in_progress" && (
                <Button 
                  size="sm" 
                  className="flex-1 gap-1 bg-status-approved hover:bg-status-approved/80"
                  onClick={() => handleStatusUpdate(c.id!, "resolved")}
                  disabled={!!processingId}
                >
                  <CheckCircle className="h-3 w-3" /> Mark Resolved
                </Button>
              )}
            </div>
            
            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
              <span>{c.createdAt?.toDate().toLocaleString() || "Recent"}</span>
              {c.status !== "resolved" && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" /> SLA active
                </div>
              )}
            </div>
          </div>
        ))}
        {complaints.length === 0 && (
          <div className="text-center py-10 opacity-50">
            <p className="text-sm">No complaints found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WardenComplaints;
