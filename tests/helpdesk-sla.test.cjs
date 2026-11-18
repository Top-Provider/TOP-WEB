const test = require('node:test');
const assert = require('node:assert/strict');
const {
  calculatePriority,
  determineQueue,
  advanceToBusinessHours,
  addBusinessMinutes,
  computeBusinessMinutesBetween,
  getSlaStatus,
  DEFAULT_BUSINESS_HOURS,
} = require('../src/lib/helpdesk-sla.ts');

test('calculatePriority respects matrix and patient care critical floor', () => {
  assert.equal(calculatePriority('ORG', 'CRITICAL', false), 'P1');
  assert.equal(calculatePriority('USER', 'NORMAL', false), 'P4');
  assert.equal(calculatePriority('USER', 'NORMAL', true), 'P2');
  assert.equal(calculatePriority('ORG', 'CRITICAL', true), 'P1');
});

test('determineQueue routes PRINTER to PRINTER and others to GENERAL', () => {
  assert.equal(determineQueue('PRINTER'), 'PRINTER');
  assert.equal(determineQueue('COMPUTER'), 'GENERAL');
  assert.equal(determineQueue('NETWORK'), 'GENERAL');
});

test('advanceToBusinessHours snaps after-hours Friday to Monday 08:30 BKK', () => {
  // Friday 2026-11-13 19:00 BKK = 12:00 UTC
  const friEvening = new Date('2026-11-13T12:00:00Z');
  const snapped = advanceToBusinessHours(friEvening, DEFAULT_BUSINESS_HOURS, []);
  // Monday 2026-11-16 08:30 BKK = 01:30 UTC
  assert.equal(snapped.toISOString(), '2026-11-16T01:30:00.000Z');
});

test('advanceToBusinessHours skips public holidays', () => {
  // Monday 2026-11-16 09:00 BKK = 02:00 UTC, holiday on 2026-11-16
  const monMorning = new Date('2026-11-16T02:00:00Z');
  const snapped = advanceToBusinessHours(monMorning, DEFAULT_BUSINESS_HOURS, ['2026-11-16']);
  // Tuesday 2026-11-17 08:30 BKK = 01:30 UTC
  assert.equal(snapped.toISOString(), '2026-11-17T01:30:00.000Z');
});

test('addBusinessMinutes rolls over across business days (9.5h = 570m/day)', () => {
  // Friday 2026-11-13 17:30 BKK = 10:30 UTC (30m left before 18:00)
  const friAfternoon = new Date('2026-11-13T10:30:00Z');
  const due = addBusinessMinutes(friAfternoon, 90, DEFAULT_BUSINESS_HOURS, []);
  // 30m on Friday + 60m on Monday 08:30 -> Monday 09:30 BKK = 02:30 UTC
  assert.equal(due.toISOString(), '2026-11-16T02:30:00.000Z');
});

test('computeBusinessMinutesBetween excludes weekends', () => {
  // Friday 17:00 BKK (10:00 UTC) to Monday 09:30 BKK (02:30 UTC) = 60m + 60m = 120m
  const start = new Date('2026-11-13T10:00:00Z');
  const end = new Date('2026-11-16T02:30:00Z');
  assert.equal(computeBusinessMinutesBetween(start, end, DEFAULT_BUSINESS_HOURS, []), 120);
});

test('getSlaStatus detects WARNING at >=75% and PAUSED when pending customer', () => {
  const start = new Date('2026-11-16T01:30:00Z'); // Mon 08:30 BKK
  const due = new Date('2026-11-16T03:30:00Z');   // Mon 10:30 BKK (120m)
  const warnNow = new Date('2026-11-16T03:00:00Z'); // Mon 10:00 BKK (90m = 75%)
  const snap = getSlaStatus(
    { status: 'IN_PROGRESS', sla_started_at: start, resolve_due_at: due },
    warnNow,
    DEFAULT_BUSINESS_HOURS,
    []
  );
  assert.equal(snap.state, 'WARNING');
  assert.equal(snap.percentUsed, 75);

  const pausedSnap = getSlaStatus(
    {
      status: 'PENDING_CUSTOMER',
      sla_started_at: start,
      resolve_due_at: due,
      sla_paused_at: new Date('2026-11-16T02:30:00Z'),
    },
    new Date('2026-11-16T05:00:00Z'),
    DEFAULT_BUSINESS_HOURS,
    []
  );
  assert.equal(pausedSnap.state, 'PAUSED');
  assert.equal(pausedSnap.elapsedMinutes, 60);
});

