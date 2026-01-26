import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { DashboardClient } from './dashboard-client'
import { ManagerDashboard } from './manager-dashboard'
import { AdminDashboard } from './admin-dashboard'
import { getCurrentWeekInfo, getDaysInWeek, getShortDayName, isSameDayCheck } from '@/lib/date-utils'

export default async function DashboardPage() {
  const session = await getSession()
  
  if (!session) {
    redirect('/auth/login')
  }

  const { weekNumber, year, startDate, endDate } = getCurrentWeekInfo()

  // Admin Dashboard
  if (session.role === 'ADMIN') {
    const [
      totalUsers,
      totalManagers,
      totalEmployees,
      totalAdmins,
      totalDailyLogs,
      totalWeeklyReports,
      totalCareerGoals,
      pendingReviews,
      activeUsersThisWeek,
      recentUsers,
      logsLast7Days,
      reportsLast7Days,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'MANAGER' } }),
      prisma.user.count({ where: { role: 'EMPLOYEE' } }),
      prisma.user.count({ where: { role: 'ADMIN' } }),
      prisma.dailyLog.count(),
      prisma.weeklyReport.count(),
      prisma.careerGoal.count(),
      prisma.weeklyReport.count({ where: { status: 'SUBMITTED' } }),
      prisma.dailyLog.findMany({
        where: {
          date: { gte: startDate, lte: endDate },
        },
        select: { userId: true },
        distinct: ['userId'],
      }),
      prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
      }),
      prisma.dailyLog.findMany({
        where: {
          date: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
        select: { date: true },
      }),
      prisma.weeklyReport.findMany({
        where: {
          createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
        select: { createdAt: true },
      }),
    ])

    // Build activity data for last 7 days
    const days = getDaysInWeek(new Date())
    const activityData = days.map((day) => ({
      day: getShortDayName(day),
      logs: logsLast7Days.filter((log) => isSameDayCheck(log.date, day)).length,
      reports: reportsLast7Days.filter((report) => isSameDayCheck(report.createdAt, day)).length,
    }))

    const roleDistribution = [
      { name: 'Admin', value: totalAdmins, color: '#ef4444' },
      { name: 'Manager', value: totalManagers, color: '#3b82f6' },
      { name: 'Employee', value: totalEmployees, color: '#94a3b8' },
    ]

    return (
      <AdminDashboard
        userName={session.name}
        stats={{
          totalUsers,
          totalManagers,
          totalEmployees,
          totalAdmins,
          totalDailyLogs,
          totalWeeklyReports,
          totalCareerGoals,
          pendingReviews,
          activeUsersThisWeek: activeUsersThisWeek.length,
        }}
        userGrowthData={[]}
        activityData={activityData}
        roleDistribution={roleDistribution}
        recentUsers={recentUsers}
        systemHealth={{
          databaseStatus: 'healthy',
          activeConnections: 1,
          avgResponseTime: 45,
        }}
      />
    )
  }

  // Manager Dashboard
  if (session.role === 'MANAGER') {
    const [
      subordinates,
      pendingReports,
      reviewedThisWeek,
    ] = await Promise.all([
      prisma.user.findMany({
        where: { managerId: session.id },
        include: {
          _count: {
            select: {
              dailyLogs: true,
              weeklyReports: true,
              careerGoals: true,
            },
          },
          weeklyReports: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            select: {
              id: true,
              status: true,
              weekNumber: true,
              year: true,
              startDate: true,
              endDate: true,
            },
          },
          careerGoals: {
            select: {
              id: true,
              title: true,
              status: true,
            },
          },
          dailyLogs: {
            where: {
              date: { gte: startDate, lte: endDate },
            },
            select: { id: true },
          },
        },
      }),
      prisma.weeklyReport.findMany({
        where: {
          user: { managerId: session.id },
          status: 'SUBMITTED',
        },
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.weeklyReport.count({
        where: {
          user: { managerId: session.id },
          status: 'REVIEWED',
          updatedAt: { gte: startDate, lte: endDate },
        },
      }),
    ])

    const totalGoalsTracking = subordinates.reduce(
      (sum, sub) => sum + sub.careerGoals.length,
      0
    )

    // Build team activity data
    const teamActivityData = subordinates.map((sub) => ({
      name: sub.name.split(' ')[0],
      logs: sub.dailyLogs.length,
    }))

    return (
      <ManagerDashboard
        userName={session.name}
        stats={{
          totalSubordinates: subordinates.length,
          pendingReviews: pendingReports.length,
          reviewedThisWeek,
          totalGoalsTracking,
        }}
        subordinates={subordinates}
        pendingReports={pendingReports}
        teamActivityData={teamActivityData}
      />
    )
  }

  // Employee Dashboard (Default)
  const [
    totalLogsCount,
    logsThisWeek,
    weeklyReportsSubmitted,
    careerGoalsInProgress,
    recentLogs,
    currentWeekReport,
    careerGoals,
  ] = await Promise.all([
    // Total logs count
    prisma.dailyLog.count({
      where: { userId: session.id },
    }),
    // Logs this week
    prisma.dailyLog.findMany({
      where: {
        userId: session.id,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    }),
    // Weekly reports submitted
    prisma.weeklyReport.count({
      where: {
        userId: session.id,
        status: { in: ['SUBMITTED', 'REVIEWED'] },
      },
    }),
    // Career goals in progress
    prisma.careerGoal.count({
      where: {
        userId: session.id,
        status: 'IN_PROGRESS',
      },
    }),
    // Recent logs
    prisma.dailyLog.findMany({
      where: { userId: session.id },
      orderBy: { date: 'desc' },
      take: 5,
    }),
    // Current week report
    prisma.weeklyReport.findUnique({
      where: {
        userId_weekNumber_year: {
          userId: session.id,
          weekNumber,
          year,
        },
      },
      include: {
        dailyLogs: true,
        attachments: true,
      },
    }),
    // Career goals
    prisma.careerGoal.findMany({
      where: { userId: session.id },
      orderBy: { createdAt: 'desc' },
      take: 4,
    }),
  ])

  // Build weekly activity data
  const daysInWeek = getDaysInWeek(new Date())
  const weeklyActivity = daysInWeek.map((day) => ({
    day: getShortDayName(day),
    logs: logsThisWeek.filter((log) => isSameDayCheck(log.date, day)).length,
  }))

  return (
    <DashboardClient
      stats={{
        totalLogs: totalLogsCount,
        logsThisWeek: logsThisWeek.length,
        weeklyReportsSubmitted,
        careerGoalsInProgress,
      }}
      recentLogs={recentLogs}
      weeklyActivity={weeklyActivity}
      currentWeekReport={currentWeekReport}
      careerGoals={careerGoals}
      userName={session.name}
    />
  )
}
