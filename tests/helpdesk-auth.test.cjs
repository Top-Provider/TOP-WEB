const { test, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const { NextRequest } = require('next/server');
const { hashPassword, hashToken } = require('../src/lib/password.ts');
const { canAccessHelpdeskTicket, requireHelpdeskUser } = require('../src/lib/admin-auth.ts');
const login = require('../src/app/api/helpdesk/auth/login/route.ts');
const tickets = require('../src/app/api/helpdesk/tickets/route.ts');

const origin = 'http://localhost:3000';

afterEach(() => {
  delete globalThis.topDbPool;
});

function loginRequest(username = 'hospital-user') {
  return new NextRequest(`${origin}/api/helpdesk/auth/login`, {
    method: 'POST',
    headers: { origin, 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password: 'correct-test-password' }),
  });
}

test('helpdesk viewer login issues a secure session and rejects admin accounts', async () => {
  const passwordHash = await hashPassword('correct-test-password');
  let storedSession;
  let role = 'viewer';
  globalThis.topDbPool = {
    query: async (sql, values) => {
      if (sql.includes('RETURNING attempts')) return { rows: [{ attempts: 1 }] };
      if (sql.startsWith('SELECT id, password_hash')) {
        return { rows: [{ id: 12, password_hash: passwordHash, role, is_active: true }] };
      }
      if (sql.startsWith('INSERT INTO admin_sessions')) storedSession = values;
      return { rows: [] };
    },
  };

  const response = await login.POST(loginRequest());
  assert.equal(response.status, 200);
  const cookie = response.cookies.get('top_admin_session');
  assert.match(cookie.value, /^[a-f0-9]{64}$/);
  assert.equal(storedSession[0], hashToken(cookie.value));
  assert.match(response.headers.get('set-cookie'), /HttpOnly/i);
  assert.deepEqual(await response.json(), {
    success: true,
    user: { username: 'hospital-user', role: 'viewer' },
  });

  role = 'admin';
  assert.equal((await login.POST(loginRequest('admin'))).status, 401);
});

test('viewer sessions can access helpdesk but anonymous ticket creation is rejected', async () => {
  const token = 'b'.repeat(64);
  globalThis.topDbPool = {
    query: async (sql, values) => {
      assert.ok(sql.includes('s.expires_at > now()'));
      assert.equal(values[0], hashToken(token));
      return { rows: [{ id: 12, username: 'hospital-user', role: 'viewer' }] };
    },
  };

  const account = await requireHelpdeskUser(
    new NextRequest(`${origin}/api/helpdesk/auth/session`, {
      headers: { cookie: `top_admin_session=${token}` },
    })
  );
  assert.equal(account.username, 'hospital-user');
  assert.equal(account.role, 'viewer');

  delete globalThis.topDbPool;
  const response = await tickets.POST(
    new NextRequest(`${origin}/api/helpdesk/tickets`, {
      method: 'POST',
      headers: { origin, 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
  );
  assert.equal(response.status, 401);
});

test('helpdesk ticket access is limited to the creator or the same organization', () => {
  const viewer = { id: 12, username: 'hospital-user', role: 'viewer', org_name: 'Hospital A' };
  assert.equal(canAccessHelpdeskTicket(viewer, { created_by: 'hospital-user', customer_org: 'Hospital B' }), true);
  assert.equal(canAccessHelpdeskTicket(viewer, { created_by: 'other-user', customer_org: 'Hospital A' }), true);
  assert.equal(canAccessHelpdeskTicket(viewer, { created_by: 'other-user', customer_org: 'Hospital B' }), false);
  assert.equal(
    canAccessHelpdeskTicket({ ...viewer, role: 'admin' }, { created_by: 'other-user', customer_org: 'Hospital B' }),
    true
  );
});
