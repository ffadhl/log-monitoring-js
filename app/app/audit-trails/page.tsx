import { redirect } from 'next/navigation'
import { getSession, isAdmin } from '@/lib/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileSearch, Shield, Clock, User, AlertTriangle } from 'lucide-react'

export default async function AuditTrailsPage() {
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
        <h1 className="text-3xl font-bold tracking-tight">Audit Trails</h1>
        <p className="text-muted-foreground">
          System activity logs and security monitoring
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Events</p>
                <p className="text-2xl font-bold">--</p>
              </div>
              <FileSearch className="size-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Login Events</p>
                <p className="text-2xl font-bold">--</p>
              </div>
              <User className="size-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Data Changes</p>
                <p className="text-2xl font-bold">--</p>
              </div>
              <Shield className="size-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Warnings</p>
                <p className="text-2xl font-bold">--</p>
              </div>
              <AlertTriangle className="size-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="size-5" />
            Recent Activity
          </CardTitle>
          <CardDescription>
            System events and user activities
          </CardDescription>
        </CardHeader>
        <CardContent className="py-12 text-center">
          <FileSearch className="size-16 mx-auto text-muted-foreground/30" />
          <p className="text-muted-foreground mt-4">
            Audit trails will be available in a future update
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            This feature will track: login/logout events, data modifications, permission changes, and security alerts
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
