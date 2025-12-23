import { Wallet } from 'lucide-react'
import UserMenu from '../auth/UserMenu'

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
          <UserMenu />
        </div>
      </div>
    </header>
  )
}
