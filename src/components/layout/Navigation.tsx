import { NavLink } from 'react-router-dom'
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

export default function Navigation() {
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

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-50">
        <div className="grid grid-cols-5 gap-1 px-2 py-2">
          {navItems.slice(0, 5).map((item) => (
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
        </div>
      </nav>
    </>
  )
}
