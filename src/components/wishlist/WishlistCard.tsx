/**
 * WishlistCard Component
 * Ultra-compact card layout for mobile
 */

import { Edit2, Trash2, CheckCircle, ShoppingCart, Calendar } from 'lucide-react'
import type { WishlistItem, Priority } from '../../types'
import { formatCurrency } from '../../utils/formatters'

interface WishlistCardProps {
  item: WishlistItem & { progress: number; estimatedCompletion?: string | null }
  onEdit: (item: WishlistItem) => void
  onDelete: (item: WishlistItem) => void
  onMarkBought: (item: WishlistItem) => void
}

const priorityConfig: Record<Priority, { label: string; dot: string }> = {
  high: { label: 'H', dot: 'bg-red-500' },
  medium: { label: 'M', dot: 'bg-amber-500' },
  low: { label: 'L', dot: 'bg-green-500' },
}

// Format date to short format (e.g., "15 Des")
function formatShortDate(dateStr: string): string {
  const date = new Date(dateStr)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
  return `${date.getDate()} ${months[date.getMonth()]}`
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

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border p-2.5 ${
      isBought 
        ? 'border-green-200 dark:border-green-800 opacity-75' 
        : 'border-gray-200 dark:border-gray-700'
    }`}>
      {/* Row 1: Name + Actions */}
      <div className="flex items-center justify-between gap-1 mb-1.5">
        <h3 className={`text-sm font-medium truncate flex-1 ${isBought ? 'text-gray-400 line-through' : 'text-gray-900 dark:text-gray-100'}`}>
          {item.name}
        </h3>
        <div className="flex items-center gap-0.5 shrink-0">
          <button onClick={() => onEdit(item)} className="p-0.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
            <Edit2 className="w-3 h-3 text-gray-400" />
          </button>
          <button onClick={() => onDelete(item)} className="p-0.5 hover:bg-red-50 dark:hover:bg-red-900/30 rounded">
            <Trash2 className="w-3 h-3 text-red-400" />
          </button>
        </div>
      </div>

      {/* Row 2: Priority dot + Category + Date */}
      <div className="flex items-center gap-1.5 mb-1.5 text-[10px]">
        <span className={`w-2 h-2 rounded-full ${priority.dot}`} title={item.priority} />
        {item.category && (
          <span className="text-gray-500 dark:text-gray-400 truncate max-w-[60px]">{item.category}</span>
        )}
        {item.targetDate && (
          <span className="flex items-center gap-0.5 text-gray-400 ml-auto">
            <Calendar className="w-2.5 h-2.5" />
            {formatShortDate(item.targetDate)}
          </span>
        )}
      </div>

      {/* Row 3: Progress bar with percentage */}
      <div className="flex items-center gap-2 mb-1.5">
        <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div 
            className={`h-full ${progressColor} transition-all`}
            style={{ width: `${Math.min(item.progress, 100)}%` }}
          />
        </div>
        {isBought ? (
          <CheckCircle className="w-3.5 h-3.5 text-green-500 shrink-0" />
        ) : (
          <span className="text-[10px] font-semibold text-gray-600 dark:text-gray-300 w-7 text-right">{item.progress.toFixed(0)}%</span>
        )}
      </div>

      {/* Row 4: Amount */}
      <div className="flex items-center justify-between text-[10px]">
        <span className="text-green-600 font-medium">{formatCurrency(item.currentSaved).replace('Rp ', '')}</span>
        <span className="text-gray-400">/</span>
        <span className="text-gray-700 dark:text-gray-300 font-medium">{formatCurrency(item.targetPrice).replace('Rp ', '')}</span>
      </div>

      {/* Action button (only when complete) */}
      {!isBought && isComplete && (
        <button
          onClick={() => onMarkBought(item)}
          className="w-full flex items-center justify-center gap-1 mt-1.5 py-1 bg-green-600 text-white rounded text-[10px] hover:bg-green-700"
        >
          <ShoppingCart className="w-3 h-3" />
          Dibeli
        </button>
      )}

      {isBought && (
        <div className="text-center mt-1.5 py-1 bg-green-50 dark:bg-green-900/20 rounded">
          <span className="text-[10px] font-medium text-green-600 dark:text-green-400">✓ Dibeli</span>
        </div>
      )}
    </div>
  )
}
