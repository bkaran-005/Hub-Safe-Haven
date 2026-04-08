import { useState } from "react";
import { StatusBadge } from "@/components/StatusBadge";
import { outings } from "@/data/dummyData";
import { Plus, MapPin, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const StudentOutings = () => {
  const [showForm, setShowForm] = useState(false);
  const studentOutings = outings.filter((o) => o.student === "Priya Sharma");

  return (
    <div className="space-y-4 pb-20 p-4">
      <h1 className="text-xl font-bold text-foreground">My Outings</h1>

      <div className="space-y-3">
        {studentOutings.map((o) => (
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
              {new Date(o.from).toLocaleString()} — {new Date(o.returnBy).toLocaleString()}
            </div>
            {o.wardenNote && (
              <p className="text-xs text-status-rejected italic">Note: {o.wardenNote}</p>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={() => setShowForm(true)}
        className="fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-resident text-resident-foreground shadow-lg"
      >
        <Plus className="h-6 w-6" />
      </button>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="bg-card border-border max-w-sm">
          <DialogHeader>
            <DialogTitle>Request Outing</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div><Label>Reason</Label><Input className="bg-secondary mt-1" placeholder="Why do you need to go out?" /></div>
            <div><Label>Destination</Label><Input className="bg-secondary mt-1" placeholder="Where are you going?" /></div>
            <div><Label>From</Label><Input type="datetime-local" className="bg-secondary mt-1" /></div>
            <div><Label>Return By</Label><Input type="datetime-local" className="bg-secondary mt-1" /></div>
            <Button className="w-full" onClick={() => setShowForm(false)}>Submit Request</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentOutings;
