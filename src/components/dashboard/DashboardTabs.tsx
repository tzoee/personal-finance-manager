import { useState, ReactNode } from 'react'
import { BarChart3, PieChart, Trophy, TrendingUp } from 'lucide-react'

interface Tab {
  id: string
  label: string
  icon: ReactNode
}

interface DashboardTabsProps {
  children: {
    cashflow: ReactNode
    breakdown: ReactNode
    progress: ReactNode
    trends: ReactNode
  }
}

const tabs: Tab[] = [
  { id: 'cashflow', label: 'Cashflow', icon: <BarChart3 className="w-4 h-4" /> },
  { id: 'breakdown', label: 'Breakdown', icon: <PieChart className="w-4 h-4" /> },
  { id: 'progress', label: 'Progress', icon: <Trophy className="w-4 h-4" /> },
  { id: 'trends', label: 'Tren', icon: <TrendingUp className="w-4 h-4" /> },
]

export default function DashboardTabs({ children }: DashboardTabsProps) {
  const [activeTab, setActiveTab] = useState('cashflow')

  return (
    <div className="card overflow-hidden">
      {/* Tab Headers */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-3 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-teal-600 border-b-2 border-teal-500 bg-teal-50 dark:bg-teal-900/20'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-4">
        {activeTab === 'cashflow' && children.cashflow}
        {activeTab === 'breakdown' && children.breakdown}
        {activeTab === 'progress' && children.progress}
        {activeTab === 'trends' && children.trends}
      </div>
    </div>
  )
}
