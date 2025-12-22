/**
 * WishlistCard Component
 * Compact card layout with horizontal progress for mobile
 */

import { Edit2, Trash2, CheckCircle, ShoppingCart } from 'lucide-react'
import type { WishlistItem, Priority } from '../../types'
import { formatCurrency } from '../../utils/formatters'

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

  const progressColor = isBought 
    ? 'bg-green-500' 
    : isComplete 
      ? 'bg-primary-500' 
      : item.progress >= 50 
        ? 'bg-amber-500' 
        : 'bg-gray-400'

  const progressTextColor = isBought 
    ? 'text-green-500' 
    : isComplete 
      ? 'text-primary-500' 
      : item.progress >= 50 
        ? 'text-amber-500' 
        : 'text-gray-500'

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border p-3 ${
      isBought 
        ? 'border-green-200 dark:border-green-800 opacity-75' 
        : 'border-gray-200 dark:border-gray-700'
    }`}>
      {/* Header Row */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <h3 className={`text-sm font-medium truncate ${isBought ? 'text-gray-500 line-through' : 'text-gray-900 dark:text-gray-100'}`}>
            {item.name}
          </h3>
        </div>
        <div className="flex items-center gap-0.5 shrink-0">
          <button onClick={() => onEdit(item)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded" title="Edit">
            <Edit2 className="w-3.5 h-3.5 text-gray-500" />
          </button>
          <button onClick={() => onDelete(item)} className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded" title="Hapus">
            <Trash2 className="w-3.5 h-3.5 text-red-500" />
          </button>
        </div>
      </div>

      {/* Tags Row */}
      <div className="flex items-center gap-1.5 mb-2">
        <span className={`px-1.5 py-0.5 text-[10px] rounded-full ${priority.bgColor} ${priority.color}`}>
          {priority.label}
        </span>
        {item.category && (
          <span className="px-1.5 py-0.5 text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full truncate max-w-[80px]">
            {item.category}
          </span>
        )}
      </div>

      {/* Progress Bar (Horizontal) */}
      <div className="mb-2">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-gray-500 dark:text-gray-400">Progress</span>
          {isBought ? (
            <CheckCircle className="w-4 h-4 text-green-500" />
          ) : (
            <span className={`font-semibold ${progressTextColor}`}>{item.progress.toFixed(0)}%</span>
          )}
        </div>
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div 
            className={`h-full ${progressColor} transition-all duration-300`}
            style={{ width: `${Math.min(item.progress, 100)}%` }}
          />
        </div>
      </div>

      {/* Amount Row */}
      <div className="flex items-center justify-between text-xs">
        <div>
          <span className="text-gray-500 dark:text-gray-400">Terkumpul: </span>
          <span className="font-medium text-green-600">{formatCurrency(item.currentSaved).replace('Rp ', '')}</span>
        </div>
        <div>
          <span className="text-gray-500 dark:text-gray-400">Target: </span>
          <span className="font-medium text-gray-900 dark:text-gray-100">{formatCurrency(item.targetPrice).replace('Rp ', '')}</span>
        </div>
      </div>

      {/* Actions */}
      {!isBought && isComplete && (
        <button
          onClick={() => onMarkBought(item)}
          className="w-full flex items-center justify-center gap-1.5 mt-2 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs"
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          Tandai Dibeli
        </button>
      )}

      {isBought && (
        <div className="text-center mt-2 py-1.5 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <span className="text-xs font-medium text-green-600 dark:text-green-400">✓ Sudah Dibeli</span>
        </div>
      )}
    </div>
  )
}
