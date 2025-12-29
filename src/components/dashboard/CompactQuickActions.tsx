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
      color: 'bg-gradient-to-r from-[#CA2851] to-[#FF6766] hover:from-[#b82349] hover:to-[#f83b3a]',
    },
    {
      icon: <CreditCard className="w-5 h-5" />,
      label: 'Cicilan',
      onClick: onPayInstallment,
      color: 'bg-gradient-to-r from-[#FF6766] to-[#FFB173] hover:from-[#f83b3a] hover:to-[#ff9a4d]',
    },
    {
      icon: <PiggyBank className="w-5 h-5" />,
      label: 'Tabungan',
      onClick: onAddSavings,
      color: 'bg-gradient-to-r from-[#FFB173] to-[#FFE3B3] hover:from-[#ff9a4d] hover:to-[#ffd699] text-gray-800',
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
