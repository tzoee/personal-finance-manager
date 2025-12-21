/**
 * Monthly Needs Page
 * Manage monthly recurring expenses with budget tracking and recurrence support
 */

import { useState, useEffect } from 'react'
import { Receipt, Plus, Check, X, Edit2, Trash2, RefreshCw } from 'lucide-react'
import { useMonthlyNeeds } from '../hooks/useMonthlyNeeds'
import type { MonthlyNeed, MonthlyNeedInput, RecurrencePeriod } from '../types'
import { formatCurrency } from '../utils/formatters'

export default function MonthlyNeeds() {
  const {
    needsWithStatus,
    totals,
    initialized,
    initialize,
    addNeed,
    updateNeed,
    deleteNeed,
    markAsPaid,
    unmarkAsPaid,
  } = useMonthlyNeeds()

  const [showForm, setShowForm] = useState(false)
  const [editingNeed, setEditingNeed] = useState<MonthlyNeed | null>(null)
  const [deletingNeed, setDeletingNeed] = useState<MonthlyNeed | null>(null)
  const [payingNeed, setPayingNeed] = useState<MonthlyNeed | null>(null)
  const [payAmount, setPayAmount] = useState('')

  // Form state
  const [formName, setFormName] = useState('')
  const [formBudget, setFormBudget] = useState('')
  const [formDueDay, setFormDueDay] = useState('')
  const [formNote, setFormNote] = useState('')
  const [formRecurrence, setFormRecurrence] = useState<RecurrencePeriod>('forever')
  const [formAutoGenerate, setFormAutoGenerate] = useState(false)
  const [formErrors, setFormErrors] = useState<string[]>([])

  useEffect(() => {
    if (!initialized) initialize()
  }, [initialized, initialize])

  const resetForm = () => {
    setFormName('')
    setFormBudget('')
    setFormDueDay('')
    setFormNote('')
    setFormRecurrence('forever')
    setFormAutoGenerate(false)
    setFormErrors([])
  }

  const openEditForm = (need: MonthlyNeed) => {
    setEditingNeed(need)
    setFormName(need.name)
    setFormBudget(need.budgetAmount.toString())
    setFormDueDay(need.dueDay?.toString() || '')
    setFormNote(need.note || '')
    setFormRecurrence(need.recurrencePeriod || 'forever')
    setFormAutoGenerate(need.autoGenerateTransaction || false)
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormErrors([])

    const parsedBudget = parseInt(formBudget.replace(/[^\d]/g, ''), 10)
    const parsedDueDay = formDueDay ? parseInt(formDueDay, 10) : undefined

    if (!formName.trim()) {
      setFormErrors(['Nama kebutuhan wajib diisi'])
      return
    }

    if (isNaN(parsedBudget) || parsedBudget <= 0) {
      setFormErrors(['Budget harus lebih dari 0'])
      return
    }

    const input: MonthlyNeedInput = {
      name: formName.trim(),
      budgetAmount: parsedBudget,
      dueDay: parsedDueDay,
      recurrencePeriod: formRecurrence,
      autoGenerateTransaction: formAutoGenerate,
      note: formNote.trim() || undefined,
    }

    if (editingNeed) {
      await updateNeed(editingNeed.id, input)
      setEditingNeed(null)
    } else {
      const result = await addNeed(input)
      if (!result.success && result.errors) {
        setFormErrors(result.errors)
        return
      }
    }

    setShowForm(false)
    resetForm()
  }

  const handleMarkAsPaid = async () => {
    if (!payingNeed) return
    const amount = parseInt(payAmount.replace(/[^\d]/g, ''), 10) || payingNeed.budgetAmount
    await markAsPaid(payingNeed.id, amount)
    setPayingNeed(null)
    setPayAmount('')
  }

  const handleDelete = async () => {
    if (!deletingNeed) return
    await deleteNeed(deletingNeed.id)
    setDeletingNeed(null)
  }

  const currentMonth = new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Receipt className="w-8 h-8 text-primary-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Kebutuhan Bulanan</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{currentMonth}</p>
          </div>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white 
                   rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Tambah</span>
        </button>
      </div>

      {/* Summary */}
      {needsWithStatus.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Budget</p>
              <p className="font-semibold text-gray-900 dark:text-gray-100">
                {formatCurrency(totals.totalBudget)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Sudah Dibayar</p>
              <p className="font-semibold text-green-600">
                {formatCurrency(totals.totalActual)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Status</p>
              <p className="font-semibold text-primary-600">
                {totals.paidCount}/{needsWithStatus.length}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Needs List */}
      {needsWithStatus.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
            <Receipt className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
            Belum ada kebutuhan bulanan
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Tambahkan pengeluaran rutin seperti listrik, air, internet
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {needsWithStatus.map(need => (
            <div
              key={need.id}
              className={`bg-white dark:bg-gray-800 rounded-xl border p-4 ${
                need.isPaid 
                  ? 'border-green-200 dark:border-green-800' 
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => need.isPaid ? unmarkAsPaid(need.id) : setPayingNeed(need)}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                      need.isPaid
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'border-gray-300 dark:border-gray-600 hover:border-primary-500'
                    }`}
                  >
                    {need.isPaid && <Check className="w-4 h-4" />}
                  </button>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className={`font-medium ${need.isPaid ? 'text-gray-500 line-through' : 'text-gray-900 dark:text-gray-100'}`}>
                        {need.name}
                      </h3>
                      {need.recurrencePeriod && need.recurrencePeriod !== 'forever' && (
                        <span className="px-1.5 py-0.5 text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded flex items-center gap-1">
                          <RefreshCw className="w-3 h-3" />
                          {need.recurrenceLabel}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Budget: {formatCurrency(need.budgetAmount)}
                      {need.dueDay && ` • Jatuh tempo: tanggal ${need.dueDay}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {need.isPaid && (
                    <span className={`text-sm font-medium ${need.isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
                      {formatCurrency(need.actualAmount)}
                    </span>
                  )}
                  <button onClick={() => openEditForm(need)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                    <Edit2 className="w-4 h-4 text-gray-500" />
                  </button>
                  <button onClick={() => setDeletingNeed(need)} className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded">
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {editingNeed ? 'Edit Kebutuhan' : 'Tambah Kebutuhan'}
              </h2>
              <button onClick={() => { setShowForm(false); setEditingNeed(null); resetForm(); }} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nama</label>
                <input type="text" value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Contoh: Listrik" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" autoFocus />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Budget (Rp)</label>
                <input type="text" inputMode="numeric" value={formBudget ? formatCurrency(parseInt(formBudget.replace(/[^\d]/g, ''), 10) || 0).replace('Rp ', '') : ''} onChange={(e) => setFormBudget(e.target.value.replace(/[^\d]/g, ''))} placeholder="0" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-right font-mono" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tanggal Jatuh Tempo (opsional)</label>
                <input type="number" value={formDueDay} onChange={(e) => setFormDueDay(e.target.value)} placeholder="1-31" min="1" max="31" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Catatan (opsional)</label>
                <input type="text" value={formNote} onChange={(e) => setFormNote(e.target.value)} placeholder="Catatan..." className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Periode Pengulangan</label>
                <select 
                  value={formRecurrence} 
                  onChange={(e) => setFormRecurrence(e.target.value as RecurrencePeriod)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="forever">Selamanya</option>
                  <option value="monthly">Bulanan (12 bulan)</option>
                  <option value="yearly">Tahunan (bulan yang sama)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {formRecurrence === 'monthly' && 'Akan muncul selama 12 bulan dari bulan ini'}
                  {formRecurrence === 'yearly' && 'Akan muncul setiap tahun di bulan yang sama'}
                  {formRecurrence === 'forever' && 'Akan muncul setiap bulan tanpa batas waktu'}
                </p>
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formAutoGenerate}
                  onChange={(e) => setFormAutoGenerate(e.target.checked)}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Auto-generate transaksi setiap bulan
                </span>
              </label>
              {formErrors.length > 0 && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                  {formErrors.map((error, i) => <p key={i} className="text-sm text-red-600 dark:text-red-400">{error}</p>)}
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowForm(false); setEditingNeed(null); resetForm(); }} className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">Batal</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">{editingNeed ? 'Simpan' : 'Tambah'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pay Modal */}
      {payingNeed && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Tandai Sudah Dibayar</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">{payingNeed.name}</p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Jumlah Aktual (Rp)</label>
              <input type="text" inputMode="numeric" value={payAmount ? formatCurrency(parseInt(payAmount.replace(/[^\d]/g, ''), 10) || 0).replace('Rp ', '') : ''} onChange={(e) => setPayAmount(e.target.value.replace(/[^\d]/g, ''))} placeholder={formatCurrency(payingNeed.budgetAmount).replace('Rp ', '')} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-right font-mono" />
              <p className="text-xs text-gray-500 mt-1">Kosongkan untuk menggunakan budget ({formatCurrency(payingNeed.budgetAmount)})</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setPayingNeed(null); setPayAmount(''); }} className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">Batal</button>
              <button onClick={handleMarkAsPaid} className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Tandai Dibayar</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deletingNeed && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Hapus Kebutuhan</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-6">Hapus "{deletingNeed.name}" dari daftar kebutuhan bulanan?</p>
            <div className="flex gap-3">
              <button onClick={() => setDeletingNeed(null)} className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">Batal</button>
              <button onClick={handleDelete} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
