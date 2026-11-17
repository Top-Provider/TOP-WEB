"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { ArrowLeft, Save, Plus, Trash2, Loader2 } from "lucide-react";
import type { BusinessHourRule, SlaTargetRule } from "@/lib/helpdesk-sla";
import type { TicketPriority } from "@/lib/helpdesk-constants";

const DAY_NAMES = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"];

export default function AdminHelpdeskSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [targets, setTargets] = useState<SlaTargetRule[]>([]);
  const [hours, setHours] = useState<BusinessHourRule[]>([]);
  const [holidays, setHolidays] = useState<Array<{ id: number; holiday_date: string; name: string }>>([]);
  const [accounts, setAccounts] = useState<Array<{ id: number; username: string; org_name: string | null; is_active: boolean }>>([]);
  const [newAccUsername, setNewAccUsername] = useState("");
  const [newAccOrg, setNewAccOrg] = useState("");
  const [newAccPassword, setNewAccPassword] = useState("");
  const [editingOrgById, setEditingOrgById] = useState<Record<number, string>>({});

  const [newHolidayDate, setNewHolidayDate] = useState("");
  const [newHolidayName, setNewHolidayName] = useState("");

  const loadConfig = useCallback(async () => {
    setLoading(true);
    try {
      const [res, accRes] = await Promise.all([
        fetch("/api/helpdesk/settings", { cache: "no-store" }),
        fetch("/api/helpdesk/accounts", { cache: "no-store" }),
      ]);
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "โหลดการตั้งค่าไม่สำเร็จ");
      const order: TicketPriority[] = ["P1", "P2", "P3", "P4"];
      setTargets(order.map((p) => json.data.targets[p]));
      setHours(json.data.businessHours);
      setHolidays(json.data.holidays);

      if (accRes.ok) {
        const accJson = await accRes.json();
        if (accJson.success && Array.isArray(accJson.data)) {
          setAccounts(accJson.data);
          const map: Record<number, string> = {};
          for (const acc of accJson.data) {
            map[acc.id] = acc.org_name || "";
          }
          setEditingOrgById(map);
        }
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  const saveConfig = async (payload: Record<string, unknown>, msg: string) => {
    if (saving) return;
    setSaving(true);
    try {
      const res = await fetch("/api/helpdesk/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "บันทึกไม่สำเร็จ");
      const order: TicketPriority[] = ["P1", "P2", "P3", "P4"];
      setTargets(order.map((p) => json.data.targets[p]));
      setHours(json.data.businessHours);
      setHolidays(json.data.holidays);
      toast.success(msg);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center text-slate-500">
        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
        กำลังโหลดการตั้งค่า SLA...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">ตั้งค่า SLA และเวลาทำการ</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            กำหนดเป้าหมายเวลา P1-P4, เวลาทำการ (จ-ศ 08:30-18:00) และวันหยุดนักขัตฤกษ์
          </p>
        </div>
        <Link href="/admin/helpdesk">
          <Button variant="outline" className="gap-1.5">
            <ArrowLeft className="w-4 h-4" />
            กลับคิวงาน Helpdesk
          </Button>
        </Link>
      </div>

      {/* SLA Targets */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <h2 className="text-lg font-bold text-slate-900">เป้าหมายเวลา SLA (หน่วย: นาทีทำการ)</h2>
          <Button
            type="button"
            disabled={saving}
            onClick={() =>
              saveConfig(
                {
                  targets: targets.map((t) => ({
                    priority: t.priority,
                    first_response_minutes: Number(t.first_response_minutes),
                    onsite_minutes: t.onsite_minutes === null ? null : Number(t.onsite_minutes),
                    resolve_minutes: Number(t.resolve_minutes),
                  })),
                },
                "บันทึกเป้าหมาย SLA เรียบร้อยแล้ว"
              )
            }
            className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5"
          >
            <Save className="w-4 h-4" />
            บันทึก SLA
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs text-slate-500">
                <th className="py-2 pr-3">ระดับ</th>
                <th className="py-2 pr-3">ตอบรับครั้งแรก (นาที)</th>
                <th className="py-2 pr-3">เข้าหน้างาน (นาที)</th>
                <th className="py-2">แก้ไขเสร็จ (นาที)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {targets.map((t, idx) => (
                <tr key={t.priority}>
                  <td className="py-2.5 pr-3 font-semibold text-slate-900">
                    {t.priority} · {t.label}
                  </td>
                  <td className="py-2.5 pr-3">
                    <Input
                      type="number"
                      min={1}
                      value={t.first_response_minutes}
                      onChange={(e) => {
                        const next = [...targets];
                        next[idx] = { ...t, first_response_minutes: Number(e.target.value) };
                        setTargets(next);
                      }}
                      className="w-28 h-9 px-2.5 rounded-lg"
                    />
                  </td>
                  <td className="py-2.5 pr-3">
                    <Input
                      type="number"
                      min={1}
                      placeholder="ไม่กำหนด"
                      value={t.onsite_minutes ?? ""}
                      onChange={(e) => {
                        const next = [...targets];
                        next[idx] = {
                          ...t,
                          onsite_minutes: e.target.value ? Number(e.target.value) : null,
                        };
                        setTargets(next);
                      }}
                      className="w-28 h-9 px-2.5 rounded-lg"
                    />
                  </td>
                  <td className="py-2.5">
                    <Input
                      type="number"
                      min={1}
                      value={t.resolve_minutes}
                      onChange={(e) => {
                        const next = [...targets];
                        next[idx] = { ...t, resolve_minutes: Number(e.target.value) };
                        setTargets(next);
                      }}
                      className="w-28 h-9 px-2.5 rounded-lg"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-slate-500">หมายเหตุ: 1 วันทำการ (08:30-18:00 น.) เท่ากับ 570 นาทีทำการ</p>
      </div>

      {/* Business Hours */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <h2 className="text-lg font-bold text-slate-900">เวลาทำการประจำสัปดาห์</h2>
          <Button
            type="button"
            disabled={saving}
            onClick={() => saveConfig({ businessHours: hours }, "บันทึกเวลาทำการเรียบร้อยแล้ว")}
            className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5"
          >
            <Save className="w-4 h-4" />
            บันทึกเวลาทำการ
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {hours.map((h, idx) => (
            <div
              key={h.day_of_week}
              className="flex items-center justify-between gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/50"
            >
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={h.is_working_day}
                  onChange={(e) => {
                    const next = [...hours];
                    next[idx] = { ...h, is_working_day: e.target.checked };
                    setHours(next);
                  }}
                  className="h-4 w-4 rounded border-slate-300"
                />
                วัน{DAY_NAMES[h.day_of_week]}
              </label>
              <div className="flex items-center gap-1.5 text-sm">
                <Input
                  type="time"
                  disabled={!h.is_working_day}
                  value={h.start_time}
                  onChange={(e) => {
                    const next = [...hours];
                    next[idx] = { ...h, start_time: e.target.value };
                    setHours(next);
                  }}
                  className="w-auto h-9 px-2 rounded-lg"
                />
                <span>-</span>
                <Input
                  type="time"
                  disabled={!h.is_working_day}
                  value={h.end_time}
                  onChange={(e) => {
                    const next = [...hours];
                    next[idx] = { ...h, end_time: e.target.value };
                    setHours(next);
                  }}
                  className="w-auto h-9 px-2 rounded-lg"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Holidays */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-4">
        <h2 className="text-lg font-bold text-slate-900">วันหยุดนักขัตฤกษ์ (ไม่นับเวลา SLA)</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="w-full sm:w-56">
            <DatePicker value={newHolidayDate} onChange={setNewHolidayDate} placeholder="เลือกวันหยุด" />
          </div>
          <Input
            type="text"
            value={newHolidayName}
            onChange={(e) => setNewHolidayName(e.target.value)}
            placeholder="ชื่อวันหยุด เช่น วันขึ้นปีใหม่"
            className="flex-1 h-11 px-3.5"
          />
          <Button
            type="button"
            disabled={saving || !newHolidayDate || !newHolidayName.trim()}
            onClick={async () => {
              await saveConfig(
                { addHoliday: { holiday_date: newHolidayDate, name: newHolidayName.trim() } },
                "เพิ่มวันหยุดเรียบร้อยแล้ว"
              );
              setNewHolidayDate("");
              setNewHolidayName("");
            }}
            className="bg-slate-900 hover:bg-slate-800 text-white gap-1.5"
          >
            <Plus className="w-4 h-4" />
            เพิ่มวันหยุด
          </Button>
        </div>

        {holidays.length === 0 ? (
          <p className="text-sm text-slate-400">ยังไม่มีรายการวันหยุดที่บันทึกไว้</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {holidays.map((hol) => (
              <div key={hol.id} className="py-2.5 flex items-center justify-between text-sm">
                <div>
                  <span className="font-semibold text-slate-900 mr-3">{hol.holiday_date}</span>
                  <span className="text-slate-600">{hol.name}</span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={saving}
                  onClick={() => saveConfig({ deleteHolidayId: hol.id }, "ลบวันหยุดแล้ว")}
                  className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Customer Accounts (Hospital Binding) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">บัญชีลูกค้าแจ้งซ่อม (ผูกชื่อโรงพยาบาลอัตโนมัติ)</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            เมื่อลูกค้าเข้าสู่ระบบด้วยบัญชีเหล่านี้ ระบบจะกรอกชื่อโรงพยาบาล / หน่วยงานให้โดยอัตโนมัติ
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <Input
            type="text"
            value={newAccUsername}
            onChange={(e) => setNewAccUsername(e.target.value)}
            placeholder="ชื่อผู้ใช้ (เช่น hosp_demo)"
            className="h-11 px-3.5"
          />
          <Input
            type="text"
            value={newAccOrg}
            onChange={(e) => setNewAccOrg(e.target.value)}
            placeholder="ชื่อโรงพยาบาล / หน่วยงาน"
            className="h-11 px-3.5 sm:col-span-2"
          />
          <Input
            type="password"
            value={newAccPassword}
            onChange={(e) => setNewAccPassword(e.target.value)}
            placeholder="รหัสผ่าน (อย่างน้อย 8 ตัว)"
            className="h-11 px-3.5"
          />
        </div>
        <div>
          <Button
            type="button"
            disabled={saving || !newAccUsername.trim() || !newAccOrg.trim() || newAccPassword.length < 8}
            onClick={async () => {
              setSaving(true);
              try {
                const res = await fetch("/api/helpdesk/accounts", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    username: newAccUsername.trim(),
                    org_name: newAccOrg.trim(),
                    password: newAccPassword,
                  }),
                });
                const json = await res.json();
                if (!res.ok || !json.success) throw new Error(json.error || "เพิ่มบัญชีไม่สำเร็จ");
                setAccounts(json.data);
                const map: Record<number, string> = {};
                for (const acc of json.data) map[acc.id] = acc.org_name || "";
                setEditingOrgById(map);
                setNewAccUsername("");
                setNewAccOrg("");
                setNewAccPassword("");
                toast.success("เพิ่มบัญชีลูกค้าเรียบร้อยแล้ว");
              } catch (err) {
                toast.error(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
              } finally {
                setSaving(false);
              }
            }}
            className="bg-slate-900 hover:bg-slate-800 text-white gap-1.5"
          >
            <Plus className="w-4 h-4" />
            เพิ่มบัญชีลูกค้า
          </Button>
        </div>

        {accounts.length > 0 && (
          <div className="divide-y divide-slate-100 pt-2">
            {accounts.map((acc) => (
              <div key={acc.id} className="py-3 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="sm:w-44 text-sm font-semibold text-slate-900">{acc.username}</div>
                <Input
                  type="text"
                  value={editingOrgById[acc.id] ?? ""}
                  onChange={(e) =>
                    setEditingOrgById((prev) => ({ ...prev, [acc.id]: e.target.value }))
                  }
                  placeholder="ระบุชื่อโรงพยาบาล / หน่วยงาน"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={saving || !(editingOrgById[acc.id] || "").trim()}
                  onClick={async () => {
                    setSaving(true);
                    try {
                      const res = await fetch("/api/helpdesk/accounts", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          id: acc.id,
                          username: acc.username,
                          org_name: (editingOrgById[acc.id] || "").trim(),
                        }),
                      });
                      const json = await res.json();
                      if (!res.ok || !json.success) throw new Error(json.error || "บันทึกไม่สำเร็จ");
                      setAccounts(json.data);
                      toast.success(`อัปเดตโรงพยาบาลของ ${acc.username} แล้ว`);
                    } catch (err) {
                      toast.error(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
                    } finally {
                      setSaving(false);
                    }
                  }}
                  className="gap-1.5 shrink-0"
                >
                  <Save className="w-3.5 h-3.5" />
                  บันทึกชื่อ รพ.
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

