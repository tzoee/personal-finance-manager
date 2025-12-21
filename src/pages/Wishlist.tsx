/**
 * Wishlist Page - Redesigned
 * Grid layout with stats, filtering, and card-based display
 */

import { useState, useEffect } from 'react'
import { Heart, Plus, Filter, TrendingUp } from 'lucide-react'
import { useWishlist, WishlistItemWithProgress } from '../hooks/useWishlist'
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Heart className="w-8 h-8 text-primary-600" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Wishlist</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-lg border transition-colors ${
              showFilters || categoryFilter || priorityFilter
                ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <Filter className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Tambah</span>
          </button>
        </div>
      </div>

      {/* Stats Card */}
      {stats.totalItems > 0 && (
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl p-4 text-white">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5" />
            <span className="font-medium">{stats.motivationalMessage}</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-primary-100 mb-1">Total Target</p>
              <p className="font-semibold">{formatCurrency(stats.totalTarget)}</p>
            </div>
            <div>
              <p className="text-xs text-primary-100 mb-1">Terkumpul</p>
              <p className="font-semibold">{formatCurrency(stats.totalSaved)}</p>
            </div>
            <div>
              <p className="text-xs text-primary-100 mb-1">Progress</p>
              <p className="font-semibold">{stats.overallProgress.toFixed(0)}%</p>
            </div>
            <div>
              <p className="text-xs text-primary-100 mb-1">Tercapai</p>
              <p className="font-semibold">{stats.completedCount}/{stats.totalItems}</p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      {showFilters && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kategori</label>
              <select
                value={categoryFilter || ''}
                onChange={(e) => setCategoryFilter(e.target.value || null)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="">Semua Kategori</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prioritas</label>
              <select
                value={priorityFilter || ''}
                onChange={(e) => setPriorityFilter((e.target.value || null) as Priority | null)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="">Semua Prioritas</option>
                <option value="high">Tinggi</option>
                <option value="medium">Sedang</option>
                <option value="low">Rendah</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Urutkan</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'priority' | 'progress' | 'date')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="priority">Prioritas</option>
                <option value="progress">Progress</option>
                <option value="date">Terbaru</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Wishlist Grid */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
            <Heart className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
            {categoryFilter || priorityFilter ? 'Tidak ada item yang cocok' : 'Belum ada wishlist'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {categoryFilter || priorityFilter ? 'Coba ubah filter' : 'Tambahkan barang impianmu'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
