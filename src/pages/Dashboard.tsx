import { Plus, Receipt, PiggyBank, CreditCard } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useDashboard } from '../hooks/useDashboard'
import { useInstallmentStore } from '../store/installmentStore'
import { useSavingsStore } from '../store/savingsStore'
import { useMonthlyNeedStore } from '../store/monthlyNeedStore'
import { useSettingsStore } from '../store/settingsStore'
import { useGamificationStore } from '../store/gamificationStore'

// New simplified components
import HeroSummary from '../components/dashboard/HeroSummary'
import CompactQuickActions from '../components/dashboard/CompactQuickActions'
import UpcomingList from '../components/dashboard/UpcomingList'
import DashboardTabs from '../components/dashboard/DashboardTabs'
import CashflowTab from '../components/dashboard/CashflowTab'
import BreakdownTab from '../components/dashboard/BreakdownTab'
import ProgressTab from '../components/dashboard/ProgressTab'
import TrendsTab from '../components/dashboard/TrendsTab'
import CollapsibleInsights from '../components/dashboard/CollapsibleInsights'
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
    netWorthTrend,
    emergencyFundProgress,
    insights,
  } = useDashboard()

  const { installments } = useInstallmentStore()
  const { savings } = useSavingsStore()
  const { needs: monthlyNeeds } = useMonthlyNeedStore()
  const { settings } = useSettingsStore()
  const { 
    progress, 
    initialized: gamificationInitialized, 
    initialize: initGamification,
    getUnlockedAchievements,
  } = useGamificationStore()

  // Initialize gamification
  useEffect(() => {
    if (!gamificationInitialized) {
      initGamification()
    }
  }, [gamificationInitialized, initGamification])

  // Calculate total saved
  const totalSaved = savings.reduce((sum, s) => 
    sum + s.deposits.reduce((dSum, d) => dSum + d.amount, 0), 0
  )

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
      {/* Hero Summary - Main Stats */}
      <FadeIn delay={0}>
        <HeroSummary
          netWorth={netWorth}
          income={currentMonthSummary.income}
          expense={currentMonthSummary.expense}
          surplus={currentMonthSummary.surplus}
          budgetTotal={settings.monthlyLivingCost}
        />
      </FadeIn>

      {/* Quick Actions */}
      <FadeIn delay={50}>
        <CompactQuickActions
          onAddTransaction={handleAddTransaction}
          onPayInstallment={handlePayInstallment}
          onAddSavings={handleAddSavings}
        />
      </FadeIn>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column - Tabs (2/3 width on desktop) */}
        <FadeIn delay={100} className="lg:col-span-2">
          <DashboardTabs>
            {{
              cashflow: (
                <CashflowTab
                  data={monthlyCashflow}
                  currentIncome={currentMonthSummary.income}
                  currentExpense={currentMonthSummary.expense}
                  previousIncome={previousMonthSummary.income}
                  previousExpense={previousMonthSummary.expense}
                />
              ),
              breakdown: (
                <BreakdownTab
                  data={expenseBreakdown}
                  totalExpense={currentMonthSummary.expense}
                />
              ),
              progress: (
                <ProgressTab
                  currentStreak={progress.currentStreak}
                  longestStreak={progress.longestStreak}
                  totalTransactions={progress.totalTransactions}
                  totalSaved={totalSaved}
                  emergencyFund={emergencyFundProgress}
                  recentAchievements={getUnlockedAchievements().slice(-5)}
                />
              ),
              trends: (
                <TrendsTab
                  netWorthHistory={netWorthTrend}
                  currentNetWorth={netWorth}
                />
              ),
            }}
          </DashboardTabs>
        </FadeIn>

        {/* Right Column - Upcoming (1/3 width on desktop) */}
        <FadeIn delay={150} className="lg:col-span-1">
          <UpcomingList
            installments={installments}
            monthlyNeeds={monthlyNeeds}
            maxItems={6}
          />
        </FadeIn>
      </div>

      {/* Collapsible Insights */}
      {insights.length > 0 && (
        <FadeIn delay={200}>
          <CollapsibleInsights insights={insights} />
        </FadeIn>
      )}

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
