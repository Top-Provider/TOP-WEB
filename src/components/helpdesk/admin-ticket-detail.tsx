"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { GalleryUpload } from "@/components/ui/gallery-upload";
import { AttachmentGallery } from "@/components/helpdesk/attachment-gallery";
import { toast } from "@/components/ui/toast";
import {
  Copy,
  ExternalLink,
  Send,
  UserCheck,
  Clock,
  Lock,
  MessageSquare,
  Loader2,
} from "lucide-react";
import {
  ALLOWED_STATUS_TRANSITIONS,
  EQUIPMENT_LABELS,
  PRIORITY_LABELS,
  QUEUE_LABELS,
  SOURCE_CHANNEL_LABELS,
  STATUS_LABELS,
  type TicketPriority,
  type TicketQueue,
  type TicketStatus,
} from "@/lib/helpdesk-constants";
import type { TicketRow } from "@/lib/helpdesk-repository";
import {
  buildLineGroupSummary,
  formatThaiDateTime,
  SlaStatusBadge,
  TicketPriorityBadge,
  TicketStatusBadge,
} from "@/components/helpdesk/sla-badge";

interface DetailPayload {
  ticket: TicketRow;
  messages: Array<{
    id: number;
    sender_type: string;
    sender_name: string;
    is_internal: boolean;
    message: string;
    created_at: string;
  }>;
  attachments: Array<{
    id: number;
    stage: string;
    file_name: string;
    data_url: string;
  }>;
  events: Array<{
    id: number;
    event_type: string;
    actor: string;
    from_value: string | null;
    to_value: string | null;
    note: string | null;
    created_at: string;
  }>;
}

const PRIORITY_OPTIONS = (Object.keys(PRIORITY_LABELS) as TicketPriority[]).map((value) => ({
  value,
  label: PRIORITY_LABELS[value],
}));

const QUEUE_OPTIONS = (Object.keys(QUEUE_LABELS) as TicketQueue[]).map((value) => ({
  value,
  label: QUEUE_LABELS[value],
}));

