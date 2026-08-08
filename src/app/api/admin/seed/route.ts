import { requireAdmin } from '@/lib/auth/session';
import { runSeed, seedStatus } from '@/lib/seed';

/** What the admin panel shows before anyone presses the button. */
export async function GET() {
    const admin = await requireAdmin();
    if (admin instanceof Response) return admin;

    try {
        return Response.json(await seedStatus());
    } catch (err) {
        console.error('GET /api/admin/seed', err);
        return Response.json({ message: 'Could not read the shop status' }, { status: 500 });
    }
}

export async function POST() {
    const admin = await requireAdmin();
    if (admin instanceof Response) return admin;

    try {
        const report = await runSeed();
        return Response.json(report);
    } catch (err) {
        console.error('POST /api/admin/seed', err);
        return Response.json({ message: 'Seeding failed' }, { status: 500 });
    }
}
