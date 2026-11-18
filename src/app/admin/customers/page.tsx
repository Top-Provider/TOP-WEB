"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { Building2, CheckCircle2, Loader2, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/ui/image-upload";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { toast } from "@/components/ui/toast";
import { AdminLoadingState } from "@/components/admin/admin-loading-state";

interface Customer {
  customerId: number;
  customerName: string;
  logoUrl?: string | null;
  isActive: boolean;
  createdAt: string;
}

interface CustomerDraft {
  key: number;
  customerName: string;
  logoUrl: string;
}

let nextDraftKey = 1;
const createEmptyDraft = (): CustomerDraft => ({
  key: nextDraftKey++,
  customerName: "",
  logoUrl: "",
});

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Customer | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [drafts, setDrafts] = useState<CustomerDraft[]>([createEmptyDraft()]);

  const loadCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/customers", { cache: "no-store" });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error || "โหลดข้อมูลลูกค้าไม่สำเร็จ");
      setCustomers(result.data || []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "โหลดข้อมูลลูกค้าไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const filteredCustomers = useMemo(() => {
    const keyword = search.trim().toLocaleLowerCase("th");
    if (!keyword) return customers;
    return customers.filter((customer) =>
      customer.customerName.toLocaleLowerCase("th").includes(keyword)
    );
  }, [customers, search]);

  const openCreate = () => {
    setEditing(null);
    setCustomerName("");
    setLogoUrl("");
    setDrafts([createEmptyDraft()]);
    setModalOpen(true);
  };

  const openEdit = (customer: Customer) => {
    setEditing(customer);
    setCustomerName(customer.customerName);
    setLogoUrl(customer.logoUrl || "");
    setModalOpen(true);
  };

  const validDrafts = useMemo(
    () => drafts.filter((d) => d.customerName.trim().length > 0),
    [drafts]
  );

  const submitCustomer = async (event: FormEvent) => {
    event.preventDefault();
    if (saving) return;

    if (editing) {
      const name = customerName.trim();
      if (!name) return;
      setSaving(true);
      try {
        const normalizedLogo = logoUrl.trim() || null;
        const response = await fetch("/api/admin/customers", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customerId: editing.customerId,
            customerName: name,
            logoUrl: normalizedLogo,
          }),
        });
        const result = await response.json();
        if (!response.ok || !result.success) throw new Error(result.error || "บันทึกข้อมูลไม่สำเร็จ");
        setCustomers(result.data || []);
        setModalOpen(false);
        toast.success("แก้ไขข้อมูลลูกค้าเรียบร้อยแล้ว");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "บันทึกข้อมูลไม่สำเร็จ");
      } finally {
        setSaving(false);
      }
      return;
    }

    if (validDrafts.length === 0) return;
    setSaving(true);
    try {
      const response = await fetch("/api/admin/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: validDrafts.map((d) => ({
            customerName: d.customerName.trim(),
            logoUrl: d.logoUrl.trim() || null,
          })),
        }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error || "บันทึกข้อมูลไม่สำเร็จ");
      setCustomers(result.data || []);
      setModalOpen(false);
      const inserted = Number(result.insertedCount ?? validDrafts.length);
      const skipped = Number(result.skippedCount ?? 0);
      toast.success(
        skipped > 0
          ? `เพิ่มลูกค้าใหม่ ${inserted} แห่ง (ข้ามรายการซ้ำ ${skipped} แห่ง)`
          : `เพิ่มลูกค้าเรียบร้อยแล้ว ${inserted} แห่ง`
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "บันทึกข้อมูลไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (customer: Customer) => {
    if (saving) return;
    setSaving(true);
    try {
      const response = await fetch("/api/admin/customers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: customer.customerId,
          isActive: !customer.isActive,
        }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error || "เปลี่ยนสถานะไม่สำเร็จ");
      setCustomers(result.data || []);
      toast.success(customer.isActive ? "ปิดใช้งานลูกค้าแล้ว" : "เปิดใช้งานลูกค้าแล้ว");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "เปลี่ยนสถานะไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Master ลูกค้า</h1>
          <p className="mt-1 text-sm text-slate-500">
            จัดการรายชื่อโรงพยาบาลสำหรับเลือกใช้ในกิจกรรมและระบบ Helpdesk
          </p>
        </div>
        <Button
          type="button"
          onClick={openCreate}
          className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white h-10 px-5 text-sm font-semibold shadow-sm shadow-blue-600/20 gap-2 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          เพิ่มโรงพยาบาล
        </Button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-semibold text-slate-800">ลูกค้าทั้งหมด {customers.length} รายการ</p>
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="ค้นหาชื่อโรงพยาบาล..."
              className="pl-9"
            />
          </div>
        </div>

        {loading ? (
          <AdminLoadingState label="กำลังโหลดข้อมูลลูกค้า..." />
        ) : filteredCustomers.length === 0 ? (
          <div className="py-16 text-center text-sm text-slate-400">ไม่พบรายชื่อลูกค้า</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500">
                <tr>
                  <th className="px-4 py-3 text-left">Customer ID</th>
                  <th className="px-4 py-3 text-left">ชื่อโรงพยาบาล</th>
                  <th className="px-4 py-3 text-left">สถานะ</th>
                  <th className="px-4 py-3 text-right sticky right-0 z-10 bg-slate-50 border-l border-slate-200/70 whitespace-nowrap">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCustomers.map((customer) => (
                  <tr key={customer.customerId} className="hover:bg-slate-50/70">
                    <td className="px-4 py-3.5 font-mono text-xs text-slate-500">{customer.customerId}</td>
                    <td className="px-4 py-3.5 font-medium text-slate-900">
                      <span className="flex items-center gap-2.5">
                        {customer.logoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={customer.logoUrl}
                            alt={customer.customerName}
                            className="h-8 w-8 rounded-lg object-contain border border-slate-200 bg-white p-0.5 shrink-0"
                          />
                        ) : (
                          <span className="h-8 w-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                            <Building2 className="h-4 w-4 text-blue-600" />
                          </span>
                        )}
                        <span>{customer.customerName}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${customer.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                        {customer.isActive ? "ใช้งาน" : "ปิดใช้งาน"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 sticky right-0 z-10 bg-white border-l border-slate-100">
                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" size="sm" onClick={() => openEdit(customer)} className="gap-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200">
                          <Pencil className="h-3.5 w-3.5" /> แก้ไข
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => toggleActive(customer)}
                          disabled={saving}
                          className={
                            customer.isActive
                              ? "bg-rose-50 text-rose-600 hover:bg-rose-100 border-rose-200"
                              : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200"
                          }
                        >
                          {customer.isActive ? "ปิดใช้งาน" : "เปิดใช้งาน"}
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

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "แก้ไขข้อมูลลูกค้า" : "เพิ่มโรงพยาบาล (เพิ่มได้หลายรายการ)"}
        maxWidth={editing ? "md" : "2xl"}
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              onClick={() => setModalOpen(false)}
              disabled={saving}
              className="rounded-xl px-5 h-10 text-sm font-medium cursor-pointer"
            >
              ยกเลิก
            </Button>
            <Button
              type="submit"
              form="customer-form"
              disabled={saving || (editing ? !customerName.trim() : validDrafts.length === 0)}
              className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-6 h-10 text-sm font-semibold shadow-sm shadow-blue-600/20 cursor-pointer flex items-center gap-2"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              {editing
                ? "บันทึกข้อมูล"
                : `บันทึกทั้งหมด (${validDrafts.length} แห่ง)`}
            </Button>
          </>
        }
      >
        <form id="customer-form" onSubmit={submitCustomer} className="space-y-4">
          {editing ? (
            <>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                  ชื่อโรงพยาบาล <span className="text-rose-500 font-bold">*</span>
                </label>
                <Input
                  autoFocus
                  required
                  maxLength={300}
                  value={customerName}
                  onChange={(event) => setCustomerName(event.target.value)}
                  placeholder="เช่น โรงพยาบาลตัวอย่าง"
                />
              </div>

              <ImageUpload
                value={logoUrl}
                onChange={setLogoUrl}
                label="โลโก้ / ไอคอนโรงพยาบาล (Hospital Logo)"
                description="อัปโหลดไฟล์ PNG, JPG, WebP, SVG หรือวาง URL รูปภาพ เพื่อแสดงบนหน้าแรก"
              />
            </>
          ) : (
            <div className="space-y-4">
              {drafts.map((draft, idx) => (
                <div
                  key={draft.key}
                  className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 space-y-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-blue-700">
                      โรงพยาบาลที่ {idx + 1}
                    </span>
                    {drafts.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          setDrafts((prev) => prev.filter((item) => item.key !== draft.key))
                        }
                        className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        ลบรายการนี้
                      </button>
                    )}
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                      ชื่อโรงพยาบาล <span className="text-rose-500 font-bold">*</span>
                    </label>
                    <Input
                      autoFocus={idx === 0}
                      maxLength={300}
                      value={draft.customerName}
                      onChange={(event) =>
                        setDrafts((prev) =>
                          prev.map((item) =>
                            item.key === draft.key
                              ? { ...item, customerName: event.target.value }
                              : item
                          )
                        )
                      }
                      placeholder="เช่น โรงพยาบาลตัวอย่าง"
                      className="bg-white"
                    />
                  </div>

                  <ImageUpload
                    value={draft.logoUrl}
                    onChange={(val) =>
                      setDrafts((prev) =>
                        prev.map((item) =>
                          item.key === draft.key ? { ...item, logoUrl: val } : item
                        )
                      )
                    }
                    label="โลโก้ / ไอคอนโรงพยาบาล (ไม่บังคับ)"
                    description="อัปโหลดไฟล์ PNG, JPG, WebP, SVG หรือวาง URL รูปภาพ"
                  />
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={() => setDrafts((prev) => [...prev, createEmptyDraft()])}
                className="w-full rounded-xl border-dashed border-blue-300 text-blue-600 hover:bg-blue-50/70 gap-2 h-11 font-semibold cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                เพิ่มรายการโรงพยาบาล
              </Button>
            </div>
          )}
        </form>
      </Modal>
    </div>
  );
}
