import { format, startOfMonth, endOfMonth, subMonths, addMonths, differenceInMonths, parseISO, isValid } from 'date-fns'
import { id } from 'date-fns/locale'

/**
 * Get current date as ISO string (YYYY-MM-DD)
 */
export function getCurrentDate(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

/**
 * Get current year-month as string (YYYY-MM)
 */
export function getCurrentYearMonth(): string {
  return format(new Date(), 'yyyy-MM')
}

/**
 * Get start of month for a given date
 */
export function getMonthStart(dateStr: string): string {
  const date = parseISO(dateStr)
  return format(startOfMonth(date), 'yyyy-MM-dd')
}

/**
 * Get end of month for a given date
 */
export function getMonthEnd(dateStr: string): string {
  const date = parseISO(dateStr)
  return format(endOfMonth(date), 'yyyy-MM-dd')
}

/**
 * Get date N months ago
 */
export function getMonthsAgo(months: number): string {
  return format(subMonths(new Date(), months), 'yyyy-MM-dd')
}

/**
 * Get date N months from now
 */
export function getMonthsFromNow(months: number): string {
  return format(addMonths(new Date(), months), 'yyyy-MM-dd')
}

/**
 * Calculate difference in months between two dates
 */
export function getMonthDifference(startDate: string, endDate: string): number {
  return differenceInMonths(parseISO(endDate), parseISO(startDate))
}

/**
 * Get array of year-month strings for last N months
 */
export function getLastNMonths(n: number): string[] {
  const months: string[] = []
  for (let i = n - 1; i >= 0; i--) {
    months.push(format(subMonths(new Date(), i), 'yyyy-MM'))
  }
  return months
}

/**
 * Format date to Indonesian month name
 */
export function formatMonthName(yearMonth: string): string {
  const [year, month] = yearMonth.split('-')
  const date = new Date(parseInt(year), parseInt(month) - 1, 1)
  return format(date, 'MMMM yyyy', { locale: id })
}

/**
 * Format date to short month name (e.g., "Des 2024")
 */
export function formatShortMonth(yearMonth: string): string {
  const [year, month] = yearMonth.split('-')
  const date = new Date(parseInt(year), parseInt(month) - 1, 1)
  return format(date, 'MMM yyyy', { locale: id })
}

/**
 * Check if date string is valid
 */
export function isValidDate(dateStr: string): boolean {
  const date = parseISO(dateStr)
  return isValid(date)
}

/**
 * Get ISO timestamp for now
 */
export function getNowISO(): string {
  return new Date().toISOString()
}

/**
 * Check if a date is in the current month
 */
export function isCurrentMonth(dateStr: string): boolean {
  const date = parseISO(dateStr)
  const now = new Date()
  return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
}

/**
 * Get year and month from date string
 */
export function getYearMonth(dateStr: string): { year: number; month: number } {
  const date = parseISO(dateStr)
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
  }
}
