/**
 * TransactionList Component
 * Displays list of transactions with summary
 */

import { TrendingUp, TrendingDown, ArrowLeftRight, Edit2, Trash2 } from 'lucide-react'
import type { Transaction } from '../../types'
import { formatCurrency, formatDate } from '../../utils/formatters'

interface TransactionWithCategory extends Transaction {
  categoryName: string
  subcategoryName?: string
}

interface TransactionListProps {
  transactions: TransactionWithCategory[]
  onEdit: (transaction: Transaction) => void
  onDelete: (transaction: Transaction) => void
}

const typeIcons = {
  income: TrendingUp,
  expense: TrendingDown,
  transfer: ArrowLeftRight,
}

const typeColors = {
  income: 'text-green-600 bg-green-100 dark:bg-green-900/30',
  expense: 'text-red-600 bg-red-100 dark:bg-red-900/30',
  transfer: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30',
}

export default function TransactionList({
  transactions,
  onEdit,
  onDelete,
}: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
          <ArrowLeftRight className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
          Belum ada transaksi
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Mulai catat transaksi pertama Anda
        </p>
      </div>
    )
  }

  // Group transactions by date
  const groupedByDate = transactions.reduce((acc, tx) => {
    if (!acc[tx.date]) acc[tx.date] = []
    acc[tx.date].push(tx)
    return acc
  }, {} as Record<string, TransactionWithCategory[]>)

  const sortedDates = Object.keys(groupedByDate).sort((a, b) => b.localeCompare(a))

  return (
    <div className="space-y-4">
      {sortedDates.map(date => {
        const dayTransactions = groupedByDate[date]
        const dayIncome = dayTransactions
          .filter(tx => tx.type === 'income')
          .reduce((sum, tx) => sum + tx.amount, 0)
        const dayExpense = dayTransactions
          .filter(tx => tx.type === 'expense')
          .reduce((sum, tx) => sum + tx.amount, 0)

        return (
          <div key={date} className="space-y-2">
            {/* Date Header */}
            <div className="flex items-center justify-between px-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {formatDate(date)}
              </span>
              <div className="flex items-center gap-3 text-xs">
                {dayIncome > 0 && (
                  <span className="text-green-600">+{formatCurrency(dayIncome)}</span>
                )}
                {dayExpense > 0 && (
                  <span className="text-red-600">-{formatCurrency(dayExpense)}</span>
                )}
              </div>
            </div>

            {/* Transactions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700">
              {dayTransactions.map(tx => {
                const Icon = typeIcons[tx.type]
                return (
                  <div
                    key={tx.id}
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    {/* Icon */}
                    <div className={`p-2 rounded-lg ${typeColors[tx.type]}`}>
                      <Icon className="w-4 h-4" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 dark:text-gray-100 truncate">
                          {tx.categoryName}
                        </span>
                        {tx.subcategoryName && (
                          <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            • {tx.subcategoryName}
                          </span>
                        )}
                      </div>
                      {tx.note && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {tx.note}
                        </p>
                      )}
                    </div>

                    {/* Amount */}
                    <div className={`text-right font-medium ${
                      tx.type === 'income' 
                        ? 'text-green-600' 
                        : tx.type === 'expense' 
                        ? 'text-red-600' 
                        : 'text-blue-600'
                    }`}>
                      {tx.type === 'income' ? '+' : tx.type === 'expense' ? '-' : ''}
                      {formatCurrency(tx.amount)}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onEdit(tx)}
                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4 text-gray-500" />
                      </button>
                      <button
                        onClick={() => onDelete(tx)}
                        className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                        title="Hapus"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
