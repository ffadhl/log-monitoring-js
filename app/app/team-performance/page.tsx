import { redirect } from 'next/navigation'
import { getSession, isManager } from '@/lib/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3, TrendingUp, Users, Target } from 'lucide-react'

export default async function TeamPerformancePage() {
  const session = await getSession()

  if (!session) {
    redirect('/auth/login')
  }

  // Only managers can access this page
  if (!isManager(session.role)) {
    redirect('/app/dashboard')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Team Performance</h1>
        <p className="text-muted-foreground">
          Analyze your team&apos;s performance trends and metrics
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg. Log Completion
            </CardTitle>
            <TrendingUp className="size-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85%</div>
            <p className="text-xs text-muted-foreground">Weekly average</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              On-time Submissions
            </CardTitle>
            <BarChart3 className="size-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">92%</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Members
            </CardTitle>
            <Users className="size-4 text-violet-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">100%</div>
            <p className="text-xs text-muted-foreground">All engaged</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Goals Progress
            </CardTitle>
            <Target className="size-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">67%</div>
            <p className="text-xs text-muted-foreground">Avg. completion</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Performance Reports</CardTitle>
          <CardDescription>
            Coming soon: Detailed performance analytics, trend analysis, and exportable reports
          </CardDescription>
        </CardHeader>
        <CardContent className="py-12 text-center">
          <BarChart3 className="size-16 mx-auto text-muted-foreground/30" />
          <p className="text-muted-foreground mt-4">
            Performance analytics will be available in a future update
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
