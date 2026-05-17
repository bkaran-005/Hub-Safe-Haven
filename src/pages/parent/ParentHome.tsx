import { useState } from "react";
import { NotificationBell } from "@/components/NotificationBell";
import { LogOut, User, MapPin, Clock, AlertTriangle, CheckCircle, Info, Loader2, Link2, Pencil } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { useStudentForParent } from "@/hooks/useStudentForParent";
import { useOutings } from "@/hooks/useOutings";
import { useAnnouncements } from "@/hooks/useAnnouncements";
import { db, doc, updateDoc } from "@/lib/firebase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const ParentHome = () => {
  const { profile, logout } = useAuth();
  const { student, loading: loadingStudent } = useStudentForParent(profile?.uid);
  const { outings, loading: loadingOutings } = useOutings(student?.uid);
  const { announcements, loading: loadingAnnouncements } = useAnnouncements();
  const { toast } = useToast();

  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [newStudentUid, setNewStudentUid] = useState("");
  const [isLinking, setIsLinking] = useState(false);

  const lastOuting = outings.find((o) => (o.status === "approved" || o.status === "exited") && !o.returnTimestamp);
  const isOutside = lastOuting?.status === "exited";

  const isLoading = loadingStudent || loadingOutings || loadingAnnouncements;

  const handleLinkStudent = async () => {
    if (!profile?.uid || !newStudentUid.trim()) {
      toast({ title: "UID required", description: "Please paste the student's UID.", variant: "destructive" });
      return;
    }
    setIsLinking(true);
    try {
      await updateDoc(doc(db, "users", profile.uid), {
        studentUid: newStudentUid.trim(),
      });
      toast({ title: "Student linked", description: "Reload the page to see the student's details." });
      setShowLinkDialog(false);
      setNewStudentUid("");
      // Reload to re-fetch profile with new studentUid
      window.location.reload();
    } catch (e: any) {
      toast({ title: "Failed", description: e.message, variant: "destructive" });
    } finally {
      setIsLinking(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">Parent Dashboard</h1>
        <div className="flex items-center gap-2">
          <NotificationBell
            count={announcements.length}
            label="Announcements"
            storageKey="parent_notif_seen"
            items={announcements.map(a => ({ id: a.id, title: a.title, body: a.body, type: "announcement" as const }))}
          />
          <ThemeToggle />
          <button
            onClick={() => logout()}
            className="p-2 rounded-full border border-border bg-card text-status-rejected transition-colors hover:bg-status-rejected/10"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Student card — shows link prompt if not linked */}
      {!student ? (
        <div className="rounded-xl border-2 border-dashed border-parent/30 bg-parent/5 p-6 flex flex-col items-center gap-3 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-parent/20">
            <Link2 className="h-6 w-6 text-parent" />
          </div>
          <div>
            <p className="font-semibold text-foreground">No student linked</p>
            <p className="text-xs text-muted-foreground mt-1">
              Link your child's account to monitor their hostel activity.
            </p>
          </div>
          <Button
            onClick={() => setShowLinkDialog(true)}
            className="bg-parent hover:bg-parent/90 text-white gap-2 mt-1"
          >
            <Link2 className="h-4 w-4" /> Link Student Account
          </Button>
        </div>
      ) : (
        <div className="rounded-lg bg-card border border-border p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-parent/20 shrink-0">
              <User className="h-6 w-6 text-parent" />
            </div>
            <div>
              <p className="font-semibold text-foreground">{student.name}</p>
              <p className="text-sm text-muted-foreground">Room {student.roomNo || "N/A"}</p>
            </div>
          </div>
          <button
            onClick={() => setShowLinkDialog(true)}
            className="p-2 rounded-full hover:bg-accent transition-colors text-muted-foreground"
            title="Change linked student"
          >
            <Pencil className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Status card — only show if student is linked */}
      {student && (
        <div className={`rounded-lg border p-4 flex items-center gap-3 ${isOutside ? "bg-status-pending/10 border-status-pending/30" : "bg-status-approved/10 border-status-approved/30"}`}>
          {isOutside ? <MapPin className="h-5 w-5 text-status-pending" /> : <CheckCircle className="h-5 w-5 text-status-approved" />}
          <div>
            <p className={`text-sm font-medium ${isOutside ? "text-status-pending" : "text-status-approved"}`}>
              {isOutside ? `Outside — ${lastOuting?.destination}` : "Inside hostel"}
            </p>
            {isOutside && lastOuting && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" /> Since {lastOuting.exitTimestamp?.toDate().toLocaleTimeString() || "Recently"}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Announcements */}
      <div>
        <h2 className="mb-3 text-sm font-semibold text-foreground">Recent Announcements</h2>
        <div className="space-y-2">
          {announcements.slice(0, 3).map((a) => (
            <div key={a.id} className="flex items-start gap-3 rounded-lg bg-card border border-border p-3">
              <Info className="h-4 w-4 text-resident mt-0.5" />
              <div>
                <p className="text-sm text-foreground font-medium">{a.title}</p>
                <p className="text-xs text-muted-foreground line-clamp-2">{a.body}</p>
              </div>
            </div>
          ))}
          {announcements.length === 0 && (
            <p className="text-xs text-center text-muted-foreground py-4">No recent announcements</p>
          )}
        </div>
      </div>

      {/* Link student dialog */}
      <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
        <DialogContent className="bg-card border-border max-w-sm">
          <DialogHeader>
            <DialogTitle>{student ? "Change Linked Student" : "Link Student Account"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <p className="text-xs text-muted-foreground">
              Ask your child to open the app → Profile page → copy their UID and share it with you.
            </p>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Student UID</Label>
              <Input
                placeholder="Paste student's UID here"
                value={newStudentUid}
                onChange={(e) => setNewStudentUid(e.target.value)}
                className="bg-secondary h-11 font-mono text-sm"
              />
            </div>
            <Button
              className="w-full gap-2 bg-parent hover:bg-parent/90 text-white"
              onClick={handleLinkStudent}
              disabled={isLinking || !newStudentUid.trim()}
            >
              {isLinking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Link2 className="h-4 w-4" />}
              {student ? "Update Link" : "Link Student"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ParentHome;
