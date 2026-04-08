import { studentData } from "@/data/dummyData";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { User, Mail, Phone, BookOpen, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

const StudentProfile = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const info = [
    { icon: Mail, label: "Email", value: studentData.email },
    { icon: Phone, label: "Phone", value: studentData.phone },
    { icon: BookOpen, label: "Course", value: studentData.course },
  ];

  return (
    <div className="space-y-6 pb-20 p-4">
      <h1 className="text-xl font-bold text-foreground">Profile</h1>

      <div className="flex flex-col items-center gap-3">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-resident/20">
          <User className="h-10 w-10 text-resident" />
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold text-foreground">{studentData.name}</p>
          <p className="text-sm text-muted-foreground">Room {studentData.room} • {studentData.year}</p>
        </div>
      </div>

      <div className="rounded-lg bg-card border border-border divide-y divide-border">
        {info.map((i) => {
          const Icon = i.icon;
          return (
            <div key={i.label} className="flex items-center gap-3 p-4">
              <Icon className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">{i.label}</p>
                <p className="text-sm text-foreground">{i.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <Button variant="destructive" className="w-full gap-2" onClick={handleLogout}>
        <LogOut className="h-4 w-4" /> Log Out
      </Button>
    </div>
  );
};

export default StudentProfile;
