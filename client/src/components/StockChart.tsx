import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { format } from 'date-fns';

interface DataPoint {
  date: string;
  price: number;
}

interface StockChartProps {
  data: DataPoint[];
  color?: string;
  height?: number;
}

export function StockChart({ data, color = "#3b82f6", height = 300 }: StockChartProps) {
  // Calculate min/max for Y axis scale
  const prices = data.map(d => d.price);
  const min = Math.min(...prices) * 0.99;
  const max = Math.max(...prices) * 1.01;

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={color} stopOpacity={0}/>
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
            domain={[min, max]} 
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
              borderRadius: '8px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
            }}
            itemStyle={{ color: '#fff' }}
            labelStyle={{ color: '#94a3b8' }}
            formatter={(value: number) => [`$${value.toFixed(2)}`, 'Price']}
            labelFormatter={(label) => format(new Date(label), 'MMM d, yyyy')}
          />
          <Area 
            type="monotone" 
            dataKey="price" 
            stroke={color} 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorPrice)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
