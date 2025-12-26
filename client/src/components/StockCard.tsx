import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface StockCardProps {
  symbol: string;
  name?: string;
  price: number;
  change: number;
  changePercent: number;
  onClick?: () => void;
}

export function StockCard({ symbol, name, price, change, changePercent, onClick }: StockCardProps) {
  const isPositive = change >= 0;

  return (
    <div 
      onClick={onClick}
      className={cn(
        "bg-card rounded-2xl p-5 border border-border/50 hover:border-border transition-all duration-300 group cursor-pointer hover:shadow-lg hover:-translate-y-1 relative overflow-hidden",
      )}
    >
      <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded-md">TRADE</div>
      </div>

      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-display font-bold text-xl text-white">{symbol}</h3>
          <p className="text-xs text-muted-foreground font-medium mt-1">{name || "Stock Equity"}</p>
        </div>
        <div className={cn(
          "h-10 w-10 rounded-full flex items-center justify-center",
          isPositive ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
        )}>
          {isPositive ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
        </div>
      </div>

      <div className="flex items-end justify-between">
        <div className="font-mono text-2xl text-white font-medium">
          ${price.toFixed(2)}
        </div>
        <div className={cn(
          "text-sm font-medium flex items-center gap-1",
          isPositive ? "text-green-500" : "text-red-500"
        )}>
          {isPositive ? "+" : ""}{change.toFixed(2)} ({changePercent.toFixed(2)}%)
        </div>
      </div>
    </div>
  );
}
