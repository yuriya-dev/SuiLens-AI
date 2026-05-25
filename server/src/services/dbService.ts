import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const dbUrl = process.env.DATABASE_URL;
const hasDatabaseUrl = !!dbUrl && 
  dbUrl.trim() !== '' && 
  !dbUrl.includes('your-supabase-connection-string-here') &&
  !dbUrl.includes('your_supabase_connection_string');

export let prisma: PrismaClient;
export let isDbActive = false;

if (hasDatabaseUrl) {
  try {
    console.log('[Database Service] Connecting to PostgreSQL via PrismaPg driver adapter...');
    const pool = new Pool({ connectionString: dbUrl });
    const adapter = new PrismaPg(pool);
    
    prisma = new PrismaClient({ adapter });
    isDbActive = true;
    console.log('[Database Service] Supabase PostgreSQL database client initialized.');
  } catch (err) {
    console.error('[Database Service Error] Failed to initialize PrismaClient. Falling back to in-memory mode:', err);
    isDbActive = false;
  }
} else {
  console.warn('[Database Service Warning] DATABASE_URL is not configured. Dynamically falling back to in-memory storage mode.');
}
