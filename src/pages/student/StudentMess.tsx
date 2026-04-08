import { studentData } from "@/data/dummyData";
import { CreditCard, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";

const StudentMess = () => (
  <div className="space-y-6 pb-20 p-4">
    <h1 className="text-xl font-bold text-foreground">Mess</h1>
    
    <div className="rounded-lg bg-card border border-border p-6 text-center space-y-2">
      <Wallet className="mx-auto h-8 w-8 text-resident" />
      <p className="text-sm text-muted-foreground">Current Balance</p>
      <p className="text-3xl font-bold text-foreground">₹{studentData.messBalance}</p>
    </div>

    <div className="rounded-lg bg-card border border-border p-4 space-y-3">
      <h2 className="text-sm font-semibold text-foreground">Recent Transactions</h2>
      {[
        { label: "April Mess Fee", amount: -4500, date: "Apr 01" },
        { label: "Top-up", amount: 5000, date: "Mar 28" },
        { label: "March Mess Fee", amount: -4500, date: "Mar 01" },
      ].map((t, i) => (
        <div key={i} className="flex items-center justify-between border-t border-border pt-2">
          <div>
            <p className="text-sm text-foreground">{t.label}</p>
            <p className="text-xs text-muted-foreground">{t.date}</p>
          </div>
          <span className={t.amount > 0 ? "text-sm text-status-approved" : "text-sm text-status-rejected"}>
            {t.amount > 0 ? "+" : ""}₹{Math.abs(t.amount)}
          </span>
        </div>
      ))}
    </div>

    <Button className="w-full gap-2">
      <CreditCard className="h-4 w-4" /> Pay Mess Fee
    </Button>
  </div>
);

export default StudentMess;
