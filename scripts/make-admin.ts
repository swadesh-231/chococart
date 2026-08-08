import 'dotenv/config';
import { eq } from 'drizzle-orm';
import { db, pool } from '../src/db/db';
import { user } from '../src/db/schema/auth-schema';
import { users } from '../src/db/schema/schema';
import { linkAppUser } from '../src/lib/auth/app-user';

const email = process.argv[2];

if (!email) {
    console.error('Usage: bun run make-admin <email>');
    process.exit(1);
}

const [authUser] = await db.select().from(user).where(eq(user.email, email)).limit(1);

if (!authUser) {
    console.error(`No account found for "${email}". Sign up at /signin first, then run this again.`);
    await pool.end();
    process.exit(1);
}

await linkAppUser(authUser);

const [updated] = await db
    .update(users)
    .set({ role: 'admin', updatedAt: new Date() })
    .where(eq(users.email, email))
    .returning({ email: users.email, role: users.role });

console.log(`✅ ${updated.email} is now an ${updated.role}`);
await pool.end();
