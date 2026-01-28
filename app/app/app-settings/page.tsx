import { redirect } from 'next/navigation'
import { getSession, isAdmin } from '@/lib/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Cog, Palette, Bell, Clock, Shield, Globe } from 'lucide-react'

export default async function AppSettingsPage() {
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
        <h1 className="text-3xl font-bold tracking-tight">App Settings</h1>
        <p className="text-muted-foreground">
          Configure application settings and preferences
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-50">
                <Palette className="size-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Branding</CardTitle>
                <CardDescription>Customize logo and app name</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Upload company logo, set app name, and configure brand colors.
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-violet-50">
                <Bell className="size-5 text-violet-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Notifications</CardTitle>
                <CardDescription>Configure notification settings</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Set up email notifications, reminders, and alert preferences.
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
                <CardTitle className="text-lg">Log Deadlines</CardTitle>
                <CardDescription>Set log submission deadlines</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Configure daily log cutoff times and weekly report deadlines.
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-50">
                <Shield className="size-5 text-emerald-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Security</CardTitle>
                <CardDescription>Security and privacy settings</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Configure password policies, session timeouts, and access controls.
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-slate-100">
                <Globe className="size-5 text-slate-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Localization</CardTitle>
                <CardDescription>Language and regional settings</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Set default language, timezone, and date format preferences.
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-rose-50">
                <Cog className="size-5 text-rose-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Advanced</CardTitle>
                <CardDescription>Advanced configuration options</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Database settings, API configurations, and system maintenance.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="py-12 text-center">
          <Cog className="size-16 mx-auto text-muted-foreground/30" />
          <p className="text-muted-foreground mt-4">
            App settings will be available in a future update
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
