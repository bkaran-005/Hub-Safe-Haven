import { useState, useEffect } from "react";
import { getMealOptins, getPaymentHistory, MealOptIn, Payment } from "@/services/messService";

export const useMess = (studentId: string | undefined, month: string) => {
  const [mealOptins, setMealOptins] = useState<MealOptIn[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!studentId) return;

    const fetchData = async () => {
      setLoading(true);
      const [optins, history] = await Promise.all([
        getMealOptins(studentId, month),
        getPaymentHistory(studentId)
      ]);
      setMealOptins(optins);
      setPayments(history);
      setLoading(false);
    };

    fetchData();
  }, [studentId, month]);

  return { mealOptins, payments, loading };
};
