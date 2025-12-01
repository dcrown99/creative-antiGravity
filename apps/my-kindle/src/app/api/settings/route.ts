import { NextResponse } from 'next/server';
import { getConfig, saveConfig } from '@/lib/config';

export async function GET() {
    try {
        const config = getConfig();
        return NextResponse.json(config);
    } catch (error) {
        console.error('[API] Settings GET error:', error);
        return NextResponse.json(
            { error: 'Failed to load settings', details: String(error) },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        if (!body || typeof body.libraryPath !== 'string') {
            return NextResponse.json(
                { error: 'Invalid libraryPath' },
                { status: 400 }
            );
        }

        const updated = saveConfig({ libraryPath: body.libraryPath });
        return NextResponse.json(updated);
    } catch (error) {
        console.error('[API] Settings POST error:', error);
        return NextResponse.json(
            { error: 'Failed to save settings', details: String(error) },
            { status: 500 }
        );
    }
}
