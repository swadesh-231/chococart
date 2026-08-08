import { Pool } from '@neondatabase/serverless';
import { defineRelations } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/neon-serverless';
import * as schema from './schema';

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set');
}

const relations = defineRelations(schema);

// The neon-http driver cannot run interactive transactions (no rollback, no
// SELECT ... FOR UPDATE), which the order placement flow depends on. The
// WebSocket pool speaks the real postgres protocol, so transactions work.
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export const db = drizzle({ client: pool, relations });

export { pool, schema, relations };
