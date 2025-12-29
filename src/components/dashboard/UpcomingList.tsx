import { Calendar, CreditCard, Receipt } from 'lucide-react'
import { formatCurrency } from '../../utils/formatters'
import type { Installment, MonthlyNeed } from '../../types'

interface UpcomingItem {
  id: string
  name: string
  amount: number
  dueDate: number
  type: 'installment' | 'need'
  isOverdue: boolean
}

interface UpcomingListProps {
  installments: Installment[]
  monthlyNeeds: MonthlyNeed[]
  maxItems?: number
}

export default function UpcomingList({ 
  installments, 
  monthlyNeeds,
  maxItems = 5 
}: UpcomingListProps) {
  const today = new Date().getDate()

  const items: UpcomingItem[] = []

  installments
    .filter(i => i.status === 'active')
    .forEach(inst => {
      const startDate = new Date(inst.startDate)
      const dueDay = startDate.getDate()
      items.push({
        id: inst.id,
        name: inst.name,
        amount: inst.monthlyAmount,
        dueDate: dueDay,
        type: 'installment',
        isOverdue: dueDay < today,
      })
    })

  monthlyNeeds.forEach(need => {
    const dueDay = need.dueDay || 1
    items.push({
      id: need.id,
      name: need.name,
      amount: need.budgetAmount,
      dueDate: dueDay,
      type: 'need',
      isOverdue: dueDay < today,
    })
  })

  const sortedItems = items
    .sort((a, b) => {
      if (a.isOverdue && !b.isOverdue) return 1
      if (!a.isOverdue && b.isOverdue) return -1
      return a.dueDate - b.dueDate
    })
    .slice(0, maxItems)

  if (sortedItems.length === 0) {
    return (
      <div className="card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="w-5 h-5 text-teal-600" />
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">Jadwal Pembayaran</h3>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
          Tidak ada pembayaran terjadwal
        </p>
      </div>
    )
  }

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-teal-600" />
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">Jadwal Pembayaran</h3>
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
        </span>
      </div>

      <div className="space-y-2">
        {sortedItems.map((item) => (
          <div
            key={`${item.type}-${item.id}`}
            className={`flex items-center gap-3 p-2 rounded-lg ${
              item.isOverdue 
                ? 'bg-red-50 dark:bg-red-900/20' 
                : 'bg-gray-50 dark:bg-gray-700/50'
            }`}
          >
            <div className={`p-2 rounded-lg ${
              item.type === 'installment' 
                ? 'bg-violet-100 dark:bg-violet-900/30' 
                : 'bg-sky-100 dark:bg-sky-900/30'
            }`}>
              {item.type === 'installment' ? (
                <CreditCard className="w-4 h-4 text-violet-600 dark:text-violet-400" />
              ) : (
                <Receipt className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                {item.name}
              </p>
              <p className={`text-xs ${
                item.isOverdue 
                  ? 'text-red-600 dark:text-red-400' 
                  : 'text-gray-500 dark:text-gray-400'
              }`}>
                {item.isOverdue ? 'Lewat jatuh tempo' : `Tgl ${item.dueDate}`}
              </p>
            </div>

            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {formatCurrency(item.amount)}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
