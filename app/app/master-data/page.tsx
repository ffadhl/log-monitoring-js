import { redirect } from 'next/navigation'
import { getSession, isAdmin } from '@/lib/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Database, Building2, Briefcase, Clock } from 'lucide-react'

export default async function MasterDataPage() {
  const session = await getSession()

  if (!session) {
    redirect('/auth/login')
  }

  // Only admins can access this page
  if (!isAdmin(session.role)) {
    redirect('/app/dashboard')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Master Data</h1>
        <p className="text-muted-foreground">
          Manage reference data and system configurations
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-50">
                <Building2 className="size-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Departments</CardTitle>
                <CardDescription>Manage company departments and divisions</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Add, edit, or remove departments from the organization structure.
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-violet-50">
                <Briefcase className="size-5 text-violet-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Job Titles</CardTitle>
                <CardDescription>Manage job positions and titles</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Configure job titles, levels, and career progression paths.
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-50">
                <Clock className="size-5 text-amber-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Work Schedules</CardTitle>
                <CardDescription>Configure working hours and shifts</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Set up work schedules, shift patterns, and time zones.
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-50">
                <Database className="size-5 text-emerald-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Other Settings</CardTitle>
                <CardDescription>Additional configuration options</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Manage other reference data and system configurations.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="py-12 text-center">
          <Database className="size-16 mx-auto text-muted-foreground/30" />
          <p className="text-muted-foreground mt-4">
            Master data management will be available in a future update
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
