import { useState, useEffect } from "react";
import { getMonthAttendance, AttendanceRecord } from "@/services/attendanceService";

export const useAttendance = (studentId: string | undefined, month: string) => {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ present: 0, total: 0, percentage: 0 });

  useEffect(() => {
    if (!studentId) return;

    const fetchAttendance = async () => {
      setLoading(true);
      try {
        const data = await getMonthAttendance(studentId, month);
        setAttendance(data);
        
        const present = data.filter(r => r.present).length;
        const total = data.length;
        const percentage = total > 0 ? (present / total) * 100 : 0;
        
        setStats({ present, total, percentage });
      } catch (error) {
        console.error("Attendance fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [studentId, month]);

  return { attendance, stats, loading };
};
