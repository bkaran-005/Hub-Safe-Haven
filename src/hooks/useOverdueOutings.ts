import { useState, useEffect } from "react";
import { watchAllOutings, OutingRequest } from "@/services/outingService";

/**
 * Returns all outings where the student is currently outside (status === "exited")
 * AND the return deadline has already passed.
 * Updates every minute so the list stays fresh without a page reload.
 */
export const useOverdueOutings = () => {
  const [allExited, setAllExited] = useState<OutingRequest[]>([]);
  const [now, setNow] = useState(new Date());

  // Real-time listener for all exited outings
  useEffect(() => {
    const unsubscribe = watchAllOutings((outings) => {
      setAllExited(outings.filter((o) => o.status === "exited"));
    });
    return () => unsubscribe();
  }, []);

  // Re-check every 60 seconds so overdue alerts appear without refreshing
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);

  const overdueOutings = allExited.filter((o) => {
    const deadline = new Date(`${o.toDate}T${o.toTime}:00`);
    return now > deadline;
  }).map((o) => {
    const deadline = new Date(`${o.toDate}T${o.toTime}:00`);
    const minutesOverdue = Math.round((now.getTime() - deadline.getTime()) / 60_000);
    return { ...o, minutesOverdue };
  });

  return { overdueOutings };
};
