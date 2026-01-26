import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { LogsClient } from './logs-client'
import {
  getCurrentWeekInfo,
  getWeekInfo,
  getDaysInWeek,
  formatForApi,
} from '@/lib/date-utils'

interface LogsPageProps {
  searchParams: Promise<{
    week?: string
    year?: string
  }>
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
    />
  )
}
