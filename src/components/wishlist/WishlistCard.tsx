/**
 * WishlistCard Component
 * Card layout with circular progress indicator and priority badge
 */

import { Calendar, Edit2, Trash2, CheckCircle, ShoppingCart } from 'lucide-react'
import type { WishlistItem, Priority } from '../../types'
import { formatCurrency, formatDate } from '../../utils/formatters'

interface WishlistCardProps {
  item: WishlistItem & { progress: number; estimatedCompletion?: string | null }
  onEdit: (item: WishlistItem) => void
  onDelete: (item: WishlistItem) => void
  onMarkBought: (item: WishlistItem) => void
}

const priorityConfig: Record<Priority, { label: string; color: string; bgColor: string }> = {
  high: { label: 'Tinggi', color: 'text-red-700 dark:text-red-400', bgColor: 'bg-red-100 dark:bg-red-900/30' },
  medium: { label: 'Sedang', color: 'text-amber-700 dark:text-amber-400', bgColor: 'bg-amber-100 dark:bg-amber-900/30' },
  low: { label: 'Rendah', color: 'text-green-700 dark:text-green-400', bgColor: 'bg-green-100 dark:bg-green-900/30' },
}

export default function WishlistCard({
  item,
  onEdit,
  onDelete,
  onMarkBought,
}: WishlistCardProps) {
  const priority = priorityConfig[item.priority]
  const isBought = item.status === 'bought'
  const isComplete = item.currentSaved >= item.targetPrice

  const circumference = 2 * Math.PI * 36
  const strokeDashoffset = circumference - (item.progress / 100) * circumference

  const progressColor = isBought 
    ? 'text-green-500' 
    : isComplete 
      ? 'text-primary-500' 
      : item.progress >= 50 
        ? 'text-amber-500' 
        : 'text-gray-400'

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl border p-4 ${
      isBought 
        ? 'border-green-200 dark:border-green-800 opacity-75' 
        : 'border-gray-200 dark:border-gray-700'
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className={`font-medium truncate ${isBought ? 'text-gray-500 line-through' : 'text-gray-900 dark:text-gray-100'}`}>
              {item.name}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 text-xs rounded-full ${priority.bgColor} ${priority.color}`}>
              {priority.label}
            </span>
            {item.category && (
              <span className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                {item.category}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 ml-2">
          <button onClick={() => onEdit(item)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded" title="Edit">
            <Edit2 className="w-4 h-4 text-gray-500" />
          </button>
          <button onClick={() => onDelete(item)} className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded" title="Hapus">
            <Trash2 className="w-4 h-4 text-red-500" />
          </button>
        </div>
      </div>

      {/* Circular Progress */}
      <div className="flex items-center justify-center mb-3">
        <div className="relative w-20 h-20">
          <svg className="w-20 h-20 transform -rotate-90">
            <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="6" fill="none" className="text-gray-200 dark:text-gray-700" />
            <circle
              cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="6" fill="none" strokeLinecap="round"
              className={progressColor}
              style={{ strokeDasharray: circumference, strokeDashoffset, transition: 'stroke-dashoffset 0.5s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            {isBought ? (
              <CheckCircle className="w-6 h-6 text-green-500" />
            ) : (
              <span className={`text-sm font-bold ${progressColor}`}>{item.progress.toFixed(0)}%</span>
            )}
          </div>
        </div>
      </div>

      {/* Amount Details */}
      <div className="space-y-1 mb-3 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500 dark:text-gray-400">Terkumpul</span>
          <span className="font-medium text-green-600">{formatCurrency(item.currentSaved)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500 dark:text-gray-400">Target</span>
          <span className="font-medium text-gray-900 dark:text-gray-100">{formatCurrency(item.targetPrice)}</span>
        </div>
      </div>

      {/* Target Date & Estimated Completion */}
      {(item.targetDate || item.estimatedCompletion) && (
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {item.targetDate && <span>Target: {formatDate(item.targetDate)}</span>}
          {item.estimatedCompletion && !isBought && (
            <span className="ml-auto">Est: {formatDate(item.estimatedCompletion)}</span>
          )}
        </div>
      )}

      {/* Actions */}
      {!isBought && isComplete && (
        <button
          onClick={() => onMarkBought(item)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
        >
          <ShoppingCart className="w-4 h-4" />
          Tandai Sudah Dibeli
        </button>
      )}

      {isBought && (
        <div className="text-center py-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <span className="text-sm font-medium text-green-600 dark:text-green-400">✓ Sudah Dibeli</span>
        </div>
      )}
    </div>
  )
}
