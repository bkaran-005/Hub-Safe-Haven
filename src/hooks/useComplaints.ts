import { useState, useEffect } from "react";
import { watchComplaints, watchStudentComplaints, Complaint } from "@/services/complaintService";

export const useComplaints = (studentId?: string) => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe: () => void;
    
    const onData = (data: Complaint[]) => {
      setComplaints(data);
      setLoading(false);
    };

    const onError = (error: any) => {
      console.error("Complaints hook error:", error);
      setLoading(false);
    };

    if (studentId) {
      unsubscribe = watchStudentComplaints(studentId, onData, onError);
    } else {
      unsubscribe = watchComplaints(onData, onError);
    }

    return () => unsubscribe && unsubscribe();
  }, [studentId]);

  return { complaints, loading };
};
