import { NavLink, useLocation } from 'react-router-dom'
import { useState } from 'react'
import {
  LayoutDashboard,
  Receipt,
  Tags,
  Heart,
  CreditCard,
  CalendarCheck,
  PiggyBank,
  Wallet,
  Settings,
  MoreHorizontal,
  X,
} from 'lucide-react'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/transactions', icon: Receipt, label: 'Transaksi' },
  { to: '/categories', icon: Tags, label: 'Kategori' },
  { to: '/wishlist', icon: Heart, label: 'Wishlist' },
  { to: '/savings', icon: PiggyBank, label: 'Tabungan' },
  { to: '/installments', icon: CreditCard, label: 'Cicilan' },
  { to: '/monthly-needs', icon: CalendarCheck, label: 'Kebutuhan' },
  { to: '/assets', icon: Wallet, label: 'Aset' },
  { to: '/settings', icon: Settings, label: 'Pengaturan' },
]

// Items shown in mobile bottom nav (first 4 + more button)
const mobileMainItems = navItems.slice(0, 4)
const mobileMoreItems = navItems.slice(4)

export default function Navigation() {
  const [showMoreMenu, setShowMoreMenu] = useState(false)
  const location = useLocation()
  
  // Check if current path is in "more" items
  const isMoreActive = mobileMoreItems.some(item => location.pathname === item.to)

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4 mb-6">
            <div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-lg">
              <PiggyBank className="w-8 h-8 text-primary-600 dark:text-primary-400" />
            </div>
            <span className="ml-3 text-xl font-bold text-gray-900 dark:text-gray-100">
              FinanceApp
            </span>
          </div>
          <nav className="flex-1 px-2 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`
                }
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>

      {/* Mobile More Menu Overlay */}
      {showMoreMenu && (
        <div className="md:hidden fixed inset-0 z-50">
          <div 
            className="absolute inset-0 bg-black/50" 
            onClick={() => setShowMoreMenu(false)}
          />
          <div className="absolute bottom-16 left-0 right-0 bg-white dark:bg-gray-800 rounded-t-2xl p-4 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Menu Lainnya</h3>
              <button 
                onClick={() => setShowMoreMenu(false)}
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {mobileMoreItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setShowMoreMenu(false)}
                  className={({ isActive }) =>
                    `flex flex-col items-center p-3 rounded-xl transition-colors ${
                      isActive
                        ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/50 dark:text-primary-400'
                        : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
                    }`
                  }
                >
                  <item.icon className="w-6 h-6 mb-1" />
                  <span className="text-xs font-medium">{item.label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-40">
        <div className="grid grid-cols-5 gap-1 px-2 py-2">
          {mobileMainItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-gray-500 dark:text-gray-400'
                }`
              }
            >
              <item.icon className="w-5 h-5 mb-0.5" />
              <span className="truncate">{item.label}</span>
            </NavLink>
          ))}
          {/* More Button */}
          <button
            onClick={() => setShowMoreMenu(true)}
            className={`flex flex-col items-center py-1.5 text-xs font-medium rounded-lg transition-colors ${
              isMoreActive || showMoreMenu
                ? 'text-primary-600 dark:text-primary-400'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            <MoreHorizontal className="w-5 h-5 mb-0.5" />
            <span className="truncate">Lainnya</span>
          </button>
        </div>
      </nav>
    </>
  )
}
