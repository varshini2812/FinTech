
import { db } from "./db";
import { users, portfolios, transactions, type User, type InsertUser, type Portfolio, type Transaction } from "@shared/schema";
import { eq, and } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getPortfolio(userId: number): Promise<Portfolio[]>;
  getPortfolioItem(userId: number, symbol: string): Promise<Portfolio | undefined>;
  updatePortfolioItem(userId: number, symbol: string, quantity: number, averagePrice: number): Promise<Portfolio>;
  createPortfolioItem(userId: number, symbol: string, quantity: number, averagePrice: number): Promise<Portfolio>;
  deletePortfolioItem(userId: number, symbol: string): Promise<void>;
  
  createTransaction(userId: number, symbol: string, type: 'buy' | 'sell', quantity: number, price: number): Promise<Transaction>;
  getTransactions(userId: number): Promise<Transaction[]>;
  
  updateUserBalance(userId: number, newBalance: string): Promise<User>;
  
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getPortfolio(userId: number): Promise<Portfolio[]> {
    return await db.select().from(portfolios).where(eq(portfolios.userId, userId));
  }

  async getPortfolioItem(userId: number, symbol: string): Promise<Portfolio | undefined> {
    const [item] = await db.select().from(portfolios)
      .where(and(eq(portfolios.userId, userId), eq(portfolios.symbol, symbol)));
    return item;
  }

  async updatePortfolioItem(userId: number, symbol: string, quantity: number, averagePrice: number): Promise<Portfolio> {
    const [item] = await db.update(portfolios)
      .set({ quantity, averagePrice: averagePrice.toString() })
      .where(and(eq(portfolios.userId, userId), eq(portfolios.symbol, symbol)))
      .returning();
    return item;
  }

  async createPortfolioItem(userId: number, symbol: string, quantity: number, averagePrice: number): Promise<Portfolio> {
    const [item] = await db.insert(portfolios)
      .values({
        userId,
        symbol,
        quantity,
        averagePrice: averagePrice.toString()
      })
      .returning();
    return item;
  }
  
  async deletePortfolioItem(userId: number, symbol: string): Promise<void> {
    await db.delete(portfolios)
      .where(and(eq(portfolios.userId, userId), eq(portfolios.symbol, symbol)));
  }

  async createTransaction(userId: number, symbol: string, type: 'buy' | 'sell', quantity: number, price: number): Promise<Transaction> {
    const [tx] = await db.insert(transactions)
      .values({
        userId,
        symbol,
        type,
        quantity,
        price: price.toString()
      })
      .returning();
    return tx;
  }

  async getTransactions(userId: number): Promise<Transaction[]> {
    return await db.select().from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(transactions.timestamp); // Sort by time
  }

  async updateUserBalance(userId: number, newBalance: string): Promise<User> {
    const [user] = await db.update(users)
      .set({ balance: newBalance })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }
}

export const storage = new DatabaseStorage();
