import { Pool, neonConfig } from '@neondatabase/serverless'
import { PrismaNeon } from '@prisma/adapter-neon'
import { PrismaClient } from '@prisma/client'
import ws from 'ws'

neonConfig.webSocketConstructor = ws

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  console.warn('DATABASE_URL is not defined in environment variables.')
}

const pool = connectionString ? new Pool({ connectionString }) : null
const adapter = pool ? new PrismaNeon(pool) : null

const prismaClientSingleton = () => {
  if (adapter) {
    return new PrismaClient({ adapter })
  }
  // Fallback for local dev if driver adapter isn't needed or DATABASE_URL is missing
  return new PrismaClient()
}

const globalForPrisma = globalThis

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
