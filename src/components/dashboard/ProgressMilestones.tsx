import { Target, TrendingUp, Wallet, PiggyBank } from 'lucide-react'
import { formatCurrency } from '../../utils/formatters'

interface Milestone {
  id: string
  label: string
  target: number
  current: number
  icon: React.ReactNode
  color: string
  unit?: string
}

interface ProgressMilestonesProps {
  totalTransactions: number
  totalSaved: number
  currentStreak: number
  monthlyBudgetProgress: number // 0-100
}

export default function ProgressMilestones({
  totalTransactions,
  totalSaved,
  currentStreak,
  monthlyBudgetProgress,
}: ProgressMilestonesProps) {
  // Calculate next milestone for each category
  const getNextMilestone = (current: number, milestones: number[]): number => {
    return milestones.find(m => m > current) || milestones[milestones.length - 1]
  }

  const transactionMilestones = [10, 50, 100, 250, 500, 1000]
  const savingsMilestones = [1000000, 5000000, 10000000, 25000000, 50000000, 100000000]
  const streakMilestones = [3, 7, 14, 30, 60, 100]

  const milestones: Milestone[] = [
    {
      id: 'transactions',
      label: 'Transaksi',
      target: getNextMilestone(totalTransactions, transactionMilestones),
      current: totalTransactions,
      icon: <TrendingUp className="w-4 h-4" />,
      color: 'blue',
    },
    {
      id: 'savings',
      label: 'Total Tabungan',
      target: getNextMilestone(totalSaved, savingsMilestones),
      current: totalSaved,
      icon: <PiggyBank className="w-4 h-4" />,
      color: 'green',
      unit: 'currency',
    },
    {
      id: 'streak',
      label: 'Streak',
      target: getNextMilestone(currentStreak, streakMilestones),
      current: currentStreak,
      icon: <Target className="w-4 h-4" />,
      color: 'orange',
      unit: 'hari',
    },
    {
      id: 'budget',
      label: 'Budget Bulan Ini',
      target: 100,
      current: monthlyBudgetProgress,
      icon: <Wallet className="w-4 h-4" />,
      color: 'purple',
      unit: '%',
    },
  ]

  const colorClasses: Record<string, { bg: string; fill: string; text: string }> = {
    blue: { 
      bg: 'bg-blue-100 dark:bg-blue-900/30', 
      fill: 'bg-blue-500', 
      text: 'text-blue-600 dark:text-blue-400' 
    },
    green: { 
      bg: 'bg-green-100 dark:bg-green-900/30', 
      fill: 'bg-green-500', 
      text: 'text-green-600 dark:text-green-400' 
    },
    orange: { 
      bg: 'bg-orange-100 dark:bg-orange-900/30', 
      fill: 'bg-orange-500', 
      text: 'text-orange-600 dark:text-orange-400' 
    },
    purple: { 
      bg: 'bg-purple-100 dark:bg-purple-900/30', 
      fill: 'bg-purple-500', 
      text: 'text-purple-600 dark:text-purple-400' 
    },
  }

  const formatValue = (value: number, unit?: string) => {
    if (unit === 'currency') return formatCurrency(value)
    if (unit) return `${value} ${unit}`
    return value.toString()
  }

  return (
    <div className="card p-4">
      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
        <Target className="w-5 h-5 text-primary-600" />
        Progress Milestone
      </h3>

      <div className="space-y-4">
        {milestones.map((milestone) => {
          const progress = Math.min((milestone.current / milestone.target) * 100, 100)
          const colors = colorClasses[milestone.color]
          const isComplete = progress >= 100

          return (
            <div key={milestone.id} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className={`p-1.5 rounded-lg ${colors.bg} ${colors.text}`}>
                    {milestone.icon}
                  </span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {milestone.label}
                  </span>
                </div>
                <div className="text-right">
                  <span className={`font-semibold ${colors.text}`}>
                    {formatValue(milestone.current, milestone.unit)}
                  </span>
                  <span className="text-gray-400 dark:text-gray-500 mx-1">/</span>
                  <span className="text-gray-500 dark:text-gray-400">
                    {formatValue(milestone.target, milestone.unit)}
                  </span>
                </div>
              </div>

              <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className={`absolute inset-y-0 left-0 ${colors.fill} rounded-full transition-all duration-500`}
                  style={{ width: `${progress}%` }}
                />
                {isComplete && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                )}
              </div>

              {isComplete && (
                <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                  <span>✓</span> Milestone tercapai!
                </p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
