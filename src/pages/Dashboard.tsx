import { LayoutDashboard } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useDashboard } from '../hooks/useDashboard'
import { useInstallmentStore } from '../store/installmentStore'
import { useWishlistStore } from '../store/wishlistStore'
import { useSavingsStore } from '../store/savingsStore'
import { useMonthlyNeedStore } from '../store/monthlyNeedStore'
import { useSettingsStore } from '../store/settingsStore'
import QuickStats from '../components/dashboard/QuickStats'
import QuickActions from '../components/dashboard/QuickActions'
import UpcomingDueDates from '../components/dashboard/UpcomingDueDates'
import BudgetProgress from '../components/dashboard/BudgetProgress'
import MiniCashflowChart from '../components/dashboard/MiniCashflowChart'
import MiniNetWorthChart from '../components/dashboard/MiniNetWorthChart'
import FinancialOverview from '../components/dashboard/FinancialOverview'
import ActiveCommitments from '../components/dashboard/ActiveCommitments'
import EmergencyFundProgress from '../components/dashboard/EmergencyFundProgress'
import InsightCard from '../components/dashboard/InsightCard'
import TopCategories from '../components/dashboard/TopCategories'
import FadeIn from '../components/ui/FadeIn'

export default function Dashboard() {
  const navigate = useNavigate()
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
  const { needs: monthlyNeeds } = useMonthlyNeedStore()
  const { settings } = useSettingsStore()

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

  // Quick action handlers
  const handleAddTransaction = () => navigate('/transactions')
  const handlePayInstallment = () => navigate('/installments')
  const handleAddSavings = () => navigate('/savings')

  return (
    <div className="space-y-4 pb-20 md:pb-6">
      {/* Header */}
      <FadeIn delay={0}>
        <div className="flex items-center gap-2">
          <LayoutDashboard className="w-6 h-6 text-primary-600" />
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
        </div>
      </FadeIn>

      {/* Quick Stats - Main Summary */}
      <FadeIn delay={50}>
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
      </FadeIn>

      {/* Insights - Show if any */}
      {insights.length > 0 && (
        <FadeIn delay={100}>
          <InsightCard insights={insights} />
        </FadeIn>
      )}

      {/* Quick Actions & Due Dates Row */}
      <FadeIn delay={150}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <QuickActions
            onAddTransaction={handleAddTransaction}
            onPayInstallment={handlePayInstallment}
            onAddSavings={handleAddSavings}
          />
          <UpcomingDueDates 
            installments={installments}
            monthlyNeeds={monthlyNeeds}
          />
          <BudgetProgress 
            budget={settings.monthlyLivingCost}
            actual={currentMonthSummary.expense}
          />
        </div>
      </FadeIn>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column - Charts */}
        <div className="lg:col-span-2 space-y-4">
          {/* Cashflow & Net Worth Charts */}
          <FadeIn delay={200}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <MiniCashflowChart data={monthlyCashflow} />
              <MiniNetWorthChart data={netWorthTrend} currentNetWorth={netWorth} />
            </div>
          </FadeIn>
          
          {/* Two Column Grid for smaller cards */}
          <FadeIn delay={250}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Expense Distribution */}
              <FinancialOverview 
                expenseBreakdown={expenseBreakdown} 
                totalExpense={currentMonthSummary.expense}
              />
              
              {/* Top Categories */}
              <TopCategories categories={topExpenseCategories} />
            </div>
          </FadeIn>

          {/* Emergency Fund */}
          <FadeIn delay={300}>
            <EmergencyFundProgress status={emergencyFundProgress} />
          </FadeIn>
        </div>

        {/* Right Column - Commitments */}
        <FadeIn delay={350} className="lg:col-span-1">
          <ActiveCommitments
            installments={installments}
            wishlist={wishlist}
            savings={savings}
          />
        </FadeIn>
      </div>
    </div>
  )
}
