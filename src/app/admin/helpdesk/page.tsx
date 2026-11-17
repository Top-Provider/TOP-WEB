"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { HospitalCombobox } from "@/components/helpdesk/hospital-combobox";
import { AdminTicketDetail } from "@/components/helpdesk/admin-ticket-detail";
import { toast } from "@/components/ui/toast";
import {
  Plus,
  Search,
  RefreshCw,
  Clock,
  AlertTriangle,
  XCircle,
  Inbox,
  Printer,
  Copy,
  ExternalLink,
  Loader2,
} from "lucide-react";
import {
  EQUIPMENT_LABELS,
  IMPACT_LABELS,
  QUEUE_LABELS,
  SOURCE_CHANNEL_LABELS,
  URGENCY_LABELS,
  type EquipmentType,
  type SourceChannel,
  type TicketImpact,
  type TicketUrgency,
} from "@/lib/helpdesk-constants";
import type { TicketRow } from "@/lib/helpdesk-repository";
import {
  buildLineGroupSummary,
  formatThaiDateTime,
  SlaStatusBadge,
  TicketPriorityBadge,
  TicketStatusBadge,
} from "@/components/helpdesk/sla-badge";

type QuickFilter = "ACTIVE" | "ALL" | "NEW" | "PRINTER" | "GENERAL" | "WARNING" | "BREACHED";

const EQUIPMENT_OPTIONS = (Object.keys(EQUIPMENT_LABELS) as EquipmentType[]).map((value) => ({
  value,
  label: EQUIPMENT_LABELS[value],
}));

const SOURCE_OPTIONS = (Object.keys(SOURCE_CHANNEL_LABELS) as SourceChannel[]).map((value) => ({
  value,
  label: SOURCE_CHANNEL_LABELS[value],
}));

const IMPACT_OPTIONS = (Object.keys(IMPACT_LABELS) as TicketImpact[]).map((value) => ({
  value,
  label: IMPACT_LABELS[value],
}));

const URGENCY_OPTIONS = (Object.keys(URGENCY_LABELS) as TicketUrgency[]).map((value) => ({
  value,
  label: URGENCY_LABELS[value],
}));

