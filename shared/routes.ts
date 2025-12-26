
import { z } from 'zod';
import { insertUserSchema, users, portfolios, transactions } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  auth: z.object({
    message: z.string(),
  }),
};

export const api = {
  auth: {
    register: {
      method: 'POST' as const,
      path: '/api/register',
      input: insertUserSchema,
      responses: {
        201: z.custom<typeof users.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    login: {
      method: 'POST' as const,
      path: '/api/login',
      input: z.object({
        username: z.string(),
        password: z.string(),
      }),
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.auth,
      },
    },
    logout: {
      method: 'POST' as const,
      path: '/api/logout',
      responses: {
        200: z.object({ message: z.string() }),
      },
    },
    me: {
      method: 'GET' as const,
      path: '/api/user',
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.auth,
      },
    },
  },
  stocks: {
    get: {
      method: 'GET' as const,
      path: '/api/stocks/:symbol',
      responses: {
        200: z.object({
          symbol: z.string(),
          price: z.number(),
          change: z.number(),
          changePercent: z.number(),
        }),
        404: errorSchemas.notFound,
      },
    },
    history: {
      method: 'GET' as const,
      path: '/api/stocks/:symbol/history',
      responses: {
        200: z.array(z.object({
          date: z.string(),
          price: z.number(),
        })),
        404: errorSchemas.notFound,
      },
    },
  },
  trade: {
    execute: {
      method: 'POST' as const,
      path: '/api/trade',
      input: z.object({
        symbol: z.string(),
        type: z.enum(['buy', 'sell']),
        quantity: z.number().int().positive(),
      }),
      responses: {
        200: z.custom<typeof transactions.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.auth,
      },
    },
  },
  portfolio: {
    get: {
      method: 'GET' as const,
      path: '/api/portfolio',
      responses: {
        200: z.array(z.custom<typeof portfolios.$inferSelect & { currentValue: number, gainLoss: number }>()),
        401: errorSchemas.auth,
      },
    },
    history: {
      method: 'GET' as const,
      path: '/api/transactions',
      responses: {
        200: z.array(z.custom<typeof transactions.$inferSelect>()),
        401: errorSchemas.auth,
      },
    },
  },
  ml: {
    predict: {
      method: 'POST' as const,
      path: '/api/predict',
      input: z.object({
        symbol: z.string(),
      }),
      responses: {
        200: z.object({
          symbol: z.string(),
          actual: z.array(z.object({ date: z.string(), price: z.number() })),
          predicted: z.array(z.object({ date: z.string(), price: z.number() })),
          nextDayPrediction: z.number(),
        }),
        400: errorSchemas.validation,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
