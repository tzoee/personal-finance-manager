import { useState } from 'react'
import { Pencil, Trash2, TrendingUp, TrendingDown, Minus, RefreshCw } from 'lucide-react'
import type { Asset } from '../../types'
import { formatCurrency } from '../../utils/formatters'

interface AssetListProps {
  assets: Asset[]
  onEdit: (asset: Asset) => void
  onDelete: (id: string) => void
  onUpdateValue: (id: string, newValue: number) => void
  getValueChange: (asset: Asset) => { amount: number; percentage: number }
}

export default function AssetList({ assets, onEdit, onDelete, onUpdateValue, getValueChange }: AssetListProps) {
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [newValue, setNewValue] = useState('')

  const handleStartUpdate = (asset: Asset) => {
    setUpdatingId(asset.id)
    setNewValue(asset.currentValue.toString())
  }

  const handleCancelUpdate = () => {
    setUpdatingId(null)
    setNewValue('')
  }

  const handleConfirmUpdate = (id: string) => {
    const value = parseFloat(newValue)
    if (!isNaN(value) && value >= 0) {
      onUpdateValue(id, value)
    }
    setUpdatingId(null)
    setNewValue('')
  }

  const getTypeLabel = (asset: Asset): string => {
    const labels: Record<string, string> = {
      cash: 'Kas',
      savings: 'Tabungan',
      investment: 'Investasi',
      gold: 'Emas',
      property: 'Properti',
      debt: 'Hutang',
      loan: 'Pinjaman',
      other: 'Lainnya',
    }
    return labels[asset.type] || asset.type
  }

  if (assets.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        Belum ada data. Klik tombol "Tambah" untuk menambahkan.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {assets.map((asset) => {
        const change = getValueChange(asset)
        const isUpdating = updatingId === asset.id

        return (
          <div
            key={asset.id}
            className="card p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                    {asset.name}
                  </h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    asset.isLiability 
                      ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  }`}>
                    {getTypeLabel(asset)}
                  </span>
                </div>

                {isUpdating ? (
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      type="number"
                      value={newValue}
                      onChange={(e) => setNewValue(e.target.value)}
                      className="input w-40"
                      min="0"
                      step="any"
                      autoFocus
                    />
                    <button
                      onClick={() => handleConfirmUpdate(asset.id)}
                      className="btn btn-primary btn-sm"
                    >
                      Simpan
                    </button>
                    <button
                      onClick={handleCancelUpdate}
                      className="btn btn-secondary btn-sm"
                    >
                      Batal
                    </button>
                  </div>
                ) : (
                  <div className="mt-1">
                    <p className={`text-lg font-semibold ${
                      asset.isLiability ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
                    }`}>
                      {asset.isLiability ? '-' : ''}{formatCurrency(asset.currentValue)}
                    </p>
                    
                    {change.amount !== 0 && (
                      <div className="flex items-center gap-1 mt-1">
                        {change.amount > 0 ? (
                          <TrendingUp className="w-4 h-4 text-green-500" />
                        ) : change.amount < 0 ? (
                          <TrendingDown className="w-4 h-4 text-red-500" />
                        ) : (
                          <Minus className="w-4 h-4 text-gray-400" />
                        )}
                        <span className={`text-sm ${
                          change.amount > 0 ? 'text-green-600' : change.amount < 0 ? 'text-red-600' : 'text-gray-500'
                        }`}>
                          {change.amount > 0 ? '+' : ''}{formatCurrency(change.amount)}
                          {' '}({change.percentage > 0 ? '+' : ''}{change.percentage.toFixed(1)}%)
                        </span>
                      </div>
                    )}

                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Nilai awal: {formatCurrency(asset.initialValue)}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleStartUpdate(asset)}
                  className="p-2 text-gray-500 hover:text-primary-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  title="Update Nilai"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onEdit(asset)}
                  className="p-2 text-gray-500 hover:text-primary-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  title="Edit"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(asset.id)}
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  title="Hapus"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
