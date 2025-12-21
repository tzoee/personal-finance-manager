import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import type { CategoryComparison } from '../../types'
import { formatCurrency } from '../../utils/formatters'

interface TopCategoriesProps {
  categories: CategoryComparison[]
}

export default function TopCategories({ categories }: TopCategoriesProps) {
  if (categories.length === 0) {
    return (
      <div className="card p-4">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Top 5 Pengeluaran
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Belum ada data pengeluaran bulan ini
        </p>
      </div>
    )
  }

  return (
    <div className="card p-4">
      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Top 5 Pengeluaran
      </h3>

      <div className="space-y-3">
        {categories.map((category, index) => (
          <div key={category.categoryId} className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-400">
              {index + 1}
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                {category.categoryName}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formatCurrency(category.currentMonth)}
              </p>
            </div>

            <div className="flex items-center gap-1">
              {category.change > 0 ? (
                <TrendingUp className="w-4 h-4 text-red-500" />
              ) : category.change < 0 ? (
                <TrendingDown className="w-4 h-4 text-green-500" />
              ) : (
                <Minus className="w-4 h-4 text-gray-400" />
              )}
              <span className={`text-xs ${
                category.change > 0 ? 'text-red-600' : category.change < 0 ? 'text-green-600' : 'text-gray-500'
              }`}>
                {category.change !== 0 && (
                  <>
                    {category.change > 0 ? '+' : ''}
                    {category.changePercentage.toFixed(0)}%
                  </>
                )}
                {category.change === 0 && '-'}
              </span>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
        Dibandingkan dengan bulan lalu
      </p>
    </div>
  )
}
