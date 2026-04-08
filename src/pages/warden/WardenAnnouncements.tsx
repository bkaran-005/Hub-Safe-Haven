import { useState } from "react";
import { useAnnouncements } from "@/hooks/useAnnouncements";
import { sendAnnouncement } from "@/services/announcementService";
import { useAuth } from "@/contexts/AuthContext";
import { Megaphone, Plus, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";

const WardenAnnouncements = () => {
  const { profile } = useAuth();
  const { announcements, loading } = useAnnouncements();
  const { toast } = useToast();
  
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ title: "", body: "", sendToAll: true });

  const handlePost = async () => {
    if (!profile) return;
    if (!formData.title || !formData.body) {
      toast({ title: "Incomplete", description: "All fields are required.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      await sendAnnouncement(formData.title, formData.body, profile.uid, profile.name, formData.sendToAll);
      setShowForm(false);
      setFormData({ title: "", body: "", sendToAll: true });
      toast({ title: "Success", description: "Announcement posted for residents." });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
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
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">Announcements</h1>
        <button 
          onClick={() => setShowForm(true)} 
          className="flex items-center gap-1 rounded-lg bg-warden px-3 py-1.5 text-xs font-medium text-warden-foreground transition-transform active:scale-95"
        >
          <Plus className="h-3 w-3" /> New
        </button>
      </div>

      <div className="space-y-3">
        {announcements.map((a) => (
          <div key={a.id} className="rounded-lg bg-card border border-border p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Megaphone className="h-4 w-4 text-warden" />
              <span className="text-sm font-semibold text-foreground">{a.title}</span>
            </div>
            <p className="text-sm text-muted-foreground">{a.body}</p>
            <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1">
               <span>By {a.wardenName}</span>
               <span>{a.createdAt?.toDate().toLocaleDateString() || "Just now"}</span>
            </div>
          </div>
        ))}
        {announcements.length === 0 && (
          <div className="text-center py-10 opacity-50">
            <p className="text-sm">No announcements yet.</p>
          </div>
        )}
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="bg-card border-border max-w-sm">
          <DialogHeader><DialogTitle>New Announcement</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-1.5">
              <Label>Title</Label>
              <Input 
                className="bg-secondary mt-1" 
                placeholder="Announcement title" 
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Body</Label>
              <Textarea 
                className="bg-secondary mt-1" 
                placeholder="Write your announcement..." 
                value={formData.body}
                onChange={(e) => setFormData({...formData, body: e.target.value})}
              />
            </div>
            <div className="flex items-center justify-between py-2">
              <Label>Send to all residents</Label>
              <Switch 
                checked={formData.sendToAll} 
                onCheckedChange={(val) => setFormData({...formData, sendToAll: val})} 
              />
            </div>
            <Button 
              className="w-full bg-warden hover:bg-warden/90 transition-colors" 
              onClick={handlePost}
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Post Announcement
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WardenAnnouncements;
