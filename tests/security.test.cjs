const { test, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const { NextRequest } = require('next/server');
const { tableName, selectColumns, validateData, activitySchema } = require('../src/lib/data-validation.ts');
const { databaseConfig } = require('../src/lib/db-config.ts');
const { hashPassword, verifyPassword, hashToken } = require('../src/lib/password.ts');
const { requireAdmin, checkOrigin } = require('../src/lib/admin-auth.ts');
const { pgSelect, pgWrite } = require('../src/lib/db.ts');
afterEach(() => { delete globalThis.topDbPool; });
const request = (path, options = {}) => new NextRequest(`http://localhost:3000${path}`, options);
test('SQL identifiers and projections reject expressions and unlisted tables', () => {
  assert.equal(tableName('public.tb_products'), 'TB_PRODUCTS');
  for (const table of ['tb_private', 'admin_accounts', 'TB_PRODUCTS"; DROP TABLE x;--', '__proto__']) assert.throws(() => tableName(table));
  for (const field of ['id;SELECT 1', '(SELECT password_hash FROM admin_accounts)', 'id AS other', 'unknown']) assert.throws(() => selectColumns('TB_PRODUCTS', field));
  assert.equal(selectColumns('TB_PRODUCTS', 'id, name'), '"id", "name"');
  assert.throws(() => validateData('TB_PRODUCTS', { 'name" = NULL--': 'x' }));
  assert.throws(() => activitySchema.parse({ title: 'x', category: 'workshop', is_active: 'false' }));
  assert.throws(() => activitySchema.parse({ title: ' ', category: 'workshop' }));
  assert.throws(() => activitySchema.parse({ title: 'x', category: 'workshop', event_date: '2026-02-30' }));
});
test('DB_* configuration works without DATABASE_URL and no silent provider fallback', () => {
  const config = databaseConfig({ DB_NAME: 'test', DB_PASSWORD: '', DB_PORT: '5432' });
  assert.equal(config.database, 'test'); assert.equal(config.port, 5432);
  assert.equal(databaseConfig({ DATABASE_URL: 'postgres://example' }).connectionString, 'postgres://example');
  assert.throws(() => databaseConfig({}));
});
test('passwords have independent salts and verify without plaintext storage', async () => {
  const password = 'test-password-1234';
  const first = await hashPassword(password), second = await hashPassword(password);
  assert.notEqual(first, second); assert.equal(first.includes(password), false);
  assert.equal(await verifyPassword(password, first), true);
  assert.equal(await verifyPassword('incorrect', first), false);
  assert.equal(await verifyPassword(password, 'broken'), false);
});
test('admin checks reject missing/expired sessions and non-admin roles', async () => {
  await assert.rejects(requireAdmin(request('/api/admin/save')), error => error.status === 401);
  const token = 'a'.repeat(64);
  const req = request('/api/admin/save', { headers: { cookie: `top_admin_session=${token}` } });
  globalThis.topDbPool = { query: async (sql, values) => {
    assert.ok(sql.includes('s.expires_at > now()')); assert.ok(sql.includes('a.is_active = true'));
    assert.equal(values[0], hashToken(token)); return { rows: [] };
  } };
  await assert.rejects(requireAdmin(req), error => error.status === 401);
  globalThis.topDbPool.query = async () => ({ rows: [{ id: 1, username: 'viewer', role: 'viewer' }] });
  await assert.rejects(requireAdmin(req), error => error.status === 403);
  globalThis.topDbPool.query = async () => ({ rows: [{ id: 1, username: 'admin', role: 'admin' }] });
  assert.equal((await requireAdmin(req)).username, 'admin');
});
test('mutations require same-origin requests', () => {
  assert.throws(() => checkOrigin(request('/api/auth/login', { method: 'POST' })), error => error.status === 403);
  assert.throws(() => checkOrigin(request('/api/auth/login', { method: 'POST', headers: { origin: 'https://evil.example' } })), error => error.status === 403);
  assert.doesNotThrow(() => checkOrigin(request('/api/auth/login', { method: 'POST', headers: { origin: 'http://localhost:3000' } })));
});
test('all private/mutation API handlers deny unauthenticated calls before touching data', async () => {
  const routes = [
    ['admin/save', ['GET', 'POST']], ['admin/categories', ['POST', 'PUT', 'DELETE']],
    ['admin/brands', ['POST']], ['admin/program-options', ['POST', 'DELETE']],
    ['activities', ['POST', 'PUT', 'DELETE']], ['activities/[id]', ['PUT', 'DELETE']],
  ];
  globalThis.topDbPool = { query: () => { throw new Error('Should not query data'); } };
  for (const [path, methods] of routes) {
    const route = require(`../src/app/api/${path}/route.ts`);
    for (const method of methods) {
      const response = await route[method](request(`/api/${path}`, { method, headers: { origin: 'http://localhost:3000' } }), { params: Promise.resolve({ id: '1' }) });
      assert.equal(response.status, 401, `${method} ${path}`);
    }
  }
  const { GET } = require('../src/app/api/activities/route.ts');
  assert.equal((await GET(request('/api/activities?all=true'))).status, 401);
});
test('CRUD writes bind values and rollback the whole batch on failure', async () => {
  const calls = []; let released = false;
  const client = { query: async (sql, values) => { calls.push({ sql, values }); if (values?.includes('fail')) throw new Error('constraint'); return { rows: [{ id: 1, name: 'ok' }] }; }, release: () => { released = true; } };
  globalThis.topDbPool = { connect: async () => client };
  const text = "x'); DROP TABLE users;--";
  const output = await pgWrite('TB_PRODUCTS', 'insert', { name: text }, {});
  assert.equal(output.length, 1); assert.ok(!calls[1].sql.includes(text)); assert.equal(calls[1].values[0], text);
  assert.equal(calls.at(-1).sql, 'COMMIT'); assert.ok(released);
  calls.length = 0;
  await assert.rejects(pgWrite('TB_PRODUCTS', 'insert', [{ name: 'ok' }, { name: 'fail' }], {}));
  assert.equal(calls.at(-1).sql, 'ROLLBACK');
  await assert.rejects(pgWrite('TB_PRODUCTS', 'delete', undefined, {}), error => error.status === 400);
});
test('CRUD update/delete bind match values and upsert uses an allowed conflict column', async () => {
  const calls = [];
  globalThis.topDbPool = { connect: async () => ({ query: async (sql, values) => { calls.push({ sql, values }); return { rows: [{ id: 2 }] }; }, release() {} }) };
  await pgWrite('TB_PRODUCTS', 'update', { name: 'new', is_active: false }, { id: 2 });
  assert.ok(calls[1].sql.includes('UPDATE')); assert.deepEqual(calls[1].values, ['new', false, 2]);
  calls.length = 0; await pgWrite('TB_PRODUCTS', 'delete', undefined, { id: 2 });
  assert.ok(calls[1].sql.includes('DELETE FROM')); assert.deepEqual(calls[1].values, [2]);
  calls.length = 0; await pgWrite('TB_PRODUCTS', 'upsert', { id: 2, name: 'new' }, {});
  assert.ok(calls[1].sql.includes('ON CONFLICT ("id")'));
});
test('empty reads stay empty and invalid limits do not reach the database', async () => {
  let calls = 0;
  globalThis.topDbPool = { query: async () => { calls++; return { rows: [] }; } };
  assert.deepEqual(await pgSelect({ table: 'TB_PRODUCTS', limit: 12 }), []);
  await assert.rejects(pgSelect({ table: 'TB_PRODUCTS', limit: -1 }));
  assert.equal(calls, 1);
});
