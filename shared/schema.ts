
import { pgTable, text, serial, integer, boolean, timestamp, real, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  balance: decimal("balance", { precision: 12, scale: 2 }).default("100000.00").notNull(), // Start with 100k virtual
  createdAt: timestamp("created_at").defaultNow(),
});

export const portfolios = pgTable("portfolios", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  symbol: text("symbol").notNull(),
  quantity: integer("quantity").notNull(),
  averagePrice: decimal("average_price", { precision: 12, scale: 2 }).notNull(),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  symbol: text("symbol").notNull(),
  type: text("type").notNull(), // 'buy' or 'sell'
  quantity: integer("quantity").notNull(),
  price: decimal("price", { precision: 12, scale: 2 }).notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

// === SCHEMAS ===

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, balance: true });
export const insertPortfolioSchema = createInsertSchema(portfolios).omit({ id: true });
export const insertTransactionSchema = createInsertSchema(transactions).omit({ id: true, timestamp: true });

// === TYPES ===

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Portfolio = typeof portfolios.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;

// API Types

export type TradeRequest = {
  symbol: string;
  type: 'buy' | 'sell';
  quantity: number;
};

export type StockData = {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
};

export type PredictionRequest = {
  symbol: string;
  days: number;
};

export type PredictionResponse = {
  symbol: string;
  actual: { date: string; price: number }[];
  predicted: { date: string; price: number }[];
  nextDayPrediction: number;
};