export function AdminTicketDetail({
  ticketId,
  onUpdated,
}: {
  ticketId: number | string;
  onUpdated?: () => void;
}) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<DetailPayload | null>(null);

  const [assignedTo, setAssignedTo] = useState("");
  const [assignedPhone, setAssignedPhone] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [priority, setPriority] = useState<TicketPriority>("P3");
  const [queue, setQueue] = useState<TicketQueue>("GENERAL");

  const [messageText, setMessageText] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [uploadStage, setUploadStage] = useState<"BEFORE" | "AFTER">("AFTER");
  const [newImages, setNewImages] = useState<string[]>([]);
  const [resolutionSummary, setResolutionSummary] = useState("");
  const [rootCause, setRootCause] = useState("");
  const [partsUsed, setPartsUsed] = useState("");

  const loadDetail = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/helpdesk/tickets/${ticketId}`, { cache: "no-store" });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "ไม่พบ Ticket");
      const payload = json.data as DetailPayload;
      setData(payload);
      setAssignedTo(payload.ticket.assigned_to || "");
      setAssignedPhone(payload.ticket.assigned_phone || "");
      setScheduledAt(
        payload.ticket.scheduled_at
          ? new Date(new Date(payload.ticket.scheduled_at).getTime() + 7 * 3600_000).toISOString().slice(0, 16)
          : ""
      );
      setPriority(payload.ticket.priority);
      setQueue(payload.ticket.queue);
      setResolutionSummary(payload.ticket.resolution_summary || "");
      setRootCause(payload.ticket.root_cause || "");
      setPartsUsed(payload.ticket.parts_used || "");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "โหลดข้อมูลไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }, [ticketId]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  const patchTicket = async (payload: Record<string, unknown>, successMsg: string) => {
    if (saving) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/helpdesk/tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "บันทึกไม่สำเร็จ");
      setData(json.data);
      toast.success(successMsg);
      onUpdated?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setSaving(false);
    }
  };

  const copyLineSummary = async () => {
    if (!data) return;
    const text = buildLineGroupSummary({
      ticket_no: data.ticket.ticket_no,
      status: data.ticket.status,
      priority: data.ticket.priority,
      customer_org: data.ticket.customer_org,
      title: data.ticket.title,
      assigned_to: data.ticket.assigned_to,
      assigned_phone: data.ticket.assigned_phone,
      scheduled_at: data.ticket.scheduled_at,
      resolve_due_at: data.ticket.resolve_due_at,
      originUrl: window.location.origin,
    });
    await navigator.clipboard.writeText(text);
    toast.success("คัดลอกข้อความสรุปสำหรับส่งเข้ากลุ่ม LINE แล้ว");
  };

  if (loading) {
    return (
      <div className="py-16 text-center text-slate-500">
        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
        กำลังโหลดรายละเอียด Ticket...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="py-12 text-center text-slate-500">ไม่พบข้อมูลใบแจ้งซ่อมนี้</div>
    );
  }

  const { ticket } = data;
  const nextStatuses = ALLOWED_STATUS_TRANSITIONS[ticket.status] || [];
  const slaPercent = ticket.sla?.percentUsed ?? 0;

  return (
    <div className="space-y-5">
      {/* Header Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xl font-bold text-slate-900">{ticket.ticket_no}</span>
            {ticket.request_group_no && (
              <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-semibold">
                {ticket.request_group_no}
              </span>
            )}
          </div>
          <div className="text-xs text-slate-500 mt-0.5">
            แจ้งเมื่อ {formatThaiDateTime(ticket.created_at)} · ช่องทาง {SOURCE_CHANNEL_LABELS[ticket.source_channel]}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={copyLineSummary} className="gap-1.5">
            <Copy className="w-4 h-4" />
            คัดลอกสรุปส่งกลุ่ม LINE
          </Button>
          <Link href={`/helpdesk/ticket/${ticket.ticket_no}`} target="_blank">
            <Button type="button" variant="outline" size="sm" className="gap-1.5">
              หน้าลูกค้า
              <ExternalLink className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* SLA Progress Bar */}
      <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 sm:p-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <TicketStatusBadge status={ticket.status} />
            <TicketPriorityBadge priority={ticket.priority} />
            <SlaStatusBadge sla={ticket.sla} />
          </div>
          <div className="text-xs text-slate-600 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            กำหนดแก้ไขเสร็จ: <strong>{formatThaiDateTime(ticket.resolve_due_at)}</strong>
          </div>
        </div>
        <div className="w-full h-2.5 rounded-full bg-slate-200 overflow-hidden">
          <div
            className={`h-full transition-all ${ticket.sla?.state === "BREACHED"
                ? "bg-rose-600"
                : ticket.sla?.state === "WARNING"
                  ? "bg-amber-500"
                  : ticket.sla?.state === "PAUSED"
                    ? "bg-purple-500"
                    : "bg-blue-600"
              }`}
            style={{ width: `${Math.min(100, Math.max(4, slaPercent))}%` }}
          />
        </div>
        <div className="flex flex-wrap gap-2 pt-1">
          {nextStatuses.filter((next) => next !== "RESOLVED").map((next) => (
            <Button
              key={next}
              type="button"
              size="sm"
              disabled={saving}
              onClick={() => {
                const needsReason = ["PENDING_CUSTOMER", "PENDING_PARTS", "CANCELLED"].includes(next);
                const note = needsReason ? window.prompt("กรุณาระบุเหตุผลในการเปลี่ยนสถานะ")?.trim() : undefined;
                if (needsReason && !note) return;
                void patchTicket({ status: next, note }, `เปลี่ยนสถานะเป็น ${STATUS_LABELS[next]} แล้ว`);
              }}
              className={
                next === "CANCELLED"
                  ? "bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }
            >
              เปลี่ยนเป็น: {STATUS_LABELS[next]}
            </Button>
          ))}
        </div>
        {nextStatuses.includes("RESOLVED") && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 space-y-3">
            <div className="text-sm font-bold text-emerald-950">บันทึกผลการซ่อมก่อนส่งให้ลูกค้าตรวจรับ</div>
            <Textarea
              value={resolutionSummary}
              onChange={(e) => setResolutionSummary(e.target.value)}
              placeholder="สรุปวิธีแก้ไข *"
              className="min-h-20 border-emerald-200 bg-white p-3"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Textarea
                value={rootCause}
                onChange={(e) => setRootCause(e.target.value)}
                placeholder="สาเหตุของปัญหา"
                className="min-h-16 border-emerald-200 bg-white p-3"
              />
              <Textarea
                value={partsUsed}
                onChange={(e) => setPartsUsed(e.target.value)}
                placeholder="อะไหล่/อุปกรณ์ที่เปลี่ยน (ถ้ามี)"
                className="min-h-16 border-emerald-200 bg-white p-3"
              />
            </div>
            <Button
              type="button"
              disabled={saving || !resolutionSummary.trim()}
              onClick={() => patchTicket({
                status: "RESOLVED",
                resolution_summary: resolutionSummary.trim(),
                root_cause: rootCause.trim() || undefined,
                parts_used: partsUsed.trim() || undefined,
              }, "บันทึกผลการซ่อมและส่งให้ลูกค้าตรวจรับแล้ว")}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              ซ่อมเสร็จและส่งให้ลูกค้าตรวจรับ
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left 2 Columns */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
            <h2 className="text-lg font-bold text-slate-900">{ticket.title}</h2>
            {ticket.description && (
              <p className="text-sm text-slate-700 whitespace-pre-line bg-slate-50 rounded-xl p-3.5 border border-slate-100">
                {ticket.description}
              </p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm pt-2">
              <div>
                <span className="text-xs text-slate-500 block">หน่วยงาน / แผนก</span>
                <span className="font-semibold text-slate-900">
                  {ticket.customer_org} {ticket.customer_dept ? `(${ticket.customer_dept})` : ""}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">ผู้ติดต่อ / กลุ่ม LINE</span>
                <span className="font-semibold text-slate-900">
                  {ticket.contact_name} · {ticket.contact_phone}
                  {ticket.contact_line ? ` · LINE: ${ticket.contact_line}` : ""}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">อุปกรณ์</span>
                <span className="font-semibold text-slate-900">
                  {EQUIPMENT_LABELS[ticket.equipment_type]}{" "}
                  {[ticket.equipment_brand, ticket.equipment_model].filter(Boolean).join(" ")}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Serial Number</span>
                <span className="font-semibold text-slate-900">{ticket.serial_number || "-"}</span>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
            <h3 className="text-base font-bold text-slate-900">การสื่อสาร &amp; โน้ตภายใน</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {data.messages.length === 0 ? (
                <p className="text-sm text-slate-400">ยังไม่มีข้อความ</p>
              ) : (
                data.messages.map((m) => (
                  <div
                    key={m.id}
                    className={`p-3 rounded-xl text-sm border ${m.is_internal
                        ? "bg-amber-50 border-amber-200"
                        : m.sender_type === "CUSTOMER"
                          ? "bg-blue-50 border-blue-100"
                          : "bg-slate-50 border-slate-200"
                      }`}
                  >
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                      <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                        {m.is_internal && <Lock className="w-3 h-3 text-amber-600" />}
                        {m.sender_name} {m.is_internal ? "(โน้ตภายในทีม)" : ""}
                      </span>
                      <span>{formatThaiDateTime(m.created_at)}</span>
                    </div>
                    <p className="text-slate-800 whitespace-pre-line">{m.message}</p>
                  </div>
                ))
              )}
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setIsInternal(false)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border ${!isInternal
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-slate-600 border-slate-200"
                    }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  ตอบกลับลูกค้า (เห็นในหน้าติดตาม)
                </button>
                <button
                  type="button"
                  onClick={() => setIsInternal(true)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border ${isInternal
                      ? "bg-amber-600 text-white border-amber-600"
                      : "bg-white text-slate-600 border-slate-200"
                    }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  โน้ตภายในทีม (ลูกค้าไม่เห็น)
                </button>
              </div>
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder={isInternal ? "บันทึกโน้ตภายในสำหรับทีม..." : "พิมพ์ข้อความตอบกลับลูกค้า..."}
                  className="flex-1"
                />
                <Button
                  type="button"
                  disabled={saving || !messageText.trim()}
                  onClick={async () => {
                    await patchTicket(
                      { message: messageText.trim(), is_internal: isInternal },
                      isInternal ? "บันทึกโน้ตภายในแล้ว" : "ส่งข้อความแล้ว"
                    );
                    setMessageText("");
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5"
                >
                  <Send className="w-4 h-4" />
                  ส่ง
                </Button>
              </div>
            </div>
          </div>

          {/* Attachments */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
            <h3 className="text-base font-bold text-slate-900">รูปภาพอาการ / ก่อน-หลังซ่อม</h3>
            <AttachmentGallery attachments={data.attachments} />
            <div className="pt-2 border-t border-slate-100 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-600">ประเภทรูปที่อัปโหลด:</span>
                <button
                  type="button"
                  onClick={() => setUploadStage("BEFORE")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${uploadStage === "BEFORE" ? "bg-slate-900 text-white" : "bg-white text-slate-600"
                    }`}
                >
                  ก่อนซ่อม (BEFORE)
                </button>
                <button
                  type="button"
                  onClick={() => setUploadStage("AFTER")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${uploadStage === "AFTER" ? "bg-slate-900 text-white" : "bg-white text-slate-600"
                    }`}
                >
                  หลังซ่อม (AFTER)
                </button>
              </div>
              <GalleryUpload
                images={newImages}
                onChange={setNewImages}
                maxFiles={5}
                label="อัปโหลดรูปภาพเพิ่มเติม"
                description="เลือกหรือลากรูปก่อนซ่อม / หลังซ่อม"
              />
              {newImages.length > 0 && (
                <Button
                  type="button"
                  disabled={saving}
                  onClick={async () => {
                    await patchTicket(
                      {
                        attachments: newImages.map((data_url, idx) => ({
                          stage: uploadStage,
                          file_name: `${uploadStage.toLowerCase()}-${idx + 1}.webp`,
                          data_url,
                        })),
                      },
                      "อัปโหลดรูปภาพเรียบร้อยแล้ว"
                    );
                    setNewImages([]);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  บันทึกรูปภาพ ({newImages.length} รูป)
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Assignment, SLA Controls & Events */}
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-blue-600" />
              การมอบหมายและระดับ SLA
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">คิวงาน</label>
                <Select
                  value={queue}
                  onChange={(val) => setQueue(val as TicketQueue)}
                  options={QUEUE_OPTIONS}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">ความเร่งด่วน (Priority)</label>
                <Select
                  value={priority}
                  onChange={(val) => setPriority(val as TicketPriority)}
                  options={PRIORITY_OPTIONS}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">ชื่อช่างผู้รับผิดชอบ</label>
                <Input
                  type="text"
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">เบอร์ติดต่อช่าง</label>
                <Input
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  minLength={6}
                  maxLength={15}
                  value={assignedPhone}
                  onChange={(e) => setAssignedPhone(e.target.value.replace(/\D/g, ""))}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">วันเวลานัดเข้าหน้างาน</label>
                <DateTimePicker
                  value={scheduledAt}
                  onChange={setScheduledAt}
                  placeholder="วว/ดด/ปปปป --:--"
                />
              </div>
              <Button
                type="button"
                disabled={saving}
                onClick={() =>
                  patchTicket(
                    {
                      queue,
                      priority,
                      assigned_to: assignedTo || null,
                      assigned_phone: assignedPhone || null,
                      scheduled_at: scheduledAt ? new Date(`${scheduledAt}:00+07:00`).toISOString() : null,
                    },
                    "บันทึกข้อมูลการมอบหมายแล้ว"
                  )
                }
                className="w-full bg-slate-900 hover:bg-slate-800 text-white"
              >
                บันทึกการมอบหมาย / SLA
              </Button>
              {ticket.onsite_due_at && !ticket.onsite_arrived_at && (
                <Button
                  type="button"
                  variant="outline"
                  disabled={saving}
                  onClick={() => patchTicket({ mark_onsite_arrived: true }, "บันทึกเวลาถึงหน้างานแล้ว")}
                  className="w-full border-blue-200 text-blue-700"
                >
                  บันทึกว่าช่างถึงหน้างานแล้ว
                </Button>
              )}
              {ticket.onsite_arrived_at && (
                <p className="text-xs text-emerald-700 text-center">
                  ถึงหน้างานเมื่อ {formatThaiDateTime(ticket.onsite_arrived_at)}
                </p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
            <h3 className="text-base font-bold text-slate-900">ประวัติ Ticket</h3>
            <div className="space-y-3 max-h-72 overflow-y-auto">
              {data.events.map((ev) => (
                <div key={ev.id} className="border-l-2 border-slate-200 pl-3 text-xs space-y-0.5">
                  <div className="text-slate-400">{formatThaiDateTime(ev.created_at)}</div>
                  <div className="font-semibold text-slate-800">
                    {ev.event_type} {ev.to_value ? `-> ${ev.to_value}` : ""}
                  </div>
                  {ev.note && <div className="text-slate-600">{ev.note}</div>}
                  <div className="text-slate-500">โดย: {ev.actor}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
