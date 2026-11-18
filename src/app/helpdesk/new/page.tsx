"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { ToastContainer, toast } from "@/components/ui/toast";
import {
  createEquipmentItem,
  EquipmentItemsForm,
  type EquipmentFormItem,
} from "@/components/helpdesk/equipment-items-form";
import {
  CheckCircle2,
  ExternalLink,
  Clock,
  ShieldAlert,
  Loader2,
  HelpCircle,
  Building2,
  MonitorSmartphone,
  Camera,
  Send,
  ListChecks,
} from "lucide-react";
import {
  IMPACT_LABELS,
  PRIORITY_LABELS,
  URGENCY_LABELS,
  type TicketImpact,
  type TicketUrgency,
} from "@/lib/helpdesk-constants";
import {
  calculatePriority,
  DEFAULT_SLA_TARGETS,
  formatBusinessDuration,
  type SlaTargetRule,
} from "@/lib/helpdesk-sla";
import {
  formatThaiDateTime,
  TicketPriorityBadge,
} from "@/components/helpdesk/sla-badge";

const IMPACT_OPTIONS = (Object.keys(IMPACT_LABELS) as TicketImpact[]).map((value) => ({
  value,
  label: IMPACT_LABELS[value],
}));

const URGENCY_OPTIONS = (Object.keys(URGENCY_LABELS) as TicketUrgency[]).map((value) => ({
  value,
  label: URGENCY_LABELS[value],
}));

function HelpdeskNewForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [authChecking, setAuthChecking] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [sessionUser, setSessionUser] = useState<{ username: string; role: "admin" | "viewer"; org_name?: string | null } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [clientRequestId] = useState(() => crypto.randomUUID());
  const [targets, setTargets] = useState(DEFAULT_SLA_TARGETS);
  const [guideOpen, setGuideOpen] = useState(false);

  const [customerOrg, setCustomerOrg] = useState("");
  const [customerDept, setCustomerDept] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  const [equipmentItems, setEquipmentItems] = useState<EquipmentFormItem[]>(() => [createEquipmentItem()]);

  const [impact, setImpact] = useState<TicketImpact>("USER");
  const [urgency, setUrgency] = useState<TicketUrgency>("NORMAL");

  const [createdResult, setCreatedResult] = useState<{
    request_group_no: string | null;
    items: Array<{
      ticket_no: string;
      priority: "P1" | "P2" | "P3" | "P4";
      queue: string;
      resolve_due_at: string;
      customer_org: string;
      title: string;
    }>;
  } | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/helpdesk/auth/session", { cache: "no-store" })
      .then(async (response) => {
        if (!active) return;
        if (response.status === 401 || response.status === 403) {
          const nextPath = `${window.location.pathname}${window.location.search}`;
          router.replace(`/helpdesk/login?next=${encodeURIComponent(nextPath)}`);
          return;
        }
        if (!response.ok) {
          throw new Error("ไม่สามารถตรวจสอบสถานะการเข้าสู่ระบบได้");
        }
        const data = await response.json();
        if (active) {
          setSessionUser(data.user);
          if (data.user?.org_name) {
            setCustomerOrg(data.user.org_name);
          }
          setAuthError(null);
          setAuthChecking(false);
        }
      })
      .catch((error) => {
        if (!active) return;
        setAuthError(error instanceof Error ? error.message : "ไม่สามารถตรวจสอบสถานะการเข้าสู่ระบบได้");
        setAuthChecking(false);
      });
    return () => {
      active = false;
    };
  }, [router]);

  useEffect(() => {
    const sn = searchParams.get("sn");
    const typeParam = searchParams.get("type");
    if (sn || (typeParam && ["PRINTER", "COMPUTER", "NETWORK", "SOFTWARE", "OTHER"].includes(typeParam))) {
      setEquipmentItems((current) => current.map((item, index) => index === 0 ? {
        ...item,
        ...(sn ? { serialNumber: sn } : {}),
        ...(typeParam ? { equipmentType: typeParam as EquipmentFormItem["equipmentType"] } : {}),
      } : item));
    }

    fetch("/api/helpdesk/settings")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json?.success && json.data?.targets) {
          setTargets(json.data.targets as Record<"P1" | "P2" | "P3" | "P4", SlaTargetRule>);
        }
      })
      .catch(() => { });
  }, [searchParams]);

  const previewPriority = useMemo(
    () => calculatePriority(impact, urgency, equipmentItems.some((item) => item.isPatientCritical)),
    [equipmentItems, impact, urgency]
  );
  const previewTarget = targets[previewPriority];

  const closeGuide = () => {
    setGuideOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    if (!customerOrg.trim() || !contactName.trim() || !contactPhone.trim()) {
      toast.warning("กรุณากรอกหน่วยงาน ชื่อผู้ติดต่อ และเบอร์โทรศัพท์ให้ครบถ้วน");
      return;
    }
    if (!/^\d{6,15}$/.test(contactPhone)) {
      toast.warning("กรุณากรอกเบอร์โทรศัพท์เป็นตัวเลข 6-15 หลัก");
      return;
    }
    if (equipmentItems.some((item) => !item.title.trim())) {
      toast.warning("กรุณาระบุอาการเสียของอุปกรณ์ทุกเครื่อง");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/helpdesk/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source_channel: searchParams.get("sn") ? "QR" : "WEB",
          customer_org: customerOrg,
          customer_dept: customerDept || null,
          contact_name: contactName,
          contact_phone: contactPhone,
          impact,
          urgency,
          client_request_id: clientRequestId,
          items: equipmentItems.map((item) => ({
            equipment_type: item.equipmentType,
            product_id: item.productId,
            equipment_brand: item.brand || null,
            equipment_model: item.model || null,
            serial_number: item.serialNumber || null,
            title: item.title,
            description: item.description || null,
            is_patient_care_critical: item.isPatientCritical,
            attachments: item.images.map((data_url, index) => ({
              file_name: `machine-${item.key}-${index + 1}.webp`, data_url,
            })),
          })),
        }),
      });
      const json = await res.json();
      if (res.status === 401) {
        const nextPath = `${window.location.pathname}${window.location.search}`;
        router.replace(`/helpdesk/login?next=${encodeURIComponent(nextPath)}`);
        throw new Error("เซสชันหมดอายุ กรุณาเข้าสู่ระบบอีกครั้ง");
      }
      if (!res.ok || !json.success) {
        throw new Error(json.error || "ไม่สามารถส่งใบแจ้งซ่อมได้");
      }
      setCreatedResult({
        request_group_no: json.request_group_no || null,
        items: Array.isArray(json.items) && json.items.length ? json.items : [json.data],
      });
      toast.success("ส่งใบแจ้งซ่อมเรียบร้อยแล้ว");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setSubmitting(false);
    }
  };

  if (authChecking) {
    return (
      <div className="mx-auto flex min-h-[360px] max-w-3xl items-center justify-center rounded-2xl border border-slate-200 bg-white text-sm font-medium text-slate-500 shadow-sm">
        <Loader2 className="mr-2 h-5 w-5 animate-spin text-blue-600" />
        กำลังตรวจสอบสิทธิ์ผู้ใช้งาน...
      </div>
    );
  }

  if (authError || !sessionUser) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-rose-200 bg-white p-7 text-center shadow-sm">
        <ShieldAlert className="mx-auto h-10 w-10 text-rose-500" />
        <h1 className="mt-4 text-xl font-bold text-slate-900">ตรวจสอบการเข้าสู่ระบบไม่สำเร็จ</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          {authError || "ไม่พบข้อมูลผู้ใช้งาน กรุณาลองเข้าสู่ระบบอีกครั้ง"}
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Button type="button" onClick={() => window.location.reload()} className="bg-blue-600 text-white hover:bg-blue-700">
            ลองตรวจสอบอีกครั้ง
          </Button>
          <Button type="button" variant="outline" onClick={() => router.replace("/helpdesk/login")}>
            กลับหน้าเข้าสู่ระบบ
          </Button>
        </div>
      </div>
    );
  }

  if (createdResult && createdResult.items.length > 0) {
    const first = createdResult.items[0];
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 text-center">
        <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">รับแจ้งซ่อมเรียบร้อยแล้ว</h1>
        <p className="text-sm text-slate-600 mt-1">
          {createdResult.items.length > 1
            ? `ระบบได้แตกใบแจ้งซ่อมตามอุปกรณ์ทั้งหมด ${createdResult.items.length} เครื่อง (${createdResult.request_group_no}) และเริ่มนับ SLA แล้ว`
            : "ระบบได้เปิดใบแจ้งซ่อมและเริ่มคำนวณ SLA (เวลาทำการ จ-ศ 08:30-18:00 น.) แล้ว"}
        </p>

        {createdResult.items.length === 1 ? (
          <div className="mt-6 rounded-xl bg-slate-50 border border-slate-200 p-5 text-left space-y-2.5">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-xs font-medium text-slate-500">เลขที่ใบแจ้งซ่อม</span>
              <span className="text-lg font-bold text-blue-700 tracking-wide">{first.ticket_no}</span>
            </div>
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-xs font-medium text-slate-500">ความเร่งด่วน</span>
              <TicketPriorityBadge priority={first.priority} />
            </div>
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-xs font-medium text-slate-500">กำหนดแก้ไขเสร็จ (SLA)</span>
              <span className="text-sm font-semibold text-slate-900">
                {formatThaiDateTime(first.resolve_due_at)}
              </span>
            </div>
          </div>
        ) : (
          <div className="mt-6 space-y-3 text-left">
            {createdResult.items.map((item, idx) => (
              <div key={item.ticket_no} className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-2">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-sm font-bold text-blue-700">
                    เครื่องที่ {idx + 1} · {item.ticket_no}
                  </span>
                  <div className="flex items-center gap-2">
                    <TicketPriorityBadge priority={item.priority} />
                  </div>
                </div>
                <div className="text-sm font-semibold text-slate-900">{item.title}</div>
                <div className="flex items-center justify-between gap-2 flex-wrap text-xs text-slate-500">
                  <span>กำหนดเสร็จ (SLA): {formatThaiDateTime(item.resolve_due_at)}</span>
                  <Link href={`/helpdesk/ticket/${item.ticket_no}`} className="text-blue-600 font-semibold hover:underline">
                    ติดตามสถานะ →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/helpdesk/tickets">
            <Button type="button" variant="outline" className="w-full sm:w-auto gap-2">
              <Clock className="w-4 h-4" />
              ดูรายการแจ้งซ่อมทั้งหมด
            </Button>
          </Link>
          {createdResult.items.length === 1 && (
            <Link href={`/helpdesk/ticket/${first.ticket_no}`}>
              <Button type="button" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white gap-2">
                ติดตามสถานะงาน
                <ExternalLink className="w-4 h-4" />
              </Button>
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Top Banner Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-[24px] border border-blue-100 bg-white/85 backdrop-blur px-6 py-5 shadow-[0_12px_40px_rgba(30,64,175,0.06)]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0d173d] tracking-tight">
            แจ้งซ่อมอุปกรณ์ออนไลน์
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => setGuideOpen(true)}
            className="gap-2 rounded-full border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-semibold px-5 h-11"
          >
            <HelpCircle className="w-4 h-4" />
            อ่านคู่มือ
          </Button>
          <Link href="/helpdesk/tickets">
            <Button
              type="button"
              variant="outline"
              className="gap-2 rounded-full border-blue-200 bg-blue-50/50 text-blue-700 hover:bg-blue-100/70 font-semibold px-5 h-11"
            >
              <Clock className="w-4 h-4" />
              ติดตามงานแจ้งซ่อม
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-6 items-start">
        <form
          onSubmit={handleSubmit}
          className="min-w-0 bg-white rounded-[24px] border border-blue-100/80 shadow-[0_20px_60px_rgba(30,64,175,0.08)] p-5 sm:p-8 space-y-8"
        >
          {/* Section 1 */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-extrabold">
                1
              </span>
              <h2 className="text-lg font-bold text-slate-900">ข้อมูลหน่วยงานและผู้ติดต่อ</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  โรงพยาบาล / หน่วยงาน <span className="text-rose-500">*</span>
                </label>
                {sessionUser.org_name ? (
                  <div className="w-full min-h-11 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-800 flex items-center justify-between gap-2">
                    <span>{sessionUser.org_name}</span>
                    <span className="text-[11px] font-medium text-blue-600 shrink-0">ผูกกับบัญชีผู้ใช้งาน</span>
                  </div>
                ) : (
                  <Input
                    type="text"
                    value={customerOrg}
                    onChange={(e) => setCustomerOrg(e.target.value)}
                    placeholder="เช่น โรงพยาบาล..."
                    className="h-11 px-3.5"
                    required
                  />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">แผนก / จุดบริการ</label>
                <Input
                  type="text"
                  value={customerDept}
                  onChange={(e) => setCustomerDept(e.target.value)}
                  placeholder="เช่น OPD, ห้องยา, การเงิน"
                  className="h-11 px-3.5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  ชื่อผู้แจ้ง <span className="text-rose-500">*</span>
                </label>
                <Input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="ชื่อ-นามสกุล"
                  className="h-11 px-3.5"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  เบอร์โทรศัพท์ติดต่อ <span className="text-rose-500">*</span>
                </label>
                <Input
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  minLength={6}
                  maxLength={15}
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value.replace(/\D/g, ""))}
                  className="h-11 px-3.5"
                  required
                />
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Section 2 */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-extrabold">
                  2
                </span>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">ข้อมูลอุปกรณ์และอาการเสีย</h2>
                  <p className="text-xs text-slate-500">
                    เพิ่มได้หลายเครื่องในคำร้องเดียว ระบบจะแตก Ticket แยกตามเครื่องให้อัตโนมัติ
                  </p>
                </div>
              </div>
              <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-1 rounded-full self-start">
                ทั้งหมด {equipmentItems.length} เครื่อง
              </span>
            </div>

            <EquipmentItemsForm items={equipmentItems} onChange={setEquipmentItems} />
          </div>

          <hr className="border-slate-100" />

          {/* Section 3 */}
          <div className="space-y-5">
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-extrabold">
                3
              </span>
              <h2 className="text-lg font-bold text-slate-900">ประเมินผลกระทบและความเร่งด่วน</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">ขอบเขตผลกระทบ</label>
                <Select
                  value={impact}
                  onChange={(val) => setImpact(val as TicketImpact)}
                  options={IMPACT_OPTIONS}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">ระดับความเร่งด่วน</label>
                <Select
                  value={urgency}
                  onChange={(val) => setUrgency(val as TicketUrgency)}
                  options={URGENCY_OPTIONS}
                />
              </div>
            </div>

            <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <ShieldAlert className="w-4 h-4 text-blue-600" />
                  ระดับ SLA ที่คำนวณได้: {PRIORITY_LABELS[previewPriority]}
                </div>
                <TicketPriorityBadge priority={previewPriority} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-white rounded-lg p-3 border border-slate-200">
                  <div className="text-slate-500">เป้าหมายตอบรับครั้งแรก</div>
                  <div className="font-bold text-slate-900 mt-0.5">
                    {formatBusinessDuration(previewTarget.first_response_minutes)}
                  </div>
                </div>
                <div className="bg-white rounded-lg p-3 border border-slate-200">
                  <div className="text-slate-500">เป้าหมายแก้ไขเสร็จ</div>
                  <div className="font-bold text-slate-900 mt-0.5">
                    {formatBusinessDuration(previewTarget.resolve_minutes)}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto h-12 bg-[#0874ff] hover:bg-blue-700 text-white font-bold gap-2 px-8 rounded-xl shadow-lg shadow-blue-200"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                ยืนยันส่งใบแจ้งซ่อม ({equipmentItems.length} เครื่อง)
              </Button>
            </div>
          </div>
        </form>

        {/* Right Summary Sidebar */}
        <aside className="space-y-4 lg:sticky lg:top-24">
          <div className="bg-white rounded-[24px] border border-blue-100/80 shadow-[0_16px_45px_rgba(30,64,175,0.06)] p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-[#0d173d]">สรุปใบแจ้งซ่อม</h3>
              <TicketPriorityBadge priority={previewPriority} />
            </div>

            <div className="space-y-3 text-xs border-t border-slate-100 pt-3">
              <div>
                <span className="text-slate-400 block">โรงพยาบาล / หน่วยงาน</span>
                <span className="font-bold text-slate-800 text-sm">{customerOrg || "-"}</span>
                {customerDept && <span className="text-slate-500 block">แผนก: {customerDept}</span>}
              </div>
              <div className="flex items-center justify-between py-2 border-y border-slate-100">
                <span className="text-slate-500">จำนวนอุปกรณ์</span>
                <span className="font-bold text-blue-700">{equipmentItems.length} เครื่อง</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">ตอบรับครั้งแรก (SLA)</span>
                <span className="font-bold text-slate-900">
                  {formatBusinessDuration(previewTarget.first_response_minutes)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">แก้ไขเสร็จ (SLA)</span>
                <span className="font-bold text-slate-900">
                  {formatBusinessDuration(previewTarget.resolve_minutes)}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-[24px] bg-gradient-to-br from-[#075fe8] to-[#0b84ff] p-5 text-white shadow-lg shadow-blue-200 space-y-2.5">
            <div className="flex items-center gap-2 text-sm font-bold">
              <Clock className="w-4 h-4" />
              เวลาทำการและเงื่อนไข SLA
            </div>
            <p className="text-xs leading-5 text-blue-100">
              นับเวลาเฉพาะวันจันทร์–ศุกร์ เวลา 08:30–18:00 น. หากแจ้งนอกเวลาทำการ ระบบจะเริ่มนับเวลา 08:30 น. ของวันทำการถัดไปอัตโนมัติ
            </p>
          </div>
        </aside>
      </div>

      <Modal
        isOpen={guideOpen}
        onClose={closeGuide}
        title="วิธีแจ้งซ่อมออนไลน์"
        description="เตรียมข้อมูลให้ครบเพื่อให้ทีมช่างวิเคราะห์และรับงานได้รวดเร็วขึ้น"
        maxWidth="2xl"
        closeOnBackdropClick
        footer={
          <Button type="button" onClick={closeGuide} className="bg-blue-600 text-white hover:bg-blue-700">
            เข้าใจแล้ว เริ่มแจ้งซ่อม
          </Button>
        }
      >
        <div className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              {
                icon: Building2,
                number: "1",
                title: "ข้อมูลผู้แจ้ง",
                detail: "ตรวจสอบหน่วยงาน ระบุแผนก ชื่อผู้แจ้ง และเบอร์โทรศัพท์เป็นตัวเลขเท่านั้น",
                color: "bg-blue-50 text-blue-700 border-blue-100",
              },
              {
                icon: MonitorSmartphone,
                number: "2",
                title: "เลือกอุปกรณ์",
                detail: "เลือกประเภท รุ่น และกรอก Serial Number หากมี สามารถเพิ่มหลายเครื่องในคำร้องเดียวได้",
                color: "bg-indigo-50 text-indigo-700 border-indigo-100",
              },
              {
                icon: ListChecks,
                number: "3",
                title: "อธิบายอาการ",
                detail: "ระบุอาการที่พบ ข้อความ Error และสิ่งที่ลองแก้ไขแล้วให้ชัดเจน",
                color: "bg-amber-50 text-amber-800 border-amber-100",
              },
              {
                icon: Camera,
                number: "4",
                title: "แนบรูปประกอบ",
                detail: "ถ่ายภาพตัวเครื่อง สติกเกอร์ S/N และหน้าจอ Error ให้เห็นชัดเจน สูงสุด 5 รูปต่อเครื่อง",
                color: "bg-emerald-50 text-emerald-700 border-emerald-100",
              },
            ].map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.number} className={`rounded-2xl border p-4 ${step.color}`}>
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-sm font-extrabold">ขั้นตอนที่ {step.number} · {step.title}</div>
                      <p className="mt-1 text-xs leading-5 opacity-90">{step.detail}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
            <div className="flex items-start gap-3">
              <Send className="mt-0.5 h-5 w-5 shrink-0 text-blue-700" />
              <div>
                <div className="text-sm font-bold text-blue-950">ตรวจสอบแล้วกดยืนยันส่งใบแจ้งซ่อม</div>
                <p className="mt-1 text-xs leading-5 text-blue-800">
                  ระบบจะแสดงเลข Ticket และกำหนด SLA หลังส่งสำเร็จ สามารถดูความคืบหน้า ส่งข้อความถึงทีมช่าง
                  และยืนยันปิดงานได้จากเมนู “ติดตามงานแจ้งซ่อม”
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs leading-5 text-rose-800">
            หากปัญหากระทบการดูแลผู้ป่วยหรือทำให้ระบบหลักหยุดทำงาน ให้เลือกผลกระทบและความเร่งด่วนตามจริง
            เพื่อให้ระบบจัดลำดับงานอย่างเหมาะสม
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default function HelpdeskNewPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[radial-gradient(circle_at_15%_10%,rgba(219,234,254,0.8),transparent_35%),radial-gradient(circle_at_85%_20%,rgba(224,242,254,0.7),transparent_30%),#f7faff]">
      <Navbar />
      <main className="flex-1 pt-8 sm:pt-12 pb-16 px-4 sm:px-6">
        <Suspense
          fallback={
            <div className="max-w-3xl mx-auto py-12 text-center text-slate-500">กำลังโหลดฟอร์มแจ้งซ่อม...</div>
          }
        >
          <HelpdeskNewForm />
        </Suspense>
      </main>
      <Footer />
      <ToastContainer />
    </div>
  );
}

