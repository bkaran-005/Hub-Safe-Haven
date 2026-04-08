import { useState } from "react";
import { StatusBadge } from "@/components/StatusBadge";
import { complaints } from "@/data/dummyData";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

const categories = ["All", "Room", "Hygiene", "Safety", "Food"] as const;

const StudentComplaints = () => {
  const [filter, setFilter] = useState<string>("All");
  const [showForm, setShowForm] = useState(false);
  const studentComplaints = complaints.filter((c) => c.student === "Priya Sharma");
  const filtered = filter === "All" ? studentComplaints : studentComplaints.filter((c) => c.category === filter);

  const statusTimeline = (status: string) => {
    const steps = ["open", "in-progress", "resolved"];
    const current = steps.indexOf(status);
    return (
      <div className="flex items-center gap-1 mt-2">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-1">
            <div className={cn("h-2 w-2 rounded-full", i <= current ? "bg-resident" : "bg-muted")} />
            {i < steps.length - 1 && <div className={cn("h-0.5 w-4", i < current ? "bg-resident" : "bg-muted")} />}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4 pb-20 p-4">
      <h1 className="text-xl font-bold text-foreground">Complaints</h1>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={cn(
              "shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors",
              filter === c ? "bg-resident text-resident-foreground" : "bg-secondary text-muted-foreground"
            )}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((c) => (
          <div key={c.id} className="rounded-lg bg-card border border-border p-4 space-y-2">
            <div className="flex items-start justify-between">
              <span className="text-xs font-medium text-resident bg-resident/20 rounded-full px-2 py-0.5">{c.category}</span>
              <StatusBadge status={c.status} />
            </div>
            <p className="text-sm text-foreground">{c.description}</p>
            <p className="text-xs text-muted-foreground">{new Date(c.createdAt).toLocaleDateString()}</p>
            {statusTimeline(c.status)}
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
            <DialogTitle>Raise Complaint</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Category</Label>
              <Select>
                <SelectTrigger className="bg-secondary mt-1"><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {["Room", "Hygiene", "Safety", "Food"].map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Description</Label><Textarea className="bg-secondary mt-1" placeholder="Describe your complaint..." /></div>
            <div>
              <Button variant="outline" className="w-full">📷 Add Photo</Button>
            </div>
            <div className="flex items-center justify-between">
              <Label>Submit anonymously</Label>
              <Switch />
            </div>
            <Button className="w-full" onClick={() => setShowForm(false)}>Submit Complaint</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentComplaints;
