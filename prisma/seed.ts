import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import 'dotenv/config'

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  // 1. Bikin Akun ADMIN
  const admin = await prisma.user.upsert({
    where: { email: 'admin@admin.com' },
    update: {},
    create: {
      email: 'admin@admin.com',
      name: 'Admin',
      password: 'admin',
      role: 'ADMIN',
    },
  })

  // 2. Bikin Akun KARYAWAN (Anak Probation)
  const employee = await prisma.user.upsert({
    where: { email: 'karyawan@karyawan.com' },
    update: {},
    create: {
      email: 'karyawan@karyawan.com',
      name: 'Karyawan',
      password: 'user',
      role: 'EMPLOYEE',
    },
  })

  console.log('✅ Database berhasil diisi data awal:')
  console.log({ admin, employee })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })