import { TrendingUp, TrendingDown, Wallet, CreditCard } from 'lucide-react'
import { formatCurrency } from '../../utils/formatters'

interface NetWorthSummaryProps {
  totalAssets: number
  totalLiabilities: number
  netWorth: number
}

export default function NetWorthSummary({ totalAssets, totalLiabilities, netWorth }: NetWorthSummaryProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="card p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <Wallet className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Aset</p>
            <p className="text-xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(totalAssets)}
            </p>
          </div>
        </div>
      </div>

      <div className="card p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
            <CreditCard className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Liabilitas</p>
            <p className="text-xl font-bold text-red-600 dark:text-red-400">
              {formatCurrency(totalLiabilities)}
            </p>
          </div>
        </div>
      </div>

      <div className="card p-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${
            netWorth >= 0 
              ? 'bg-primary-100 dark:bg-primary-900/30' 
              : 'bg-orange-100 dark:bg-orange-900/30'
          }`}>
            {netWorth >= 0 ? (
              <TrendingUp className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            ) : (
              <TrendingDown className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            )}
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Net Worth</p>
            <p className={`text-xl font-bold ${
              netWorth >= 0 
                ? 'text-primary-600 dark:text-primary-400' 
                : 'text-orange-600 dark:text-orange-400'
            }`}>
              {netWorth < 0 ? '-' : ''}{formatCurrency(Math.abs(netWorth))}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
