"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToastContainer, toast } from "@/components/ui/toast";
import {
  Clock,
  Send,
  Star,
  RotateCcw,
  CheckCircle2,
  UserCheck,
  Loader2,
  Plus,
} from "lucide-react";
import {
  EQUIPMENT_LABELS,
  STATUS_LABELS,
  type TicketStatus,
} from "@/lib/helpdesk-constants";
import type { TicketRow } from "@/lib/helpdesk-repository";
import {
  formatThaiDateTime,
  SlaStatusBadge,
  TicketPriorityBadge,
  TicketStatusBadge,
} from "@/components/helpdesk/sla-badge";
import { AttachmentGallery } from "@/components/helpdesk/attachment-gallery";

interface TicketMessage {
  id: number;
  sender_type: string;
  sender_name: string;
  message: string;
  created_at: string;
}

interface TicketAttachment {
  id: number;
  stage: string;
  file_name: string;
  data_url: string;
}

interface TicketEvent {
  id: number;
  event_type: string;
  actor: string;
  from_value: string | null;
  to_value: string | null;
  note: string | null;
  created_at: string;
}

const PROGRESS_STEPS: Array<{ key: TicketStatus; label: string }> = [
  { key: "NEW", label: "แจ้งซ่อม" },
  { key: "OPEN", label: "รับเรื่อง" },
  { key: "ASSIGNED", label: "มอบหมายช่าง" },
  { key: "IN_PROGRESS", label: "กำลังซ่อม" },
  { key: "RESOLVED", label: "ซ่อมเสร็จ" },
  { key: "CLOSED", label: "ปิดงาน" },
];

