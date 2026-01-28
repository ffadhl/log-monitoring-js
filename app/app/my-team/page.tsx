import { redirect } from 'next/navigation'
import { getSession, isManager } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Users, Mail, Building2 } from 'lucide-react'

export default async function MyTeamPage() {
  const session = await getSession()

  if (!session) {
    redirect('/auth/login')
  }

  // Only managers can access this page
  if (!isManager(session.role)) {
    redirect('/app/dashboard')
  }

  // Fetch team members with basic data only
  const teamMembers = await prisma.user.findMany({
    where: { managerId: session.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
    orderBy: { name: 'asc' },
  })

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Team</h1>
        <p className="text-muted-foreground">
          Team members under your supervision
        </p>
      </div>

      {/* Team Stats */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-xl bg-primary/10">
              <Users className="size-8 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Team Members</p>
              <p className="text-4xl font-bold">{teamMembers.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team Members Grid */}
      {teamMembers.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {teamMembers.map((member) => (
            <Card key={member.id} className="hover:shadow-md transition-all">
              <CardContent className="py-4">
                <div className="flex items-center gap-4">
                  <Avatar className="size-14">
                    <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                      {getInitials(member.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg truncate">{member.name}</h3>
                    <div className="flex items-center gap-1.5 text-muted-foreground mt-1">
                      <Mail className="size-3.5" />
                      <span className="text-sm truncate">{member.email}</span>
                    </div>
                    <Badge variant="secondary" className="mt-2">
                      {member.role === 'EMPLOYEE' ? 'Employee' : member.role}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <div className="p-4 rounded-full bg-muted w-fit mx-auto mb-4">
              <Users className="size-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">No Team Members</h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
              You don&apos;t have any team members assigned yet. Contact your administrator to assign employees to your team.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
