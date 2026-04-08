import { useState, useEffect } from "react";
import { watchStudentOutings, OutingRequest } from "@/services/outingService";

export const useOutings = (studentId: string | undefined) => {
  const [outings, setOutings] = useState<OutingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    if (!studentId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = watchStudentOutings(
      studentId, 
      (data) => {
        setOutings(data);
        setLoading(false);
      },
      (err) => {
        console.error("Outings hook error:", err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [studentId]);

  return { outings, loading, error };
};
