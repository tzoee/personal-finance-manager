import { LayoutDashboard, TrendingUp, TrendingDown, ArrowUpDown, PiggyBank } from 'lucide-react'
import { useDashboard } from '../hooks/useDashboard'
import SummaryCard from '../components/dashboard/SummaryCard'
import CashflowChart from '../components/dashboard/CashflowChart'
import NetWorthChart from '../components/dashboard/NetWorthChart'
import ExpenseBreakdownChart from '../components/dashboard/ExpenseBreakdownChart'
import TrendChart from '../components/dashboard/TrendChart'
import EmergencyFundProgress from '../components/dashboard/EmergencyFundProgress'
import InsightCard from '../components/dashboard/InsightCard'
import TopCategories from '../components/dashboard/TopCategories'

export default function Dashboard() {
  const {
    currentMonthSummary,
    netWorth,
    monthlyCashflow,
    expenseBreakdown,
    topExpenseCategories,
    netWorthTrend,
    emergencyFundProgress,
    insights,
  } = useDashboard()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <LayoutDashboard className="w-8 h-8 text-primary-600" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard
          title="Net Worth"
          value={netWorth}
          icon={PiggyBank}
          iconColor={netWorth >= 0 ? 'text-primary-600 dark:text-primary-400' : 'text-orange-600 dark:text-orange-400'}
          iconBgColor={netWorth >= 0 ? 'bg-primary-100 dark:bg-primary-900/30' : 'bg-orange-100 dark:bg-orange-900/30'}
          valueColor={netWorth >= 0 ? 'text-primary-600 dark:text-primary-400' : 'text-orange-600 dark:text-orange-400'}
        />
        <SummaryCard
          title="Pemasukan"
          value={currentMonthSummary.income}
          icon={TrendingUp}
          iconColor="text-green-600 dark:text-green-400"
          iconBgColor="bg-green-100 dark:bg-green-900/30"
          valueColor="text-green-600 dark:text-green-400"
        />
        <SummaryCard
          title="Pengeluaran"
          value={currentMonthSummary.expense}
          icon={TrendingDown}
          iconColor="text-red-600 dark:text-red-400"
          iconBgColor="bg-red-100 dark:bg-red-900/30"
          valueColor="text-red-600 dark:text-red-400"
        />
        <SummaryCard
          title="Surplus"
          value={currentMonthSummary.surplus}
          icon={ArrowUpDown}
          iconColor={currentMonthSummary.surplus >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400'}
          iconBgColor={currentMonthSummary.surplus >= 0 ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-orange-100 dark:bg-orange-900/30'}
          valueColor={currentMonthSummary.surplus >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400'}
        />
      </div>

      {/* Insights */}
      {insights.length > 0 && <InsightCard insights={insights} />}

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CashflowChart data={monthlyCashflow} />
        <NetWorthChart data={netWorthTrend} />
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ExpenseBreakdownChart data={expenseBreakdown} />
        <TrendChart data={monthlyCashflow} />
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EmergencyFundProgress status={emergencyFundProgress} />
        <TopCategories categories={topExpenseCategories} />
      </div>
    </div>
  )
}
