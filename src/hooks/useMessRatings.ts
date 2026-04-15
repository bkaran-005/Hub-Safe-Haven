import { useState, useEffect } from "react";
import { watchTodayRatings, getStudentRatings, FoodRating } from "@/services/messService";

export const useMessRatings = (studentId?: string, date?: string) => {
  const [todayRatings, setTodayRatings] = useState<FoodRating[]>([]);
  const [myRatings, setMyRatings] = useState<FoodRating[]>([]);
  const [loading, setLoading] = useState(true);

  const targetDate = date || new Date().toISOString().split("T")[0];

  useEffect(() => {
    // Watch all ratings for cumulative view (Warden or Analytics)
    const unsubscribe = watchTodayRatings(targetDate, (ratings) => {
      setTodayRatings(ratings);
      setLoading(false);
    }, (error) => {
      console.error("Mess Ratings Error:", error);
      setLoading(false); // Stop loading even on error
    });

    // Fetch specific student's ratings for the day
    if (studentId) {
      getStudentRatings(studentId, targetDate).then(setMyRatings);
    }

    return () => unsubscribe();
  }, [studentId, targetDate]);

  const getCumulativeStats = () => {
    const stats = {
      breakfast: { avg: 0, count: 0 },
      lunch: { avg: 0, count: 0 },
      dinner: { avg: 0, count: 0 }
    };

    todayRatings.forEach(r => {
      stats[r.meal].count += 1;
      stats[r.meal].avg += r.rating;
    });

    ["breakfast", "lunch", "dinner"].forEach(m => {
      const meal = m as keyof typeof stats;
      if (stats[meal].count > 0) {
        stats[meal].avg = parseFloat((stats[meal].avg / stats[meal].count).toFixed(1));
      }
    });

    return stats;
  };

  return { todayRatings, myRatings, cumulativeStats: getCumulativeStats(), loading };
};
