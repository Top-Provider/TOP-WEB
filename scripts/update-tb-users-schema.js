const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const envPath = path.resolve(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      let value = match[2] || '';
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      process.env[match[1]] = value.trim();
    }
  }
}

const client = new Client({ connectionString: process.env.DATABASE_URL });

async function run() {
  await client.connect();
  console.log('✅ Connected to DB');

  await client.query(`
    ALTER TABLE public."TB_USERS" 
    ADD COLUMN IF NOT EXISTS job_role VARCHAR(50),
    ADD COLUMN IF NOT EXISTS badge VARCHAR(100),
    ADD COLUMN IF NOT EXISTS bio TEXT,
    ADD COLUMN IF NOT EXISTS sort_order INT DEFAULT 0,
    ADD COLUMN IF NOT EXISTS show_on_home BOOLEAN DEFAULT false;
  `);

  console.log('✅ Added job_role, badge, bio, sort_order, show_on_home to TB_USERS');

  // Verify
  const cols = await client.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'TB_USERS'
    ORDER BY ordinal_position;
  `);
  console.log(cols.rows.map(c => c.column_name));

  await client.end();
}

run().catch(e => {
  console.error(e);
  client.end();
});

