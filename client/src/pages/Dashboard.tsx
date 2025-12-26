import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { StockCard } from "@/components/StockCard";
import { usePortfolio, useTransactions } from "@/hooks/use-stocks";
import { useLocation } from "wouter";
import { TrendingUp, AlertCircle, ArrowUpRight, ArrowDownRight, Activity } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { data: portfolio } = usePortfolio();
  const { data: transactions } = useTransactions();
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const totalValue = portfolio?.reduce((acc, item) => acc + item.currentValue, 0) || 0;
  const cashBalance = user?.balance ? Number(user.balance) : 0;
  const totalNetWorth = totalValue + cashBalance;

  // Mock Top Movers
  const topMovers = [
    { symbol: "AAPL", price: 175.43, change: 2.34, changePercent: 1.35 },
    { symbol: "TSLA", price: 245.67, change: -5.12, changePercent: -2.04 },
    { symbol: "NVDA", price: 460.18, change: 12.45, changePercent: 2.78 },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <Sidebar />
      <div className="flex-1 md:ml-64 flex flex-col">
        <Header title="Dashboard" />
        
        <main className="p-8 flex-1 overflow-y-auto">
          {/* Disclaimer */}
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 mb-8 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-yellow-200/80 leading-relaxed">
              <strong className="text-yellow-500">Educational Simulation:</strong> This platform is a simulation for educational purposes. All money is virtual and stock prices may be delayed or simulated. No real financial transactions occur here.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Net Worth Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-2 bg-gradient-to-br from-primary/20 to-card border border-border rounded-3xl p-8 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Activity className="h-32 w-32 text-primary" />
              </div>
              
              <h2 className="text-muted-foreground font-medium mb-2">Total Net Worth</h2>
              <div className="font-display text-5xl font-bold text-white tracking-tight mb-4">
                ${totalNetWorth.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              
              <div className="flex items-center gap-6 mt-8">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Portfolio Value</div>
                  <div className="font-mono text-xl text-white font-medium">${totalValue.toLocaleString()}</div>
                </div>
                <div className="w-[1px] h-10 bg-white/10" />
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Cash Balance</div>
                  <div className="font-mono text-xl text-white font-medium">${cashBalance.toLocaleString()}</div>
                </div>
              </div>
            </motion.div>

            {/* Quick Actions / Recent Activity */}
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.1 }}
               className="bg-card border border-border rounded-3xl p-6"
            >
              <h3 className="font-display font-bold text-lg mb-4">Recent Transactions</h3>
              <div className="space-y-4">
                {transactions && transactions.length > 0 ? (
                  transactions.slice(0, 4).map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "h-10 w-10 rounded-full flex items-center justify-center bg-card border border-border",
                          tx.type === 'buy' ? "text-green-500" : "text-blue-500"
                        )}>
                          {tx.type === 'buy' ? <ArrowDownRight className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
                        </div>
                        <div>
                          <div className="font-bold text-white">{tx.symbol}</div>
                          <div className="text-xs text-muted-foreground capitalize">{tx.type} • {tx.quantity} shares</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-medium text-white">${Number(tx.price).toFixed(2)}</div>
                        <div className="text-xs text-muted-foreground">{new Date(tx.timestamp || '').toLocaleDateString()}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground py-8">No recent transactions</div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Market Overview */}
          <div className="mt-8">
            <h2 className="font-display text-2xl font-bold mb-6">Market Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {topMovers.map((stock, i) => (
                <motion.div
                  key={stock.symbol}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + (i * 0.1) }}
                >
                  <StockCard 
                    {...stock}
                    onClick={() => setLocation(`/trade?symbol=${stock.symbol}`)}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// Helper util import
import { cn } from "@/lib/utils";