export default function AdminHelpdeskPage() {
  const [tickets, setTickets] = useState<TicketRow[]>([]);
  const [hospitals, setHospitals] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<QuickFilter>("ACTIVE");
  const [search, setSearch] = useState("");
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createdTicket, setCreatedTicket] = useState<TicketRow | null>(null);

  const [form, setForm] = useState({
    source_channel: "LINE_GROUP" as SourceChannel,
    customer_org: "",
    customer_dept: "",
    contact_name: "",
    contact_phone: "",
    contact_line: "",
    equipment_type: "PRINTER" as EquipmentType,
    equipment_brand: "",
    equipment_model: "",
    serial_number: "",
    title: "",
    description: "",
    impact: "USER" as TicketImpact,
    urgency: "HIGH" as TicketUrgency,
    is_patient_care_critical: false,
  });

  const loadTickets = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [res, hospRes] = await Promise.all([
        fetch("/api/helpdesk/tickets", { cache: "no-store" }),
        fetch("/api/helpdesk/hospitals", { cache: "no-store" }),
      ]);
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "โหลดคิวงานไม่สำเร็จ");
      setTickets(json.data || []);
      if (hospRes.ok) {
        const hospJson = await hospRes.json();
        if (hospJson.success && Array.isArray(hospJson.data)) {
          setHospitals(hospJson.data.map((h: { name: string }) => h.name));
        }
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTickets();
    const timer = window.setInterval(() => void loadTickets(true), 30_000);
    return () => window.clearInterval(timer);
  }, [loadTickets]);

  const counts = useMemo(() => {
    const active = tickets.filter((t) => !["CLOSED", "CANCELLED"].includes(t.status));
    return {
      newCount: tickets.filter((t) => t.status === "NEW").length,
      activeCount: active.length,
      warningCount: active.filter((t) => t.sla?.state === "WARNING").length,
      breachedCount: active.filter((t) => t.sla?.state === "BREACHED").length,
      printerCount: active.filter((t) => t.queue === "PRINTER").length,
    };
  }, [tickets]);

  const filteredTickets = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tickets.filter((t) => {
      if (filter === "ACTIVE" && ["CLOSED", "CANCELLED"].includes(t.status)) return false;
      if (filter === "NEW" && t.status !== "NEW") return false;
      if (filter === "PRINTER" && (t.queue !== "PRINTER" || ["CLOSED", "CANCELLED"].includes(t.status))) return false;
      if (filter === "GENERAL" && (t.queue !== "GENERAL" || ["CLOSED", "CANCELLED"].includes(t.status))) return false;
      if (filter === "WARNING" && t.sla?.state !== "WARNING") return false;
      if (filter === "BREACHED" && t.sla?.state !== "BREACHED") return false;

      if (!q) return true;
      return (
        t.ticket_no.toLowerCase().includes(q) ||
        t.customer_org.toLowerCase().includes(q) ||
        t.contact_name.toLowerCase().includes(q) ||
        t.title.toLowerCase().includes(q) ||
        (t.serial_number || "").toLowerCase().includes(q) ||
        (t.contact_line || "").toLowerCase().includes(q)
      );
    });
  }, [tickets, filter, search]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (creating) return;
    setCreating(true);
    try {
      const res = await fetch("/api/helpdesk/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          customer_dept: form.customer_dept || null,
          contact_line: form.contact_line || null,
          equipment_brand: form.equipment_brand || null,
          equipment_model: form.equipment_model || null,
          serial_number: form.serial_number || null,
          description: form.description || null,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "สร้าง Ticket ไม่สำเร็จ");
      setCreatedTicket(json.data);
      toast.success(`สร้าง ${json.data.ticket_no} เรียบร้อยแล้ว`);
      await loadTickets();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setCreating(false);
    }
  };

  const resetCreateModal = () => {
    setCreatedTicket(null);
    setCreateOpen(false);
    setForm({
      source_channel: "LINE_GROUP",
      customer_org: "",
      customer_dept: "",
      contact_name: "",
      contact_phone: "",
      contact_line: "",
      equipment_type: "PRINTER",
      equipment_brand: "",
      equipment_model: "",
      serial_number: "",
      title: "",
      description: "",
      impact: "USER",
      urgency: "HIGH",
      is_patient_care_critical: false,
    });
  };

  const copyCreatedSummary = async () => {
    if (!createdTicket) return;
    const text = buildLineGroupSummary({
      ticket_no: createdTicket.ticket_no,
      status: createdTicket.status,
      priority: createdTicket.priority,
      customer_org: createdTicket.customer_org,
      title: createdTicket.title,
      resolve_due_at: createdTicket.resolve_due_at,
      originUrl: window.location.origin,
    });
    await navigator.clipboard.writeText(text);
    toast.success("คัดลอกข้อความส่งเข้ากลุ่ม LINE แล้ว");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">คิวงานแจ้งซ่อม (Helpdesk & SLA)</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            เวลาทำการ จ-ศ 08:30-18:00 น. · แยกคิวทีม Printer และทีม General อัตโนมัติ
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" onClick={() => loadTickets()} className="gap-2">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            รีเฟรช
          </Button>
          <Button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
          >
            <Plus className="w-4 h-4" />
            สร้าง Ticket แทนลูกค้า
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            งานใหม่รอรับเรื่อง
            <Inbox className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{counts.newCount}</div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            งานค้างทั้งหมด (คิว Printer {counts.printerCount})
            <Printer className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{counts.activeCount}</div>
        </div>
        <div className="bg-white rounded-2xl border border-amber-200 bg-amber-50/40 p-4">
          <div className="flex items-center justify-between text-xs font-semibold text-amber-700">
            ใกล้เกิน SLA (&gt;= 75%)
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-800 mt-1">{counts.warningCount}</div>
        </div>
        <div className="bg-white rounded-2xl border border-rose-200 bg-rose-50/40 p-4">
          <div className="flex items-center justify-between text-xs font-semibold text-rose-700">
            เกิน SLA แล้ว
            <XCircle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold text-rose-800 mt-1">{counts.breachedCount}</div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
        <div className="flex flex-col md:flex-row gap-3 justify-between">
          <div className="flex flex-wrap gap-1.5">
            {(
              [
                { key: "ACTIVE", label: "งานที่ยังไม่ปิด" },
                { key: "NEW", label: "งานใหม่" },
                { key: "PRINTER", label: "ทีม Printer" },
                { key: "GENERAL", label: "ทีม General" },
                { key: "WARNING", label: "ใกล้เกิน SLA" },
                { key: "BREACHED", label: "เกิน SLA" },
                { key: "ALL", label: "ทั้งหมด" },
              ] as Array<{ key: QuickFilter; label: string }>
            ).map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setFilter(item.key)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                  filter === item.key
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 z-10" />
            <Input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหาเลขงาน, หน่วยงาน, S/N, กลุ่ม LINE..."
              className="h-9 pl-9 pr-3"
            />
          </div>
        </div>

        {/* Ticket List */}
        {loading ? (
          <div className="py-12 text-center text-slate-500 text-sm">
            <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
            กำลังโหลดรายการแจ้งซ่อม...
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">ไม่พบรายการแจ้งซ่อมในตัวกรองนี้</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredTickets.map((t) => (
              <div
                key={t.id}
                onClick={() => setSelectedTicketId(t.id)}
                className="py-3.5 px-2 hover:bg-slate-50 rounded-xl cursor-pointer transition flex flex-col lg:flex-row lg:items-center justify-between gap-3"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-blue-700">{t.ticket_no}</span>
                    {t.request_group_no && (
                      <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 text-[11px] font-semibold">
                        {t.request_group_no}
                      </span>
                    )}
                    <TicketStatusBadge status={t.status} />
                    <TicketPriorityBadge priority={t.priority} />
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-xs font-medium">
                      {QUEUE_LABELS[t.queue]}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-xs">
                      {SOURCE_CHANNEL_LABELS[t.source_channel]}
                    </span>
                  </div>
                  <div className="font-semibold text-slate-900 truncate">{t.title}</div>
                  <div className="text-xs text-slate-500 flex flex-wrap gap-x-3 gap-y-1">
                    <span>
                      {t.customer_org}
                      {t.customer_dept ? ` (${t.customer_dept})` : ""}
                    </span>
                    <span>ผู้แจ้ง: {t.contact_name} ({t.contact_phone})</span>
                    {t.contact_line && <span>LINE: {t.contact_line}</span>}
                    {t.assigned_to && <span className="text-slate-700 font-medium">ช่าง: {t.assigned_to}</span>}
                  </div>
                </div>

                <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between gap-2 shrink-0">
                  <SlaStatusBadge sla={t.sla} />
                  <div className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    กำหนดเสร็จ: {formatThaiDateTime(t.resolve_due_at)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Ticket on Behalf Modal */}
      <Modal
        isOpen={createOpen}
        onClose={resetCreateModal}
        title={createdTicket ? `สร้าง ${createdTicket.ticket_no} สำเร็จ` : "สร้าง Ticket แทนลูกค้า (จากกลุ่ม LINE / โทรศัพท์)"}
        maxWidth="2xl"
        footer={
          createdTicket ? (
            <>
              <Button type="button" variant="outline" onClick={copyCreatedSummary} className="rounded-xl px-5 h-10 text-sm font-medium gap-2 cursor-pointer">
                <Copy className="w-4 h-4" />
                คัดลอกข้อความส่งกลุ่ม LINE
              </Button>
              <Button
                type="button"
                onClick={() => {
                  const id = createdTicket.id;
                  resetCreateModal();
                  setSelectedTicketId(id);
                }}
                className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-6 h-10 text-sm font-semibold shadow-sm shadow-blue-600/20 gap-2 cursor-pointer"
              >
                จัดการ Ticket นี้
                <ExternalLink className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <>
              <Button type="button" variant="outline" onClick={resetCreateModal} disabled={creating} className="rounded-xl px-5 h-10 text-sm font-medium cursor-pointer">
                ยกเลิก
              </Button>
              <Button
                type="submit"
                form="helpdesk-create-ticket-form"
                disabled={creating}
                className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-6 h-10 text-sm font-semibold shadow-sm shadow-blue-600/20 gap-2 cursor-pointer"
              >
                {creating && <Loader2 className="w-4 h-4 animate-spin" />}
                บันทึกและเริ่มนับ SLA
              </Button>
            </>
          )
        }
      >
        {createdTicket ? (
          <div className="space-y-4 py-1">
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-sm text-emerald-900">
              บันทึกใบแจ้งซ่อม <strong>{createdTicket.ticket_no}</strong> เข้าคิว{" "}
              <strong>{QUEUE_LABELS[createdTicket.queue]}</strong> เรียบร้อยแล้ว
              สามารถคัดลอกข้อความด้านล่างส่งกลับเข้ากลุ่ม LINE ลูกค้าได้ทันที
            </div>
          </div>
        ) : (
          <form id="helpdesk-create-ticket-form" onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">ช่องทางที่ลูกค้าแจ้ง</label>
                <Select
                  value={form.source_channel}
                  onChange={(val) => setForm({ ...form, source_channel: val as SourceChannel })}
                  options={SOURCE_OPTIONS}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">ชื่อกลุ่ม LINE ลูกค้า</label>
                <Input
                  type="text"
                  value={form.contact_line}
                  onChange={(e) => setForm({ ...form, contact_line: e.target.value })}
                  placeholder="เช่น กลุ่ม Support รพ.xxx"
                  className="h-11 px-3"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  โรงพยาบาล / หน่วยงาน <span className="text-rose-500">*</span>
                </label>
                <HospitalCombobox
                  required
                  value={form.customer_org}
                  onChange={(val) => setForm({ ...form, customer_org: val })}
                  hospitals={hospitals}
                  onCreateHospital={(name) => {
                    if (!hospitals.some((h) => h.toLowerCase() === name.toLowerCase())) {
                      setHospitals((prev) => [...prev, name].sort((a, b) => a.localeCompare(b)));
                    }
                  }}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">แผนก / จุดบริการ</label>
                <Input
                  type="text"
                  value={form.customer_dept}
                  onChange={(e) => setForm({ ...form, customer_dept: e.target.value })}
                  className="h-11 px-3"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ชื่อผู้ติดต่อ <span className="text-rose-500">*</span>
                </label>
                <Input
                  type="text"
                  required
                  value={form.contact_name}
                  onChange={(e) => setForm({ ...form, contact_name: e.target.value })}
                  className="h-11 px-3"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  เบอร์โทรศัพท์ <span className="text-rose-500">*</span>
                </label>
                <Input
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  minLength={6}
                  maxLength={15}
                  required
                  value={form.contact_phone}
                  onChange={(e) => setForm({ ...form, contact_phone: e.target.value.replace(/\D/g, "") })}
                  className="h-11 px-3"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">ประเภทอุปกรณ์</label>
                <Select
                  value={form.equipment_type}
                  onChange={(val) => setForm({ ...form, equipment_type: val as EquipmentType })}
                  options={EQUIPMENT_OPTIONS}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Serial Number</label>
                <Input
                  type="text"
                  value={form.serial_number}
                  onChange={(e) => setForm({ ...form, serial_number: e.target.value })}
                  className="h-11 px-3"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">ขอบเขตผลกระทบ</label>
                <Select
                  value={form.impact}
                  onChange={(val) => setForm({ ...form, impact: val as TicketImpact })}
                  options={IMPACT_OPTIONS}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">ความเร่งด่วน</label>
                <Select
                  value={form.urgency}
                  onChange={(val) => setForm({ ...form, urgency: val as TicketUrgency })}
                  options={URGENCY_OPTIONS}
                />
              </div>
            </div>

            <label className="flex items-center gap-2.5 text-sm text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_patient_care_critical}
                onChange={(e) => setForm({ ...form, is_patient_care_critical: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300"
              />
              กระทบจุดบริการผู้ป่วยสำคัญ (Wristband / ฉลากยา → บังคับ P2 ขึ้นไป)
            </label>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                อาการเสียโดยย่อ <span className="text-rose-500">*</span>
              </label>
              <Input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="เช่น พิมพ์สติกเกอร์ไม่ออก ขึ้นไฟแดง"
                className="h-11 px-3"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">รายละเอียดจากแชต LINE</label>
              <Textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="วางข้อความหรือรายละเอียดที่ลูกค้าแจ้งไว้..."
                className="p-3"
              />
            </div>
          </form>
        )}
      </Modal>

      {/* Large Ticket Detail Pop-up Modal */}
      <Modal
        isOpen={selectedTicketId !== null}
        onClose={() => setSelectedTicketId(null)}
        title="รายละเอียดและจัดการงานแจ้งซ่อม"
        maxWidth="7xl"
      >
        {selectedTicketId !== null && (
          <AdminTicketDetail ticketId={selectedTicketId} onUpdated={loadTickets} />
        )}
      </Modal>
    </div>
  );
}
