import { Plus, CreditCard, PiggyBank } from 'lucide-react'

interface CompactQuickActionsProps {
  onAddTransaction: () => void
  onPayInstallment: () => void
  onAddSavings: () => void
}

export default function CompactQuickActions({
  onAddTransaction,
  onPayInstallment,
  onAddSavings,
}: CompactQuickActionsProps) {
  const actions = [
    {
      icon: <Plus className="w-5 h-5" />,
      label: 'Transaksi',
      onClick: onAddTransaction,
      color: 'bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-600 hover:to-blue-600',
    },
    {
      icon: <CreditCard className="w-5 h-5" />,
      label: 'Cicilan',
      onClick: onPayInstallment,
      color: 'bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600',
    },
    {
      icon: <PiggyBank className="w-5 h-5" />,
      label: 'Tabungan',
      onClick: onAddSavings,
      color: 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600',
    },
  ]

  return (
    <div className="flex gap-2">
      {actions.map((action) => (
        <button
          key={action.label}
          onClick={action.onClick}
          className={`flex-1 ${action.color} text-white rounded-xl p-3 flex flex-col items-center gap-1 transition-all active:scale-95 shadow-lg shadow-black/10`}
        >
          {action.icon}
          <span className="text-xs font-medium">{action.label}</span>
        </button>
      ))}
    </div>
  )
}
