"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { Building2, CheckCircle2, Loader2, Pencil, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { toast } from "@/components/ui/toast";

interface Customer {
  customerId: number;
  customerName: string;
  isActive: boolean;
  createdAt: string;
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Customer | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");

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
    setModalOpen(true);
  };

  const openEdit = (customer: Customer) => {
    setEditing(customer);
    setCustomerName(customer.customerName);
    setModalOpen(true);
  };

  const submitCustomer = async (event: FormEvent) => {
    event.preventDefault();
    const name = customerName.trim();
    if (!name || saving) return;
    setSaving(true);
    try {
      const response = await fetch("/api/admin/customers", {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          editing
            ? { customerId: editing.customerId, customerName: name }
            : { customerName: name }
        ),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error || "บันทึกข้อมูลไม่สำเร็จ");
      setCustomers(result.data || []);
      setModalOpen(false);
      toast.success(editing ? "แก้ไขชื่อลูกค้าเรียบร้อยแล้ว" : "เพิ่มลูกค้าเรียบร้อยแล้ว");
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
        <Button type="button" onClick={openCreate} className="gap-2 bg-blue-600 text-white hover:bg-blue-700">
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
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin text-blue-600" /> กำลังโหลดข้อมูล...
          </div>
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
                  <th className="px-4 py-3 text-right">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCustomers.map((customer) => (
                  <tr key={customer.customerId} className="hover:bg-slate-50/70">
                    <td className="px-4 py-3.5 font-mono text-xs text-slate-500">{customer.customerId}</td>
                    <td className="px-4 py-3.5 font-medium text-slate-900">
                      <span className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 shrink-0 text-blue-600" />
                        {customer.customerName}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${customer.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                        {customer.isActive ? "ใช้งาน" : "ปิดใช้งาน"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" size="sm" onClick={() => openEdit(customer)} className="gap-1.5">
                          <Pencil className="h-3.5 w-3.5" /> แก้ไข
                        </Button>
                        <Button type="button" variant="outline" size="sm" onClick={() => toggleActive(customer)} disabled={saving}>
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
        title={editing ? "แก้ไขชื่อลูกค้า" : "เพิ่มโรงพยาบาล"}
        maxWidth="md"
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
              disabled={saving || !customerName.trim()}
              className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-6 h-10 text-sm font-semibold shadow-sm shadow-blue-600/20 cursor-pointer flex items-center gap-2"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              บันทึกข้อมูล
            </Button>
          </>
        }
      >
        <form id="customer-form" onSubmit={submitCustomer} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">
              ชื่อโรงพยาบาล <span className="text-rose-500">*</span>
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
        </form>
      </Modal>
    </div>
  );
}
