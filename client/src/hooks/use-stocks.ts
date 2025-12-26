import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import type { TradeRequest } from "@shared/schema";

export function useStock(symbol: string) {
  return useQuery({
    queryKey: [api.stocks.get.path, symbol],
    queryFn: async () => {
      if (!symbol) return null;
      const url = buildUrl(api.stocks.get.path, { symbol });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch stock data");
      return api.stocks.get.responses[200].parse(await res.json());
    },
    enabled: !!symbol,
    refetchInterval: 5000, // Poll for live prices
  });
}

export function useStockHistory(symbol: string) {
  return useQuery({
    queryKey: [api.stocks.history.path, symbol],
    queryFn: async () => {
      if (!symbol) return null;
      const url = buildUrl(api.stocks.history.path, { symbol });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch history");
      return api.stocks.history.responses[200].parse(await res.json());
    },
    enabled: !!symbol,
  });
}

export function useTrade() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: TradeRequest) => {
      const res = await fetch(api.trade.execute.path, {
        method: api.trade.execute.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Trade failed");
      }
      return api.trade.execute.responses[200].parse(await res.json());
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [api.portfolio.get.path] });
      queryClient.invalidateQueries({ queryKey: [api.portfolio.history.path] });
      queryClient.invalidateQueries({ queryKey: [api.auth.me.path] }); // Update balance
      
      toast({
        title: "Trade Executed",
        description: `Successfully ${data.type === 'buy' ? 'bought' : 'sold'} ${data.quantity} shares of ${data.symbol}`,
        className: data.type === 'buy' ? "border-green-500/50" : "border-blue-500/50",
      });
    },
    onError: (error) => {
      toast({
        title: "Trade Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function usePortfolio() {
  return useQuery({
    queryKey: [api.portfolio.get.path],
    queryFn: async () => {
      const res = await fetch(api.portfolio.get.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch portfolio");
      return api.portfolio.get.responses[200].parse(await res.json());
    },
  });
}

export function useTransactions() {
  return useQuery({
    queryKey: [api.portfolio.history.path],
    queryFn: async () => {
      const res = await fetch(api.portfolio.history.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch transactions");
      return api.portfolio.history.responses[200].parse(await res.json());
    },
  });
}

export function usePrediction() {
  return useMutation({
    mutationFn: async (symbol: string) => {
      const res = await fetch(api.ml.predict.path, {
        method: api.ml.predict.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Prediction failed");
      return api.ml.predict.responses[200].parse(await res.json());
    },
  });
}
