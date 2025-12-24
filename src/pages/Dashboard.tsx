import { LayoutDashboard } from 'lucide-react'
import { useDashboard } from '../hooks/useDashboard'
import { useInstallmentStore } from '../store/installmentStore'
import { useWishlistStore } from '../store/wishlistStore'
import { useSavingsStore } from '../store/savingsStore'
import QuickStats from '../components/dashboard/QuickStats'
import MiniCashflowChart from '../components/dashboard/MiniCashflowChart'
import MiniNetWorthChart from '../components/dashboard/MiniNetWorthChart'
import FinancialOverview from '../components/dashboard/FinancialOverview'
import ActiveCommitments from '../components/dashboard/ActiveCommitments'
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

  const { installments } = useInstallmentStore()
  const { items: wishlist } = useWishlistStore()
  const { savings } = useSavingsStore()

  // Calculate stats for QuickStats
  const activeInstallments = installments.filter(i => i.status === 'active')
  const totalInstallmentMonthly = activeInstallments.reduce((sum, i) => sum + i.monthlyAmount, 0)
  
  const totalSaved = savings.reduce((sum, s) => 
    sum + s.deposits.reduce((dSum, d) => dSum + d.amount, 0), 0
  )
  
  const activeWishlist = wishlist.filter(w => w.status !== 'bought')
  const wishlistProgress = activeWishlist.length > 0
    ? activeWishlist.reduce((sum, w) => {
        const progress = w.targetPrice > 0 ? (w.currentSaved / w.targetPrice) * 100 : 0
        return sum + progress
      }, 0) / activeWishlist.length
    : 0

  return (
    <div className="space-y-4 pb-20 md:pb-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <LayoutDashboard className="w-6 h-6 text-primary-600" />
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
      </div>

      {/* Quick Stats - Main Summary */}
      <QuickStats
        netWorth={netWorth}
        income={currentMonthSummary.income}
        expense={currentMonthSummary.expense}
        surplus={currentMonthSummary.surplus}
        activeInstallments={activeInstallments.length}
        totalInstallmentMonthly={totalInstallmentMonthly}
        savingsCount={savings.length}
        totalSaved={totalSaved}
        wishlistCount={activeWishlist.length}
        wishlistProgress={wishlistProgress}
      />

      {/* Insights - Show if any */}
      {insights.length > 0 && <InsightCard insights={insights} />}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column - Charts */}
        <div className="lg:col-span-2 space-y-4">
          {/* Cashflow & Net Worth Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <MiniCashflowChart data={monthlyCashflow} />
            <MiniNetWorthChart data={netWorthTrend} currentNetWorth={netWorth} />
          </div>
          
          {/* Two Column Grid for smaller cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Expense Distribution */}
            <FinancialOverview 
              expenseBreakdown={expenseBreakdown} 
              totalExpense={currentMonthSummary.expense}
            />
            
            {/* Top Categories */}
            <TopCategories categories={topExpenseCategories} />
          </div>

          {/* Emergency Fund */}
          <EmergencyFundProgress status={emergencyFundProgress} />
        </div>

        {/* Right Column - Commitments */}
        <div className="lg:col-span-1">
          <ActiveCommitments
            installments={installments}
            wishlist={wishlist}
            savings={savings}
          />
        </div>
      </div>
    </div>
  )
}
