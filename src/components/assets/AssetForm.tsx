import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import type { Asset, AssetInput, AssetType, LiabilityType } from '../../types'

interface AssetFormProps {
  initialData?: Asset
  onSubmit: (data: AssetInput) => void
  onCancel: () => void
}

const assetTypes: { value: AssetType; label: string }[] = [
  { value: 'cash', label: 'Kas' },
  { value: 'savings', label: 'Tabungan' },
  { value: 'investment', label: 'Investasi' },
  { value: 'gold', label: 'Emas' },
  { value: 'property', label: 'Properti' },
  { value: 'other', label: 'Lainnya' },
]

const liabilityTypes: { value: LiabilityType; label: string }[] = [
  { value: 'debt', label: 'Hutang' },
  { value: 'loan', label: 'Pinjaman' },
  { value: 'other', label: 'Lainnya' },
]

export default function AssetForm({ initialData, onSubmit, onCancel }: AssetFormProps) {
  const [name, setName] = useState(initialData?.name || '')
  const [isLiability, setIsLiability] = useState(initialData?.isLiability || false)
  const [type, setType] = useState<AssetType | LiabilityType>(initialData?.type || 'cash')
  const [initialValue, setInitialValue] = useState(initialData?.initialValue?.toString() || '')
  const [currentValue, setCurrentValue] = useState(initialData?.currentValue?.toString() || '')
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    // Reset type when switching between asset/liability
    if (isLiability && !['debt', 'loan', 'other'].includes(type)) {
      setType('debt')
    } else if (!isLiability && ['debt', 'loan'].includes(type)) {
      setType('cash')
    }
  }, [isLiability])

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!name.trim()) {
      newErrors.name = 'Nama wajib diisi'
    }

    const initialVal = parseFloat(initialValue)
    if (isNaN(initialVal) || initialVal < 0) {
      newErrors.initialValue = 'Nilai awal harus >= 0'
    }

    const currentVal = parseFloat(currentValue)
    if (isNaN(currentVal) || currentVal < 0) {
      newErrors.currentValue = 'Nilai saat ini harus >= 0'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    onSubmit({
      name: name.trim(),
      type,
      isLiability,
      initialValue: parseFloat(initialValue),
      currentValue: parseFloat(currentValue),
    })
  }

  const typeOptions = isLiability ? liabilityTypes : assetTypes

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {initialData ? 'Edit' : 'Tambah'} {isLiability ? 'Liabilitas' : 'Aset'}
          </h2>
          <button onClick={onCancel} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={!isLiability}
                onChange={() => setIsLiability(false)}
                className="text-primary-600"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Aset</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={isLiability}
                onChange={() => setIsLiability(true)}
                className="text-primary-600"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Liabilitas</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nama
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input w-full"
              placeholder={isLiability ? 'Contoh: KPR Rumah' : 'Contoh: Tabungan BCA'}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tipe
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as AssetType | LiabilityType)}
              className="input w-full"
            >
              {typeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nilai Awal
            </label>
            <input
              type="number"
              value={initialValue}
              onChange={(e) => setInitialValue(e.target.value)}
              className="input w-full"
              placeholder="0"
              min="0"
              step="any"
            />
            {errors.initialValue && <p className="text-red-500 text-sm mt-1">{errors.initialValue}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nilai Saat Ini
            </label>
            <input
              type="number"
              value={currentValue}
              onChange={(e) => setCurrentValue(e.target.value)}
              className="input w-full"
              placeholder="0"
              min="0"
              step="any"
            />
            {errors.currentValue && <p className="text-red-500 text-sm mt-1">{errors.currentValue}</p>}
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onCancel} className="btn btn-secondary flex-1">
              Batal
            </button>
            <button type="submit" className="btn btn-primary flex-1">
              {initialData ? 'Simpan' : 'Tambah'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
