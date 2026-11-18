require('./register-ts.cjs');
const { loadEnvConfig } = require('@next/env');
loadEnvConfig(process.cwd());
const fs = require('node:fs/promises');
const path = require('node:path');
const readline = require('node:readline');
const { createInterface } = require('node:readline/promises');
const { getDbPool } = require('../src/lib/db.ts');
const { hashPassword } = require('../src/lib/password.ts');

function secret(prompt) {
  if (!process.stdin.isTTY) throw new Error('Use an interactive terminal to enter the password securely.');
  process.stdout.write(prompt);
  readline.emitKeypressEvents(process.stdin);
  process.stdin.setRawMode(true); process.stdin.resume();
  return new Promise((resolve, reject) => {
    let value = '';
    const finish = () => { process.stdin.removeListener('keypress', listener); process.stdin.setRawMode(false); process.stdin.pause(); process.stdout.write('\n'); };
    function listener(text, key = {}) {
      if (key.ctrl && key.name === 'c') { finish(); reject(new Error('Cancelled')); }
      else if (key.name === 'return' || key.name === 'enter') { finish(); resolve(value); }
      else if (key.name === 'backspace') value = value.slice(0, -1);
      else if (text && !key.ctrl && !key.meta) value += text;
    }
    process.stdin.on('keypress', listener);
  });
}
async function main() {
  const pool = getDbPool();
  try {
    if (process.argv.includes('--migrate')) {
      const sql = await fs.readFile(path.join(__dirname, '../supabase/migrations/20261113_admin_auth.sql'), 'utf8');
      await pool.query(sql); console.log('Admin authentication tables are ready.'); return;
    }
    const role = process.argv.includes('--viewer') ? 'viewer' : 'admin';
    const accountLabel = role === 'viewer' ? 'Helpdesk user' : 'Admin';
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    const username = (await rl.question(`${accountLabel} username or email: `)).trim().toLowerCase(); rl.close();
    if (!/^[a-z0-9][a-z0-9@._+-]{2,253}$/.test(username)) throw new Error('Use 3–254 characters: letters, numbers, @ . _ + -');
    const password = await secret('Password (hidden, at least 12 characters): ');
    if (password.length < 12 || password.length > 256) throw new Error('Password must be 12–256 characters.');
    if (password !== await secret('Confirm password (hidden): ')) throw new Error('Passwords do not match.');
    const hash = await hashPassword(password);
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const existing = await client.query('SELECT id, role FROM admin_accounts WHERE username = $1 FOR UPDATE', [username]);
      if (existing.rowCount && !process.argv.includes('--reset')) throw new Error('Account exists. Use --reset explicitly to reset its password.');
      if (existing.rowCount && existing.rows[0].role !== role) throw new Error(`Account already exists with role ${existing.rows[0].role}.`);
      if (existing.rowCount) {
        await client.query('UPDATE admin_accounts SET password_hash = $1 WHERE id = $2', [hash, existing.rows[0].id]);
        await client.query('DELETE FROM admin_sessions WHERE account_id = $1', [existing.rows[0].id]);
      } else await client.query('INSERT INTO admin_accounts (username, password_hash, role) VALUES ($1,$2,$3)', [username, hash, role]);
      await client.query('COMMIT'); console.log(`${accountLabel} account saved.`);
    } catch (error) { await client.query('ROLLBACK'); throw error; }
    finally { client.release(); }
  } finally { await pool.end(); }
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
