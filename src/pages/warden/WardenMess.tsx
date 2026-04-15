import { Star, Utensils, MessageSquare, Loader2 } from "lucide-react";
import { useMessRatings } from "@/hooks/useMessRatings";
import { getTodayMenu } from "@/services/messService";
import { cn } from "@/lib/utils";

const WardenMess = () => {
  const today = new Date().toISOString().split("T")[0];
  const { todayRatings, cumulativeStats, loading } = useMessRatings(undefined, today);
  const menu = getTodayMenu();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const MealDetail = (meal: "breakfast" | "lunch" | "dinner") => {
    const mealRatings = todayRatings.filter(r => r.meal === meal);
    
    return (
      <div key={meal} className="space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-2">
          <div>
            <h2 className="text-lg font-bold capitalize text-foreground">{meal}</h2>
            <p className="text-sm text-muted-foreground">{menu[meal]}</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-status-pending">
              <Star className="h-4 w-4 fill-current" />
              <span className="text-lg font-bold">{cumulativeStats[meal].avg || "-"}</span>
            </div>
            <p className="text-[10px] text-muted-foreground">{cumulativeStats[meal].count} reviews</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2">
          {mealRatings.map((r) => (
            <div key={r.id} className="p-3 rounded-lg bg-card border border-border space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground">{r.studentName}</span>
                <div className="flex items-center gap-0.5">
                  <Star className="h-3 w-3 fill-status-pending text-status-pending" />
                  <span className="text-xs font-bold">{r.rating}</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground italic leading-relaxed">
                "{r.remarks || "No remarks provided"}"
              </p>
            </div>
          ))}
          {mealRatings.length === 0 && (
            <p className="text-xs text-muted-foreground py-4 text-center">No reviews yet for {meal}</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 pb-24 p-4">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-warden/10 text-warden">
          <Utensils className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Mess Monitoring</h1>
          <p className="text-sm text-muted-foreground">Detailed student feedback for today</p>
        </div>
      </div>

      <div className="space-y-10">
        {MealDetail("breakfast")}
        {MealDetail("lunch")}
        {MealDetail("dinner")}
      </div>
    </div>
  );
};

export default WardenMess;
