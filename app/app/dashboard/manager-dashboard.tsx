'use client'

import * as React from 'react'
import {
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Target,
  Eye,
  FileText,
  Calendar,
  ArrowRight,
  ClipboardList,
  MessageSquare,
} from 'lucide-react'
import Link from 'next/link'
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { formatDateRange, formatDate } from '@/lib/date-utils'
import { REPORT_STATUS_CONFIG } from '@/lib/types'

interface Subordinate {
  id: string
  name: string
  email: string
  _count: {
    dailyLogs: number
    weeklyReports: number
    careerGoals: number
  }
  weeklyReports: {
    id: string
    status: string
    weekNumber: number
    year: number
    startDate: Date
    endDate: Date
  }[]
  careerGoals: {
    id: string
    title: string
    status: string
  }[]
}

interface TodayLog {
  id: string
  content: string
  mood: string | null
  date: Date
  user: {
    id: string
    name: string
    email: string
  }
}

interface ManagerDashboardProps {
  userName: string
  stats: {
    totalSubordinates: number
    pendingReviews: number
    reviewedThisWeek: number
    totalGoalsTracking: number
  }
  subordinates: Subordinate[]
  pendingReports: {
    id: string
    weekNumber: number
    year: number
    startDate: Date
    endDate: Date
    status: string
    user: {
      id: string
      name: string
      email: string
    }
  }[]
  teamActivityData: { name: string; logs: number }[]
  todayLogs: TodayLog[]
}

