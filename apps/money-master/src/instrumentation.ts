/**
 * Next.js Instrumentation Hook
 * https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 * 
 * This file runs once when the Next.js server starts.
 */

export async function register() {
    // Only run on Node.js runtime (server-side)
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        console.log('[Instrumentation] Initializing server-side features...');

        // Initialize backup scheduler (optional - won't block if dependencies are missing)
        try {
            // Check if node-cron is available before importing
            require.resolve('node-cron');

            const { startBackupScheduler } = await import('./lib/cron/backup-scheduler');
            startBackupScheduler();
            console.log('[Instrumentation] Backup scheduler initialized');
        } catch (error) {
            if (error instanceof Error && error.message.includes('Cannot find module')) {
                console.warn('[Instrumentation] Backup scheduler dependencies not installed. Skipping auto-backup initialization.');
                console.warn('[Instrumentation] To enable auto-backup, run: pnpm install');
            } else {
                console.error('[Instrumentation] Failed to initialize backup scheduler:', error);
            }
        }
    }
}
