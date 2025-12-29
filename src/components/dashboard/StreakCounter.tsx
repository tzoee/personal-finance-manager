import { Flame, Trophy, Calendar } from 'lucide-react'

interface StreakCounterProps {
  currentStreak: number
  longestStreak: number
  lastActivityDate?: string
}

export default function StreakCounter({ 
  currentStreak, 
  longestStreak, 
  lastActivityDate 
}: StreakCounterProps) {
  const isActiveToday = lastActivityDate === new Date().toISOString().split('T')[0]
  
  // Determine streak status
  const getStreakStatus = () => {
    if (currentStreak === 0) return { color: 'gray', message: 'Mulai streak baru!' }
    if (currentStreak >= 30) return { color: 'purple', message: 'Luar biasa!' }
    if (currentStreak >= 7) return { color: 'orange', message: 'Semangat terus!' }
    if (currentStreak >= 3) return { color: 'yellow', message: 'Bagus!' }
    return { color: 'blue', message: 'Pertahankan!' }
  }

  const status = getStreakStatus()

  const colorClasses: Record<string, string> = {
    gray: 'from-gray-400 to-gray-500',
    blue: 'from-blue-400 to-blue-600',
    yellow: 'from-yellow-400 to-orange-500',
    orange: 'from-orange-400 to-red-500',
    purple: 'from-purple-400 to-pink-500',
  }

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Flame className="w-5 h-5 text-orange-500" />
          Streak Harian
        </h3>
        {isActiveToday && (
          <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full">
            Aktif hari ini
          </span>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* Current Streak */}
        <div className={`
          flex-1 p-4 rounded-xl bg-gradient-to-br ${colorClasses[status.color]}
          text-white text-center relative overflow-hidden
        `}>
          {/* Animated flames for active streak */}
          {currentStreak > 0 && (
            <div className="absolute inset-0 opacity-20">
              <div className="absolute bottom-0 left-1/4 w-8 h-12 bg-white rounded-full blur-sm animate-pulse" />
              <div className="absolute bottom-0 right-1/4 w-6 h-10 bg-white rounded-full blur-sm animate-pulse delay-100" />
            </div>
          )}
          
          <div className="relative">
            <div className="text-4xl font-bold">{currentStreak}</div>
            <div className="text-sm opacity-90">hari berturut-turut</div>
            <div className="text-xs mt-1 opacity-75">{status.message}</div>
          </div>
        </div>

        {/* Stats */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Trophy className="w-4 h-4 text-yellow-500" />
            <div>
              <div className="text-gray-500 dark:text-gray-400 text-xs">Rekor</div>
              <div className="font-semibold text-gray-900 dark:text-gray-100">
                {longestStreak} hari
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-blue-500" />
            <div>
              <div className="text-gray-500 dark:text-gray-400 text-xs">Terakhir</div>
              <div className="font-semibold text-gray-900 dark:text-gray-100">
                {lastActivityDate 
                  ? new Date(lastActivityDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
                  : '-'
                }
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Streak progress bar to next milestone */}
      {currentStreak > 0 && currentStreak < 30 && (
        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
            <span>Progress ke {currentStreak < 7 ? '7' : currentStreak < 30 ? '30' : '100'} hari</span>
            <span>{currentStreak}/{currentStreak < 7 ? 7 : currentStreak < 30 ? 30 : 100}</span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className={`h-full bg-gradient-to-r ${colorClasses[status.color]} transition-all duration-500`}
              style={{ 
                width: `${(currentStreak / (currentStreak < 7 ? 7 : currentStreak < 30 ? 30 : 100)) * 100}%` 
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
