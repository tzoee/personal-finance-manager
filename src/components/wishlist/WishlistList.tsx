/**
 * WishlistList Component
 * Displays wishlist items with progress bars
 */

import { Star, Edit2, Trash2, Check, ShoppingCart } from 'lucide-react'
import type { WishlistItem, Priority } from '../../types'
import { formatCurrency } from '../../utils/formatters'

interface WishlistItemWithProgress extends WishlistItem {
  progress: number
  remaining: number
  monthsToTarget: number | null
}

interface WishlistListProps {
  items: WishlistItemWithProgress[]
  onEdit: (item: WishlistItem) => void
  onDelete: (item: WishlistItem) => void
  onMarkAsBought: (item: WishlistItem) => void
}

const priorityColors: Record<Priority, string> = {
  high: 'text-red-600 bg-red-100 dark:bg-red-900/30',
  medium: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30',
  low: 'text-green-600 bg-green-100 dark:bg-green-900/30',
}

const priorityLabels: Record<Priority, string> = {
  high: 'Tinggi',
  medium: 'Sedang',
  low: 'Rendah',
}

export default function WishlistList({
  items,
  onEdit,
  onDelete,
  onMarkAsBought,
}: WishlistListProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
          <ShoppingCart className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
          Belum ada wishlist
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Tambahkan barang impian yang ingin Anda beli
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {items.map(item => (
        <div
          key={item.id}
          className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 ${
            item.status === 'bought' ? 'opacity-60' : ''
          }`}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className={`font-medium text-gray-900 dark:text-gray-100 truncate ${
                  item.status === 'bought' ? 'line-through' : ''
                }`}>
                  {item.name}
                </h3>
                {item.status === 'bought' && (
                  <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full">
                    Dibeli
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 text-xs rounded-full flex items-center gap-1 ${priorityColors[item.priority]}`}>
                  <Star className="w-3 h-3 fill-current" />
                  {priorityLabels[item.priority]}
                </span>
                {item.targetDate && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Target: {new Date(item.targetDate).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 ml-2">
              {item.status !== 'bought' && (
                <button
                  onClick={() => onMarkAsBought(item)}
                  className="p-1.5 hover:bg-green-100 dark:hover:bg-green-900/30 rounded transition-colors"
                  title="Tandai sudah dibeli"
                >
                  <Check className="w-4 h-4 text-green-600" />
                </button>
              )}
              <button
                onClick={() => onEdit(item)}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                title="Edit"
              >
                <Edit2 className="w-4 h-4 text-gray-500" />
              </button>
              <button
                onClick={() => onDelete(item)}
                className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                title="Hapus"
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </button>
            </div>
          </div>

          {/* Progress */}
          {item.status !== 'bought' && (
            <>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600 dark:text-gray-400">
                  {formatCurrency(item.currentSaved)} / {formatCurrency(item.targetPrice)}
                </span>
                <span className="font-medium text-primary-600">
                  {item.progress.toFixed(0)}%
                </span>
              </div>

              <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden mb-2">
                <div
                  className="h-full bg-primary-500 rounded-full transition-all"
                  style={{ width: `${item.progress}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>Kurang: {formatCurrency(item.remaining)}</span>
                {item.monthsToTarget !== null && item.monthsToTarget > 0 && (
                  <span>~{item.monthsToTarget} bulan lagi</span>
                )}
              </div>
            </>
          )}

          {/* Note */}
          {item.note && (
            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700 pt-3">
              {item.note}
            </p>
          )}
        </div>
      ))}
    </div>
  )
}
