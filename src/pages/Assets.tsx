import { useState } from 'react'
import { PiggyBank, Plus, Wallet, CreditCard } from 'lucide-react'
import { useAssets } from '../hooks/useAssets'
import type { Asset, AssetInput } from '../types'
import AssetForm from '../components/assets/AssetForm'
import AssetList from '../components/assets/AssetList'
import NetWorthSummary from '../components/assets/NetWorthSummary'

export default function Assets() {
  const {
    assetsOnly,
    liabilitiesOnly,
    addAsset,
    updateAsset,
    updateAssetValue,
    deleteAsset,
    getNetWorth,
    getTotalAssets,
    getTotalLiabilities,
    getValueChange,
  } = useAssets()

  const [showForm, setShowForm] = useState(false)
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null)
  const [activeTab, setActiveTab] = useState<'assets' | 'liabilities'>('assets')

  const handleSubmit = async (data: AssetInput) => {
    if (editingAsset) {
      await updateAsset(editingAsset.id, data)
    } else {
      await addAsset(data)
    }
    setShowForm(false)
    setEditingAsset(null)
  }

  const handleEdit = (asset: Asset) => {
    setEditingAsset(asset)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Yakin ingin menghapus item ini?')) {
      await deleteAsset(id)
    }
  }

  const handleUpdateValue = async (id: string, newValue: number) => {
    await updateAssetValue(id, newValue)
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingAsset(null)
  }

  const currentList = activeTab === 'assets' ? assetsOnly : liabilitiesOnly

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <PiggyBank className="w-8 h-8 text-primary-600" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Aset & Net Worth</h1>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Tambah
        </button>
      </div>

      <NetWorthSummary
        totalAssets={getTotalAssets()}
        totalLiabilities={getTotalLiabilities()}
        netWorth={getNetWorth()}
      />

      <div className="card">
        <div className="flex border-b dark:border-gray-700">
          <button
            onClick={() => setActiveTab('assets')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'assets'
                ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <Wallet className="w-4 h-4" />
            Aset ({assetsOnly.length})
          </button>
          <button
            onClick={() => setActiveTab('liabilities')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'liabilities'
                ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            Liabilitas ({liabilitiesOnly.length})
          </button>
        </div>

        <div className="p-4">
          <AssetList
            assets={currentList}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onUpdateValue={handleUpdateValue}
            getValueChange={getValueChange}
          />
        </div>
      </div>

      {showForm && (
        <AssetForm
          initialData={editingAsset || undefined}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      )}
    </div>
  )
}
