import { formatCurrency } from '../../utils/formatters'
import type { CategoryBreakdown } from '../../types'

interface BreakdownTabProps {
  data: CategoryBreakdown[]
  totalExpense: number
}

const COLORS = [
  'bg-[#CA2851]',
  'bg-[#FF6766]',
  'bg-[#FFB173]',
  'bg-[#FFE3B3]',
  'bg-[#f46d8c]',
  'bg-[#ffa3a2]',
  'bg-[#ffc266]',
  'bg-[#b82349]',
]

export default function BreakdownTab({ data, totalExpense }: BreakdownTabProps) {
  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <p>Belum ada data pengeluaran bulan ini</p>
      </div>
    )
  }

  // Take top 6 categories
  const topCategories = data.slice(0, 6)
  const othersTotal = data.slice(6).reduce((sum, cat) => sum + cat.amount, 0)
  
  if (othersTotal > 0) {
    topCategories.push({
      categoryId: 'others',
      categoryName: 'Lainnya',
      amount: othersTotal,
      percentage: (othersTotal / totalExpense) * 100,
    })
  }

  return (
    <div className="space-y-4">
      {/* Donut Chart Visualization */}
      <div className="flex items-center justify-center">
        <div className="relative w-32 h-32">
          <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
            {(() => {
              let cumulativePercent = 0
              return topCategories.map((cat, index) => {
                const percent = cat.percentage
                const strokeDasharray = `${percent} ${100 - percent}`
                const strokeDashoffset = -cumulativePercent
                cumulativePercent += percent
                
                return (
                  <circle
                    key={cat.categoryId}
                    cx="18"
                    cy="18"
                    r="15.9"
                    fill="none"
                    stroke={`hsl(${(index * 45) % 360}, 70%, 50%)`}
                    strokeWidth="3"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-500"
                  />
                )
              })
            })()}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
            <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
              {formatCurrency(totalExpense)}
            </p>
          </div>
        </div>
      </div>

      {/* Category List */}
      <div className="space-y-2">
        {topCategories.map((cat, index) => (
          <div key={cat.categoryId} className="flex items-center gap-3">
            <div 
              className={`w-3 h-3 rounded-full ${COLORS[index % COLORS.length]}`}
            />
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                  {cat.categoryName}
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {formatCurrency(cat.amount)}
                </span>
              </div>
              <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mt-1">
                <div
                  className={`h-full rounded-full ${COLORS[index % COLORS.length]} transition-all duration-500`}
                  style={{ width: `${cat.percentage}%` }}
                />
              </div>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400 w-10 text-right">
              {cat.percentage.toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
