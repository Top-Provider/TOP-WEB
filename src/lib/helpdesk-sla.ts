import type {
  EquipmentType,
  TicketImpact,
  TicketPriority,
  TicketQueue,
  TicketStatus,
  TicketUrgency,
} from "./helpdesk-constants";
import { PAUSED_STATUSES } from "./helpdesk-constants";

export interface BusinessHourRule {
  day_of_week: number; // 0 = Sunday .. 6 = Saturday
  is_working_day: boolean;
  start_time: string; // "HH:MM"
  end_time: string;   // "HH:MM"
}

export interface SlaTargetRule {
  priority: TicketPriority;
  label: string;
  first_response_minutes: number;
  onsite_minutes: number | null;
  resolve_minutes: number;
}

export const DEFAULT_BUSINESS_HOURS: BusinessHourRule[] = [
  { day_of_week: 0, is_working_day: false, start_time: "08:30", end_time: "18:00" },
  { day_of_week: 1, is_working_day: true, start_time: "08:30", end_time: "18:00" },
  { day_of_week: 2, is_working_day: true, start_time: "08:30", end_time: "18:00" },
  { day_of_week: 3, is_working_day: true, start_time: "08:30", end_time: "18:00" },
  { day_of_week: 4, is_working_day: true, start_time: "08:30", end_time: "18:00" },
  { day_of_week: 5, is_working_day: true, start_time: "08:30", end_time: "18:00" },
  { day_of_week: 6, is_working_day: false, start_time: "08:30", end_time: "18:00" },
];

export const DEFAULT_SLA_TARGETS: Record<TicketPriority, SlaTargetRule> = {
  P1: { priority: "P1", label: "วิกฤต (Critical)", first_response_minutes: 30, onsite_minutes: 240, resolve_minutes: 480 },
  P2: { priority: "P2", label: "เร่งด่วน (High)", first_response_minutes: 60, onsite_minutes: 570, resolve_minutes: 1140 },
  P3: { priority: "P3", label: "ปกติ (Medium)", first_response_minutes: 240, onsite_minutes: 1140, resolve_minutes: 2850 },
  P4: { priority: "P4", label: "ไม่เร่งด่วน (Low)", first_response_minutes: 570, onsite_minutes: null, resolve_minutes: 5700 },
};

const BKK_OFFSET_MS = 7 * 60 * 60 * 1000;

export function calculatePriority(
  impact: TicketImpact,
  urgency: TicketUrgency,
  isPatientCareCritical = false
): TicketPriority {
  const matrix: Record<TicketImpact, Record<TicketUrgency, TicketPriority>> = {
    ORG: { CRITICAL: "P1", HIGH: "P2", NORMAL: "P3" },
    DEPT: { CRITICAL: "P2", HIGH: "P3", NORMAL: "P4" },
    USER: { CRITICAL: "P3", HIGH: "P4", NORMAL: "P4" },
  };
  const base = matrix[impact]?.[urgency] ?? "P3";
  if (isPatientCareCritical && (base === "P3" || base === "P4")) {
    return "P2";
  }
  return base;
}

export function determineQueue(equipmentType: EquipmentType): TicketQueue {
  return equipmentType === "PRINTER" ? "PRINTER" : "GENERAL";
}

function parseHm(hm: string): number {
  const [hStr, mStr] = hm.split(":");
  const h = Number(hStr);
  const m = Number(mStr);
  return (Number.isFinite(h) ? h : 0) * 60 + (Number.isFinite(m) ? m : 0);
}

function toBkkDate(utcDate: Date): Date {
  return new Date(utcDate.getTime() + BKK_OFFSET_MS);
}

function fromBkkParts(year: number, month: number, day: number, minuteOfDay: number): Date {
  const h = Math.floor(minuteOfDay / 60);
  const m = minuteOfDay % 60;
  const bkkUtcMs = Date.UTC(year, month, day, h, m, 0, 0);
  return new Date(bkkUtcMs - BKK_OFFSET_MS);
}

