import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { useStock, useStockHistory, useTrade } from "@/hooks/use-stocks";
import { useAuth } from "@/hooks/use-auth";
import { Search, Loader2 } from "lucide-react";
import { StockChart } from "@/components/StockChart";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";

export default function TradePage() {
  const [symbol, setSymbol] = useState("AAPL");
  const [searchInput, setSearchInput] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [orderType, setOrderType] = useState<'buy' | 'sell'>('buy');
  const [location] = useLocation();
  
  const { data: stock, isLoading: isStockLoading } = useStock(symbol);
  const { data: history, isLoading: isHistoryLoading } = useStockHistory(symbol);
  const { user } = useAuth();
  const tradeMutation = useTrade();

  // Parse query param on load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const symbolParam = params.get("symbol");
    if (symbolParam) setSymbol(symbolParam);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput) {
      setSymbol(searchInput.toUpperCase());
      setSearchInput("");
    }
  };

  const cashBalance = user ? Number(user.balance) : 0;
  const estimatedTotal = stock ? stock.price * quantity : 0;
  const canAfford = orderType === 'buy' ? cashBalance >= estimatedTotal : true; // Simplified sell check

  const handleTrade = () => {
    tradeMutation.mutate({
      symbol,
      type: orderType,
      quantity
    }, {
      onSuccess: () => {
        setQuantity(1);
      }
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <Sidebar />
      <div className="flex-1 md:ml-64 flex flex-col">
        <Header title="Trade Terminal" />
        
        <main className="p-8 flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="relative max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search symbol (e.g., MSFT, GOOGL)..."
                className="w-full bg-card border border-border rounded-xl pl-12 pr-4 py-4 text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none shadow-sm"
              />
            </form>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Chart & Info */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-card border border-border rounded-2xl p-6 min-h-[400px] flex flex-col">
                  {isStockLoading ? (
                    <div className="flex-1 flex items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : stock ? (
                    <>
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <h2 className="text-3xl font-display font-bold text-white">{stock.symbol}</h2>
                          <p className="text-muted-foreground">Real-time Data</p>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-mono font-medium text-white">${stock.price.toFixed(2)}</div>
                          <div className={cn(
                            "font-medium",
                            stock.change >= 0 ? "text-green-500" : "text-red-500"
                          )}>
                            {stock.change >= 0 ? "+" : ""}{stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex-1 w-full h-[300px]">
                        {history ? (
                          <StockChart data={history} color={stock.change >= 0 ? "#22c55e" : "#ef4444"} />
                        ) : (
                          <div className="h-full flex items-center justify-center text-muted-foreground">Loading chart...</div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-muted-foreground">
                      Symbol not found
                    </div>
                  )}
                </div>
              </div>

              {/* Order Form */}
              <div className="bg-card border border-border rounded-2xl p-6 h-fit sticky top-24">
                <h3 className="font-display font-bold text-xl mb-6">Place Order</h3>
                
                <div className="grid grid-cols-2 gap-2 p-1 bg-background/50 rounded-xl mb-6">
                  <button
                    onClick={() => setOrderType('buy')}
                    className={cn(
                      "py-2.5 rounded-lg text-sm font-bold transition-all",
                      orderType === 'buy' ? "bg-green-500 text-white shadow-lg" : "text-muted-foreground hover:bg-white/5"
                    )}
                  >
                    Buy
                  </button>
                  <button
                    onClick={() => setOrderType('sell')}
                    className={cn(
                      "py-2.5 rounded-lg text-sm font-bold transition-all",
                      orderType === 'sell' ? "bg-blue-500 text-white shadow-lg" : "text-muted-foreground hover:bg-white/5"
                    )}
                  >
                    Sell
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Quantity</span>
                      <span className="text-muted-foreground">Shares</span>
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 0))}
                        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white font-mono text-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                      />
                    </div>
                  </div>

                  <div className="bg-background/30 rounded-xl p-4 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Market Price</span>
                      <span className="text-white font-mono">${stock?.price.toFixed(2) || '0.00'}</span>
                    </div>
                    <div className="h-[1px] bg-border/50" />
                    <div className="flex justify-between text-base font-bold">
                      <span className="text-white">Estimated Total</span>
                      <span className="text-white font-mono">${estimatedTotal.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  {orderType === 'buy' && (
                     <div className="text-xs text-muted-foreground text-center">
                        Available Balance: <span className="text-white">${cashBalance.toFixed(2)}</span>
                     </div>
                  )}

                  <button
                    onClick={handleTrade}
                    disabled={!stock || tradeMutation.isPending || !canAfford}
                    className={cn(
                      "w-full py-4 rounded-xl font-bold text-lg transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none",
                      orderType === 'buy' 
                        ? "bg-green-500 hover:bg-green-600 text-white shadow-green-500/25 hover:shadow-green-500/40" 
                        : "bg-blue-500 hover:bg-blue-600 text-white shadow-blue-500/25 hover:shadow-blue-500/40"
                    )}
                  >
                    {tradeMutation.isPending ? (
                      <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    ) : !canAfford ? (
                      "Insufficient Funds"
                    ) : (
                      `${orderType === 'buy' ? 'Buy' : 'Sell'} ${symbol}`
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
