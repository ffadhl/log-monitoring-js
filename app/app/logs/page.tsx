import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { LogsClient } from './logs-client'
import {
  getCurrentWeekInfo,
  getWeekInfo,
  getDaysInWeek,
  formatForApi,
  getWeekStart,
  getWeekEnd,
  getWeekNumber,
} from '@/lib/date-utils'

interface LogsPageProps {
  searchParams: Promise<{
    week?: string
    year?: string
  }>
}

// Generate available weeks from join date to current week (server-side)
function generateAvailableWeeks() {
  const weeks: { weekNumber: number; year: number; startDate: string; endDate: string; isCurrent: boolean }[] = []
  const joinDate = new Date(2025, 10, 3) // Nov 3, 2025
  const today = new Date()
  
  let currentDate = getWeekStart(joinDate)
  const todayWeekStart = getWeekStart(today)
  
  while (currentDate <= todayWeekStart) {
    const weekStart = new Date(currentDate)
    const weekEnd = getWeekEnd(weekStart)
    const weekNum = getWeekNumber(currentDate)
    const year = currentDate.getFullYear()
    
    weeks.push({
      weekNumber: weekNum,
      year: year,
      startDate: weekStart.toISOString(),
      endDate: weekEnd.toISOString(),
      isCurrent: currentDate.getTime() === todayWeekStart.getTime(),
    })
    
    currentDate.setDate(currentDate.getDate() + 7)
  }
  
  // Reverse to show most recent first
  return weeks.reverse()
}

export default async function LogsPage({ searchParams }: LogsPageProps) {
  const session = await getSession()

  if (!session) {
    redirect('/auth/login')
  }

  const params = await searchParams
  
  // Determine which week to show
  let weekNumber: number
  let year: number
  let startDate: Date
  let endDate: Date

  if (params.week && params.year) {
    weekNumber = parseInt(params.week)
    year = parseInt(params.year)
    const info = getWeekInfo(weekNumber, year)
    startDate = info.startDate
    endDate = info.endDate
  } else {
    const current = getCurrentWeekInfo()
    weekNumber = current.weekNumber
    year = current.year
    startDate = current.startDate
    endDate = current.endDate
  }

  // Fetch weekly report with logs
  const weeklyReport = await prisma.weeklyReport.findUnique({
    where: {
      userId_weekNumber_year: {
        userId: session.id,
        weekNumber,
        year,
      },
    },
    include: {
      dailyLogs: {
        orderBy: { date: 'asc' },
      },
      attachments: true,
    },
  })

  // If no weekly report exists, fetch any logs for this week
  let dailyLogs = weeklyReport?.dailyLogs || []
  
  if (!weeklyReport) {
    dailyLogs = await prisma.dailyLog.findMany({
      where: {
        userId: session.id,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { date: 'asc' },
    })
  }

  // Get days in week for display
  const daysInWeek = getDaysInWeek(startDate).map((d) => formatForApi(d))

  // Generate available weeks for selector (server-side to avoid hydration mismatch)
  const availableWeeks = generateAvailableWeeks()

  return (
    <LogsClient
      weekInfo={{
        weekNumber,
        year,
        startDate: formatForApi(startDate),
        endDate: formatForApi(endDate),
      }}
      weeklyReport={weeklyReport}
      dailyLogs={dailyLogs}
      daysInWeek={daysInWeek}
      availableWeeks={availableWeeks}
    />
  )
}
