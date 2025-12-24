import { Shield } from 'lucide-react'
import type { EmergencyFundStatus } from '../../types'
import { formatCurrency } from '../../utils/formatters'

interface EmergencyFundProgressProps {
  status: EmergencyFundStatus
}

export default function EmergencyFundProgress({ status }: EmergencyFundProgressProps) {
  const progressColor = status.progress >= 100 
    ? 'bg-green-500' 
    : status.progress >= 50 
      ? 'bg-yellow-500' 
      : 'bg-red-500'

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Dana Darurat</h3>
            <p className="text-[10px] text-gray-500 dark:text-gray-400">
              Target: {status.targetMultiplier}x biaya hidup
            </p>
          </div>
        </div>
        <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
          {status.progress.toFixed(0)}%
        </span>
      </div>

      <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2 mb-3">
        <div 
          className={`h-2 rounded-full transition-all duration-500 ${progressColor}`}
          style={{ width: `${Math.min(100, status.progress)}%` }}
        />
      </div>

      <div className="flex justify-between text-xs">
        <div>
          <span className="text-gray-500 dark:text-gray-400">Terkumpul: </span>
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {formatCurrency(status.currentAmount)}
          </span>
        </div>
        <div>
          <span className="text-gray-500 dark:text-gray-400">Target: </span>
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {formatCurrency(status.targetAmount)}
          </span>
        </div>
      </div>

      {status.progress < 100 && (
        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-2">
          Kurang {formatCurrency(status.targetAmount - status.currentAmount)} lagi
        </p>
      )}
    </div>
  )
}
