import { useState, useEffect } from "react";
import { watchPendingOutings, OutingRequest } from "@/services/outingService";

export const usePendingOutings = () => {
  const [pendingOutings, setPendingOutings] = useState<OutingRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = watchPendingOutings(
      (data) => {
        setPendingOutings(data);
        setLoading(false);
      },
      (error) => {
        console.error("Outings hook error:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { pendingOutings, loading };
};
