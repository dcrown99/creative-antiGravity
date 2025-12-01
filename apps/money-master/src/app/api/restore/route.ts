import { NextRequest, NextResponse } from 'next/server';
import { restoreBackup } from '@/lib/backup';

export const dynamic = 'force-dynamic';

/**
 * POST /api/restore - Restore database from backup
 * Body: { fileName: string }
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { fileName } = body;

        if (!fileName) {
            return NextResponse.json(
                { success: false, error: 'Backup file name is required' },
                { status: 400 }
            );
        }

        await restoreBackup(fileName);

        return NextResponse.json({
            success: true,
            message: 'Database restored successfully. Please refresh the page.',
        });
    } catch (error) {
        console.error('Failed to restore backup:', error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : 'Failed to restore backup' },
            { status: 500 }
        );
    }
}