export default function HelpdeskTrackPage() {
  const router = useRouter();
  const params = useParams<{ no: string }>();
  const ticketNo = params.no;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<{
    ticket: TicketRow;
    messages: TicketMessage[];
    attachments: TicketAttachment[];
    events: TicketEvent[];
  } | null>(null);

  const [replyText, setReplyText] = useState("");
  const [csatScore, setCsatScore] = useState<number>(5);
  const [csatComment, setCsatComment] = useState("");
  const [reopenReason, setReopenReason] = useState("");
  const [showReopen, setShowReopen] = useState(false);
  const [busy, setBusy] = useState(false);

  const loadTicket = useCallback(async () => {
    try {
      const res = await fetch(`/api/helpdesk/track/${encodeURIComponent(ticketNo)}`, {
        cache: "no-store",
      });
      if (res.status === 401) {
        const next = `/helpdesk/ticket/${encodeURIComponent(ticketNo)}`;
        router.replace(`/helpdesk/login?next=${encodeURIComponent(next)}`);
        return;
      }
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "ไม่พบเลขที่ใบแจ้งซ่อมนี้");
      }
      setData(json.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "ไม่สามารถโหลดข้อมูลได้");
    } finally {
      setLoading(false);
    }
  }, [router, ticketNo]);

  useEffect(() => {
    loadTicket();
    const timer = window.setInterval(loadTicket, 30_000);
    return () => window.clearInterval(timer);
  }, [loadTicket]);

  const sendAction = async (payload: Record<string, unknown>, successMsg: string) => {
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/helpdesk/track/${encodeURIComponent(ticketNo)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.status === 401) {
        const next = `/helpdesk/ticket/${encodeURIComponent(ticketNo)}`;
        router.replace(`/helpdesk/login?next=${encodeURIComponent(next)}`);
        return;
      }
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "ดำเนินการไม่สำเร็จ");
      setData(json.data);
      toast.success(successMsg);
      setReplyText("");
      setReopenReason("");
      setShowReopen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[radial-gradient(circle_at_15%_10%,rgba(219,234,254,0.8),transparent_35%),radial-gradient(circle_at_85%_20%,rgba(224,242,254,0.7),transparent_30%),#f7faff]">
      <Navbar />
      <main className="flex-1 pt-8 sm:pt-12 pb-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-4 flex items-center justify-between gap-2 flex-wrap">
            <Link href="/helpdesk/tickets">
              <Button type="button" variant="outline" size="sm" className="gap-1.5 bg-white">
                ดูรายการแจ้งซ่อมทั้งหมด
              </Button>
            </Link>
            <Link href="/helpdesk/new">
              <Button type="button" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5">
                <Plus className="w-4 h-4" />
                แจ้งซ่อมใหม่
              </Button>
            </Link>
          </div>
          {loading ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-slate-500">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
              กำลังโหลดข้อมูลใบแจ้งซ่อม...
            </div>
          ) : error || !data ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-4">
              <p className="text-lg font-bold text-slate-900">{error || "ไม่พบข้อมูล"}</p>
              <Link href="/helpdesk/new">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                  <Plus className="w-4 h-4" />
                  แจ้งซ่อมใหม่
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Header card */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-7">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div>
                    <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                      ใบแจ้งซ่อมอุปกรณ์
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 mt-0.5">{data.ticket.ticket_no}</h1>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <TicketStatusBadge status={data.ticket.status} />
                    <TicketPriorityBadge priority={data.ticket.priority} />
                    <SlaStatusBadge sla={data.ticket.sla} />
                  </div>
                </div>

                <div className="mt-4">
                  <h2 className="text-lg font-bold text-slate-900">{data.ticket.title}</h2>
                  {data.ticket.description && (
                    <p className="text-sm text-slate-600 mt-1 whitespace-pre-line">{data.ticket.description}</p>
                  )}
                </div>

                {/* Progress Steps */}
                {data.ticket.status !== "CANCELLED" && (
                  <div className="mt-6 grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {PROGRESS_STEPS.map((st, idx) => {
                      const currentIdx = PROGRESS_STEPS.findIndex((s) => s.key === data.ticket.status);
                      const effectiveIdx =
                        data.ticket.status === "PENDING_CUSTOMER" || data.ticket.status === "PENDING_PARTS"
                          ? 3
                          : currentIdx;
                      const done = idx <= effectiveIdx;
                      return (
                        <div
                          key={st.key}
                          className={`rounded-xl px-2.5 py-2 text-center text-xs font-semibold border ${
                            done
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : "bg-slate-50 text-slate-400 border-slate-200"
                          }`}
                        >
                          {st.label}
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <div>
                    <div className="text-xs text-slate-500">หน่วยงาน / แผนก</div>
                    <div className="font-semibold text-slate-900 mt-0.5">
                      {data.ticket.customer_org}
                      {data.ticket.customer_dept ? ` (${data.ticket.customer_dept})` : ""}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">อุปกรณ์</div>
                    <div className="font-semibold text-slate-900 mt-0.5">
                      {EQUIPMENT_LABELS[data.ticket.equipment_type]}
                      {data.ticket.equipment_brand || data.ticket.equipment_model
                        ? ` · ${[data.ticket.equipment_brand, data.ticket.equipment_model].filter(Boolean).join(" ")}`
                        : ""}
                    </div>
                    {data.ticket.serial_number && (
                      <div className="text-xs text-slate-500">S/N: {data.ticket.serial_number}</div>
                    )}
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">ช่างผู้รับผิดชอบ</div>
                    <div className="font-semibold text-slate-900 mt-0.5 flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-slate-500" />
                      {data.ticket.assigned_to ||
                        (["RESOLVED", "CLOSED", "CANCELLED"].includes(data.ticket.status)
                          ? "ดำเนินการโดยทีมงาน"
                          : "รอการมอบหมาย")}
                      {data.ticket.assigned_phone ? ` (${data.ticket.assigned_phone})` : ""}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">นัดเข้าหน้างาน</div>
                    <div className="font-semibold text-slate-900 mt-0.5">
                      {formatThaiDateTime(data.ticket.scheduled_at)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">กำหนดแก้ไขเสร็จ (SLA)</div>
                    <div className="font-semibold text-slate-900 mt-0.5 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-blue-600" />
                      {formatThaiDateTime(data.ticket.resolve_due_at)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer Confirmation & CSAT when RESOLVED */}
              {data.ticket.status === "RESOLVED" && (
                <div className="bg-emerald-50/70 rounded-2xl border border-emerald-200 p-5 sm:p-6 space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        ช่างดำเนินการแก้ไขเรียบร้อยแล้ว กรุณาตรวจสอบและยืนยันปิดงาน
                      </h3>
                      <p className="text-xs text-slate-600 mt-0.5">
                        หากยังไม่สามารถใช้งานได้ตามปกติ สามารถกดแจ้งเปิดงานซ้ำได้ทันที
                      </p>
                    </div>
                  </div>

                  {data.ticket.resolution_summary && (
                    <div className="rounded-xl border border-emerald-200 bg-white p-4 text-sm space-y-2">
                      <div>
                        <span className="text-xs font-semibold text-slate-500 block">สรุปการแก้ไข</span>
                        <p className="text-slate-900 whitespace-pre-line">{data.ticket.resolution_summary}</p>
                      </div>
                      {data.ticket.root_cause && (
                        <div>
                          <span className="text-xs font-semibold text-slate-500 block">สาเหตุ</span>
                          <p className="text-slate-700 whitespace-pre-line">{data.ticket.root_cause}</p>
                        </div>
                      )}
                      {data.ticket.parts_used && (
                        <div>
                          <span className="text-xs font-semibold text-slate-500 block">อะไหล่/อุปกรณ์ที่เปลี่ยน</span>
                          <p className="text-slate-700 whitespace-pre-line">{data.ticket.parts_used}</p>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="bg-white rounded-xl p-4 border border-emerald-200 space-y-3">
                    <div className="text-sm font-semibold text-slate-800">ให้คะแนนความพึงพอใจ</div>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((score) => (
                        <button
                          key={score}
                          type="button"
                          onClick={() => setCsatScore(score)}
                          className={`p-2 rounded-lg border transition ${
                            csatScore >= score
                              ? "bg-amber-50 border-amber-300 text-amber-500"
                              : "bg-slate-50 border-slate-200 text-slate-300"
                          }`}
                        >
                          <Star className="w-5 h-5 fill-current" />
                        </button>
                      ))}
                      <span className="text-sm font-medium text-slate-600 ml-2">{csatScore} / 5</span>
                    </div>
                    <Input
                      type="text"
                      value={csatComment}
                      onChange={(e) => setCsatComment(e.target.value)}
                      placeholder="ข้อเสนอแนะเพิ่มเติม (ไม่บังคับ)"
                      className="rounded-lg"
                    />
                    <div className="flex flex-wrap gap-3 pt-1">
                      <Button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          sendAction(
                            {
                              action: "confirm_close",
                              csat_score: csatScore,
                              csat_comment: csatComment || undefined,
                            },
                            "ยืนยันปิดงานเรียบร้อยแล้ว ขอบคุณครับ"
                          )
                        }
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        ยืนยันปิดงาน
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowReopen((prev) => !prev)}
                        className="gap-1.5 text-rose-700 border-rose-200 hover:bg-rose-50"
                      >
                        <RotateCcw className="w-4 h-4" />
                        ยังไม่หาย / เปิดงานซ้ำ
                      </Button>
                    </div>

                    {showReopen && (
                      <div className="pt-3 border-t border-slate-100 space-y-2">
                        <Input
                          type="text"
                          value={reopenReason}
                          onChange={(e) => setReopenReason(e.target.value)}
                          placeholder="ระบุอาการที่ยังพบปัญหา..."
                          className="rounded-lg"
                        />
                        <Button
                          type="button"
                          disabled={busy || !reopenReason.trim()}
                          onClick={() =>
                            sendAction({ action: "reopen", reason: reopenReason.trim() }, "ส่งคำขอเปิดงานซ้ำแล้ว")
                          }
                          className="bg-rose-600 hover:bg-rose-700 text-white"
                        >
                          ส่งเรื่องให้ช่างแก้ไขต่อ
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Attachments */}
              {data.attachments.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">
                  <h3 className="text-base font-bold text-slate-900 mb-3">รูปภาพประกอบ</h3>
                  <AttachmentGallery attachments={data.attachments} />
                </div>
              )}

              {/* Messages & Timeline */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 flex flex-col">
                  <h3 className="text-base font-bold text-slate-900 mb-3">ข้อความสื่อสาร</h3>
                  <div className="flex-1 space-y-3 max-h-80 overflow-y-auto mb-4">
                    {data.messages.length === 0 ? (
                      <p className="text-sm text-slate-400">ยังไม่มีข้อความโต้ตอบ</p>
                    ) : (
                      data.messages.map((m) => (
                        <div
                          key={m.id}
                          className={`p-3 rounded-xl text-sm ${
                            m.sender_type === "CUSTOMER"
                              ? "bg-blue-50 border border-blue-100 ml-4"
                              : "bg-slate-50 border border-slate-200 mr-4"
                          }`}
                        >
                          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                            <span className="font-semibold text-slate-700">{m.sender_name}</span>
                            <span>{formatThaiDateTime(m.created_at)}</span>
                          </div>
                          <p className="text-slate-800 whitespace-pre-line">{m.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                  {data.ticket.status !== "CLOSED" && data.ticket.status !== "CANCELLED" && (
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="พิมพ์ข้อความถึงทีมช่าง..."
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        disabled={busy || !replyText.trim()}
                        onClick={() =>
                          sendAction({ action: "reply", message: replyText.trim() }, "ส่งข้อความแล้ว")
                        }
                        className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5"
                      >
                        <Send className="w-4 h-4" />
                        ส่ง
                      </Button>
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">
                  <h3 className="text-base font-bold text-slate-900 mb-3">ประวัติการดำเนินการ</h3>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {data.events.map((ev) => (
                      <div key={ev.id} className="border-l-2 border-blue-200 pl-3 py-0.5 text-sm">
                        <div className="text-xs text-slate-400">{formatThaiDateTime(ev.created_at)}</div>
                        <div className="font-semibold text-slate-800">
                          {ev.event_type === "STATUS_CHANGED" && ev.to_value
                            ? `เปลี่ยนสถานะเป็น ${STATUS_LABELS[ev.to_value as TicketStatus] || ev.to_value}`
                            : ev.note || ev.event_type}
                        </div>
                        {ev.note && ev.event_type === "STATUS_CHANGED" && (
                          <div className="text-xs text-slate-600">{ev.note}</div>
                        )}
                        <div className="text-xs text-slate-500">โดย: {ev.actor}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
      <ToastContainer />
    </div>
  );
}

