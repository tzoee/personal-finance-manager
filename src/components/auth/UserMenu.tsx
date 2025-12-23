/**
 * User Menu Component
 * Shows user info and logout button
 */

import { useState, useRef, useEffect } from 'react'
import { LogOut, User, ChevronDown } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'

export default function UserMenu() {
  const { user, signOut, loading } = useAuthStore()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (!user) return null

  const userInitial = user.email?.charAt(0).toUpperCase() || 'U'
  const userEmail = user.email || 'User'

  const handleLogout = async () => {
    setIsOpen(false)
    await signOut()
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
          <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
            {userInitial}
          </span>
        </div>
        <span className="hidden sm:block text-sm text-gray-700 dark:text-gray-300 max-w-[120px] truncate">
          {userEmail}
        </span>
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
          {/* User Info */}
          <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-500 dark:text-gray-400">Masuk sebagai</span>
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate mt-1">
              {userEmail}
            </p>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            disabled={loading}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
          >
            <LogOut className="w-4 h-4" />
            {loading ? 'Keluar...' : 'Keluar'}
          </button>
        </div>
      )}
    </div>
  )
}
