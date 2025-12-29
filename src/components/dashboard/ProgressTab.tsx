import { Flame, Trophy, Target, Award } from 'lucide-react'
import { formatCurrency } from '../../utils/formatters'
import type { Achievement, EmergencyFundStatus } from '../../types'

interface ProgressTabProps {
  currentStreak: number
  longestStreak: number
  totalTransactions: number
  totalSaved: number
  emergencyFund: EmergencyFundStatus
  recentAchievements: Achievement[]
}

export default function ProgressTab({
  currentStreak,
  longestStreak,
  totalTransactions,
  totalSaved,
  emergencyFund,
  recentAchievements,
}: ProgressTabProps) {
  return (
    <div className="space-y-4">
      {/* Streak & Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl border border-amber-100 dark:border-amber-800/30 text-center">
          <Flame className="w-6 h-6 text-amber-500 mx-auto mb-1" />
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{currentStreak}</p>
          <p className="text-xs text-amber-700 dark:text-amber-300">Hari Streak</p>
          <p className="text-[10px] text-gray-500 mt-1">Rekor: {longestStreak} hari</p>
        </div>

        <div className="p-3 bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-900/20 dark:to-blue-900/20 rounded-xl border border-sky-100 dark:border-sky-800/30 text-center">
          <Target className="w-6 h-6 text-sky-500 mx-auto mb-1" />
          <p className="text-2xl font-bold text-sky-600 dark:text-sky-400">{totalTransactions}</p>
          <p className="text-xs text-sky-700 dark:text-sky-300">Total Transaksi</p>
        </div>
      </div>

      {/* Emergency Fund Progress */}
      <div className="p-3 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800/30">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-emerald-500" />
            <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Dana Darurat</span>
          </div>
          <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
            {emergencyFund.progress.toFixed(0)}%
          </span>
        </div>
        <div className="h-2 bg-emerald-200 dark:bg-emerald-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(emergencyFund.progress, 100)}%` }}
          />
        </div>
        <div className="flex justify-between mt-1 text-xs text-emerald-600 dark:text-emerald-400">
          <span>{formatCurrency(emergencyFund.currentAmount)}</span>
          <span>Target: {formatCurrency(emergencyFund.targetAmount)}</span>
        </div>
      </div>

      {/* Recent Achievements */}
      {recentAchievements.length > 0 && (
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1">
            <Award className="w-3 h-3" />
            Pencapaian Terbaru
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {recentAchievements.slice(0, 5).map((achievement) => (
              <div
                key={achievement.id}
                className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-amber-400 via-yellow-400 to-orange-400 rounded-full flex items-center justify-center text-2xl shadow-lg shadow-amber-200/50 dark:shadow-amber-900/30"
                title={achievement.name}
              >
                {achievement.icon}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Total Saved */}
      <div className="text-center p-3 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 rounded-xl border border-violet-100 dark:border-violet-800/30">
        <p className="text-xs text-violet-600 dark:text-violet-400 mb-1">Total Tabungan</p>
        <p className="text-xl font-bold text-violet-700 dark:text-violet-300">
          {formatCurrency(totalSaved)}
        </p>
      </div>
    </div>
  )
}
