import { Database } from 'sqlite3';
import path from 'path';

export default async function globalTeardown() {
    const dbPath = path.join(__dirname, '../prisma/dev.db');
    console.log('🧹 Cleaning up test data from:', dbPath);

    const db = new Database(dbPath);

    return new Promise<void>((resolve, reject) => {
        db.run("DELETE FROM Asset WHERE ticker = 'E2E-001'", (err) => {
            if (err) {
                console.error('❌ Failed to clean up test data:', err);
                reject(err);
            } else {
                console.log('✅ Test data cleaned up successfully.');
                resolve();
            }
            db.close();
        });
    });
}
