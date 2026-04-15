import { useState } from "react";
import { StatusBadge } from "@/components/StatusBadge";
import { Plus, MapPin, Clock, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useOutings } from "@/hooks/useOutings";
import { submitOutingRequest } from "@/services/outingService";
import { useToast } from "@/components/ui/use-toast";

const StudentOutings = () => {
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { profile } = useAuth();
  const { outings, loading } = useOutings(profile?.uid);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    reason: "",
    destination: "",
    fromDate: "",
    fromTime: "",
    toDate: "",
    toTime: "",
  });

  const handleSubmit = async () => {
    if (!profile) return;
    if (!formData.reason || !formData.destination || !formData.fromDate || !formData.fromTime || !formData.toDate || !formData.toTime) {
      toast({ title: "Incomplete Form", description: "Please fill all fields.", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      await submitOutingRequest(profile.uid, {
        studentName: profile.name,
        roomNo: profile.roomNo || "",
        phone: (profile as any).phone || "",
        ...formData,
        parentFcmToken: profile.parentFcmToken || "",
      });
      setShowForm(false);
      setFormData({ reason: "", destination: "", fromDate: "", fromTime: "", toDate: "", toTime: "" });
      toast({ title: "Request Submitted", description: "Your outing request is pending warden approval." });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
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
      <h1 className="text-xl font-bold text-foreground">My Outings</h1>

      <div className="space-y-3">
        {outings.map((o) => (
          <div key={o.id} className="rounded-lg bg-card border border-border p-4 space-y-2">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-resident" />
                <span className="font-medium text-sm text-foreground">{o.destination}</span>
              </div>
              <StatusBadge status={o.status} />
            </div>
            <p className="text-xs text-muted-foreground">{o.reason}</p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {o.fromDate} {o.fromTime} — {o.toDate} {o.toTime}
            </div>
            {o.wardenNote && (
              <div className="rounded bg-secondary/50 p-2 mt-2 border border-border/50">
                <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Warden's Note</p>
                <p className="text-xs text-foreground italic">"{o.wardenNote}"</p>
              </div>
            )}
          </div>
        ))}
        {outings.length === 0 && (
          <div className="text-center py-10 opacity-50 border-2 border-dashed border-border rounded-xl">
            <p className="text-sm">No outing requests yet.</p>
          </div>
        )}
      </div>

      <button
        onClick={() => setShowForm(true)}
        className="fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-resident text-resident-foreground shadow-lg transition-transform active:scale-95 hover:scale-105"
      >
        <Plus className="h-6 w-6" />
      </button>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="bg-card border-border max-w-sm">
          <DialogHeader>
            <DialogTitle>Request Outing</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-1.5">
              <Label>Destination</Label>
              <Input 
                className="bg-secondary mt-1" 
                placeholder="Where are you going?" 
                value={formData.destination}
                onChange={(e) => setFormData({...formData, destination: e.target.value})}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Reason</Label>
              <Input 
                className="bg-secondary mt-1" 
                placeholder="Why do you need to go out?" 
                value={formData.reason}
                onChange={(e) => setFormData({...formData, reason: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <Label>From Date</Label>
                <Input 
                  type="date" 
                  className="bg-secondary mt-1" 
                  value={formData.fromDate}
                  onChange={(e) => setFormData({...formData, fromDate: e.target.value})}
                />
              </div>
              <div className="space-y-1.5">
                <Label>From Time</Label>
                <Input 
                  type="time" 
                  className="bg-secondary mt-1" 
                  value={formData.fromTime}
                  onChange={(e) => setFormData({...formData, fromTime: e.target.value})}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <Label>Return Date</Label>
                <Input 
                  type="date" 
                  className="bg-secondary mt-1" 
                  value={formData.toDate}
                  onChange={(e) => setFormData({...formData, toDate: e.target.value})}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Return Time</Label>
                <Input 
                  type="time" 
                  className="bg-secondary mt-1" 
                  value={formData.toTime}
                  onChange={(e) => setFormData({...formData, toTime: e.target.value})}
                />
              </div>
            </div>
            <Button className="w-full mt-4" onClick={handleSubmit} disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Submit Request
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentOutings;
