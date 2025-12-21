import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import type { CashflowData } from '../../types'
import { formatCurrency } from '../../utils/formatters'

interface TrendChartProps {
  data: CashflowData[]
}

export default function TrendChart({ data }: TrendChartProps) {
  const formatMonth = (month: string) => {
    const [, m] = month.split('-')
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
    return months[parseInt(m) - 1]
  }

  const chartData = data.map(d => ({
    ...d,
    monthLabel: formatMonth(d.month),
    surplusRate: d.income > 0 ? ((d.income - d.expense) / d.income) * 100 : 0,
  }))

  return (
    <div className="card p-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Trend Surplus Rate
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
            <XAxis 
              dataKey="monthLabel" 
              tick={{ fontSize: 12 }}
              className="text-gray-600 dark:text-gray-400"
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `${value.toFixed(0)}%`}
              domain={[-50, 100]}
              className="text-gray-600 dark:text-gray-400"
            />
            <Tooltip 
              formatter={(value: number, name: string) => {
                if (name === 'surplusRate') return [`${value.toFixed(1)}%`, 'Surplus Rate']
                return [formatCurrency(value), name]
              }}
              labelFormatter={(label) => `Bulan: ${label}`}
              contentStyle={{ 
                backgroundColor: 'var(--tooltip-bg, #fff)',
                border: '1px solid var(--tooltip-border, #e5e7eb)',
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="surplusRate" 
              name="Surplus Rate"
              stroke="#22c55e" 
              strokeWidth={2}
              dot={{ fill: '#22c55e', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
