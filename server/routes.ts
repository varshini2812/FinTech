
import type { Express } from "express";
import type { Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

// Mock Stock Data Service
const MOCK_STOCKS: Record<string, number> = {
  'AAPL': 150.00,
  'GOOGL': 2800.00,
  'MSFT': 300.00,
  'TSLA': 900.00,
  'AMZN': 3400.00,
};

function getMockPrice(symbol: string): number {
  const base = MOCK_STOCKS[symbol.toUpperCase()] || 100.00;
  // Add some random fluctuation
  return base + (Math.random() * 10 - 5);
}

function getMockHistory(symbol: string, days: number = 30) {
  const history = [];
  let price = getMockPrice(symbol);
  const now = new Date();
  
  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    price = price + (Math.random() * 10 - 4); // Random walk
    history.push({
      date: date.toISOString().split('T')[0],
      price: Number(price.toFixed(2))
    });
  }
  return history;
}

// Simple Linear Regression
function calculateLinearRegression(data: { x: number, y: number }[]) {
  const n = data.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;

  for (const point of data) {
    sumX += point.x;
    sumY += point.y;
    sumXY += point.x * point.y;
    sumXX += point.x * point.x;
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  return { slope, intercept };
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup Auth
  setupAuth(app);

  // Stock Data
  app.get(api.stocks.get.path, (req, res) => {
    const symbol = req.params.symbol.toUpperCase();
    const price = getMockPrice(symbol);
    
    res.json({
      symbol,
      price: Number(price.toFixed(2)),
      change: Number((Math.random() * 5).toFixed(2)),
      changePercent: Number((Math.random() * 2).toFixed(2))
    });
  });

  app.get(api.stocks.history.path, (req, res) => {
    const symbol = req.params.symbol.toUpperCase();
    const history = getMockHistory(symbol);
    res.json(history);
  });

  // Portfolio & Trade
  app.get(api.portfolio.get.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const items = await storage.getPortfolio(req.user!.id);
    const enrichedItems = items.map(item => {
      const currentPrice = getMockPrice(item.symbol);
      const value = Number(item.quantity) * currentPrice;
      const cost = Number(item.quantity) * Number(item.averagePrice);
      return {
        ...item,
        currentValue: Number(value.toFixed(2)),
        gainLoss: Number((value - cost).toFixed(2))
      };
    });
    
    res.json(enrichedItems);
  });
  
  app.get(api.portfolio.history.path, async (req, res) => {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      const txs = await storage.getTransactions(req.user!.id);
      res.json(txs);
  });

  app.post(api.trade.execute.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { symbol, type, quantity } = api.trade.execute.input.parse(req.body);
      const userId = req.user!.id;
      const user = await storage.getUser(userId);
      const price = getMockPrice(symbol);
      const totalCost = price * quantity;

      if (!user) return res.sendStatus(404);

      if (type === 'buy') {
        if (Number(user.balance) < totalCost) {
          return res.status(400).json({ message: "Insufficient funds" });
        }

        // Update Balance
        const newBalance = Number(user.balance) - totalCost;
        await storage.updateUserBalance(userId, newBalance.toFixed(2));

        // Update Portfolio
        const existingItem = await storage.getPortfolioItem(userId, symbol);
        if (existingItem) {
          const totalQty = existingItem.quantity + quantity;
          const totalCostBasis = (Number(existingItem.averagePrice) * existingItem.quantity) + totalCost;
          const newAvgPrice = totalCostBasis / totalQty;
          await storage.updatePortfolioItem(userId, symbol, totalQty, newAvgPrice);
        } else {
          await storage.createPortfolioItem(userId, symbol, quantity, price);
        }
      } else {
        // Sell
        const existingItem = await storage.getPortfolioItem(userId, symbol);
        if (!existingItem || existingItem.quantity < quantity) {
          return res.status(400).json({ message: "Insufficient stock quantity" });
        }

        const newBalance = Number(user.balance) + totalCost;
        await storage.updateUserBalance(userId, newBalance.toFixed(2));

        const newQty = existingItem.quantity - quantity;
        if (newQty === 0) {
          await storage.deletePortfolioItem(userId, symbol);
        } else {
          await storage.updatePortfolioItem(userId, symbol, newQty, Number(existingItem.averagePrice));
        }
      }

      // Record Transaction
      const tx = await storage.createTransaction(userId, symbol, type, quantity, price);
      res.json(tx);

    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input" });
      }
      throw err;
    }
  });

  // ML Prediction
  app.post(api.ml.predict.path, async (req, res) => {
    try {
      const { symbol } = api.ml.predict.input.parse(req.body);
      const history = getMockHistory(symbol, 50); // Get 50 days
      
      // Prepare data for regression (use index as x, price as y)
      const dataPoints = history.map((point, index) => ({
        x: index,
        y: point.price
      }));

      const { slope, intercept } = calculateLinearRegression(dataPoints);

      // Generate trend line points
      const predicted = history.map((point, index) => ({
        date: point.date,
        price: Number((slope * index + intercept).toFixed(2))
      }));

      // Predict next day (index = 50)
      const nextDayIndex = 50;
      const nextDayPrediction = Number((slope * nextDayIndex + intercept).toFixed(2));

      res.json({
        symbol,
        actual: history,
        predicted,
        nextDayPrediction
      });

    } catch (err) {
       if (err instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input" });
      }
      throw err;
    }
  });

  return httpServer;
}
