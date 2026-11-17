"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/textarea";
import { HospitalCombobox } from "@/components/helpdesk/hospital-combobox";
import { toast } from "@/components/ui/toast";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Copy,
  Eye,
  EyeOff,
  Loader2,
  Pencil,
  RefreshCw,
  Search,
  Upload,
  UserPlus,
} from "lucide-react";

interface CustomerAccount {
  id: number;
  username: string;
  org_name: string | null;
  is_active: boolean;
  created_at: string;
}

export default function AdminHelpdeskCustomersPage() {
  const [accounts, setAccounts] = useState<CustomerAccount[]>([]);
  const [hospitals, setHospitals] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  // Modal state (null = closed, "create" = new customer, CustomerAccount = edit)
  const [modalMode, setModalMode] = useState<"create" | CustomerAccount | null>(null);
  const [formUsername, setFormUsername] = useState("");
  const [formOrgName, setFormOrgName] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formActive, setFormActive] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState("");
  const [importing, setImporting] = useState(false);
  const [savedCredentials, setSavedCredentials] = useState<{
    username: string;
    org_name: string;
    password: string;
  } | null>(null);

  const loadAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const [res, hospRes] = await Promise.all([
        fetch("/api/helpdesk/accounts", { cache: "no-store" }),
        fetch("/api/helpdesk/hospitals", { cache: "no-store" }),
      ]);
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "โหลดรายชื่อลูกค้าไม่สำเร็จ");
      setAccounts((json.data || []) as CustomerAccount[]);
      if (hospRes.ok) {
        const hospJson = await hospRes.json();
        if (hospJson.success && Array.isArray(hospJson.data)) {
          setHospitals(hospJson.data.map((h: { name: string }) => h.name));
        }
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  const openCreateModal = () => {
    setFormUsername("");
    setFormOrgName("");
    setFormPassword("");
    setFormActive(true);
    setShowPassword(false);
    setSavedCredentials(null);
    setModalMode("create");
  };

  const openEditModal = (acc: CustomerAccount) => {
    setFormUsername(acc.username);
    setFormOrgName(acc.org_name || "");
    setFormPassword("");
    setFormActive(acc.is_active);
    setShowPassword(false);
    setSavedCredentials(null);
    setModalMode(acc);
  };

  const closeModal = () => {
    setModalMode(null);
    setSavedCredentials(null);
  };

  const generatePassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
    let result = "";
    for (let i = 0; i < 10; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormPassword(result);
    setShowPassword(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving || !modalMode) return;

    const isCreate = modalMode === "create";
    if (isCreate && formPassword.length < 8) {
      toast.warning("กรุณากำหนดรหัสผ่านอย่างน้อย 8 ตัวอักษร");
      return;
    }
    if (!isCreate && formPassword && formPassword.length < 8) {
      toast.warning("รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษร");
      return;
    }

    setSaving(true);
    try {
      const payload = isCreate
        ? {
            username: formUsername.trim(),
            org_name: formOrgName.trim(),
            password: formPassword,
          }
        : {
            id: modalMode.id,
            username: modalMode.username,
            org_name: formOrgName.trim(),
            is_active: formActive,
            ...(formPassword ? { password: formPassword } : {}),
          };

      const res = await fetch("/api/helpdesk/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "บันทึกข้อมูลไม่สำเร็จ");

      setAccounts((json.data || []) as CustomerAccount[]);
      const savedOrg = formOrgName.trim();
      if (savedOrg && !hospitals.some((h) => h.toLowerCase() === savedOrg.toLowerCase())) {
        setHospitals((prev) => [...prev, savedOrg].sort((a, b) => a.localeCompare(b)));
      }
      toast.success(isCreate ? "ลงทะเบียนบัญชีลูกค้าเรียบร้อยแล้ว" : "อัปเดตข้อมูลลูกค้าเรียบร้อยแล้ว");

      if (formPassword) {
        setSavedCredentials({
          username: formUsername.trim().toLowerCase(),
          org_name: formOrgName.trim(),
          password: formPassword,
        });
      } else {
        closeModal();
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (acc: CustomerAccount) => {
    if (saving) return;
    setSaving(true);
    try {
      const res = await fetch("/api/helpdesk/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: acc.id,
          username: acc.username,
          org_name: (acc.org_name || acc.username).trim(),
          is_active: !acc.is_active,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "เปลี่ยนสถานะไม่สำเร็จ");
      setAccounts((json.data || []) as CustomerAccount[]);
      toast.success(acc.is_active ? `ปิดใช้งาน ${acc.username} แล้ว` : `เปิดใช้งาน ${acc.username} แล้ว`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setSaving(false);
    }
  };

  const copyCredentials = async () => {
    if (!savedCredentials) return;
    const text = [
      `บัญชีเข้าสู่ระบบแจ้งซ่อม (TOP PROVIDER Helpdesk)`,
      `โรงพยาบาล / หน่วยงาน: ${savedCredentials.org_name}`,
      `ลิงก์เข้าสู่ระบบ: ${window.location.origin}/helpdesk/login`,
      `Username: ${savedCredentials.username}`,
      `Password: ${savedCredentials.password}`,
    ].join("\n");
    await navigator.clipboard.writeText(text);
    toast.success("คัดลอกข้อมูลเข้าสู่ระบบสำหรับส่งลูกค้าแล้ว");
  };

  const parsedImportNames = useMemo(() => {
    const lines = importText
      .split(/\r?\n/)
      .map((line) => line.split(",")[0].replace(/^["']|["']$/g, "").trim())
      .filter((name) => name.length > 0 && !["name", "hospital", "ชื่อโรงพยาบาล", "โรงพยาบาล"].includes(name.toLowerCase()));
    return Array.from(new Set(lines));
  }, [importText]);

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    setImportText(text);
    e.target.value = "";
  };

  const handleImportHospitals = async () => {
    if (importing || parsedImportNames.length === 0) return;
    setImporting(true);
    try {
      const res = await fetch("/api/helpdesk/hospitals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ names: parsedImportNames }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "นำเข้าข้อมูลไม่สำเร็จ");
      if (Array.isArray(json.data)) {
        setHospitals(json.data.map((h: { name: string }) => h.name));
      }
      toast.success(`นำเข้ารายชื่อโรงพยาบาลใหม่ ${json.insertedCount} แห่ง (ทั้งหมดในระบบ ${json.data?.length || 0} แห่ง)`);
      setImportOpen(false);
      setImportText("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setImporting(false);
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return accounts;
    return accounts.filter(
      (a) =>
        a.username.toLowerCase().includes(q) ||
        (a.org_name || "").toLowerCase().includes(q)
    );
  }, [accounts, search]);

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">ลงทะเบียนลูกค้า (ระบบแจ้งซ่อม)</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            จัดการบัญชีลูกค้าและผูกชื่อโรงพยาบาลอัตโนมัติสำหรับหน้าแจ้งซ่อม
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/admin/helpdesk">
            <Button type="button" variant="outline" className="gap-1.5">
              <ArrowLeft className="w-4 h-4" />
              กลับคิวงาน
            </Button>
          </Link>
          <Button type="button" variant="outline" onClick={loadAccounts} className="gap-1.5">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            รีเฟรช
          </Button>
          <Button type="button" variant="outline" onClick={() => setImportOpen(true)} className="gap-1.5">
            <Upload className="w-4 h-4" />
            นำเข้ารายชื่อ รพ. ({hospitals.length})
          </Button>
          <Button
            type="button"
            onClick={openCreateModal}
            className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
          >
            <UserPlus className="w-4 h-4" />
            ลงทะเบียนลูกค้าใหม่
          </Button>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-sm font-bold text-slate-900">
            รายชื่อบัญชีลูกค้าทั้งหมด ({accounts.length} บัญชี)
          </div>
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 z-10" />
            <Input
              type="search"
              autoComplete="off"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหาชื่อโรงพยาบาล หรือ Username..."
              className="pl-9 pr-3"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-14 text-center text-sm text-slate-500">
            <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
            กำลังโหลดข้อมูลบัญชีลูกค้า...
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-14 text-center space-y-3">
            <p className="text-sm text-slate-400">ไม่พบบัญชีลูกค้าที่ตรงกับคำค้นหา</p>
            {accounts.length === 0 && (
              <Button type="button" onClick={openCreateModal} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                <UserPlus className="w-4 h-4" />
                ลงทะเบียนลูกค้าคนแรก
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500">
                <tr>
                  <th className="text-left py-3 px-4">Username</th>
                  <th className="text-left py-3 px-4">โรงพยาบาล / หน่วยงาน</th>
                  <th className="text-left py-3 px-4">สถานะ</th>
                  <th className="text-right py-3 px-4">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((acc) => (
                  <tr key={acc.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{acc.username}</td>
                    <td className="py-3.5 px-4">
                      {acc.org_name ? (
                        <span className="inline-flex items-center gap-1.5 font-medium text-slate-800">
                          <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
                          {acc.org_name}
                        </span>
                      ) : (
                        <span className="text-amber-600 text-xs font-medium">
                          ยังไม่ระบุชื่อโรงพยาบาล (กดแก้ไขเพื่อผูกชื่อ รพ.)
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                          acc.is_active
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-slate-100 text-slate-500 border-slate-200"
                        }`}
                      >
                        {acc.is_active ? "ใช้งานอยู่" : "ปิดใช้งาน"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => openEditModal(acc)}
                          className="gap-1.5"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          แก้ไข
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={saving}
                          onClick={() => toggleActive(acc)}
                          className={
                            acc.is_active
                              ? "text-rose-600 hover:bg-rose-50 border-rose-200"
                              : "text-emerald-700 hover:bg-emerald-50 border-emerald-200"
                          }
                        >
                          {acc.is_active ? "ปิดใช้งาน" : "เปิดใช้งาน"}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      <Modal
        isOpen={modalMode !== null}
        onClose={closeModal}
        title={
          savedCredentials
            ? "บันทึกข้อมูลบัญชีลูกค้าสำเร็จ"
            : modalMode === "create"
            ? "ลงทะเบียนลูกค้าใหม่"
            : `แก้ไขบัญชี: ${modalMode?.username || ""}`
        }
        maxWidth="lg"
        footer={
          savedCredentials ? (
            <>
              <Button type="button" variant="outline" onClick={copyCredentials} className="rounded-xl px-5 h-10 text-sm font-medium gap-1.5 cursor-pointer">
                <Copy className="w-4 h-4" />
                คัดลอกข้อมูลส่งลูกค้า
              </Button>
              <Button type="button" onClick={closeModal} className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-6 h-10 text-sm font-semibold shadow-sm shadow-blue-600/20 cursor-pointer">
                เสร็จสิ้น
              </Button>
            </>
          ) : (
            <>
              <Button type="button" variant="outline" onClick={closeModal} disabled={saving} className="rounded-xl px-5 h-10 text-sm font-medium cursor-pointer">
                ยกเลิก
              </Button>
              <Button
                type="submit"
                form="helpdesk-customer-form"
                disabled={saving}
                className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-6 h-10 text-sm font-semibold shadow-sm shadow-blue-600/20 gap-2 cursor-pointer"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {modalMode === "create" ? "ลงทะเบียนลูกค้า" : "บันทึกการแก้ไข"}
              </Button>
            </>
          )
        }
      >
        {savedCredentials ? (
          <div className="space-y-4 py-1">
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-sm text-emerald-950 space-y-1">
                <div className="font-bold">พร้อมส่งให้ลูกค้าเข้าสู่ระบบแจ้งซ่อมแล้ว</div>
                <div>โรงพยาบาล: <strong>{savedCredentials.org_name}</strong></div>
                <div>Username: <strong className="font-mono">{savedCredentials.username}</strong></div>
                <div>Password: <strong className="font-mono">{savedCredentials.password}</strong></div>
              </div>
            </div>
          </div>
        ) : (
          <form id="helpdesk-customer-form" onSubmit={handleSubmit} autoComplete="off" className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                ชื่อโรงพยาบาล / หน่วยงาน <span className="text-rose-500">*</span>
              </label>
              <HospitalCombobox
                required
                value={formOrgName}
                onChange={setFormOrgName}
                hospitals={hospitals}
                onCreateHospital={(name) => {
                  if (!hospitals.some((h) => h.toLowerCase() === name.toLowerCase())) {
                    setHospitals((prev) => [...prev, name].sort((a, b) => a.localeCompare(b)));
                  }
                }}
                placeholder="เลือกจากรายการ หรือพิมพ์ชื่อโรงพยาบาลใหม่..."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                ชื่อผู้ใช้งาน (Username) <span className="text-rose-500">*</span>
              </label>
              <Input
                type="text"
                name="helpdesk_customer_username"
                autoComplete="off"
                required
                minLength={3}
                disabled={modalMode !== "create"}
                value={formUsername}
                onChange={(e) => setFormUsername(e.target.value)}
                placeholder="ภาษาอังกฤษหรือตัวเลข อย่างน้อย 3 ตัว เช่น hosp_a"
                className="h-11 px-3.5 font-mono disabled:bg-slate-100 disabled:text-slate-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {modalMode === "create" ? (
                  <>
                    รหัสผ่าน (อย่างน้อย 8 ตัวอักษร) <span className="text-rose-500 font-bold">*</span>
                  </>
                ) : (
                  "ตั้งรหัสผ่านใหม่ (เว้นว่างไว้หากไม่ต้องการเปลี่ยน)"
                )}
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    type={showPassword ? "text" : "password"}
                    name="helpdesk_customer_password"
                    autoComplete="new-password"
                    required={modalMode === "create"}
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    placeholder={modalMode === "create" ? "อย่างน้อย 8 ตัวอักษร" : "กรอกเฉพาะเมื่อต้องการเปลี่ยนรหัสผ่าน"}
                    className="h-11 pl-3.5 pr-10 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    aria-label="แสดง/ซ่อนรหัสผ่าน"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <Button type="button" variant="outline" onClick={generatePassword} className="shrink-0">
                  สุ่มรหัสผ่าน
                </Button>
              </div>
            </div>

            {modalMode !== "create" && (
              <label className="flex items-center gap-2.5 text-sm text-slate-700 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={formActive}
                  onChange={(e) => setFormActive(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300"
                />
                เปิดใช้งานบัญชีนี้
              </label>
            )}
          </form>
        )}
      </Modal>

      {/* Import Hospitals Modal */}
      <Modal
        isOpen={importOpen}
        onClose={() => setImportOpen(false)}
        title="นำเข้ารายชื่อโรงพยาบาล (Import)"
        maxWidth="lg"
        footer={
          <>
            <Button type="button" variant="outline" onClick={() => setImportOpen(false)} disabled={importing} className="rounded-xl px-5 h-10 text-sm font-medium cursor-pointer">
              ยกเลิก
            </Button>
            <Button
              type="button"
              disabled={importing || parsedImportNames.length === 0}
              onClick={handleImportHospitals}
              className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-6 h-10 text-sm font-semibold shadow-sm shadow-blue-600/20 gap-2 cursor-pointer"
            >
              {importing && <Loader2 className="w-4 h-4 animate-spin" />}
              นำเข้า {parsedImportNames.length} รายชื่อ
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5 text-xs text-slate-600 space-y-1">
            <div className="font-semibold text-slate-800">วิธีนำเข้าข้อมูลโรงพยาบาล</div>
            <div>1. เลือกไฟล์ <code className="font-mono">.csv</code> หรือ <code className="font-mono">.txt</code> (1 โรงพยาบาลต่อ 1 บรรทัด)</div>
            <div>2. หรือคัดลอกรายชื่อจาก Excel / Google Sheets มาวางในช่องด้านล่างได้ทันที</div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              อัปโหลดไฟล์ CSV / TXT
            </label>
            <input
              type="file"
              accept=".csv,.txt"
              onChange={handleImportFile}
              className="block w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                รายชื่อโรงพยาบาล (1 บรรทัด = 1 โรงพยาบาล)
              </label>
              <span className="text-xs font-semibold text-blue-600">
                พบ {parsedImportNames.length} รายชื่อ
              </span>
            </div>
            <Textarea
              rows={8}
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder={"โรงพยาบาล...\nโรงพยาบาล...\nโรงพยาบาล..."}
              className="p-3"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
