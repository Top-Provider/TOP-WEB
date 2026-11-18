"use client";

import React from "react";
import { Clock, AlertTriangle, CheckCircle2, PauseCircle, XCircle } from "lucide-react";
import { cn } from "cn";
import { formatBusinessDuration, type SlaSnapshot } from "@/lib/helpdesk-sla";
import {
  PRIORITY_BADGE_CLASSES,
  PRIORITY_LABELS,
  STATUS_BADGE_CLASSES,
  STATUS_LABELS,
  type TicketPriority,
  type TicketStatus,
} from "@/lib/helpdesk-constants";

export function TicketStatusBadge({ status }: { status: TicketStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border whitespace-nowrap",
        STATUS_BADGE_CLASSES[status] || "bg-slate-100 text-slate-700 border-slate-200"
      )}
    >
      {STATUS_LABELS[status] || status}
    </span>
  );
}

export function TicketPriorityBadge({ priority }: { priority: TicketPriority }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border whitespace-nowrap",
        PRIORITY_BADGE_CLASSES[priority] || "bg-slate-100 text-slate-700 border-slate-200"
      )}
    >
      {PRIORITY_LABELS[priority] || priority}
    </span>
  );
}

export function SlaStatusBadge({ sla }: { sla?: SlaSnapshot }) {
  if (!sla) return null;

  if (sla.state === "BREACHED") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 whitespace-nowrap">
        <XCircle className="w-3.5 h-3.5" />
        เกิน SLA
      </span>
    );
  }
  if (sla.state === "WARNING") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-300 whitespace-nowrap">
        <AlertTriangle className="w-3.5 h-3.5" />
        ใกล้เกิน SLA (เหลือ {formatBusinessDuration(sla.remainingMinutes)})
      </span>
    );
  }
  if (sla.state === "PAUSED") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200 whitespace-nowrap">
        <PauseCircle className="w-3.5 h-3.5" />
        หยุดนับชั่วคราว
      </span>
    );
  }
  if (sla.state === "MET") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">
        <CheckCircle2 className="w-3.5 h-3.5" />
        ตาม SLA
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200 whitespace-nowrap">
      <Clock className="w-3.5 h-3.5" />
      เหลือ {formatBusinessDuration(sla.remainingMinutes)}
    </span>
  );
}

export function formatThaiDateTime(iso: string | null | undefined): string {
  if (!iso) return "-";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("th-TH", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function buildLineGroupSummary(params: {
  ticket_no: string;
  status: TicketStatus;
  priority: TicketPriority;
  customer_org: string;
  title: string;
  assigned_to?: string | null;
  assigned_phone?: string | null;
  scheduled_at?: string | null;
  resolve_due_at: string;
  originUrl: string;
}): string {
  const lines = [
    `[TOP PROVIDER Helpdesk] ${params.ticket_no}`,
    `สถานะ: ${STATUS_LABELS[params.status]} (${params.priority})`,
    `หน่วยงาน: ${params.customer_org}`,
    `อาการ: ${params.title}`,
  ];
  if (params.assigned_to) {
    lines.push(
      `ช่างผู้รับผิดชอบ: ${params.assigned_to}${params.assigned_phone ? ` (${params.assigned_phone})` : ""}`
    );
  }
  if (params.scheduled_at) {
    lines.push(`นัดเข้าหน้างาน: ${formatThaiDateTime(params.scheduled_at)}`);
  }
  lines.push(`กำหนดเสร็จ (SLA): ${formatThaiDateTime(params.resolve_due_at)}`);
  lines.push(`ติดตามงาน: ${params.originUrl}/helpdesk/ticket/${params.ticket_no}`);
  return lines.join("\n");
}