function bkkDateString(bkkDate: Date): string {
  const y = bkkDate.getUTCFullYear();
  const m = String(bkkDate.getUTCMonth() + 1).padStart(2, "0");
  const d = String(bkkDate.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getRuleForDay(
  bkkDate: Date,
  businessHours: BusinessHourRule[],
  holidaySet: Set<string>
): { working: boolean; startMin: number; endMin: number } {
  const dateKey = bkkDateString(bkkDate);
  if (holidaySet.has(dateKey)) {
    return { working: false, startMin: 0, endMin: 0 };
  }
  const dow = bkkDate.getUTCDay();
  const rule = businessHours.find((r) => r.day_of_week === dow);
  if (!rule || !rule.is_working_day) {
    return { working: false, startMin: 0, endMin: 0 };
  }
  const startMin = parseHm(rule.start_time);
  const endMin = parseHm(rule.end_time);
  if (endMin <= startMin) {
    return { working: false, startMin: 0, endMin: 0 };
  }
  return { working: true, startMin, endMin };
}

export function advanceToBusinessHours(
  date: Date,
  businessHours: BusinessHourRule[] = DEFAULT_BUSINESS_HOURS,
  holidays: Iterable<string> = []
): Date {
  const holidaySet = holidays instanceof Set ? holidays : new Set(holidays);
  let cursor = new Date(date.getTime());

  for (let guard = 0; guard < 366; guard++) {
    const bkk = toBkkDate(cursor);
    const rule = getRuleForDay(bkk, businessHours, holidaySet);
    const currentMin = bkk.getUTCHours() * 60 + bkk.getUTCMinutes();

    if (rule.working) {
      if (currentMin < rule.startMin) {
        return fromBkkParts(bkk.getUTCFullYear(), bkk.getUTCMonth(), bkk.getUTCDate(), rule.startMin);
      }
      if (currentMin < rule.endMin) {
        return cursor;
      }
    }

    // Move to 00:00 of the next Bangkok day
    cursor = fromBkkParts(bkk.getUTCFullYear(), bkk.getUTCMonth(), bkk.getUTCDate() + 1, 0);
  }
  return cursor;
}

export function addBusinessMinutes(
  startDate: Date,
  minutesToAdd: number,
  businessHours: BusinessHourRule[] = DEFAULT_BUSINESS_HOURS,
  holidays: Iterable<string> = []
): Date {
  const holidaySet = holidays instanceof Set ? holidays : new Set(holidays);
  let cursor = advanceToBusinessHours(startDate, businessHours, holidaySet);
  let remaining = Math.max(0, minutesToAdd);

  for (let guard = 0; guard < 366 && remaining > 0; guard++) {
    const bkk = toBkkDate(cursor);
    const rule = getRuleForDay(bkk, businessHours, holidaySet);
    if (!rule.working) {
      cursor = advanceToBusinessHours(cursor, businessHours, holidaySet);
      continue;
    }
    const windowEnd = fromBkkParts(bkk.getUTCFullYear(), bkk.getUTCMonth(), bkk.getUTCDate(), rule.endMin);
    const availableMinutes = (windowEnd.getTime() - cursor.getTime()) / 60000;

    if (remaining <= availableMinutes) {
      return new Date(cursor.getTime() + remaining * 60000);
    }

    remaining -= availableMinutes;
    const nextDayStart = fromBkkParts(bkk.getUTCFullYear(), bkk.getUTCMonth(), bkk.getUTCDate() + 1, 0);
    cursor = advanceToBusinessHours(nextDayStart, businessHours, holidaySet);
  }

  return cursor;
}

export function computeBusinessMinutesBetween(
  startDate: Date,
  endDate: Date,
  businessHours: BusinessHourRule[] = DEFAULT_BUSINESS_HOURS,
  holidays: Iterable<string> = []
): number {
  if (endDate.getTime() <= startDate.getTime()) return 0;
  const holidaySet = holidays instanceof Set ? holidays : new Set(holidays);
  let cursor = advanceToBusinessHours(startDate, businessHours, holidaySet);
  let totalMinutes = 0;

  for (let guard = 0; guard < 366 && cursor.getTime() < endDate.getTime(); guard++) {
    const bkk = toBkkDate(cursor);
    const rule = getRuleForDay(bkk, businessHours, holidaySet);
    if (!rule.working) {
      cursor = advanceToBusinessHours(cursor, businessHours, holidaySet);
      continue;
    }
    const windowEnd = fromBkkParts(bkk.getUTCFullYear(), bkk.getUTCMonth(), bkk.getUTCDate(), rule.endMin);
    const effectiveEnd = endDate.getTime() < windowEnd.getTime() ? endDate : windowEnd;
    if (effectiveEnd.getTime() > cursor.getTime()) {
      totalMinutes += (effectiveEnd.getTime() - cursor.getTime()) / 60000;
    }
    if (endDate.getTime() <= windowEnd.getTime()) break;
    const nextDayStart = fromBkkParts(bkk.getUTCFullYear(), bkk.getUTCMonth(), bkk.getUTCDate() + 1, 0);
    cursor = advanceToBusinessHours(nextDayStart, businessHours, holidaySet);
  }

  return Math.round(totalMinutes);
}

export interface SlaSnapshot {
  state: "ON_TRACK" | "WARNING" | "BREACHED" | "PAUSED" | "MET";
  elapsedMinutes: number;
  totalMinutes: number;
  remainingMinutes: number;
  percentUsed: number;
}

export function getSlaStatus(
  ticket: {
    status: TicketStatus;
    sla_started_at: string | Date;
    resolve_due_at: string | Date;
    resolved_at?: string | Date | null;
    sla_paused_at?: string | Date | null;
    sla_paused_minutes?: number;
    sla_breached?: boolean;
  },
  now: Date = new Date(),
  businessHours: BusinessHourRule[] = DEFAULT_BUSINESS_HOURS,
  holidays: Iterable<string> = []
): SlaSnapshot {
  const startedAt = new Date(ticket.sla_started_at);
  const dueAt = new Date(ticket.resolve_due_at);
  const totalMinutes = Math.max(1, computeBusinessMinutesBetween(startedAt, dueAt, businessHours, holidays));
  const pausedMin = Math.max(0, Number(ticket.sla_paused_minutes || 0));

  if (ticket.status === "CANCELLED") {
    return { state: "MET", elapsedMinutes: 0, totalMinutes, remainingMinutes: totalMinutes, percentUsed: 0 };
  }

  if (ticket.status === "RESOLVED" || ticket.status === "CLOSED") {
    const endAt = ticket.resolved_at ? new Date(ticket.resolved_at) : now;
    const rawElapsed = computeBusinessMinutesBetween(startedAt, endAt, businessHours, holidays);
    const elapsed = Math.max(0, rawElapsed - pausedMin);
    const breached = Boolean(ticket.sla_breached) || endAt.getTime() > dueAt.getTime();
    return {
      state: breached ? "BREACHED" : "MET",
      elapsedMinutes: elapsed,
      totalMinutes,
      remainingMinutes: Math.max(0, totalMinutes - elapsed),
      percentUsed: Math.min(100, Math.round((elapsed / totalMinutes) * 100)),
    };
  }

  if (PAUSED_STATUSES.has(ticket.status) && ticket.sla_paused_at) {
    const pausedAt = new Date(ticket.sla_paused_at);
    const rawElapsed = computeBusinessMinutesBetween(startedAt, pausedAt, businessHours, holidays);
    const elapsed = Math.max(0, rawElapsed - pausedMin);
    const remaining = Math.max(0, totalMinutes - elapsed);
    return {
      state: "PAUSED",
      elapsedMinutes: elapsed,
      totalMinutes,
      remainingMinutes: remaining,
      percentUsed: Math.min(100, Math.round((elapsed / totalMinutes) * 100)),
    };
  }

  const rawElapsed = computeBusinessMinutesBetween(startedAt, now, businessHours, holidays);
  const elapsed = Math.max(0, rawElapsed - pausedMin);
  const remaining = Math.max(0, totalMinutes - elapsed);
  const percentUsed = Math.round((elapsed / totalMinutes) * 100);
  const isBreached = Boolean(ticket.sla_breached) || now.getTime() > dueAt.getTime();

  return {
    state: isBreached ? "BREACHED" : percentUsed >= 75 ? "WARNING" : "ON_TRACK",
    elapsedMinutes: elapsed,
    totalMinutes,
    remainingMinutes: remaining,
    percentUsed: Math.min(100, percentUsed),
  };
}

export function formatBusinessDuration(minutes: number): string {
  const m = Math.max(0, Math.round(minutes));
  if (m < 60) return `${m} นาที`;
  const hours = Math.floor(m / 60);
  const remMin = m % 60;
  if (m >= 570 && m % 570 === 0) {
    const days = m / 570;
    return `${days} วันทำการ (${hours} ชม.)`;
  }
  return remMin > 0 ? `${hours} ชม. ${remMin} นาที` : `${hours} ชม.`;
}

