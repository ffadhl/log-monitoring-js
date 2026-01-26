'use client'

import * as React from 'react'
import {
  Users,
  UserPlus,
  FileText,
  Activity,
  TrendingUp,
  Shield,
  Database,
  Clock,
  CheckCircle,
  AlertCircle,
  Target,
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
  PieChart,
  Pie,
  Cell,
} from 'recharts'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'

interface AdminDashboardProps {
  userName: string
  stats: {
    totalUsers: number
    totalManagers: number
    totalEmployees: number
    totalAdmins: number
    totalDailyLogs: number
    totalWeeklyReports: number
    totalCareerGoals: number
    pendingReviews: number
    activeUsersThisWeek: number
  }
  userGrowthData: { month: string; users: number }[]
  activityData: { day: string; logs: number; reports: number }[]
  roleDistribution: { name: string; value: number; color: string }[]
  recentUsers: {
    id: string
    name: string
    email: string
    role: string
    createdAt: Date
  }[]
  systemHealth: {
    databaseStatus: 'healthy' | 'warning' | 'error'
    activeConnections: number
    avgResponseTime: number
  }
}

export function AdminDashboard({
  userName,
  stats,
  activityData,
  roleDistribution,
  recentUsers,
  systemHealth,
}: AdminDashboardProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-100 text-red-700'
      case 'MANAGER':
        return 'bg-blue-100 text-blue-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      description: 'Registered users',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Active This Week',
      value: stats.activeUsersThisWeek,
      icon: Activity,
      description: 'Users with activity',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      title: 'Total Logs',
      value: stats.totalDailyLogs,
      icon: FileText,
      description: 'All daily logs',
      color: 'text-violet-600',
      bgColor: 'bg-violet-50',
    },
    {
      title: 'Pending Reviews',
      value: stats.pendingReviews,
      icon: Clock,
      description: 'Awaiting review',
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Admin Dashboard 🛡️
          </h1>
          <p className="text-muted-foreground mt-2">
            System overview and management for {userName}
          </p>
        </div>
        <Button asChild>
          <Link href="/app/admin">
            <UserPlus className="size-4 mr-2" />
            Manage Users
          </Link>
        </Button>
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
              <div className="text-3xl font-bold">{stat.value.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* User Stats Row */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Shield className="size-4 text-red-500" />
              Admins
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAdmins}</div>
            <Progress value={(stats.totalAdmins / stats.totalUsers) * 100} className="mt-2 h-1" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="size-4 text-blue-500" />
              Managers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalManagers}</div>
            <Progress value={(stats.totalManagers / stats.totalUsers) * 100} className="mt-2 h-1" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="size-4 text-gray-500" />
              Employees
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEmployees}</div>
            <Progress value={(stats.totalEmployees / stats.totalUsers) * 100} className="mt-2 h-1" />
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-7">
        {/* Activity Chart */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="size-5 text-muted-foreground" />
              System Activity (Last 7 Days)
            </CardTitle>
            <CardDescription>
              Daily logs and reports submitted across all users
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] min-h-[300px] w-full">
              {activityData && activityData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={activityData}>
                    <defs>
                      <linearGradient id="colorLogs" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorReports" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      dataKey="day"
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
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
                    <Area
                      type="monotone"
                      dataKey="logs"
                      stroke="hsl(var(--primary))"
                      fill="url(#colorLogs)"
                      strokeWidth={2}
                      name="Daily Logs"
                    />
                    <Area
                      type="monotone"
                      dataKey="reports"
                      stroke="#10b981"
                      fill="url(#colorReports)"
                      strokeWidth={2}
                      name="Reports"
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

        {/* Role Distribution */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="size-5 text-muted-foreground" />
              User Role Distribution
            </CardTitle>
            <CardDescription>
              Breakdown of users by role
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] min-h-[200px] w-full">
              {roleDistribution.some(d => d.value > 0) ? (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={roleDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {roleDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No user data
                </div>
              )}
            </div>
            <div className="flex justify-center gap-4 mt-4">
              {roleDistribution.map((item) => (
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

      {/* Bottom Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Users */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="size-5 text-muted-foreground" />
                  Recent Users
                </CardTitle>
                <CardDescription>Newly registered users</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/app/admin">View all</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentUsers.length > 0 ? (
              <div className="space-y-4">
                {recentUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="size-8">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className={getRoleBadgeColor(user.role)}>
                        {user.role}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(user.createdAt)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="size-12 mx-auto text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground mt-4">
                  No recent users
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* System Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="size-5 text-muted-foreground" />
              System Summary
            </CardTitle>
            <CardDescription>Key metrics overview</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <FileText className="size-4" />
                  <span className="text-xs">Total Reports</span>
                </div>
                <p className="text-2xl font-bold">{stats.totalWeeklyReports.toLocaleString()}</p>
              </div>
              <div className="p-4 rounded-lg border">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Target className="size-4" />
                  <span className="text-xs">Career Goals</span>
                </div>
                <p className="text-2xl font-bold">{stats.totalCareerGoals.toLocaleString()}</p>
              </div>
            </div>
            
            <div className="p-4 rounded-lg border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Database Status</span>
                <Badge
                  variant="secondary"
                  className={
                    systemHealth.databaseStatus === 'healthy'
                      ? 'bg-emerald-100 text-emerald-700'
                      : systemHealth.databaseStatus === 'warning'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-red-100 text-red-700'
                  }
                >
                  {systemHealth.databaseStatus === 'healthy' ? (
                    <CheckCircle className="size-3 mr-1" />
                  ) : (
                    <AlertCircle className="size-3 mr-1" />
                  )}
                  {systemHealth.databaseStatus.charAt(0).toUpperCase() + systemHealth.databaseStatus.slice(1)}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                <div>Active Connections: {systemHealth.activeConnections}</div>
                <div>Avg Response: {systemHealth.avgResponseTime}ms</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
