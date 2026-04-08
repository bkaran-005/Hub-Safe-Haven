import { useState } from "react";
import { announcements } from "@/data/dummyData";
import { Megaphone, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

const WardenAnnouncements = () => {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="space-y-4 pb-20 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">Announcements</h1>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-1 rounded-lg bg-warden px-3 py-1.5 text-xs font-medium text-warden-foreground">
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
            <p className="text-xs text-muted-foreground">{new Date(a.date).toLocaleDateString()}</p>
          </div>
        ))}
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="bg-card border-border max-w-sm">
          <DialogHeader><DialogTitle>New Announcement</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Title</Label><Input className="bg-secondary mt-1" placeholder="Announcement title" /></div>
            <div><Label>Body</Label><Textarea className="bg-secondary mt-1" placeholder="Write your announcement..." /></div>
            <div className="flex items-center justify-between">
              <Label>Send to all</Label>
              <Switch defaultChecked />
            </div>
            <Button className="w-full bg-warden hover:bg-warden/90" onClick={() => setShowForm(false)}>Post Announcement</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WardenAnnouncements;
