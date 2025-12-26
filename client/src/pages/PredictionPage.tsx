import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { usePrediction } from "@/hooks/use-stocks";
import { BrainCircuit, Search, Loader2, Info } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend } from 'recharts';
import { format } from 'date-fns';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function PredictionPage() {
  const [symbol, setSymbol] = useState("AAPL");
  const predictMutation = usePrediction();
  const [predictionData, setPredictionData] = useState<any>(null);

  const handlePredict = (e: React.FormEvent) => {
    e.preventDefault();
    predictMutation.mutate(symbol, {
      onSuccess: (data) => setPredictionData(data),
    });
  };

  // Combine actual and predicted data for chart
  const chartData = predictionData ? [
    ...predictionData.actual.map((d: any) => ({ ...d, type: 'Historical' })),
    ...predictionData.predicted.map((d: any) => ({ ...d, type: 'Predicted' }))
  ] : [];

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <Sidebar />
      <div className="flex-1 md:ml-64 flex flex-col">
        <Header title="AI Market Forecast" />
        
        <main className="p-8 flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            
            <div className="bg-gradient-to-r from-primary/20 to-blue-600/20 border border-primary/20 rounded-2xl p-8 mb-8 flex items-center gap-6">
              <div className="bg-primary/20 p-4 rounded-xl">
                <BrainCircuit className="h-10 w-10 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-display font-bold text-white mb-2">AI-Powered Price Prediction</h2>
                <p className="text-muted-foreground">
                  Our advanced machine learning model analyzes historical patterns to forecast future stock movements.
                  <span className="block mt-1 text-xs opacity-70 italic">For educational purposes only. Not financial advice.</span>
                </p>
              </div>
            </div>

            <form onSubmit={handlePredict} className="flex gap-4 mb-8">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                  className="w-full bg-card border border-border rounded-xl pl-12 pr-4 py-4 text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                  placeholder="Enter symbol (e.g. TSLA)"
                />
              </div>
              <button 
                type="submit"
                disabled={predictMutation.isPending}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 rounded-xl font-bold transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
              >
                {predictMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : "Run Forecast"}
              </button>
            </form>

            {predictionData && (
              <div className="bg-card border border-border rounded-2xl p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-white">{predictionData.symbol} Forecast</h3>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Next Day Prediction</div>
                    <div className="text-2xl font-mono font-bold text-primary">
                      ${predictionData.nextDayPrediction.toFixed(2)}
                    </div>
                  </div>
                </div>

                <div className="h-[400px] w-full">
                   <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorPred" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid vertical={false} strokeDasharray="3 3" strokeOpacity={0.1} />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fill: '#64748b', fontSize: 12 }} 
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(str) => format(new Date(str), 'MMM d')}
                        minTickGap={30}
                      />
                      <YAxis 
                        domain={['auto', 'auto']}
                        tick={{ fill: '#64748b', fontSize: 12 }} 
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(val) => `$${val.toFixed(0)}`}
                        width={60}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          borderColor: 'hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                        itemStyle={{ color: '#fff' }}
                        labelFormatter={(label) => format(new Date(label), 'MMM d, yyyy')}
                      />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="price" 
                        name="Historical Data"
                        stroke="#3b82f6" 
                        fill="url(#colorPrice)"
                        strokeWidth={2}
                        connectNulls
                        data={predictionData.actual}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="price" 
                        name="AI Prediction"
                        stroke="#a855f7" 
                        fill="url(#colorPred)" 
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        connectNulls
                        data={predictionData.predicted}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="mt-6 flex items-start gap-3 text-sm text-muted-foreground bg-background/50 p-4 rounded-xl border border-white/5">
                  <Info className="h-5 w-5 flex-shrink-0 text-primary" />
                  <p>
                    The prediction model uses a Long Short-Term Memory (LSTM) neural network trained on the last 180 days of price data. 
                    Dotted purple line indicates projected future movement.
                  </p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
