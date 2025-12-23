import { Wallet, Cloud, CloudOff, Loader2 } from 'lucide-react'
import UserMenu from '../auth/UserMenu'
import { useSyncStore } from '../../store/syncStore'

function SyncIndicator() {
  const { isSyncing, lastSynced, error } = useSyncStore()

  if (isSyncing) {
    return (
      <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
        <Loader2 className="w-3 h-3 animate-spin" />
        <span className="hidden sm:inline">Menyimpan...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center gap-1 text-xs text-red-500" title={error}>
        <CloudOff className="w-3 h-3" />
        <span className="hidden sm:inline">Offline</span>
      </div>
    )
  }

  if (lastSynced) {
    const syncDate = new Date(lastSynced)
    const timeAgo = getTimeAgo(syncDate)
    return (
      <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400" title={`Terakhir sync: ${syncDate.toLocaleString('id-ID')}`}>
        <Cloud className="w-3 h-3" />
        <span className="hidden sm:inline">{timeAgo}</span>
      </div>
    )
  }

  return null
}

function getTimeAgo(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  
  if (diffMins < 1) return 'Baru saja'
  if (diffMins < 60) return `${diffMins}m lalu`
  
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}j lalu`
  
  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays}h lalu`
}

export default function Header() {
  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 md:pl-64">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-lg">
              <Wallet className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Personal Finance Manager
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Kelola keuangan dengan mudah
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <SyncIndicator />
            <UserMenu />
          </div>
        </div>
      </div>
    </header>
  )
}
