// prisma/seed.ts
// Seed script for CareerTrack database

import { PrismaClient } from '../generated/prisma'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import bcrypt from 'bcryptjs'
import 'dotenv/config'

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

async function main() {
  console.log('🌱 Starting seed...')

  // Clean existing data
  await prisma.attachment.deleteMany()
  await prisma.dailyLog.deleteMany()
  await prisma.weeklyReport.deleteMany()
  await prisma.careerGoal.deleteMany()
  await prisma.user.deleteMany()

  console.log('🧹 Cleaned existing data')

  // Create hashed passwords
  const hashedPassword = await hashPassword('demo123')

  // Create Admin
  const admin = await prisma.user.create({
    data: {
      email: 'admin@demo.com',
      name: 'System Admin',
      password: hashedPassword,
      role: 'ADMIN',
    },
  })
  console.log('👤 Created admin:', admin.email)

  // Create Manager
  const manager = await prisma.user.create({
    data: {
      email: 'manager@demo.com',
      name: 'Sarah Johnson',
      password: hashedPassword,
      role: 'MANAGER',
    },
  })
  console.log('👤 Created manager:', manager.email)

  // Create Employees under the manager
  const employee1 = await prisma.user.create({
    data: {
      email: 'employee@demo.com',
      name: 'Alex Chen',
      password: hashedPassword,
      role: 'EMPLOYEE',
      managerId: manager.id,
    },
  })
  console.log('👤 Created employee:', employee1.email)

  const employee2 = await prisma.user.create({
    data: {
      email: 'john@demo.com',
      name: 'John Doe',
      password: hashedPassword,
      role: 'EMPLOYEE',
      managerId: manager.id,
    },
  })
  console.log('👤 Created employee:', employee2.email)

  const employee3 = await prisma.user.create({
    data: {
      email: 'emily@demo.com',
      name: 'Emily Williams',
      password: hashedPassword,
      role: 'EMPLOYEE',
      managerId: manager.id,
    },
  })
  console.log('👤 Created employee:', employee3.email)

  // Create sample career goals for employee1
  const goals = [
    {
      title: 'Master TypeScript and Next.js',
      description: 'Become proficient in TypeScript with advanced type manipulation, generics, and utility types. Build at least 3 production-ready Next.js applications using App Router.',
      status: 'IN_PROGRESS' as const,
      targetDate: new Date('2026-06-30'),
    },
    {
      title: 'Obtain AWS Solutions Architect Certification',
      description: 'Study and pass the AWS Solutions Architect Associate exam. Focus on core services: EC2, S3, RDS, Lambda, VPC, and IAM.',
      status: 'NOT_STARTED' as const,
      targetDate: new Date('2026-09-30'),
    },
    {
      title: 'Lead a Cross-Functional Project',
      description: 'Take the lead on a project that involves coordination between engineering, design, and product teams. Develop leadership and communication skills.',
      status: 'IN_PROGRESS' as const,
      targetDate: new Date('2026-04-15'),
      managerComment: 'Great initiative! Consider leading the upcoming dashboard redesign project.',
    },
    {
      title: 'Complete Advanced React Patterns Course',
      description: 'Learn advanced React patterns including compound components, render props, custom hooks, and state management strategies.',
      status: 'COMPLETED' as const,
    },
  ]

  for (const goal of goals) {
    await prisma.careerGoal.create({
      data: {
        ...goal,
        userId: employee1.id,
      },
    })
  }
  console.log('🎯 Created career goals for employee1')

  // Create career goals for employee2
  const employee2Goals = [
    {
      title: 'Learn Docker and Kubernetes',
      description: 'Gain hands-on experience with containerization and orchestration. Deploy microservices in a Kubernetes cluster.',
      status: 'IN_PROGRESS' as const,
      targetDate: new Date('2026-05-30'),
    },
    {
      title: 'Improve System Design Skills',
      description: 'Study system design principles and practice designing scalable distributed systems.',
      status: 'NOT_STARTED' as const,
    },
  ]

  for (const goal of employee2Goals) {
    await prisma.careerGoal.create({
      data: {
        ...goal,
        userId: employee2.id,
      },
    })
  }
  console.log('🎯 Created career goals for employee2')

  // Create weekly report and daily logs for current week
  const today = new Date()
  const dayOfWeek = today.getDay()
  const monday = new Date(today)
  monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))
  monday.setHours(0, 0, 0, 0)
  
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  sunday.setHours(23, 59, 59, 999)

  const getWeekNumber = (date: Date): number => {
    const startOfYear = new Date(date.getFullYear(), 0, 1)
    const days = Math.floor((date.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000))
    return Math.ceil((days + startOfYear.getDay() + 1) / 7)
  }

  const weekNumber = getWeekNumber(today)
  const year = today.getFullYear()

  // Create weekly report for employee1
  const weeklyReport = await prisma.weeklyReport.create({
    data: {
      userId: employee1.id,
      weekNumber,
      year,
      startDate: monday,
      endDate: sunday,
      summary: 'This week I focused on implementing the new authentication system and started learning about WebSockets for real-time features.',
      status: 'DRAFT',
    },
  })
  console.log('📋 Created weekly report for employee1')

  // Create daily logs for the current week
  const dailyLogContents = [
    { offset: 0, content: 'Set up the project structure and configured TypeScript. Reviewed the technical requirements document and created initial database schema.', mood: '🎯' },
    { offset: 1, content: 'Implemented user authentication with JWT tokens. Learned about refresh token rotation patterns and security best practices.', mood: '💡' },
    { offset: 2, content: 'Built the dashboard UI components using Shadcn UI. Integrated Recharts for data visualization. Had a productive pair programming session with John.', mood: '🔥' },
    { offset: 3, content: 'Started working on the API routes for daily logs. Wrote unit tests for the authentication middleware.', mood: '🙂' },
  ]

  for (const log of dailyLogContents) {
    const logDate = new Date(monday)
    logDate.setDate(monday.getDate() + log.offset)
    
    if (logDate <= today) {
      await prisma.dailyLog.create({
        data: {
          userId: employee1.id,
          weeklyReportId: weeklyReport.id,
          date: logDate,
          content: log.content,
          mood: log.mood,
        },
      })
    }
  }
  console.log('📝 Created daily logs for employee1')

  // Create a submitted report for employee2 (for manager to review)
  const lastWeekMonday = new Date(monday)
  lastWeekMonday.setDate(monday.getDate() - 7)
  const lastWeekSunday = new Date(sunday)
  lastWeekSunday.setDate(sunday.getDate() - 7)
  
  const submittedReport = await prisma.weeklyReport.create({
    data: {
      userId: employee2.id,
      weekNumber: weekNumber - 1,
      year,
      startDate: lastWeekMonday,
      endDate: lastWeekSunday,
      summary: 'Completed the database migration project and began containerizing the legacy application. Attended the DevOps workshop on Tuesday.',
      status: 'SUBMITTED',
    },
  })

  // Create daily logs for submitted report
  const submittedLogContents = [
    { offset: 0, content: 'Analyzed the current database schema and identified tables that need migration. Created a detailed migration plan.', mood: '📊' },
    { offset: 1, content: 'Attended the DevOps workshop. Learned about CI/CD pipelines with GitHub Actions. Very informative session!', mood: '💡' },
    { offset: 2, content: 'Started writing migration scripts. Faced some challenges with foreign key constraints but found a solution using transaction batching.', mood: '😐' },
    { offset: 3, content: 'Completed the migration scripts and ran them in the staging environment. All tests passed.', mood: '🔥' },
    { offset: 4, content: 'Began containerizing the legacy application. Created the Dockerfile and docker-compose configuration.', mood: '🎯' },
  ]

  for (const log of submittedLogContents) {
    const logDate = new Date(lastWeekMonday)
    logDate.setDate(lastWeekMonday.getDate() + log.offset)
    
    await prisma.dailyLog.create({
      data: {
        userId: employee2.id,
        weeklyReportId: submittedReport.id,
        date: logDate,
        content: log.content,
        mood: log.mood,
      },
    })
  }
  console.log('📝 Created submitted report for employee2')

  // Create a reviewed report for employee3
  const twoWeeksAgoMonday = new Date(monday)
  twoWeeksAgoMonday.setDate(monday.getDate() - 14)
  const twoWeeksAgoSunday = new Date(sunday)
  twoWeeksAgoSunday.setDate(sunday.getDate() - 14)

  await prisma.weeklyReport.create({
    data: {
      userId: employee3.id,
      weekNumber: weekNumber - 2,
      year,
      startDate: twoWeeksAgoMonday,
      endDate: twoWeeksAgoSunday,
      summary: 'Focused on improving the user experience of the mobile app. Conducted user testing sessions and implemented feedback.',
      status: 'REVIEWED',
      managerFeedback: 'Excellent work on the UX improvements, Emily! The user testing approach was very thorough. Keep documenting your process - it could be valuable for the team wiki.',
    },
  })
  console.log('📝 Created reviewed report for employee3')

  console.log('')
  console.log('✅ Seed completed successfully!')
  console.log('')
  console.log('📧 Demo accounts:')
  console.log('   Admin:    admin@demo.com / demo123')
  console.log('   Manager:  manager@demo.com / demo123')
  console.log('   Employee: employee@demo.com / demo123')
  console.log('   Employee: john@demo.com / demo123')
  console.log('   Employee: emily@demo.com / demo123')
}

main()
  .then(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
  .catch(async (e) => {
    console.error('❌ Seed failed:', e)
    await prisma.$disconnect()
    await pool.end()
    process.exit(1)
  })