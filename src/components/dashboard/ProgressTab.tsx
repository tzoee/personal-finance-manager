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
        <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-center">
          <Flame className="w-6 h-6 text-orange-500 mx-auto mb-1" />
          <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{currentStreak}</p>
          <p className="text-xs text-orange-700 dark:text-orange-300">Hari Streak</p>
          <p className="text-[10px] text-gray-500 mt-1">Rekor: {longestStreak} hari</p>
        </div>

        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
          <Target className="w-6 h-6 text-blue-500 mx-auto mb-1" />
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalTransactions}</p>
          <p className="text-xs text-blue-700 dark:text-blue-300">Total Transaksi</p>
        </div>
      </div>

      {/* Emergency Fund Progress */}
      <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-700 dark:text-green-300">Dana Darurat</span>
          </div>
          <span className="text-sm font-bold text-green-600 dark:text-green-400">
            {emergencyFund.progress.toFixed(0)}%
          </span>
        </div>
        <div className="h-2 bg-green-200 dark:bg-green-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(emergencyFund.progress, 100)}%` }}
          />
        </div>
        <div className="flex justify-between mt-1 text-xs text-green-600 dark:text-green-400">
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
                className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center text-2xl shadow-md"
                title={achievement.name}
              >
                {achievement.icon}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Total Saved */}
      <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
        <p className="text-xs text-purple-600 dark:text-purple-400 mb-1">Total Tabungan</p>
        <p className="text-xl font-bold text-purple-700 dark:text-purple-300">
          {formatCurrency(totalSaved)}
        </p>
      </div>
    </div>
  )
}
