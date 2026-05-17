import { useState } from "react";
import { StatusBadge } from "@/components/StatusBadge";
import { Plus, Loader2, Camera, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useComplaints } from "@/hooks/useComplaints";
import { raiseComplaint } from "@/services/complaintService";
import { useToast } from "@/components/ui/use-toast";

const categories = ["All", "Room", "Hygiene", "Safety", "Food"] as const;

const StudentComplaints = () => {
  const { profile } = useAuth();
  const { complaints, loading } = useComplaints(profile?.uid);
  const { toast } = useToast();

  const [filter, setFilter] = useState<string>("All");
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    category: "",
    description: "",
    isAnonymous: false,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const filtered = filter === "All" ? complaints : complaints.filter((c) => c.category === filter.toLowerCase());

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!profile) return;
    if (!formData.category || !formData.description) {
      toast({ title: "Validation Error", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      await raiseComplaint(profile.uid, {
        studentName: formData.isAnonymous ? "Anonymous" : profile.name,
        roomNo: profile.roomNo || "",
        category: formData.category.toLowerCase() as any,
        description: formData.description,
        isAnonymous: formData.isAnonymous,
      }, imageFile || undefined);
      
      setShowForm(false);
      setFormData({ category: "", description: "", isAnonymous: false });
      setImageFile(null);
      setImagePreview(null);
      toast({ title: "Complaint Raised", description: "Warden has been notified of your complaint." });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusTimeline = (status: string) => {
    const steps = ["open", "in_progress", "resolved"];
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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-20 p-4">
      <h1 className="text-xl font-bold text-foreground">Complaints</h1>

      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
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
              <span className="text-xs font-medium text-resident uppercase bg-resident/20 rounded-full px-2 py-0.5">{c.category}</span>
              <StatusBadge status={c.status} />
            </div>
            <p className="text-sm text-foreground">{c.description}</p>
            {c.imageUrl && (
              <img src={c.imageUrl} alt="Complaint Attachment" className="w-full h-32 object-cover rounded-lg border border-border" />
            )}
            <p className="text-[10px] text-muted-foreground">Raised on: {c.createdAt?.toDate().toLocaleDateString() || "Just now"}</p>
            {statusTimeline(c.status)}
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-10 border-2 border-dashed border-border rounded-xl">
            <p className="text-sm font-medium text-muted-foreground">No complaints found.</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Tap + to raise a new complaint.</p>
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
            <DialogTitle>Raise Complaint</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select onValueChange={(val) => setFormData({...formData, category: val})}>
                <SelectTrigger className="bg-secondary mt-1"><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {["Room", "Hygiene", "Safety", "Food"].map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea 
                className="bg-secondary mt-1" 
                placeholder="Describe your complaint..." 
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Photo (Optional)</Label>
              {imagePreview ? (
                <div className="relative w-full h-32 rounded-lg border border-border overflow-hidden">
                  <img src={imagePreview} className="w-full h-full object-cover" />
                  <button onClick={() => {setImageFile(null); setImagePreview(null);}} className="absolute top-1 right-1 bg-black/50 p-1 rounded-full text-white">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <Input type="file" accept="image/*" onChange={handleImageChange} className="hidden" id="complaint-image" />
                  <Label htmlFor="complaint-image" className="flex items-center justify-center gap-2 border border-dashed border-border p-4 rounded-lg cursor-pointer bg-secondary hover:bg-secondary/80">
                    <Camera className="h-5 w-5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Add Capture/Upload</span>
                  </Label>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between py-2 border-t border-border">
              <Label>Submit anonymously</Label>
              <Switch 
                checked={formData.isAnonymous} 
                onCheckedChange={(val) => setFormData({...formData, isAnonymous: val})} 
              />
            </div>
            <Button className="w-full" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Submit Complaint
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentComplaints;
