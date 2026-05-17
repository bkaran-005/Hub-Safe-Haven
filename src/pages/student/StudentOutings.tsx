import { useState } from "react";
import { StatusBadge } from "@/components/StatusBadge";
import { Plus, MapPin, Clock, Loader2, QrCode, ChevronDown, ChevronUp, Calendar, LogIn } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useOutings } from "@/hooks/useOutings";
import { submitOutingRequest } from "@/services/outingService";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

const CURFEW_TIME = "18:30"; // 6:30 PM

const isCurfewViolation = (date: string, time: string): boolean => {
  return time > CURFEW_TIME;
};

const StudentOutings = () => {
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [expandedQR, setExpandedQR] = useState<string | null>(null);
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
    if (formData.toDate < formData.fromDate) {
      toast({ title: "Invalid Dates", description: "Return date cannot be before departure date.", variant: "destructive" });
      return;
    }
    if (formData.toDate === formData.fromDate && formData.toTime <= formData.fromTime) {
      toast({ title: "Invalid Time", description: "Return time must be after departure time.", variant: "destructive" });
      return;
    }
    if (formData.toDate < formData.fromDate) {
      toast({ title: "Invalid Dates", description: "Return date cannot be before departure date", variant: "destructive" });
      return;
    }
    if (isCurfewViolation(formData.toDate, formData.toTime)) {
      toast({
        title: "Curfew Violation ⚠️",
        description: "Return time cannot be after 6:30 PM. Hostel curfew is at 6:30 PM.",
        variant: "destructive"
      });
      return;
    }
    if (isCurfewViolation(formData.fromDate, formData.fromTime)) {
      toast({
        title: "Curfew Violation ⚠️",
        description: "Departure time cannot be after 6:30 PM. Hostel curfew is at 6:30 PM.",
        variant: "destructive"
      });
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
          <div key={o.id} className={cn(
            "rounded-xl bg-card border p-4 space-y-2 transition-all",
            (o.status === "approved" || o.status === "exited") ? "border-status-approved/30" : "border-border"
          )}>
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
              <div className="rounded bg-secondary/50 p-2 mt-1 border border-border/50">
                <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Warden's Note</p>
                <p className="text-xs text-foreground italic">"{o.wardenNote}"</p>
              </div>
            )}

            {/* Inline QR — only for approved or exited */}
            {(o.status === "approved" || o.status === "exited") && (
              <div className="border-t border-border/50 pt-2 mt-1">
                <button
                  onClick={() => setExpandedQR(expandedQR === o.id ? null : o.id!)}
                  className="flex items-center gap-2 text-xs font-semibold text-status-approved hover:opacity-80 transition-opacity"
                >
                  <QrCode className="h-3.5 w-3.5" />
                  {expandedQR === o.id ? "Hide Gate Pass QR" : "Show Gate Pass QR"}
                  {expandedQR === o.id
                    ? <ChevronUp className="h-3 w-3" />
                    : <ChevronDown className="h-3 w-3" />
                  }
                </button>

                {expandedQR === o.id && (
                  <div className="flex flex-col items-center gap-2 mt-3 animate-in fade-in duration-200">
                    <div className="rounded-2xl bg-white p-5 shadow-lg border-2 border-status-approved/40">
                      <QRCodeSVG
                        value={o.id!}
                        size={180}
                        bgColor="white"
                        fgColor="#111111"
                        level="H"
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground text-center">
                      Show this to the warden at the gate
                    </p>
                  </div>
                )}
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
            {/* Departure */}
            <div className="rounded-xl bg-secondary/40 border border-border p-3 space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-resident" /> Departure
              </p>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">Date</Label>
                  <div className="relative">
                    <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                    <Input
                      type="date"
                      className="bg-card border-border h-10 pl-8 text-sm"
                      value={formData.fromDate}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={(e) => setFormData({...formData, fromDate: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">Time</Label>
                  <div className="relative">
                    <Clock className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                    <Input
                      type="time"
                      className="bg-card border-border h-10 pl-8 text-sm"
                      value={formData.fromTime}
                      onChange={(e) => setFormData({...formData, fromTime: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Return */}
            <div className="rounded-xl bg-secondary/40 border border-border p-3 space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <LogIn className="h-3.5 w-3.5 text-status-approved" /> Return
              </p>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">Date</Label>
                  <div className="relative">
                    <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                    <Input
                      type="date"
                      className="bg-card border-border h-10 pl-8 text-sm"
                      value={formData.toDate}
                      min={formData.fromDate || new Date().toISOString().split("T")[0]}
                      onChange={(e) => setFormData({...formData, toDate: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">Time</Label>
                  <div className="relative">
                    <Clock className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                    <Input
                      type="time"
                      className="bg-card border-border h-10 pl-8 text-sm"
                      value={formData.toTime}
                      max="18:30"
                      onChange={(e) => setFormData({...formData, toTime: e.target.value})}
                    />
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-status-pending flex items-center gap-1">
                ⚠ Curfew at 6:30 PM — return must be before this time
              </p>
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
