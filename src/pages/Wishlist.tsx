/**
 * Wishlist Page - Redesigned
 * Grid layout with stats, filtering, and card-based display
 */

import { useState, useEffect } from 'react'
import { Heart, Plus, Filter } from 'lucide-react'
import { useWishlist } from '../hooks/useWishlist'
import WishlistCard from '../components/wishlist/WishlistCard'
import WishlistForm from '../components/wishlist/WishlistForm'
import type { WishlistItem, WishlistInput, Priority } from '../types'
import { formatCurrency } from '../utils/formatters'

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
    sortBy,
    setCategoryFilter,
    setPriorityFilter,
    setSortBy,
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
    if (result.success) {
      setShowForm(false)
    }
    return result
  }

  const handleEditItem = async (input: WishlistInput) => {
    if (!editingItem) return { success: false, errors: ['No item selected'] }
    await updateItem(editingItem.id, input)
    setEditingItem(null)
    return { success: true }
  }

  const handleDeleteItem = async () => {
    if (!deletingItem) return
    await deleteItem(deletingItem.id)
    setDeletingItem(null)
  }

  const handleMarkBought = async (item: WishlistItem) => {
    await markAsBought(item.id)
  }

  return (
    <div className="space-y-4">
      {/* Header with Stats - Compact Mobile Layout */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl p-3 sm:p-4 text-white">
        {/* Top Row: Title + Buttons */}
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 sm:w-6 sm:h-6" />
            <h1 className="text-lg sm:text-xl font-bold">Wishlist</h1>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-1.5 sm:p-2 rounded-lg transition-colors ${
                showFilters || categoryFilter || priorityFilter
                  ? 'bg-white/30'
                  : 'bg-white/20 hover:bg-white/30'
              }`}
            >
              <Filter className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-white text-primary-600 rounded-lg hover:bg-primary-50 transition-colors text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah</span>
            </button>
          </div>
        </div>

        {/* Stats Row - Compact */}
        {stats.totalItems > 0 && (
          <>
            <p className="text-xs sm:text-sm text-primary-100 mb-2">{stats.motivationalMessage}</p>
            <div className="grid grid-cols-4 gap-2 sm:gap-4 text-center">
              <div>
                <p className="text-[10px] sm:text-xs text-primary-200">Target</p>
                <p className="text-xs sm:text-sm font-semibold truncate">{formatCurrency(stats.totalTarget).replace('Rp ', '')}</p>
              </div>
              <div>
                <p className="text-[10px] sm:text-xs text-primary-200">Terkumpul</p>
                <p className="text-xs sm:text-sm font-semibold truncate">{formatCurrency(stats.totalSaved).replace('Rp ', '')}</p>
              </div>
              <div>
                <p className="text-[10px] sm:text-xs text-primary-200">Progress</p>
                <p className="text-xs sm:text-sm font-semibold">{stats.overallProgress.toFixed(0)}%</p>
              </div>
              <div>
                <p className="text-[10px] sm:text-xs text-primary-200">Tercapai</p>
                <p className="text-xs sm:text-sm font-semibold">{stats.completedCount}/{stats.totalItems}</p>
              </div>
            </div>
          </>
        )}

        {/* Empty state message in header */}
        {stats.totalItems === 0 && (
          <p className="text-sm text-primary-100">Mulai tambahkan barang impianmu!</p>
        )}
      </div>

      {/* Filters - Compact */}
      {showFilters && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3">
          <div className="grid grid-cols-3 gap-2">
            <select
              value={categoryFilter || ''}
              onChange={(e) => setCategoryFilter(e.target.value || null)}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="">Kategori</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <select
              value={priorityFilter || ''}
              onChange={(e) => setPriorityFilter((e.target.value || null) as Priority | null)}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="">Prioritas</option>
              <option value="high">Tinggi</option>
              <option value="medium">Sedang</option>
              <option value="low">Rendah</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'priority' | 'progress' | 'date')}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="priority">Prioritas</option>
              <option value="progress">Progress</option>
              <option value="date">Terbaru</option>
            </select>
          </div>
        </div>
      )}

      {/* Wishlist Grid */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
            <Heart className="w-6 h-6 text-gray-400" />
          </div>
          <h3 className="text-base font-medium text-gray-900 dark:text-gray-100 mb-1">
            {categoryFilter || priorityFilter ? 'Tidak ada item' : 'Belum ada wishlist'}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {categoryFilter || priorityFilter ? 'Coba ubah filter' : 'Tambahkan barang impianmu'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {filteredItems.map(item => (
            <WishlistCard
              key={item.id}
              item={item}
              onEdit={setEditingItem}
              onDelete={setDeletingItem}
              onMarkBought={handleMarkBought}
            />
          ))}
        </div>
      )}

      {/* Add Form Modal */}
      {showForm && (
        <WishlistForm
          onSubmit={handleAddItem}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Edit Form Modal */}
      {editingItem && (
        <WishlistForm
          item={editingItem}
          onSubmit={handleEditItem}
          onCancel={() => setEditingItem(null)}
        />
      )}

      {/* Delete Confirmation */}
      {deletingItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Hapus Wishlist</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-6">Hapus "{deletingItem.name}" dari wishlist?</p>
            <div className="flex gap-3">
              <button onClick={() => setDeletingItem(null)} className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">Batal</button>
              <button onClick={handleDeleteItem} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
