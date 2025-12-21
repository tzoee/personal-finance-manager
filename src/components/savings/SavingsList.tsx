/**
 * SavingsList Component
 * Grid of SavingsCard components with empty state
 */

import { PiggyBank } from 'lucide-react'
import type { SavingsWithDetails } from '../../hooks/useSavings'
import SavingsCard from './SavingsCard'

interface SavingsListProps {
  savings: SavingsWithDetails[]
  onDeposit: (savings: SavingsWithDetails) => void
  onEdit: (savings: SavingsWithDetails) => void
  onDelete: (savings: SavingsWithDetails) => void
}

export default function SavingsList({
  savings,
  onDeposit,
  onEdit,
  onDelete,
}: SavingsListProps) {
  if (savings.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
          <PiggyBank className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
          Belum ada tabungan
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Mulai menabung untuk mencapai tujuan finansialmu
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {savings.map(s => (
        <SavingsCard
          key={s.id}
          savings={s}
          onDeposit={onDeposit}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
