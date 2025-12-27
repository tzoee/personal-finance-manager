/**
 * UpcomingDueDates Component
 * Mini calendar showing upcoming due dates for installments and monthly needs
 */

import { Calendar, CreditCard, Receipt } from 'lucide-react'
import { format, parseISO, differenceInDays, addMonths, setDate } from 'date-fns'
import { id } from 'date-fns/locale'
import type { Installment, MonthlyNeed } from '../../types'
import { formatCurrency } from '../../utils/formatters'
import { getCurrentDate } from '../../utils/dateUtils'

interface DueItem {
  id: string
  name: string
  amount: number
  dueDate: Date
  type: 'installment' | 'monthly-need'
  daysUntil: number
}

interface UpcomingDueDatesProps {
  installments: Installment[]
  monthlyNeeds: MonthlyNeed[]
}

export default function UpcomingDueDates({ installments, monthlyNeeds }: UpcomingDueDatesProps) {
  const today = parseISO(getCurrentDate())
  
  // Calculate upcoming due dates
  const dueItems: DueItem[] = []
  
  // Add active installments (assume due on same day each month as start date)
  installments
    .filter(i => i.status === 'active')
    .forEach(inst => {
      const startDate = parseISO(inst.startDate)
      const dueDay = startDate.getDate()
      
      // Get next due date
      let nextDue = setDate(today, dueDay)
      if (nextDue <= today) {
        nextDue = addMonths(nextDue, 1)
      }
      
      dueItems.push({
        id: inst.id,
        name: inst.name,
        amount: inst.monthlyAmount,
        dueDate: nextDue,
        type: 'installment',
        daysUntil: differenceInDays(nextDue, today),
      })
    })
  
  // Add monthly needs with due day
  monthlyNeeds
    .filter(n => n.dueDay)
    .forEach(need => {
      let nextDue = setDate(today, need.dueDay!)
      if (nextDue <= today) {
        nextDue = addMonths(nextDue, 1)
      }
      
      dueItems.push({
        id: need.id,
        name: need.name,
        amount: need.budgetAmount,
        dueDate: nextDue,
        type: 'monthly-need',
        daysUntil: differenceInDays(nextDue, today),
      })
    })
  
  // Sort by due date and take first 5
  const upcomingItems = dueItems
    .sort((a, b) => a.daysUntil - b.daysUntil)
    .slice(0, 5)

  if (upcomingItems.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="w-4 h-4 text-primary-500" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Jatuh Tempo
          </h3>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center py-4">
          Tidak ada jatuh tempo dalam waktu dekat
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
      <div className="flex items-center gap-2 mb-3">
        <Calendar className="w-4 h-4 text-primary-500" />
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          Jatuh Tempo
        </h3>
      </div>
      
      <div className="space-y-2">
        {upcomingItems.map((item) => (
          <div
            key={`${item.type}-${item.id}`}
            className={`flex items-center justify-between p-2 rounded-lg ${
              item.daysUntil <= 3 
                ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800' 
                : item.daysUntil <= 7
                ? 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800'
                : 'bg-gray-50 dark:bg-gray-700/50'
            }`}
          >
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded ${
                item.type === 'installment' 
                  ? 'bg-purple-100 dark:bg-purple-900/30' 
                  : 'bg-blue-100 dark:bg-blue-900/30'
              }`}>
                {item.type === 'installment' 
                  ? <CreditCard className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                  : <Receipt className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                }
              </div>
              <div>
                <p className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate max-w-[120px]">
                  {item.name}
                </p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">
                  {format(item.dueDate, 'd MMM', { locale: id })}
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                {formatCurrency(item.amount)}
              </p>
              <p className={`text-[10px] font-medium ${
                item.daysUntil <= 3 
                  ? 'text-red-600 dark:text-red-400' 
                  : item.daysUntil <= 7
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-gray-500 dark:text-gray-400'
              }`}>
                {item.daysUntil === 0 
                  ? 'Hari ini!' 
                  : item.daysUntil === 1 
                  ? 'Besok' 
                  : `${item.daysUntil} hari`}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
