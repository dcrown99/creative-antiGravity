import { NextRequest, NextResponse } from 'next/server';
import { createBackup, listBackups, deleteBackup } from '@/lib/backup';

export const dynamic = 'force-dynamic';

/**
 * GET /api/backup - List all backups
 */
export async function GET() {
    try {
        const backups = await listBackups();
        return NextResponse.json({
            success: true,
            backups: backups.map(b => ({
                name: b.name,
                size: b.size,
                date: b.date.toISOString(),
            })),
        });
    } catch (error) {
        console.error('Failed to list backups:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to list backups' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/backup - Create a new backup
 */
export async function POST() {
    try {
        const backupPath = await createBackup();
        return NextResponse.json({
            success: true,
            message: 'Backup created successfully',
            backupPath,
        });
    } catch (error) {
        console.error('Failed to create backup:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create backup' },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/backup?file=xxx - Delete a backup file
 */
export async function DELETE(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const fileName = searchParams.get('file');

    if (!fileName) {
        return NextResponse.json(
            { success: false, error: 'Backup file name is required' },
            { status: 400 }
        );
    }

    try {
        await deleteBackup(fileName);
        return NextResponse.json({
            success: true,
            message: 'Backup deleted successfully',
        });
    } catch (error) {
        console.error('Failed to delete backup:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to delete backup' },
            { status: 500 }
        );
    }
}
