const { test } = require("node:test");
const assert = require("node:assert/strict");
const {
  TICKET_STATUSES,
  TICKET_PRIORITIES,
  TICKET_IMPACTS,
  TICKET_URGENCIES,
  TICKET_QUEUES,
  EQUIPMENT_TYPES,
  SOURCE_CHANNELS,
  STATUS_LABELS,
  STATUS_BADGE_CLASSES,
  PRIORITY_LABELS,
  PRIORITY_BADGE_CLASSES,
  EQUIPMENT_LABELS,
  SOURCE_CHANNEL_LABELS,
  IMPACT_LABELS,
  URGENCY_LABELS,
  QUEUE_LABELS,
  ALLOWED_STATUS_TRANSITIONS,
  PAUSED_STATUSES,
} = require("../src/lib/helpdesk-constants.ts");

test("helpdesk constants define complete labels, badges, and valid transitions for all enum values", () => {
  for (const status of TICKET_STATUSES) {
    assert.ok(STATUS_LABELS[status], `Missing STATUS_LABELS for ${status}`);
    assert.ok(STATUS_BADGE_CLASSES[status], `Missing STATUS_BADGE_CLASSES for ${status}`);
    assert.ok(Array.isArray(ALLOWED_STATUS_TRANSITIONS[status]), `Missing transitions for ${status}`);
    for (const next of ALLOWED_STATUS_TRANSITIONS[status]) {
      assert.ok(TICKET_STATUSES.includes(next), `Invalid transition target ${next}`);
    }
  }

  assert.deepEqual(ALLOWED_STATUS_TRANSITIONS.CLOSED, []);
  assert.deepEqual(ALLOWED_STATUS_TRANSITIONS.CANCELLED, []);
  assert.ok(PAUSED_STATUSES.has("PENDING_CUSTOMER"));
  assert.ok(PAUSED_STATUSES.has("PENDING_PARTS"));
  assert.equal(PAUSED_STATUSES.has("IN_PROGRESS"), false);

  for (const priority of TICKET_PRIORITIES) {
    assert.ok(PRIORITY_LABELS[priority]);
    assert.ok(PRIORITY_BADGE_CLASSES[priority]);
  }
  for (const eq of EQUIPMENT_TYPES) assert.ok(EQUIPMENT_LABELS[eq]);
  for (const ch of SOURCE_CHANNELS) assert.ok(SOURCE_CHANNEL_LABELS[ch]);
  for (const imp of TICKET_IMPACTS) assert.ok(IMPACT_LABELS[imp]);
  for (const urg of TICKET_URGENCIES) assert.ok(URGENCY_LABELS[urg]);
  for (const q of TICKET_QUEUES) assert.ok(QUEUE_LABELS[q]);
});
