/**
 * FilterBar Component
 * Filter controls for transactions
 */

import { useState } from 'react'
import { Search, Filter, X, Calendar } from 'lucide-react'
import type { Category, TransactionFilters } from '../../types'

interface FilterBarProps {
  categories: Category[]
  filters: TransactionFilters
  onFilterChange: (filters: TransactionFilters) => void
  onSearch: (text: string) => void
}

export default function FilterBar({
  categories,
  filters,
  onFilterChange,
  onSearch,
}: FilterBarProps) {
  const [searchText, setSearchText] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const handleSearchChange = (value: string) => {
    setSearchText(value)
    onSearch(value)
  }

  const handleFilterChange = (key: keyof TransactionFilters, value: string | undefined) => {
    onFilterChange({
      ...filters,
      [key]: value || undefined,
    })
  }

  const clearFilters = () => {
    onFilterChange({})
    setSearchText('')
    onSearch('')
  }

  const hasActiveFilters = filters.type || filters.categoryId || filters.startDate || filters.endDate

  // Get current month date range
  const now = new Date()
  const currentMonthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
  const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]

  const setCurrentMonth = () => {
    onFilterChange({
      ...filters,
      startDate: currentMonthStart,
      endDate: currentMonthEnd,
    })
  }

  return (
    <div className="space-y-3">
      {/* Search and Filter Toggle */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchText}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Cari transaksi..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                     focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-3 py-2 border rounded-lg flex items-center gap-2 transition-colors ${
            hasActiveFilters
              ? 'border-primary-500 bg-primary-50 text-primary-600 dark:bg-primary-900/20'
              : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
        >
          <Filter className="w-4 h-4" />
          <span className="hidden sm:inline">Filter</span>
          {hasActiveFilters && (
            <span className="w-2 h-2 bg-primary-500 rounded-full" />
          )}
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter</span>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                Reset
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Type Filter */}
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Jenis</label>
              <select
                value={filters.type || ''}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="">Semua</option>
                <option value="income">Pemasukan</option>
                <option value="expense">Pengeluaran</option>
                <option value="transfer">Transfer</option>
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Kategori</label>
              <select
                value={filters.categoryId || ''}
                onChange={(e) => handleFilterChange('categoryId', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="">Semua</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Dari Tanggal</label>
              <input
                type="date"
                value={filters.startDate || ''}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Sampai Tanggal</label>
              <input
                type="date"
                value={filters.endDate || ''}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={setCurrentMonth}
              className="px-3 py-1 text-xs bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 
                       rounded-full hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors
                       flex items-center gap-1"
            >
              <Calendar className="w-3 h-3" />
              Bulan Ini
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
