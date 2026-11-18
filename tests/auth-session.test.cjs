const { test, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const { NextRequest } = require('next/server');
const { hashPassword, hashToken } = require('../src/lib/password.ts');
const login = require('../src/app/api/auth/login/route.ts');
const logout = require('../src/app/api/auth/logout/route.ts');
const origin = 'http://localhost:3000';
afterEach(() => { delete globalThis.topDbPool; });
const loginRequest = () => new NextRequest(`${origin}/api/auth/login`, { method: 'POST', headers: { origin, 'Content-Type': 'application/json' }, body: JSON.stringify({ username: 'admin', password: 'correct-test-password' }) });
test('login issues an opaque HttpOnly cookie and stores only its hash; logout revokes it', async () => {
  const hash = await hashPassword('correct-test-password');
  let inserted;
  globalThis.topDbPool = { query: async (sql, values) => {
    if (sql.includes('RETURNING attempts')) return { rows: [{ attempts: 1 }] };
    if (sql.startsWith('SELECT id, password_hash')) return { rows: [{ id: 7, password_hash: hash, role: 'admin', is_active: true }] };
    if (sql.startsWith('INSERT INTO admin_sessions')) inserted = values;
    return { rows: [] };
  } };
  const response = await login.POST(loginRequest());
  assert.equal(response.status, 200);
  const cookie = response.headers.get('set-cookie');
  assert.match(cookie, /HttpOnly/i); assert.match(cookie, /SameSite=strict/i); assert.match(cookie, /Max-Age=28800/i);
  const token = response.cookies.get('top_admin_session').value;
  assert.match(token, /^[a-f0-9]{64}$/); assert.equal(inserted[0], hashToken(token)); assert.notEqual(inserted[0], token);
  const body = await response.json(); assert.deepEqual(body, { success: true, user: { username: 'admin' } });
  globalThis.topDbPool.query = async (sql, values) => { assert.ok(sql.startsWith('DELETE FROM admin_sessions')); assert.deepEqual(values, [hashToken(token)]); return { rows: [] }; };
  const result = await logout.POST(new NextRequest(`${origin}/api/auth/logout`, { method: 'POST', headers: { origin, cookie: `top_admin_session=${token}` } }));
  assert.equal(result.status, 200); assert.match(result.headers.get('set-cookie'), /Max-Age=0/);
});
test('login throttling denies an account before password verification', async () => {
  let queries = 0;
  globalThis.topDbPool = { query: async () => { queries++; return { rows: [{ attempts: 11 }] }; } };
  assert.equal((await login.POST(loginRequest())).status, 429); assert.equal(queries, 1);
});
test('development diagnostics reveal no schema and production diagnostics are absent', async () => {
  const { GET } = require('../src/app/api/test-db/route.ts');
  const previous = process.env.NODE_ENV;
  try {
    process.env.NODE_ENV = 'production';
    assert.equal((await GET(new NextRequest(`${origin}/api/test-db`))).status, 404);
    process.env.NODE_ENV = 'development';
    assert.equal((await GET(new NextRequest(`${origin}/api/test-db`))).status, 401);
  } finally { if (previous === undefined) delete process.env.NODE_ENV; else process.env.NODE_ENV = previous; }
});
