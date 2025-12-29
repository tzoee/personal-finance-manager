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
        <div className="p-3 bg-gradient-to-br from-[#FF6766]/10 to-[#FFB173]/10 dark:from-[#FF6766]/20 dark:to-[#FFB173]/20 rounded-xl border border-[#FF6766]/30 text-center">
          <Flame className="w-6 h-6 text-[#FF6766] mx-auto mb-1" />
          <p className="text-2xl font-bold text-[#CA2851] dark:text-[#FF6766]">{currentStreak}</p>
          <p className="text-xs text-[#CA2851] dark:text-[#FF6766]">Hari Streak</p>
          <p className="text-[10px] text-gray-500 mt-1">Rekor: {longestStreak} hari</p>
        </div>

        <div className="p-3 bg-gradient-to-br from-[#FFB173]/10 to-[#FFE3B3]/10 dark:from-[#FFB173]/20 dark:to-[#FFE3B3]/20 rounded-xl border border-[#FFB173]/30 text-center">
          <Target className="w-6 h-6 text-[#FFB173] mx-auto mb-1" />
          <p className="text-2xl font-bold text-[#CA2851] dark:text-[#FFB173]">{totalTransactions}</p>
          <p className="text-xs text-[#CA2851] dark:text-[#FFB173]">Total Transaksi</p>
        </div>
      </div>

      {/* Emergency Fund Progress */}
      <div className="p-3 bg-gradient-to-br from-[#FFE3B3]/20 to-[#FFB173]/10 dark:from-[#FFE3B3]/10 dark:to-[#FFB173]/10 rounded-xl border border-[#FFE3B3]/50">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-[#FFB173]" />
            <span className="text-sm font-medium text-[#CA2851] dark:text-[#FFB173]">Dana Darurat</span>
          </div>
          <span className="text-sm font-bold text-[#CA2851] dark:text-[#FF6766]">
            {emergencyFund.progress.toFixed(0)}%
          </span>
        </div>
        <div className="h-2 bg-[#FFE3B3]/50 dark:bg-[#FFE3B3]/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#CA2851] via-[#FF6766] to-[#FFB173] rounded-full transition-all duration-500"
            style={{ width: `${Math.min(emergencyFund.progress, 100)}%` }}
          />
        </div>
        <div className="flex justify-between mt-1 text-xs text-[#CA2851] dark:text-[#FF6766]">
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
                className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-[#CA2851] via-[#FF6766] to-[#FFB173] rounded-full flex items-center justify-center text-2xl shadow-lg shadow-[#FF6766]/30"
                title={achievement.name}
              >
                {achievement.icon}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Total Saved */}
      <div className="text-center p-3 bg-gradient-to-br from-[#CA2851]/10 to-[#FF6766]/10 dark:from-[#CA2851]/20 dark:to-[#FF6766]/20 rounded-xl border border-[#CA2851]/30">
        <p className="text-xs text-[#CA2851] dark:text-[#FF6766] mb-1">Total Tabungan</p>
        <p className="text-xl font-bold text-[#CA2851] dark:text-[#FF6766]">
          {formatCurrency(totalSaved)}
        </p>
      </div>
    </div>
  )
}
