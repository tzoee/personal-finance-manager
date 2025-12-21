/**
 * SavingsCard Component
 * Displays a savings goal with circular progress indicator
 */

import { PiggyBank, Calendar, Plus, Edit2, Trash2, CheckCircle } from 'lucide-react'
import type { SavingsWithDetails } from '../../hooks/useSavings'
import { formatCurrency, formatDate } from '../../utils/formatters'

interface SavingsCardProps {
  savings: SavingsWithDetails
  onDeposit: (savings: SavingsWithDetails) => void
  onEdit: (savings: SavingsWithDetails) => void
  onDelete: (savings: SavingsWithDetails) => void
}

export default function SavingsCard({
  savings,
  onDeposit,
  onEdit,
  onDelete,
}: SavingsCardProps) {
  const progressColor = savings.isComplete 
    ? 'text-green-500' 
    : savings.progress >= 75 
      ? 'text-primary-500' 
      : savings.progress >= 50 
        ? 'text-amber-500' 
        : 'text-gray-400'

  const circumference = 2 * Math.PI * 40
  const strokeDashoffset = circumference - (savings.progress / 100) * circumference

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl border p-4 ${
      savings.isComplete 
        ? 'border-green-200 dark:border-green-800' 
        : 'border-gray-200 dark:border-gray-700'
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            savings.isComplete 
              ? 'bg-green-100 dark:bg-green-900/30' 
              : 'bg-primary-100 dark:bg-primary-900/30'
          }`}>
            {savings.isComplete ? (
              <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
            ) : (
              <PiggyBank className="w-4 h-4 text-primary-600 dark:text-primary-400" />
            )}
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-gray-100 line-clamp-1">
              {savings.name}
            </h3>
            {savings.targetDate && (
              <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatDate(savings.targetDate)}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(savings)}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            title="Edit"
          >
            <Edit2 className="w-4 h-4 text-gray-500" />
          </button>
          <button
            onClick={() => onDelete(savings)}
            className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
            title="Hapus"
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </button>
        </div>
      </div>

      {/* Circular Progress */}
      <div className="flex items-center justify-center mb-4">
        <div className="relative w-24 h-24">
          <svg className="w-24 h-24 transform -rotate-90">
            <circle
              cx="48"
              cy="48"
              r="40"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-gray-200 dark:text-gray-700"
            />
            <circle
              cx="48"
              cy="48"
              r="40"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              className={progressColor}
              style={{
                strokeDasharray: circumference,
                strokeDashoffset,
                transition: 'stroke-dashoffset 0.5s ease',
              }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-lg font-bold ${progressColor}`}>
              {savings.progress.toFixed(0)}%
            </span>
          </div>
        </div>
      </div>

      {/* Amount Details */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">Terkumpul</span>
          <span className="font-medium text-green-600 dark:text-green-400">
            {formatCurrency(savings.totalSaved)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">Target</span>
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {formatCurrency(savings.targetAmount)}
          </span>
        </div>
        {!savings.isComplete && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Kurang</span>
            <span className="font-medium text-amber-600 dark:text-amber-400">
              {formatCurrency(savings.remaining)}
            </span>
          </div>
        )}
      </div>

      {/* Estimated Completion */}
      {!savings.isComplete && savings.estimatedCompletion && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 text-center">
          Estimasi tercapai: {formatDate(savings.estimatedCompletion)}
        </p>
      )}

      {/* Deposit Button */}
      {!savings.isComplete && (
        <button
          onClick={() => onDeposit(savings)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 
                   bg-primary-600 text-white rounded-lg hover:bg-primary-700 
                   transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          Tambah Tabungan
        </button>
      )}

      {/* Complete Badge */}
      {savings.isComplete && (
        <div className="text-center py-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <span className="text-sm font-medium text-green-600 dark:text-green-400">
            🎉 Target Tercapai!
          </span>
        </div>
      )}
    </div>
  )
}
