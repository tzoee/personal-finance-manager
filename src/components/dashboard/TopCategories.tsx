import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import type { CategoryComparison } from '../../types'
import { formatCurrency } from '../../utils/formatters'

interface TopCategoriesProps {
  categories: CategoryComparison[]
}

export default function TopCategories({ categories }: TopCategoriesProps) {
  if (categories.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
          Top 5 Pengeluaran
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center py-6">
          Belum ada data pengeluaran
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
        Top 5 Pengeluaran
      </h3>

      <div className="space-y-2.5">
        {categories.map((category, index) => (
          <div key={category.categoryId} className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-[10px] font-medium text-gray-500 dark:text-gray-400">
              {index + 1}
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">
                {category.categoryName}
              </p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400">
                {formatCurrency(category.currentMonth)}
              </p>
            </div>

            <div className="flex items-center gap-0.5">
              {category.change > 0 ? (
                <TrendingUp className="w-3 h-3 text-red-500" />
              ) : category.change < 0 ? (
                <TrendingDown className="w-3 h-3 text-green-500" />
              ) : (
                <Minus className="w-3 h-3 text-gray-400" />
              )}
              <span className={`text-[10px] ${
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

      <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-3 pt-2 border-t border-gray-100 dark:border-gray-700">
        vs bulan lalu
      </p>
    </div>
  )
}
