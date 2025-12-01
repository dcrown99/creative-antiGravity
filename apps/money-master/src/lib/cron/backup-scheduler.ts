import cron from 'node-cron';
import { createBackup, cleanOldBackups } from '../backup';

let isSchedulerRunning = false;

/**
 * Start the automatic backup scheduler
 * Runs daily at 9:00 AM
 */
export function startBackupScheduler() {
    if (isSchedulerRunning) {
        console.log('Backup scheduler is already running');
        return;
    }

    // Schedule backup at 9:00 AM every day
    cron.schedule('0 9 * * *', async () => {
        console.log('Running scheduled backup at 9:00 AM...');
        try {
            const backupPath = await createBackup();
            console.log(`Scheduled backup created: ${backupPath}`);

            // Clean up old backups (older than 30 days)
            const deletedCount = await cleanOldBackups(30);
            console.log(`Cleaned up ${deletedCount} old backups`);
        } catch (error) {
            console.error('Scheduled backup failed:', error);
        }
    });

    isSchedulerRunning = true;
    console.log('Backup scheduler started - will run daily at 9:00 AM');
}
