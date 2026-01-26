'use client'

import * as React from 'react'
import {
  BarChart3,
  BookOpen,
  Target,
  TrendingUp,
  Calendar,
  Clock,
  ChevronRight,
} from 'lucide-react'
import Link from 'next/link'
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { formatDate, getRelativeTimeDescription } from '@/lib/date-utils'
import { REPORT_STATUS_CONFIG, GOAL_STATUS_CONFIG } from '@/lib/types'
import type { DailyLog, WeeklyReport, CareerGoal } from '@/lib/types'

interface DashboardClientProps {
  stats: {
    totalLogs: number
    logsThisWeek: number
    weeklyReportsSubmitted: number
    careerGoalsInProgress: number
  }
  recentLogs: DailyLog[]
  weeklyActivity: { day: string; logs: number }[]
  currentWeekReport: WeeklyReport | null
  careerGoals: CareerGoal[]
  userName: string
}

export function DashboardClient({
  stats,
  recentLogs,
  weeklyActivity,
  currentWeekReport,
  careerGoals,
  userName,
}: DashboardClientProps) {
  const statCards = [
    {
      title: 'Total Logs',
      value: stats.totalLogs,
      icon: BookOpen,
      description: 'All time entries',
      trend: '+12% from last month',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'This Week',
      value: stats.logsThisWeek,
      icon: Calendar,
      description: 'Logs this week',
      trend: `${7 - stats.logsThisWeek} days remaining`,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      title: 'Reports Submitted',
      value: stats.weeklyReportsSubmitted,
      icon: BarChart3,
      description: 'Weekly reports',
      trend: 'Lifetime submissions',
      color: 'text-violet-600',
      bgColor: 'bg-violet-50',
    },
    {
      title: 'Active Goals',
      value: stats.careerGoalsInProgress,
      icon: Target,
      description: 'In progress',
      trend: 'Career milestones',
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {userName.split(' ')[0]}! 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          Here&apos;s an overview of your activity and progress.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`rounded-lg p-2 ${stat.bgColor}`}>
                <stat.icon className={`size-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.trend}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-7">
        {/* Weekly Activity Chart */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="size-5 text-muted-foreground" />
              Weekly Activity
            </CardTitle>
            <CardDescription>
              Your logging activity for the current week
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] min-h-[300px] w-full">
              {weeklyActivity && weeklyActivity.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={weeklyActivity}>
                  <defs>
                    <linearGradient id="colorLogs" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    className="text-muted-foreground"
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    className="text-muted-foreground"
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="logs"
                    stroke="hsl(var(--primary))"
                    fill="url(#colorLogs)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No activity data
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Current Week Report */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="size-5 text-muted-foreground" />
              This Week&apos;s Report
            </CardTitle>
            <CardDescription>
              Weekly report status and summary
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentWeekReport ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge
                    variant="secondary"
                    className={
                      REPORT_STATUS_CONFIG[currentWeekReport.status].color
                    }
                  >
                    {REPORT_STATUS_CONFIG[currentWeekReport.status].label}
                  </Badge>
                </div>
                <Separator />
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Daily Logs</span>
                    <span className="font-medium">
                      {currentWeekReport.dailyLogs?.length || 0} / 7
                    </span>
                  </div>
                  <Progress
                    value={
                      ((currentWeekReport.dailyLogs?.length || 0) / 7) * 100
                    }
                  />
                </div>
                <Separator />
                {currentWeekReport.summary && (
                  <div className="space-y-2">
                    <span className="text-sm text-muted-foreground">
                      Summary
                    </span>
                    <p className="text-sm line-clamp-3">
                      {currentWeekReport.summary}
                    </p>
                  </div>
                )}
                <Button asChild className="w-full mt-4">
                  <Link href={`/app/logs?week=${currentWeekReport.weekNumber}&year=${currentWeekReport.year}`}>
                    View Details
                    <ChevronRight className="ml-2 size-4" />
                  </Link>
                </Button>
              </>
            ) : (
              <div className="text-center py-8">
                <Calendar className="size-12 mx-auto text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground mt-4">
                  No report started for this week yet
                </p>
                <Button asChild className="mt-4">
                  <Link href="/app/logs">
                    Start Logging
                    <ChevronRight className="ml-2 size-4" />
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Logs */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="size-5 text-muted-foreground" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Your latest log entries</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/app/logs">View all</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentLogs.length > 0 ? (
              <div className="space-y-4">
                {recentLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start gap-4 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    {log.mood && (
                      <div className="text-2xl">{log.mood}</div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm line-clamp-2">{log.content}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {getRelativeTimeDescription(log.date)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <BookOpen className="size-12 mx-auto text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground mt-4">
                  No logs yet. Start tracking your activities!
                </p>
                <Button asChild className="mt-4">
                  <Link href="/app/logs">Add your first log</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Career Goals */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Target className="size-5 text-muted-foreground" />
                  Career Goals
                </CardTitle>
                <CardDescription>Track your aspirations</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/app/career">View all</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {careerGoals.length > 0 ? (
              <div className="space-y-4">
                {careerGoals.slice(0, 4).map((goal) => (
                  <div
                    key={goal.id}
                    className="flex items-center gap-4 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">
                          {goal.title}
                        </p>
                        <Badge
                          variant="secondary"
                          className={`text-xs ${GOAL_STATUS_CONFIG[goal.status].color}`}
                        >
                          {GOAL_STATUS_CONFIG[goal.status].label}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                        {goal.description}
                      </p>
                      {goal.targetDate && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Target: {formatDate(goal.targetDate)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Target className="size-12 mx-auto text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground mt-4">
                  Set your career goals to track progress
                </p>
                <Button asChild className="mt-4">
                  <Link href="/app/career">Add a goal</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
