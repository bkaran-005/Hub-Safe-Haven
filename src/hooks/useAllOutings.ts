import { useState, useEffect } from "react";
import { watchAllOutings, OutingRequest } from "@/services/outingService";

export const useAllOutings = () => {
  const [outings, setOutings] = useState<OutingRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = watchAllOutings((data) => {
      setOutings(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { outings, loading };
};
