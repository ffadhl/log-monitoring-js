// lib/date-utils.ts
// Date utility functions for CareerTrack

import {
  startOfWeek,
  endOfWeek,
  startOfDay,
  endOfDay,
  format,
  getWeek,
  getYear,
  addWeeks,
  subWeeks,
  eachDayOfInterval,
  isSameDay,
  parseISO,
  isValid,
} from 'date-fns'

// Get the start of week (Monday)
export function getWeekStart(date: Date): Date {
  return startOfWeek(date, { weekStartsOn: 1 })
}

// Get the end of week (Sunday)
export function getWeekEnd(date: Date): Date {
  return endOfWeek(date, { weekStartsOn: 1 })
}

// Get the start of day
export function getStartOfDay(date: Date): Date {
  return startOfDay(date)
}

// Get the end of day
export function getEndOfDay(date: Date): Date {
  return endOfDay(date)
}

// Get week number
export function getWeekNumber(date: Date): number {
  return getWeek(date, { weekStartsOn: 1 })
}

// Get year
export function getYearNumber(date: Date): number {
  return getYear(date)
}

// Format date for display
export function formatDate(date: Date | string, formatStr: string = 'MMM d, yyyy'): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  if (!isValid(d)) return 'Invalid date'
  return format(d, formatStr)
}

// Format date range
export function formatDateRange(start: Date | string, end: Date | string): string {
  const startDate = typeof start === 'string' ? parseISO(start) : start
  const endDate = typeof end === 'string' ? parseISO(end) : end
  
  if (!isValid(startDate) || !isValid(endDate)) return 'Invalid date range'
  
  const sameMonth = format(startDate, 'MMM') === format(endDate, 'MMM')
  const sameYear = format(startDate, 'yyyy') === format(endDate, 'yyyy')
  
  if (sameMonth && sameYear) {
    return `${format(startDate, 'MMM d')} - ${format(endDate, 'd, yyyy')}`
  } else if (sameYear) {
    return `${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d, yyyy')}`
  }
  return `${format(startDate, 'MMM d, yyyy')} - ${format(endDate, 'MMM d, yyyy')}`
}

// Get current week info
export function getCurrentWeekInfo() {
  const now = new Date()
  return {
    weekNumber: getWeekNumber(now),
    year: getYearNumber(now),
    startDate: getWeekStart(now),
    endDate: getWeekEnd(now),
  }
}

// Get week info for a specific week
export function getWeekInfo(weekNumber: number, year: number) {
  // Create a date in the middle of the year
  const jan4 = new Date(year, 0, 4)
  const weekStart = startOfWeek(jan4, { weekStartsOn: 1 })
  const targetWeekStart = addWeeks(weekStart, weekNumber - 1)
  
  return {
    weekNumber,
    year,
    startDate: targetWeekStart,
    endDate: endOfWeek(targetWeekStart, { weekStartsOn: 1 }),
  }
}

// Navigate weeks
export function navigateWeek(currentDate: Date, direction: 'prev' | 'next'): Date {
  return direction === 'next' ? addWeeks(currentDate, 1) : subWeeks(currentDate, 1)
}

// Get all days in a week
export function getDaysInWeek(date: Date): Date[] {
  const start = getWeekStart(date)
  const end = getWeekEnd(date)
  return eachDayOfInterval({ start, end })
}

// Check if two dates are the same day
export function isSameDayCheck(date1: Date | string, date2: Date | string): boolean {
  const d1 = typeof date1 === 'string' ? parseISO(date1) : date1
  const d2 = typeof date2 === 'string' ? parseISO(date2) : date2
  return isSameDay(d1, d2)
}

// Get day name
export function getDayName(date: Date): string {
  return format(date, 'EEEE')
}

// Get short day name
export function getShortDayName(date: Date): string {
  return format(date, 'EEE')
}

// Format for API
export function formatForApi(date: Date): string {
  return date.toISOString()
}

// Parse ISO string safely
export function parseDateSafe(dateStr: string | Date): Date | null {
  if (dateStr instanceof Date) return dateStr
  const parsed = parseISO(dateStr)
  return isValid(parsed) ? parsed : null
}

// Get relative time description
export function getRelativeTimeDescription(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 14) return 'Last week'
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  if (diffDays < 60) return 'Last month'
  return format(d, 'MMM d, yyyy')
}
