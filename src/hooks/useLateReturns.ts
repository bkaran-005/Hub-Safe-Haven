import { useState, useEffect } from "react";
import { watchLateReturns, OutingRequest } from "@/services/outingService";

export const useLateReturns = () => {
  const [lateReturns, setLateReturns] = useState<OutingRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = watchLateReturns(
      (outings) => {
        setLateReturns(outings);
        setLoading(false);
      },
      (error) => {
        console.error("Error watching late returns:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { lateReturns, loading };
};
