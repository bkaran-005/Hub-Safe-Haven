import { useState, useEffect } from "react";
import { getStudentByParentUid, UserProfile } from "@/services/authService";

export const useStudentForParent = (parentUid: string | undefined) => {
  const [student, setStudent] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!parentUid) return;

    const fetchStudent = async () => {
      setLoading(true);
      try {
        const data = await getStudentByParentUid(parentUid);
        setStudent(data);
      } catch (e) {
        console.error("Error fetching student for parent:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, [parentUid]);

  return { student, loading };
};
