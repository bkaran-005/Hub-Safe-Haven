import { QRCodeSVG } from "qrcode.react";
import { useAuth } from "@/contexts/AuthContext";
import { useOutings } from "@/hooks/useOutings";
import { MapPin, Clock, Loader2, AlertCircle } from "lucide-react";

const StudentQR = () => {
  const { profile } = useAuth();
  const { outings, loading } = useOutings(profile?.uid);

  // Find the most recent approved or exited outing
  const activeOuting = outings.find(
    (o) => (o.status === "approved" || o.status === "exited")
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-5rem)] flex-col items-center justify-center space-y-6 p-4 pb-20">
      <div className="rounded-3xl bg-white p-8 shadow-xl">
        {activeOuting ? (
          <QRCodeSVG value={activeOuting.id!} size={200} bgColor="white" fgColor="black" />
        ) : (
          <div className="h-[200px] w-[200px] flex flex-col items-center justify-center text-center gap-2 text-muted-foreground border-2 border-dashed border-border rounded-xl">
            <AlertCircle className="h-10 w-10 opacity-20" />
            <p className="text-[10px] uppercase font-bold tracking-tighter">No Active QR</p>
          </div>
        )}
      </div>

      <p className="text-sm text-muted-foreground text-center max-w-[200px]">
        {activeOuting ? "Show this to the warden at the gate" : "Request an outing and wait for approval to see your QR"}
      </p>

      {activeOuting ? (
        <div className="w-full max-w-xs rounded-xl bg-card border border-border p-4 space-y-2 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-resident" />
            <span className="text-sm font-medium text-foreground">{activeOuting.destination}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{activeOuting.fromDate} {activeOuting.fromTime} — {activeOuting.toDate} {activeOuting.toTime}</span>
          </div>
          <div className="pt-2 border-t border-border mt-2">
             <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-50">Status: {activeOuting.status}</span>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default StudentQR;
