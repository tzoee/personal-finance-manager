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
    <div className="card p-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
          <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">Dana Darurat</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Target: {status.targetMultiplier}x biaya hidup
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Progress</span>
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {status.progress.toFixed(0)}%
          </span>
        </div>
        
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div 
            className={`h-3 rounded-full transition-all duration-500 ${progressColor}`}
            style={{ width: `${Math.min(100, status.progress)}%` }}
          />
        </div>

        <div className="flex justify-between text-sm mt-3">
          <div>
            <p className="text-gray-500 dark:text-gray-400">Terkumpul</p>
            <p className="font-semibold text-gray-900 dark:text-gray-100">
              {formatCurrency(status.currentAmount)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-gray-500 dark:text-gray-400">Target</p>
            <p className="font-semibold text-gray-900 dark:text-gray-100">
              {formatCurrency(status.targetAmount)}
            </p>
          </div>
        </div>

        {status.progress < 100 && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Kurang {formatCurrency(status.targetAmount - status.currentAmount)} lagi untuk mencapai target
          </p>
        )}
      </div>
    </div>
  )
}
