import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { usePortfolio } from "@/hooks/use-stocks";
import { cn } from "@/lib/utils";
import { Loader2, TrendingUp, TrendingDown } from "lucide-react";
import { Link } from "wouter";

export default function PortfolioPage() {
  const { data: portfolio, isLoading } = usePortfolio();

  const totalValue = portfolio?.reduce((acc, item) => acc + item.currentValue, 0) || 0;
  const totalGainLoss = portfolio?.reduce((acc, item) => acc + item.gainLoss, 0) || 0;

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <Sidebar />
      <div className="flex-1 md:ml-64 flex flex-col">
        <Header title="My Portfolio" />
        
        <main className="p-8 flex-1 overflow-y-auto">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-card border border-border rounded-2xl p-6">
              <h3 className="text-muted-foreground mb-2">Total Equity</h3>
              <div className="font-display text-4xl font-bold text-white">
                ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div className="bg-card border border-border rounded-2xl p-6">
              <h3 className="text-muted-foreground mb-2">Total Gain/Loss</h3>
              <div className={cn(
                "font-display text-4xl font-bold flex items-center gap-2",
                totalGainLoss >= 0 ? "text-green-500" : "text-red-500"
              )}>
                {totalGainLoss >= 0 ? "+" : "-"}${Math.abs(totalGainLoss).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                {totalGainLoss >= 0 ? <TrendingUp className="h-8 w-8" /> : <TrendingDown className="h-8 w-8" />}
              </div>
            </div>
          </div>

          {/* Holdings Table */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-border">
              <h3 className="font-display font-bold text-xl">Current Holdings</h3>
            </div>
            
            {isLoading ? (
              <div className="p-12 flex justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : portfolio && portfolio.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-background/50 border-b border-border text-left">
                      <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Symbol</th>
                      <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Shares</th>
                      <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Avg Price</th>
                      <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Market Value</th>
                      <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Gain/Loss</th>
                      <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {portfolio.map((item) => (
                      <tr key={item.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-bold text-white text-lg">{item.symbol}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right font-mono text-white">
                          {item.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right font-mono text-muted-foreground">
                          ${Number(item.averagePrice).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right font-mono text-white font-medium">
                          ${item.currentValue.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <span className={cn(
                            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                            item.gainLoss >= 0 ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                          )}>
                            {item.gainLoss >= 0 ? "+" : ""}${item.gainLoss.toFixed(2)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                           <Link href={`/trade?symbol=${item.symbol}`} className="text-primary hover:text-primary/80 font-medium text-sm">
                             Trade
                           </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center">
                <p className="text-muted-foreground mb-4">You don't have any holdings yet.</p>
                <Link href="/trade" className="inline-flex items-center justify-center px-6 py-2 border border-transparent text-sm font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary/90">
                  Start Trading
                </Link>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
