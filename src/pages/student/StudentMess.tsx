import { useState } from "react";
import { CreditCard, Wallet, Loader2, CheckCircle2, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useMess } from "@/hooks/useMess";
import { toggleMealOptIn, savePayment } from "@/services/messService";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

const StudentMess = () => {
  const { profile } = useAuth();
  const currentMonth = new Date().toISOString().slice(0, 7);
  const today = new Date().toISOString().split("T")[0];
  
  const { mealOptins, payments, loading } = useMess(profile?.uid, currentMonth);
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

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

  if (loading) {
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
