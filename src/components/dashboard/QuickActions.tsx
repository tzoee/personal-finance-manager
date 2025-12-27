/**
 * QuickActions Component
 * Fast action buttons for common tasks
 */

import { 
  CreditCard, 
  PiggyBank, 
  Receipt,
} from 'lucide-react'

interface QuickActionsProps {
  onAddTransaction: () => void
  onPayInstallment: () => void
  onAddSavings: () => void
}

export default function QuickActions({
  onAddTransaction,
  onPayInstallment,
  onAddSavings,
}: QuickActionsProps) {
  const actions = [
    {
      icon: Receipt,
      label: 'Transaksi',
      color: 'bg-blue-500 hover:bg-blue-600',
      onClick: onAddTransaction,
    },
    {
      icon: CreditCard,
      label: 'Bayar Cicilan',
      color: 'bg-purple-500 hover:bg-purple-600',
      onClick: onPayInstallment,
    },
    {
      icon: PiggyBank,
      label: 'Setor Tabungan',
      color: 'bg-emerald-500 hover:bg-emerald-600',
      onClick: onAddSavings,
    },
  ]

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
        Aksi Cepat
      </h3>
      
      <div className="grid grid-cols-3 gap-2">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            className={`${action.color} text-white rounded-lg p-3 flex flex-col items-center gap-1.5 transition-all transform hover:scale-105 active:scale-95`}
          >
            <action.icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
