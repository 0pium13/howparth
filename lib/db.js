/**
 * Database Configuration for Production
 * Handles both Prisma and Supabase connections
 */

const { PrismaClient } = require('@prisma/client');

// Prisma client with connection pooling for production
const globalForPrisma = globalThis;

const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  },
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Database health check
async function checkDatabaseHealth() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return {
      status: 'healthy',
      message: 'Database connection successful'
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      message: `Database connection failed: ${error.message}`
    };
  }
}

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

module.exports = {
  prisma,
  checkDatabaseHealth
};
