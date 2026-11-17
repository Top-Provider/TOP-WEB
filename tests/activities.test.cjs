const { test, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const { NextRequest } = require('next/server');
const { activityQuery, activityFilters, categoryAliases, listActivities, getActivity } = require('../src/lib/activity-repository.ts');
const { formatActivityRow, formatThaiDate } = require('../src/lib/activities.ts');
afterEach(() => { delete globalThis.topDbPool; });
test('filters include legacy categories, tags and safely escaped literal search', () => {
  assert.ok(categoryAliases('company_internal').includes('culture'));
  assert.ok(categoryAliases('seminar').includes('การสัมนา'));
  const { where, values } = activityFilters(activityQuery.parse({ category: 'seminar', search: '50%_off' }));
  assert.ok(where.includes('is_active = true')); assert.ok(where.includes('tags::text ILIKE'));
  assert.equal(values[1], '%50\\%\\_off%');
  assert.equal(where.includes('50'), false);
  assert.throws(() => activityQuery.parse({ limit: 100000 }));
  assert.throws(() => activityQuery.parse({ offset: -1 }));
  assert.throws(() => activityQuery.parse({ sort: 'desc;DROP TABLE x' }));
});
test('public list pages exclude full content/gallery and preserve totals for an empty page', async () => {
  globalThis.topDbPool = { query: async (sql, values) => {
    assert.ok(sql.includes('LIMIT $1 OFFSET $2')); assert.deepEqual(values, [12, 24]);
    assert.ok(sql.includes('a.event_date ASC NULLS LAST, a.id ASC'));
    assert.ok(sql.includes('LEFT JOIN public."TBM_HD_HOSPITALS"'));
    assert.ok(!sql.includes('SELECT *')); assert.ok(!sql.includes(',content,'));
    assert.ok(sql.includes('/api/activity-image/')); return { rows: [{ total: 20, items: [] }] };
  } };
  const result = await listActivities({ limit: 12, offset: 24, sort: 'asc' });
  assert.equal(result.total, 20); assert.deepEqual(result.data, []);
});
test('unpublished activities are not exposed through either public detail route', async () => {
  globalThis.topDbPool = { query: async sql => { assert.ok(sql.includes('AND a.is_active = true')); return { rows: [] }; } };
  assert.equal(await getActivity(1), null);
  const list = require('../src/app/api/activities/route.ts');
  const detail = require('../src/app/api/activities/[id]/route.ts');
  assert.equal((await list.GET(new NextRequest('http://localhost/api/activities?id=1'))).status, 404);
  assert.equal((await detail.GET(new NextRequest('http://localhost/api/activities/1'), { params: Promise.resolve({ id: '1' }) })).status, 404);
});
test('Thai calendar uses date-only values consistently', () => {
  assert.equal(formatThaiDate('2026-11-13'), '13 พ.ย. 2569');
  assert.equal(formatThaiDate(undefined), '');
});
test('activity rows expose customerId and customerName for dropdown-backed activities', () => {
  const activity = formatActivityRow({
    id: 1,
    title: 'Customer event',
    customer_id: '42',
    customer_name: 'โรงพยาบาลตัวอย่าง',
  });
  assert.equal(activity.customerId, 42);
  assert.equal(activity.customerName, 'โรงพยาบาลตัวอย่าง');
});
