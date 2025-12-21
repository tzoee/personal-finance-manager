/**
 * InstallmentList Component
 * Displays installments with progress and payment options
 */

import { Calendar, Edit2, Trash2, CheckCircle, Clock, Wallet } from 'lucide-react'
import type { Installment } from '../../types'
import { formatCurrency } from '../../utils/formatters'
import PaymentHistory from './PaymentHistory'

interface InstallmentWithDetails extends Installment {
  remainingMonths: number
  remainingAmount: number
  totalAmount: number
  paidAmount: number
  progressPercentage: number
  periodPaid: number
  remainingThisPeriod: number
}

interface InstallmentListProps {
  installments: InstallmentWithDetails[]
  onEdit: (installment: Installment) => void
  onDelete: (installment: Installment) => void
  onPay?: (installment: InstallmentWithDetails) => void
}

export default function InstallmentList({
  installments,
  onEdit,
  onDelete,
  onPay,
}: InstallmentListProps) {
  if (installments.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
          <Calendar className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
          Belum ada cicilan
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Tambahkan cicilan bulanan yang sedang berjalan
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {installments.map(installment => (
        <div
          key={installment.id}
          className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 ${
            installment.status === 'paid_off' ? 'opacity-60' : ''
          }`}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                  {installment.name}
                </h3>
                {installment.status === 'paid_off' ? (
                  <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Lunas
                  </span>
                ) : (
                  <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Aktif
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">
                  {installment.subcategory}
                </span>
                <span>•</span>
                <span>{formatCurrency(installment.monthlyAmount)}/bulan</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 ml-2">
              {installment.status === 'active' && onPay && (
                <button
                  onClick={() => onPay(installment)}
                  className="px-2 py-1 text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 
                           rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors flex items-center gap-1"
                  title="Bayar"
                >
                  <Wallet className="w-3 h-3" />
                  Bayar
                </button>
              )}
              <button
                onClick={() => onEdit(installment)}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                title="Edit"
              >
                <Edit2 className="w-4 h-4 text-gray-500" />
              </button>
              <button
                onClick={() => onDelete(installment)}
                className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                title="Hapus"
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </button>
            </div>
          </div>

          {/* Progress */}
          <div className="mb-3">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-600 dark:text-gray-400">
                Bulan ke-{installment.currentMonth} dari {installment.totalTenor}
              </span>
              <span className="font-medium text-primary-600">
                {installment.progressPercentage.toFixed(0)}%
              </span>
            </div>

            <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  installment.status === 'paid_off' ? 'bg-green-500' : 'bg-primary-500'
                }`}
                style={{ width: `${installment.progressPercentage}%` }}
              />
            </div>

            {/* Period Progress - show partial payment progress */}
            {installment.status === 'active' && installment.periodPaid > 0 && (
              <div className="mt-2">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-gray-500 dark:text-gray-400">
                    Progress periode ini
                  </span>
                  <span className="text-gray-600 dark:text-gray-300">
                    {formatCurrency(installment.periodPaid)} / {formatCurrency(installment.monthlyAmount)}
                  </span>
                </div>
                <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all"
                    style={{ width: `${(installment.periodPaid / installment.monthlyAmount) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500 dark:text-gray-400">Sudah Dibayar</p>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {formatCurrency(installment.paidAmount)}
              </p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Sisa</p>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {formatCurrency(installment.remainingAmount)}
              </p>
            </div>
          </div>

          {/* Remaining Info */}
          {installment.status === 'active' && installment.remainingMonths > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {installment.remainingMonths} bulan lagi • Total: {formatCurrency(installment.totalAmount)}
              </p>
            </div>
          )}

          {/* Payment History */}
          {installment.payments && installment.payments.length > 0 && (
            <PaymentHistory 
              payments={installment.payments}
            />
          )}
        </div>
      ))}
    </div>
  )
}
