import { QRCodeSVG } from "qrcode.react";
import { studentData, outings } from "@/data/dummyData";
import { MapPin, Clock } from "lucide-react";

const StudentQR = () => {
  const approvedOuting = outings.find((o) => o.student === "Priya Sharma" && o.status === "approved" && !o.returnTime);
  const qrData = JSON.stringify({ student: studentData.name, room: studentData.room, outing: approvedOuting?.id || "none" });

  return (
    <div className="flex min-h-[calc(100vh-5rem)] flex-col items-center justify-center space-y-6 p-4 pb-20">
      <div className="rounded-2xl bg-card border border-border p-8">
        <QRCodeSVG value={qrData} size={200} bgColor="transparent" fgColor="hsl(210, 40%, 96%)" />
      </div>

      <p className="text-sm text-muted-foreground text-center">Show this to the warden at the gate</p>

      {approvedOuting ? (
        <div className="w-full max-w-xs rounded-lg bg-card border border-border p-4 space-y-2">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-resident" />
            <span className="text-sm font-medium text-foreground">{approvedOuting.destination}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{new Date(approvedOuting.from).toLocaleString()} — {new Date(approvedOuting.returnBy).toLocaleString()}</span>
          </div>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">No active approved outing</p>
      )}
    </div>
  );
};

export default StudentQR;
