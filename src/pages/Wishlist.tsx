/**
 * Wishlist Page
 * Manage wishlist items with progress tracking
 */

import { useState, useEffect } from 'react'
import { Heart, Plus } from 'lucide-react'
import { useWishlist } from '../hooks/useWishlist'
import WishlistForm from '../components/wishlist/WishlistForm'
import WishlistList from '../components/wishlist/WishlistList'
import type { WishlistItem, WishlistInput } from '../types'
import { formatCurrency } from '../utils/formatters'

export default function Wishlist() {
  const {
    itemsByPriority,
    activeItems,
    boughtItems,
    totals,
    initialized,
    initialize,
    addItem,
    updateItem,
    deleteItem,
    markAsBought,
  } = useWishlist()

  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState<WishlistItem | null>(null)
  const [deletingItem, setDeletingItem] = useState<WishlistItem | null>(null)
  const [markingAsBought, setMarkingAsBought] = useState<WishlistItem | null>(null)
  const [showBought, setShowBought] = useState(false)

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

  const handleMarkAsBought = async () => {
    if (!markingAsBought) return
    await markAsBought(markingAsBought.id, false)
    setMarkingAsBought(null)
  }

  const displayedItems = showBought ? boughtItems : itemsByPriority.filter(i => i.status !== 'bought')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Heart className="w-8 h-8 text-primary-600" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Wishlist</h1>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white 
                   rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Tambah</span>
        </button>
      </div>

      {/* Summary Card */}
      {activeItems.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Target</p>
              <p className="font-semibold text-gray-900 dark:text-gray-100">
                {formatCurrency(totals.totalTarget)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Sudah Ditabung</p>
              <p className="font-semibold text-green-600">
                {formatCurrency(totals.totalSaved)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Kurang</p>
              <p className="font-semibold text-amber-600">
                {formatCurrency(totals.totalRemaining)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setShowBought(false)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            !showBought
              ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
              : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
          }`}
        >
          Aktif ({activeItems.length})
        </button>
        <button
          onClick={() => setShowBought(true)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            showBought
              ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
              : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
          }`}
        >
          Sudah Dibeli ({boughtItems.length})
        </button>
      </div>

      {/* Wishlist List */}
      <WishlistList
        items={displayedItems}
        onEdit={setEditingItem}
        onDelete={setDeletingItem}
        onMarkAsBought={setMarkingAsBought}
      />

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
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Hapus Wishlist
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Apakah Anda yakin ingin menghapus "{deletingItem.name}" dari wishlist?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeletingItem(null)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 
                         text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 
                         dark:hover:bg-gray-700 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteItem}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg 
                         hover:bg-red-700 transition-colors"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mark as Bought Confirmation */}
      {markingAsBought && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Tandai Sudah Dibeli
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Tandai "{markingAsBought.name}" sebagai sudah dibeli?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setMarkingAsBought(null)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 
                         text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 
                         dark:hover:bg-gray-700 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleMarkAsBought}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg 
                         hover:bg-green-700 transition-colors"
              >
                Ya, Sudah Dibeli
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
