import { useState } from "react";
import { CreditCard, Wallet, Loader2, CheckCircle2, Circle, Star, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useMess } from "@/hooks/useMess";
import { useMessRatings } from "@/hooks/useMessRatings";
import { toggleMealOptIn, savePayment, saveFoodRating, getTodayMenu } from "@/services/messService";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

const StudentMess = () => {
  const { profile } = useAuth();
  const currentMonth = new Date().toISOString().slice(0, 7);
  const today = new Date().toISOString().split("T")[0];
  
  const { mealOptins, payments, loading: messLoading } = useMess(profile?.uid, currentMonth);
  const { myRatings, loading: ratingsLoading } = useMessRatings(profile?.uid, today);
  const menu = getTodayMenu();
  const { toast } = useToast();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [ratings, setRatings] = useState<Record<string, { stars: number, remarks: string }>>({
    breakfast: { stars: 0, remarks: "" },
    lunch: { stars: 0, remarks: "" },
    dinner: { stars: 0, remarks: "" }
  });

  const handleToggleMeal = async (meal: "breakfast" | "lunch" | "dinner") => {
    if (!profile) return;
    const currentStatus = mealOptins.find(m => m.date === today && m.meal === meal)?.opted ?? true;
    
    try {
      await toggleMealOptIn(profile.uid, today, meal, !currentStatus);
      toast({ title: "Updated", description: `${meal.charAt(0).toUpperCase() + meal.slice(1)} status updated.` });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const handlePayment = async () => {
    if (!profile) return;
    setIsProcessing(true);
    try {
      await savePayment(profile.uid, {
        amount: 4500,
        month: currentMonth,
        receiptId: `REC-${Date.now().toString().slice(-6)}`,
        method: "UPI",
      });
      toast({ title: "Payment Successful", description: "Your mess fee payment has been recorded." });
    } catch (e: any) {
      toast({ title: "Payment Failed", description: e.message, variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRating = async (meal: "breakfast" | "lunch" | "dinner") => {
    if (!profile) return;
    const { stars, remarks } = ratings[meal];
    if (stars === 0) {
      toast({ title: "Rating Required", description: "Please select a star rating first.", variant: "destructive" });
      return;
    }
    
    setIsProcessing(true);
    try {
      await saveFoodRating(profile.uid, profile.name, today, meal, stars, remarks);
      toast({ title: "Thank You", description: `Your feedback for ${meal} has been recorded.` });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  if (messLoading || ratingsLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const mealStatus = (meal: "breakfast" | "lunch" | "dinner") => {
    const opted = mealOptins.find(m => m.date === today && m.meal === meal)?.opted ?? true;
    return (
      <button 
        key={meal}
        onClick={() => handleToggleMeal(meal)}
        className={cn(
          "flex items-center justify-between p-3 rounded-lg border transition-colors",
          opted ? "bg-resident/10 border-resident/30 text-resident" : "bg-secondary border-border text-muted-foreground"
        )}
      >
        <span className="text-sm font-medium capitalize">{meal}</span>
        {opted ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
      </button>
    );
  };

  const RatingCard = (meal: "breakfast" | "lunch" | "dinner") => {
    const existing = myRatings.find(r => r.meal === meal);
    const current = ratings[meal];

    return (
      <div key={meal} className="p-4 rounded-lg bg-secondary/30 border border-border space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase text-muted-foreground">{meal}</span>
            <p className="text-sm font-medium text-foreground">{menu[meal]}</p>
          </div>
          {existing ? (
            <div className="flex items-center gap-1 text-resident">
              <Star className="h-4 w-4 fill-current" />
              <span className="text-sm font-bold">{existing.rating}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star 
                  key={s}
                  onClick={() => setRatings(prev => ({ ...prev, [meal]: { ...prev[meal], stars: s } }))}
                  className={cn(
                    "h-5 w-5 cursor-pointer transition-all",
                    current.stars >= s ? "fill-resident text-resident scale-110" : "text-muted-foreground hover:text-resident/50"
                  )}
                />
              ))}
            </div>
          )}
        </div>

        {!existing ? (
          <div className="flex gap-2">
            <Input 
              placeholder="Add remarks..." 
              className="h-8 text-xs bg-background"
              value={current.remarks}
              onChange={(e) => setRatings(prev => ({ ...prev, [meal]: { ...prev[meal], remarks: e.target.value } }))}
            />
            <Button size="sm" className="h-8 px-3 text-xs" onClick={() => handleRating(meal)} disabled={isProcessing}>
              {isProcessing ? <Loader2 className="h-3 w-3 animate-spin" /> : "Submit"}
            </Button>
          </div>
        ) : (
          <p className="text-[10px] italic text-muted-foreground bg-background/50 p-2 rounded">
            "{existing.remarks || "No remarks provided"}"
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-20 p-4">
      <h1 className="text-xl font-bold text-foreground">Mess</h1>
      
      <div className="rounded-lg bg-card border border-border p-6 text-center space-y-2">
        <Wallet className="mx-auto h-8 w-8 text-resident" />
        <p className="text-sm text-muted-foreground">Outstanding Balance</p>
        <p className="text-3xl font-bold text-foreground">₹0</p>
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Meal Preference (Today)</h2>
        <div className="grid grid-cols-1 gap-2">
          {mealStatus("breakfast")}
          {mealStatus("lunch")}
          {mealStatus("dinner")}
        </div>
        <p className="text-[10px] text-muted-foreground text-center">Toggle to opt-out of specific meals for today</p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Food Review (Today)</h2>
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="space-y-3">
          {RatingCard("breakfast")}
          {RatingCard("lunch")}
          {RatingCard("dinner")}
        </div>
      </div>

      <div className="rounded-lg bg-card border border-border p-4 space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Payment History</h2>
        {payments.map((p) => (
          <div key={p.id} className="flex items-center justify-between border-t border-border pt-2 first:border-0 first:pt-0">
            <div>
              <p className="text-sm text-foreground">Mess Fee - {p.month}</p>
              <p className="text-[10px] text-muted-foreground">{p.paidAt?.toDate().toLocaleDateString()}</p>
            </div>
            <span className="text-sm font-bold text-status-approved">
              ₹{p.amount}
            </span>
          </div>
        ))}
        {payments.length === 0 && (
          <p className="text-xs text-center text-muted-foreground py-4">No recent payments</p>
        )}
      </div>

      <Button className="w-full gap-2" onClick={handlePayment} disabled={isProcessing}>
        {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
        Pay Mess Fee (₹4500)
      </Button>
    </div>
  );
};

export default StudentMess;
