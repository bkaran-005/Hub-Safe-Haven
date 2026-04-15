import { useState, useEffect } from "react";
import { AlertCircle, MapPin, X, CheckCircle, Navigation } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { watchActiveSOS, resolveSOS, SOSLog } from "@/services/sosService";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { useToast } from "@/components/ui/use-toast";

export const SOSAlert = () => {
  const { role, profile, isLoggedIn } = useAuth();
  const { toast } = useToast();
  const [activeSOS, setActiveSOS] = useState<SOSLog[]>([]);
  const [isResolving, setIsResolving] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoggedIn || role === "resident") return;

    const unsubscribe = watchActiveSOS((logs) => {
      // Warden sees all active SOS
      if (role === "warden") {
        setActiveSOS(logs);
      } 
      // Parent only sees their resident's SOS
      else if (role === "parent" && profile?.studentUid) {
        const filtered = logs.filter(log => log.studentId === profile.studentUid);
        setActiveSOS(filtered);
      }
    }, (error) => {
      console.error("SOS Alert Index Error:", error);
    });

    return () => unsubscribe();
  }, [isLoggedIn, role, profile]);

  const handleResolve = async (id: string) => {
    setIsResolving(id);
    try {
      await resolveSOS(id);
      toast({
        title: "Emergency Resolved",
        description: "The SOS alert has been cleared for everyone.",
      });
    } catch (e: any) {
      console.error(e);
      toast({
        title: "Resolution Failed",
        description: e.message || "Could not resolve SOS. Please check your connection.",
        variant: "destructive",
      });
    } finally {
      setIsResolving(null);
    }
  };

  if (activeSOS.length === 0) return null;

  return (
    <div className="fixed inset-x-0 top-0 z-[100] p-4 flex flex-col gap-3 pointer-events-none">
      {activeSOS.map((sos) => (
        <div 
          key={sos.id}
          className="pointer-events-auto bg-status-rejected text-white p-4 rounded-xl shadow-2xl animate-in slide-in-from-top-4 duration-500 border-2 border-white/20"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 animate-pulse" />
                <h2 className="font-bold text-lg uppercase tracking-tight">Emergency SOS</h2>
              </div>
              <p className="font-semibold text-white/90">
                {sos.studentName} is in trouble!
              </p>
              <div className="text-xs text-white/80 space-y-0.5">
                <p>Room: {sos.roomNo} | Phone: {sos.phone}</p>
                <p>
                  {sos.latitude !== 0 
                    ? `Location: ${sos.latitude.toFixed(4)}, ${sos.longitude.toFixed(4)}`
                    : "⚠️ Location not shared by device"}
                </p>
                <p>Triggered at: {sos.timestamp?.toDate().toLocaleTimeString()}</p>
              </div>
            </div>
            {role === "warden" && (
              <button 
                onClick={() => sos.id && handleResolve(sos.id)}
                disabled={isResolving === sos.id}
                className="p-1 hover:bg-white/10 rounded-full transition-colors disabled:opacity-50"
                title="Mark as Resolved"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          <div className="mt-4 flex gap-2">
            {sos.latitude !== 0 && (
              <Button 
                variant="outline" 
                size="sm"
                className="flex-1 bg-white text-status-rejected hover:bg-white/90 border-none gap-2 h-10 font-bold"
                onClick={() => window.open(`https://www.google.com/maps?q=${sos.latitude},${sos.longitude}`, "_blank")}
              >
                <Navigation className="h-4 w-4" /> VIEW ON MAP
              </Button>
            )}
            {role === "warden" && (
              <Button 
                variant="ghost" 
                size="sm"
                className="flex-1 text-white hover:bg-white/10 border border-white/20 gap-2 h-10 font-bold"
                onClick={() => sos.id && handleResolve(sos.id)}
                disabled={isResolving === sos.id}
              >
                {isResolving === sos.id ? (
                  <span className="flex items-center gap-2"><div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" /> Resolving...</span>
                ) : (
                  <span className="flex items-center gap-2"><CheckCircle className="h-4 w-4" /> RESOLVE</span>
                )}
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
