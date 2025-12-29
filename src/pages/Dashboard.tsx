import { LayoutDashboard, Plus, Receipt, PiggyBank, CreditCard } from 'lucide-react'
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
import ActiveCommitments from '../components/dashboard/ActiveCommitments'
import EmergencyFundProgress from '../components/dashboard/EmergencyFundProgress'
import InsightCard from '../components/dashboard/InsightCard'
import TopCategories from '../components/dashboard/TopCategories'
import ExpenseHeatmap from '../components/dashboard/ExpenseHeatmap'
import InteractivePieChart from '../components/dashboard/InteractivePieChart'
import MonthComparisonChart from '../components/dashboard/MonthComparisonChart'
import FadeIn from '../components/ui/FadeIn'
import FloatingActionButton from '../components/ui/FloatingActionButton'

export default function Dashboard() {
  const navigate = useNavigate()
  const {
    currentMonthSummary,
    previousMonthSummary,
    netWorth,
    monthlyCashflow,
    expenseBreakdown,
    topExpenseCategories,
    netWorthTrend,
    emergencyFundProgress,
    insights,
    currentMonthTransactions,
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

  // FAB actions for mobile
  const fabActions = [
    {
      icon: <Receipt className="w-5 h-5" />,
      label: 'Transaksi',
      color: 'bg-blue-500 hover:bg-blue-600',
      onClick: handleAddTransaction,
    },
    {
      icon: <CreditCard className="w-5 h-5" />,
      label: 'Bayar Cicilan',
      color: 'bg-orange-500 hover:bg-orange-600',
      onClick: handlePayInstallment,
    },
    {
      icon: <PiggyBank className="w-5 h-5" />,
      label: 'Setor Tabungan',
      color: 'bg-green-500 hover:bg-green-600',
      onClick: handleAddSavings,
    },
  ]

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
          
          {/* Month Comparison & Expense Heatmap */}
          <FadeIn delay={250}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <MonthComparisonChart
                currentIncome={currentMonthSummary.income}
                currentExpense={currentMonthSummary.expense}
                previousIncome={previousMonthSummary.income}
                previousExpense={previousMonthSummary.expense}
              />
              <ExpenseHeatmap transactions={currentMonthTransactions} />
            </div>
          </FadeIn>

          {/* Interactive Pie Chart & Top Categories */}
          <FadeIn delay={300}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InteractivePieChart 
                data={expenseBreakdown} 
                totalExpense={currentMonthSummary.expense}
              />
              <TopCategories categories={topExpenseCategories} />
            </div>
          </FadeIn>

          {/* Emergency Fund */}
          <FadeIn delay={350}>
            <EmergencyFundProgress status={emergencyFundProgress} />
          </FadeIn>
        </div>

        {/* Right Column - Commitments */}
        <FadeIn delay={400} className="lg:col-span-1">
          <ActiveCommitments
            installments={installments}
            wishlist={wishlist}
            savings={savings}
          />
        </FadeIn>
      </div>

      {/* Mobile FAB */}
      <FloatingActionButton
        icon={<Plus className="w-6 h-6" />}
        actions={fabActions}
        position="bottom-right"
        className="md:hidden"
      />
    </div>
  )
}
