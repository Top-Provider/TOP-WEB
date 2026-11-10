/**
 * Quick Test Connection Script for Local PostgreSQL
 * Run: node scripts/test-connection.js
 */
const fs = require('fs');
const path = require('path');

// 1. Read .env.local
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

const connectionString = process.env.DATABASE_URL;
console.log('🔍 Checking DATABASE_URL from .env.local...');
console.log('URL:', connectionString ? connectionString.replace(/:([^:@]+)@/, ':****@') : 'MISSING');

let pg;
try {
  pg = require('pg');
} catch (e) {
  console.error('\n⚠️ "pg" package is not installed yet. Run: npm install pg');
  process.exit(1);
}

const { Client } = pg;
const client = new Client({ connectionString });

async function test() {
  console.log('\n⏳ Connecting to PostgreSQL...');
  try {
    await client.connect();
    console.log('✅ Connected successfully!');

    const res = await client.query('SELECT version(), current_database(), current_user, inet_server_port();');
    const info = res.rows[0];
    console.log('\n--- 📊 Database Info ---');
    console.log('Database:', info.current_database);
    console.log('User:    ', info.current_user);
    console.log('Port:    ', info.inet_server_port);
    console.log('Version: ', info.version);

    // Check tables
    const tablesRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    console.log('\n--- 📁 Tables in public schema ---');
    if (tablesRes.rows.length === 0) {
      console.log('⚠️ No tables found yet. Remember to run scripts/schema.sql in pgAdmin 4!');
    } else {
      for (const r of tablesRes.rows) {
        try {
          const cRes = await client.query(`SELECT COUNT(*) FROM public."${r.table_name}"`);
          console.log(`- ${r.table_name}: ${cRes.rows[0].count} rows`);
        } catch {
          console.log(`- ${r.table_name}`);
        }
      }
    }

    console.log('\n🎉 Everything is working properly!');
  } catch (err) {
    console.error('\n❌ Connection Failed:');
    console.error(err.message);
    if (err.code === 'ECONNREFUSED') {
      console.error('👉 Hint: Make sure PostgreSQL service is running and port matches in .env.local (e.g. 15432 or 5432).');
    } else if (err.code === '28P01') {
      console.error('👉 Hint: Password authentication failed. Please double check password in .env.local.');
    } else if (err.code === '3D000') {
      console.error('👉 Hint: Database does not exist. Check the database name in .env.local.');
    }
  } finally {
    await client.end();
  }
}

test();