export function ManagerDashboard({
  userName,
  stats,
  subordinates,
  pendingReports,
  teamActivityData,
  todayLogs,
}: ManagerDashboardProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Calculate goal status distribution
  const goalStatusData = React.useMemo(() => {
    const statusCount: Record<string, number> = {
      NOT_STARTED: 0,
      IN_PROGRESS: 0,
      COMPLETED: 0,
    }
    subordinates.forEach((sub) => {
      sub.careerGoals.forEach((goal) => {
        if (statusCount[goal.status] !== undefined) {
          statusCount[goal.status]++
        }
      })
    })
    return [
      { name: 'Not Started', value: statusCount.NOT_STARTED, color: '#94a3b8' },
      { name: 'In Progress', value: statusCount.IN_PROGRESS, color: '#3b82f6' },
      { name: 'Completed', value: statusCount.COMPLETED, color: '#10b981' },
    ]
  }, [subordinates])

  const statCards = [
    {
      title: 'Team Members',
      value: stats.totalSubordinates,
      icon: Users,
      description: 'Under your supervision',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Pending Reviews',
      value: stats.pendingReviews,
      icon: AlertCircle,
      description: 'Reports awaiting review',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Reviewed This Week',
      value: stats.reviewedThisWeek,
      icon: CheckCircle,
      description: 'Reports reviewed',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Goals Tracking',
      value: stats.totalGoalsTracking,
      icon: Target,
      description: 'Team career goals',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {userName.split(' ')[0]}! 👋
        </h1>
        <p className="text-muted-foreground mt-2">
          Monitor your team&apos;s daily activities, review weekly reports, and track career development progress.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Link href="/app/team-review?tab=daily-logs">
          <Card className="group cursor-pointer hover:shadow-md transition-all duration-200">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted group-hover:bg-primary/10 transition-colors">
                  <FileText className="size-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">View Daily Logs</p>
                  <p className="text-xs text-muted-foreground">Team activities</p>
                </div>
                <ArrowRight className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/app/team-review?tab=pending">
          <Card className="group cursor-pointer hover:shadow-md transition-all duration-200">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted group-hover:bg-primary/10 transition-colors">
                  <ClipboardList className="size-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">Review Reports</p>
                  <p className="text-xs text-muted-foreground">{stats.pendingReviews} pending</p>
                </div>
                <ArrowRight className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/app/team-review?tab=team">
          <Card className="group cursor-pointer hover:shadow-md transition-all duration-200">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted group-hover:bg-primary/10 transition-colors">
                  <MessageSquare className="size-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">Career Feedback</p>
                  <p className="text-xs text-muted-foreground">Goal reviews</p>
                </div>
                <ArrowRight className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/app/my-team">
          <Card className="group cursor-pointer hover:shadow-md transition-all duration-200">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted group-hover:bg-primary/10 transition-colors">
                  <Users className="size-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">My Team</p>
                  <p className="text-xs text-muted-foreground">{stats.totalSubordinates} members</p>
                </div>
                <ArrowRight className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`size-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Today's Logs - Priority Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="size-5 text-muted-foreground" />
                Today&apos;s Logs
              </CardTitle>
              <CardDescription>
                {formatDate(new Date(), 'EEEE, MMMM d, yyyy')} - Team member activities
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-muted-foreground">
              {todayLogs.length} {todayLogs.length === 1 ? 'log' : 'logs'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {todayLogs.length > 0 ? (
            <ScrollArea className="h-[300px]">
              <div className="space-y-4 pr-4">
                {todayLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="size-10">
                        <AvatarFallback className="bg-primary/10 text-primary text-sm">
                          {getInitials(log.user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-medium">{log.user.name}</p>
                          <div className="flex items-center gap-2">
                            {log.mood && (
                              <span className="text-lg" title="Mood">
                                {log.mood}
                              </span>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {formatDate(log.date, 'HH:mm')}
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{log.user.email}</p>
                        <div className="p-3 rounded-md bg-muted/50">
                          <p className="text-sm whitespace-pre-wrap">{log.content}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="text-center py-12">
              <FileText className="size-12 mx-auto text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold">No logs yet today</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Team members haven&apos;t submitted any logs for today
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-7">
        {/* Team Activity Chart */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="size-5 text-muted-foreground" />
              Team Activity This Week
            </CardTitle>
            <CardDescription>
              Daily logs submitted by each team member
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] min-h-[300px] w-full">
              {teamActivityData && teamActivityData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={teamActivityData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 12, fill: '#64748b' }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: '#64748b' }}
                      tickLine={false}
                      axisLine={false}
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
                    <Bar
                      dataKey="logs"
                      fill="hsl(var(--primary))"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No activity data
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Goal Status Distribution */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="size-5 text-muted-foreground" />
              Team Goals Status
            </CardTitle>
            <CardDescription>
              Distribution of career goal progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] min-h-[200px] w-full">
              {goalStatusData.some(d => d.value > 0) ? (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={goalStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {goalStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No goals data
                </div>
              )}
            </div>
            <div className="flex justify-center gap-4 mt-4">
              {goalStatusData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-xs text-muted-foreground">
                    {item.name} ({item.value})
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Reviews & Team Members */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pending Reviews */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="size-5 text-muted-foreground" />
                  Pending Reviews
                </CardTitle>
                <CardDescription>Reports waiting for your feedback</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/app/team-review">View all</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {pendingReports.length > 0 ? (
              <div className="space-y-4">
                {pendingReports.slice(0, 5).map((report) => (
                  <div
                    key={report.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="size-8">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {getInitials(report.user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{report.user.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Week {report.weekNumber} • {formatDateRange(report.startDate, report.endDate)}
                        </p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" asChild>
                      <Link href="/app/team-review">
                        <Eye className="size-4 mr-1" />
                        Review
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="size-12 mx-auto text-emerald-500/50" />
                <p className="text-sm text-muted-foreground mt-4">
                  All caught up! No pending reviews.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Team Members Overview */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="size-5 text-muted-foreground" />
                  Team Members
                </CardTitle>
                <CardDescription>Your team&apos;s activity summary</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/app/team-review">Manage</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {subordinates.length > 0 ? (
              <div className="space-y-4">
                {subordinates.slice(0, 5).map((member) => {
                  const thisWeekReport = member.weeklyReports[0]
                  return (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-card"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="size-8">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {getInitials(member.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{member.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {member._count.dailyLogs} logs • {member._count.careerGoals} goals
                          </p>
                        </div>
                      </div>
                      {thisWeekReport ? (
                        <Badge
                          variant="secondary"
                          className={REPORT_STATUS_CONFIG[thisWeekReport.status as keyof typeof REPORT_STATUS_CONFIG]?.color}
                        >
                          {REPORT_STATUS_CONFIG[thisWeekReport.status as keyof typeof REPORT_STATUS_CONFIG]?.label}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground">
                          No Report
                        </Badge>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="size-12 mx-auto text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground mt-4">
                  No team members assigned yet
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
