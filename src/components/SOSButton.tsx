import { useState } from "react";
import { AlertCircle, Loader2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { triggerSOS } from "@/services/sosService";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

export const SOSButton = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [isTriggeing, setIsTriggering] = useState(false);
  const [open, setOpen] = useState(false);

  const handleSOS = async () => {
    if (!profile) return;
    setIsTriggering(true);

    if (!navigator.geolocation) {
      toast({
        title: "Geolocation Error",
        description: "Your browser doesn't support geolocation. Sending SOS without coordinates.",
        variant: "destructive",
      });
      try {
        await triggerSOS(profile.uid, profile.name, 0, 0, profile.roomNo, profile.phone);
        toast({ title: "SOS TRIGGERED", description: "Warden has been notified!", variant: "destructive" });
        setOpen(false);
      } catch (e: any) {
        toast({ title: "Error", description: e.message, variant: "destructive" });
      } finally {
        setIsTriggering(false);
      }
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          await triggerSOS(
            profile.uid,
            profile.name,
            position.coords.latitude,
            position.coords.longitude,
            profile.roomNo,
            profile.phone
          );
          toast({ title: "SOS TRIGGERED", description: "Warden has been notified with your location!", variant: "destructive" });
          setOpen(false);
        } catch (e: any) {
          toast({ title: "Error", description: e.message, variant: "destructive" });
        } finally {
          setIsTriggering(false);
        }
      },
      async (err) => {
        console.error(err);
        toast({
          title: "Location Permission Denied",
          description: "Sending SOS without location.",
          variant: "destructive",
        });
        try {
          await triggerSOS(profile.uid, profile.name, 0, 0, profile.roomNo, profile.phone);
          toast({ title: "SOS TRIGGERED", description: "Warden has been notified!", variant: "destructive" });
          setOpen(false);
        } catch (e: any) {
          toast({ title: "Error", description: e.message, variant: "destructive" });
        } finally {
          setIsTriggering(false);
        }
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="destructive" 
          className="w-full gap-2 h-14 text-lg font-bold shadow-lg animate-pulse hover:animate-none"
        >
          <AlertCircle className="h-6 w-6" /> TRIGGER SOS
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-status-rejected flex items-center gap-2">
            <AlertCircle className="h-6 w-6" /> Confirm SOS
          </DialogTitle>
          <DialogDescription>
            Are you in an emergency? This will alert the warden and share your current location.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col gap-2 pt-4">
          <Button 
            variant="destructive" 
            className="w-full text-lg h-12" 
            onClick={handleSOS} 
            disabled={isTriggeing}
          >
            {isTriggeing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            YES, I NEED HELP
          </Button>
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={isTriggeing}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
