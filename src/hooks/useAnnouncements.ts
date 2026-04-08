import { useState, useEffect } from "react";
import { watchAnnouncements, Announcement } from "@/services/announcementService";

export const useAnnouncements = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = watchAnnouncements((data) => {
      setAnnouncements(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { announcements, loading };
};
