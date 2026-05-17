import { useState } from "react";
import {
  CreditCard, Wallet, Loader2, CheckCircle2, Circle,
  Star, UtensilsCrossed, Receipt, ThumbsUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useMess } from "@/hooks/useMess";
import { useMessRatings } from "@/hooks/useMessRatings";
import { toggleMealOptIn, savePayment, saveFoodRating, getTodayMenu } from "@/services/messService";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

type Tab = "today" | "review" | "payment";

const MEALS = ["breakfast", "lunch", "dinner"] as const;

const MEAL_TIMES: Record<string, string> = {
  breakfast: "7:30 – 9:00 AM",
  lunch:     "12:30 – 2:00 PM",
  dinner:    "7:30 – 9:00 PM",
};

const StudentMess = () => {
  const { profile } = useAuth();
  const currentMonth = new Date().toISOString().slice(0, 7);
  const today = new Date().toISOString().split("T")[0];

  const { mealOptins, payments, loading: messLoading } = useMess(profile?.uid, currentMonth);
  const { myRatings, loading: ratingsLoading } = useMessRatings(profile?.uid, today);
  const menu = getTodayMenu();
  const { toast } = useToast();

  const [tab, setTab] = useState<Tab>("today");
  const [isProcessing, setIsProcessing] = useState(false);
  const [ratings, setRatings] = useState<Record<string, { stars: number; remarks: string }>>({
    breakfast: { stars: 0, remarks: "" },
    lunch:     { stars: 0, remarks: "" },
    dinner:    { stars: 0, remarks: "" },
  });

  const handleToggleMeal = async (meal: typeof MEALS[number]) => {
    if (!profile) return;
    const currentStatus = mealOptins.find(m => m.date === today && m.meal === meal)?.opted ?? true;
    try {
      await toggleMealOptIn(profile.uid, today, meal, !currentStatus);
      toast({ title: currentStatus ? "Opted out" : "Opted in", description: `${meal.charAt(0).toUpperCase() + meal.slice(1)} updated for today.` });
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
      toast({ title: "Payment recorded", description: "Your mess fee has been saved." });
    } catch (e: any) {
      toast({ title: "Payment failed", description: e.message, variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRating = async (meal: typeof MEALS[number]) => {
    if (!profile) return;
    const { stars, remarks } = ratings[meal];
    if (stars === 0) {
      toast({ title: "Select stars", description: "Tap a star before submitting.", variant: "destructive" });
      return;
    }
    setIsProcessing(true);
    try {
      await saveFoodRating(profile.uid, profile.name, today, meal, stars, remarks);
      toast({ title: "Thanks for the feedback!", description: `${meal.charAt(0).toUpperCase() + meal.slice(1)} rating saved.` });
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

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "today",   label: "Today",   icon: UtensilsCrossed },
    { id: "review",  label: "Review",  icon: ThumbsUp        },
    { id: "payment", label: "Payment", icon: Receipt         },
  ];

  return (
    <div className="pb-24 p-4 space-y-4">
      <h1 className="text-xl font-bold text-foreground">Mess</h1>

      {/* Tab bar */}
      <div className="flex gap-2 rounded-xl bg-secondary/40 p-1">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-all",
                tab === t.id
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* ── TODAY'S MENU + OPT-IN ── */}
      {tab === "today" && (
        <div className="space-y-3 animate-in fade-in duration-200">
          <p className="text-xs text-muted-foreground">
            Today's menu — tap a meal to opt out if you won't be eating.
          </p>
          {MEALS.map((meal) => {
            const opted = mealOptins.find(m => m.date === today && m.meal === meal)?.opted ?? true;
            return (
              <button
                key={meal}
                onClick={() => handleToggleMeal(meal)}
                className={cn(
                  "w-full flex items-center justify-between rounded-xl border-2 p-4 transition-all active:scale-[0.98]",
                  opted
                    ? "bg-resident/10 border-resident/40 text-foreground"
                    : "bg-secondary/30 border-border text-muted-foreground line-through"
                )}
              >
                <div className="flex items-center gap-3 text-left">
                  <div className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                    opted ? "bg-resident/20" : "bg-secondary"
                  )}>
                    <UtensilsCrossed className={cn("h-4 w-4", opted ? "text-resident" : "text-muted-foreground")} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold capitalize">{meal}</p>
                    <p className="text-[10px] text-muted-foreground">{MEAL_TIMES[meal]}</p>
                    <p className="text-xs mt-0.5">{menu[meal]}</p>
                  </div>
                </div>
                {opted
                  ? <CheckCircle2 className="h-5 w-5 text-resident shrink-0" />
                  : <Circle className="h-5 w-5 text-muted-foreground shrink-0" />
                }
              </button>
            );
          })}
          <p className="text-[10px] text-center text-muted-foreground pt-1">
            Green = you're eating · Grey = opted out
          </p>
        </div>
      )}

      {/* ── FOOD REVIEW ── */}
      {tab === "review" && (
        <div className="space-y-3 animate-in fade-in duration-200">
          <p className="text-xs text-muted-foreground">
            Rate today's meals. You can submit once per meal per day.
          </p>
          {MEALS.map((meal) => {
            const existing = myRatings.find(r => r.meal === meal);
            const current = ratings[meal];
            return (
              <div key={meal} className="rounded-xl border border-border bg-card p-4 space-y-3">
                {/* Meal header */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{meal}</p>
                    <p className="text-sm font-medium text-foreground mt-0.5">{menu[meal]}</p>
                  </div>
                  {existing && (
                    <div className="flex items-center gap-1 bg-resident/10 px-2.5 py-1 rounded-full">
                      <Star className="h-3.5 w-3.5 fill-resident text-resident" />
                      <span className="text-sm font-bold text-resident">{existing.rating}</span>
                    </div>
                  )}
                </div>

                {existing ? (
                  /* Already rated */
                  <div className="flex items-center gap-1">
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} className={cn("h-5 w-5", s <= existing.rating ? "fill-resident text-resident" : "text-muted-foreground/30")} />
                    ))}
                    {existing.remarks && (
                      <p className="ml-2 text-xs italic text-muted-foreground">"{existing.remarks}"</p>
                    )}
                  </div>
                ) : (
                  /* Rate now */
                  <div className="space-y-2">
                    <div className="flex items-center gap-1">
                      {[1,2,3,4,5].map(s => (
                        <Star
                          key={s}
                          onClick={() => setRatings(prev => ({ ...prev, [meal]: { ...prev[meal], stars: s } }))}
                          className={cn(
                            "h-7 w-7 cursor-pointer transition-all",
                            current.stars >= s ? "fill-resident text-resident scale-110" : "text-muted-foreground/40 hover:text-resident/50"
                          )}
                        />
                      ))}
                      {current.stars > 0 && (
                        <span className="ml-1 text-xs text-muted-foreground">
                          {["","Poor","Fair","Good","Great","Excellent"][current.stars]}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Optional remarks..."
                        className="h-9 text-xs bg-secondary/50"
                        value={current.remarks}
                        onChange={(e) => setRatings(prev => ({ ...prev, [meal]: { ...prev[meal], remarks: e.target.value } }))}
                      />
                      <Button
                        size="sm"
                        className="h-9 px-4 shrink-0"
                        onClick={() => handleRating(meal)}
                        disabled={isProcessing || current.stars === 0}
                      >
                        {isProcessing ? <Loader2 className="h-3 w-3 animate-spin" /> : "Submit"}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── PAYMENT ── */}
      {tab === "payment" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Balance card */}
          <div className="rounded-xl bg-card border border-border p-6 text-center space-y-1">
            <Wallet className="mx-auto h-8 w-8 text-resident mb-2" />
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Outstanding Balance</p>
            <p className="text-4xl font-extrabold text-foreground">₹0</p>
            <p className="text-xs text-muted-foreground">for {new Date().toLocaleString("default", { month: "long", year: "numeric" })}</p>
          </div>

          <Button
            className="w-full h-12 gap-2 text-base font-semibold"
            onClick={handlePayment}
            disabled={isProcessing}
          >
            {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
            Pay Mess Fee — ₹4500
          </Button>

          {/* Payment history */}
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Payment History</p>
            {payments.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border p-6 text-center">
                <Receipt className="mx-auto h-6 w-6 text-muted-foreground/30 mb-2" />
                <p className="text-xs text-muted-foreground">No payments recorded yet.</p>
              </div>
            ) : (
              payments.map((p) => (
                <div key={p.id} className="flex items-center justify-between rounded-xl bg-card border border-border px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">Mess Fee — {p.month}</p>
                    <p className="text-[10px] text-muted-foreground">{p.paidAt?.toDate().toLocaleDateString()} · {p.method}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-status-approved">₹{p.amount}</p>
                    <p className="text-[10px] text-muted-foreground">{p.receiptId}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentMess;
