## Packages
recharts | For interactive stock price charts and ML prediction visualization
framer-motion | For smooth page transitions and micro-interactions
date-fns | For formatting dates in charts and transaction history

## Notes
Tailwind Config - extend fontFamily:
fontFamily: {
  sans: ["Inter", "sans-serif"],
  display: ["Space Grotesk", "sans-serif"],
  mono: ["JetBrains Mono", "monospace"],
}

API Integration:
- Auth uses cookie-based sessions (credentials: "include" required)
- Stock prices are simulated/mocked on backend but frontend treats them as real
- ML predictions use Recharts with two lines (actual vs predicted)
