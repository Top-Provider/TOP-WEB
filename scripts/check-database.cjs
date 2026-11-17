require('./register-ts.cjs');
require('@next/env').loadEnvConfig(process.cwd());
const { getDbPool } = require('../src/lib/db.ts');
const { listActivities } = require('../src/lib/activity-repository.ts');
async function main() {
  const pool = getDbPool();
  try {
    await pool.query('SELECT 1');
    console.log('PostgreSQL connection: OK');
    const result = await listActivities({ limit: 1 });
    console.log(`Public activity query: OK (${result.total} published records)`);
    const tables = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('admin_accounts','admin_sessions','admin_login_attempts')");
    console.log(`Authentication tables: ${tables.rowCount}/3`);
  } finally { await pool.end(); }
}
main().catch(error => { console.error('Database verification failed:', error.code || error.name); process.exitCode = 1; });
