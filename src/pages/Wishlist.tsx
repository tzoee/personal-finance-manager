/**
 * Wishlist Page - Ultra Compact Single Screen Layout
 */

import { useState, useEffect } from 'react'
import { Plus, Filter, Edit2, Trash2, Check } from 'lucide-react'
import { useWishlist } from '../hooks/useWishlist'
import WishlistForm from '../components/wishlist/WishlistForm'
import type { WishlistItem, WishlistInput, Priority } from '../types'
import { formatCurrency } from '../utils/formatters'

const priorityDot: Record<Priority, string> = {
  high: 'bg-red-500',
  medium: 'bg-amber-500', 
  low: 'bg-green-500',
}

export default function Wishlist() {
  const {
    filteredItems,
    stats,
    categories,
    initialized,
    initialize,
    addItem,
    updateItem,
    deleteItem,
    markAsBought,
    categoryFilter,
    priorityFilter,
    setCategoryFilter,
    setPriorityFilter,
  } = useWishlist()

  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState<WishlistItem | null>(null)
  const [deletingItem, setDeletingItem] = useState<WishlistItem | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    if (!initialized) initialize()
  }, [initialized, initialize])

  const handleAddItem = async (input: WishlistInput) => {
    const result = await addItem(input)
    if (result.success) setShowForm(false)
    return result
  }

  const handleEditItem = async (input: WishlistInput) => {
    if (!editingItem) return { success: false, errors: ['No item'] }
    await updateItem(editingItem.id, input)
    setEditingItem(null)
    return { success: true }
  }

  const handleDeleteItem = async () => {
    if (!deletingItem) return
    await deleteItem(deletingItem.id)
    setDeletingItem(null)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] sm:h-auto">
      {/* Mini Header */}
      <div className="flex items-center justify-between py-2 px-1 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <h1 className="text-base font-bold text-gray-900 dark:text-gray-100">Wishlist</h1>
          {stats.totalItems > 0 && (
            <span className="text-[10px] px-1.5 py-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded">
              {stats.overallProgress.toFixed(0)}%
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-1.5 rounded ${showFilters || categoryFilter || priorityFilter ? 'bg-primary-100 dark:bg-primary-900/30' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
          >
            <Filter className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1 px-2 py-1 bg-primary-600 text-white rounded text-xs font-medium hover:bg-primary-700"
          >
            <Plus className="w-3.5 h-3.5" />
            Tambah
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="flex gap-2 py-2 px-1 border-b border-gray-200 dark:border-gray-700">
          <select
            value={categoryFilter || ''}
            onChange={(e) => setCategoryFilter(e.target.value || null)}
            className="flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="">Semua Kategori</option>
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          <select
            value={priorityFilter || ''}
            onChange={(e) => setPriorityFilter((e.target.value || null) as Priority | null)}
            className="flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="">Semua Prioritas</option>
            <option value="high">Tinggi</option>
            <option value="medium">Sedang</option>
            <option value="low">Rendah</option>
          </select>
        </div>
      )}

      {/* List Items - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        {filteredItems.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {categoryFilter || priorityFilter ? 'Tidak ada item' : 'Belum ada wishlist'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {filteredItems.map(item => {
              const isBought = item.status === 'bought'
              const isComplete = item.currentSaved >= item.targetPrice
              return (
                <div key={item.id} className={`flex items-center gap-2 py-2 px-1 ${isBought ? 'opacity-60' : ''}`}>
                  {/* Priority dot */}
                  <span className={`w-2 h-2 rounded-full shrink-0 ${priorityDot[item.priority]}`} />
                  
                  {/* Name & Progress */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm truncate ${isBought ? 'line-through text-gray-400' : 'text-gray-900 dark:text-gray-100'}`}>
                        {item.name}
                      </span>
                      {isBought && <Check className="w-3 h-3 text-green-500 shrink-0" />}
                    </div>
                    {/* Progress bar */}
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="flex-1 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${isBought ? 'bg-green-500' : isComplete ? 'bg-primary-500' : item.progress >= 50 ? 'bg-amber-500' : 'bg-gray-400'}`}
                          style={{ width: `${Math.min(item.progress, 100)}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-gray-500 w-8">{item.progress.toFixed(0)}%</span>
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="text-right shrink-0">
                    <p className="text-[10px] text-green-600 font-medium">{formatCurrency(item.currentSaved).replace('Rp ', '')}</p>
                    <p className="text-[10px] text-gray-400">/{formatCurrency(item.targetPrice).replace('Rp ', '')}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center shrink-0">
                    {!isBought && isComplete && (
                      <button onClick={() => markAsBought(item.id)} className="p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded" title="Tandai dibeli">
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    <button onClick={() => setEditingItem(item)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                      <Edit2 className="w-3.5 h-3.5 text-gray-400" />
                    </button>
                    <button onClick={() => setDeletingItem(item)} className="p-1 hover:bg-red-50 dark:hover:bg-red-900/30 rounded">
                      <Trash2 className="w-3.5 h-3.5 text-red-400" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Summary Footer */}
      {stats.totalItems > 0 && (
        <div className="flex items-center justify-between py-2 px-1 border-t border-gray-200 dark:border-gray-700 text-[10px] text-gray-500 dark:text-gray-400">
          <span>{stats.completedCount}/{stats.totalItems} tercapai</span>
          <span>{formatCurrency(stats.totalSaved)} / {formatCurrency(stats.totalTarget)}</span>
        </div>
      )}

      {/* Modals */}
      {showForm && <WishlistForm onSubmit={handleAddItem} onCancel={() => setShowForm(false)} />}
      {editingItem && <WishlistForm item={editingItem} onSubmit={handleEditItem} onCancel={() => setEditingItem(null)} />}
      
      {deletingItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-sm p-4">
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">Hapus "{deletingItem.name}"?</p>
            <div className="flex gap-2">
              <button onClick={() => setDeletingItem(null)} className="flex-1 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700">Batal</button>
              <button onClick={handleDeleteItem} className="flex-1 px-3 py-1.5 text-sm bg-red-600 text-white rounded hover:bg-red-700">Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
