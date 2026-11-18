const { test, afterEach } = require("node:test");
const assert = require("node:assert/strict");
const { NextRequest } = require("next/server");
const { hashToken } = require("../src/lib/password.ts");
const contactRoute = require("../src/app/api/contact/route.ts");
const adminContactRoute = require("../src/app/api/admin/contact/route.ts");
const notificationsRoute = require("../src/app/api/helpdesk/notifications/route.ts");

const origin = "http://localhost:3000";

afterEach(() => {
  delete globalThis.topDbPool;
});

function mockAdminPool(token, handler) {
  const tokenHash = hashToken(token);
  globalThis.topDbPool = {
    query: async (sql, values) => {
      if (sql.includes("FROM admin_sessions")) {
        assert.equal(values[0], tokenHash);
        return {
          rows: [
            {
              id: 7,
              username: "admin",
              role: "admin",
              org_name: null,
            },
          ],
        };
      }
      return handler(sql, values);
    },
  };
}

test("POST /api/contact validates origin and payload, then inserts message", async () => {
  const badOriginReq = new NextRequest(`${origin}/api/contact`, {
    method: "POST",
    headers: { origin: "https://evil.example.com", "Content-Type": "application/json" },
    body: JSON.stringify({
      first_name: "Somchai",
      email: "somchai@example.com",
      subject: "สอบถาม",
      message: "รายละเอียด",
    }),
  });
  assert.equal((await contactRoute.POST(badOriginReq)).status, 403);

  const invalidReq = new NextRequest(`${origin}/api/contact`, {
    method: "POST",
    headers: { origin, "Content-Type": "application/json" },
    body: JSON.stringify({ first_name: "Somchai", email: "not-an-email", subject: "Hi", message: "Test" }),
  });
  assert.equal((await contactRoute.POST(invalidReq)).status, 400);

  let insertedValues;
  globalThis.topDbPool = {
    query: async (_sql, values) => {
      insertedValues = values;
      return { rows: [{ id: 9, created_at: "2026-11-18T04:00:00Z" }] };
    },
  };
  const okReq = new NextRequest(`${origin}/api/contact`, {
    method: "POST",
    headers: { origin, "Content-Type": "application/json" },
    body: JSON.stringify({
      first_name: " สมชาย ",
      last_name: "",
      email: "somchai@example.com",
      phone: "",
      subject: "ขอใบเสนอราคา",
      message: "ต้องการสอบถามเครื่องพิมพ์",
    }),
  });
  const res = await contactRoute.POST(okReq);
  assert.equal(res.status, 201);
  assert.deepEqual(insertedValues, [
    "สมชาย",
    null,
    "somchai@example.com",
    null,
    "ขอใบเสนอราคา",
    "ต้องการสอบถามเครื่องพิมพ์",
  ]);
});

test("admin contact route requires admin session and supports GET, PATCH, DELETE", async () => {
  assert.equal((await adminContactRoute.GET(new NextRequest(`${origin}/api/admin/contact`))).status, 401);

  const token = "a".repeat(64);
  mockAdminPool(token, async (sql, values) => {
    if (sql.includes("ALTER TABLE")) return { rows: [] };
    if (sql.startsWith("SELECT id, first_name")) {
      return { rows: [{ id: 1, first_name: "A", is_read: false }] };
    }
    if (sql.startsWith("UPDATE public.\"TB_CONTACT_MESSAGES\"")) {
      assert.deepEqual(values, [true, 1]);
      return { rowCount: 1, rows: [{ id: 1, is_read: true }] };
    }
    if (sql.startsWith("DELETE FROM public.\"TB_CONTACT_MESSAGES\"")) {
      assert.deepEqual(values, [1]);
      return { rowCount: 1, rows: [{ id: 1 }] };
    }
    return { rows: [] };
  });

  const getRes = await adminContactRoute.GET(
    new NextRequest(`${origin}/api/admin/contact`, {
      headers: { cookie: `top_admin_session=${token}` },
    })
  );
  assert.equal(getRes.status, 200);
  assert.equal(getRes.headers.get("Cache-Control"), "no-store");

  const patchRes = await adminContactRoute.PATCH(
    new NextRequest(`${origin}/api/admin/contact`, {
      method: "PATCH",
      headers: { origin, cookie: `top_admin_session=${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ id: 1, is_read: true }),
    })
  );
  assert.equal(patchRes.status, 200);

  const delRes = await adminContactRoute.DELETE(
    new NextRequest(`${origin}/api/admin/contact`, {
      method: "DELETE",
      headers: { origin, cookie: `top_admin_session=${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ id: 1 }),
    })
  );
  assert.equal(delRes.status, 200);
});

test("GET /api/helpdesk/notifications requires admin and returns new ticket counts", async () => {
  assert.equal((await notificationsRoute.GET(new NextRequest(`${origin}/api/helpdesk/notifications`))).status, 401);

  const token = "b".repeat(64);
  mockAdminPool(token, async (sql) => {
    if (sql.includes("new_count")) return { rows: [{ new_count: 3 }] };
    return {
      rows: [
        { id: 105, ticket_no: "HD-2026-0105", customer_org: "รพ.ก", title: "พิมพ์ไม่ออก", priority: "P2", queue: "PRINTER", created_at: "2026-11-18T03:00:00Z" },
      ],
    };
  });

  const res = await notificationsRoute.GET(
    new NextRequest(`${origin}/api/helpdesk/notifications`, {
      headers: { cookie: `top_admin_session=${token}` },
    })
  );
  assert.equal(res.status, 200);
  assert.equal(res.headers.get("Cache-Control"), "no-store");
  const body = await res.json();
  assert.equal(body.newCount, 3);
  assert.equal(body.latestNewId, 105);
  assert.equal(body.items.length, 1);
});
