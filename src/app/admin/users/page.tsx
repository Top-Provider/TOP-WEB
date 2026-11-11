"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Users,
  UserPlus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Briefcase,
  Mail,
  Phone,
  Building,
  Upload,
  User,
  ShieldCheck,
  RefreshCw,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { toast } from "@/components/ui/toast";
import { fetchRecords, saveRecord } from "@/lib/crud";

export interface UserItem {
  id?: number | string;
  prefix_th: string;
  first_name_th: string;
  last_name_th: string;
  position: string;
  prefix_en: string;
  first_name_en: string;
  last_name_en: string;
  email?: string;
  phone?: string;
  avatar_url?: string;
  department?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

const PREFIX_TH_OPTIONS = [
  "นาย",
  "นาง",
  "นางสาว",
  "นพ.",
  "พญ.",
  "ทพ.",
  "ทพญ.",
  "ภก.",
  "ภญ.",
  "ดร.",
  "ศ.ดร.",
  "รศ.ดร.",
  "ผศ.ดร.",
  "อาจารย์",
];

const PREFIX_EN_OPTIONS = [
  "Mr.",
  "Mrs.",
  "Ms.",
  "Dr.",
  "MD",
  "Prof.",
  "Assoc. Prof.",
  "Asst. Prof.",
];

const DEFAULT_FORM: UserItem = {
  prefix_th: "นาย",
  first_name_th: "",
  last_name_th: "",
  position: "",
  prefix_en: "Mr.",
  first_name_en: "",
  last_name_en: "",
  email: "",
  phone: "",
  avatar_url: "",
  department: "",
  is_active: true,
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | string | null>(null);
  const [formData, setFormData] = useState<UserItem>(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | string | null>(null);
  const [viewUser, setViewUser] = useState<UserItem | null>(null);

  // โหลดข้อมูลบุคลากรจาก TB_USERS
  const loadData = async () => {
    setLoading(true);
    try {
      const records = await fetchRecords<UserItem>({
        table: "TB_USERS",
        orderBy: "id",
        orderDir: "asc",
      });
      if (Array.isArray(records)) {
        setUsers(records);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[Load Users Error]:", msg);
      toast.error(`ไม่สามารถโหลดข้อมูลบุคลากรได้: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter & Search
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "active"
          ? u.is_active
          : !u.is_active;

      if (!matchesStatus) return false;

      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      const fullNameTh = `${u.prefix_th || ""} ${u.first_name_th || ""} ${u.last_name_th || ""}`.toLowerCase();
      const fullNameEn = `${u.prefix_en || ""} ${u.first_name_en || ""} ${u.last_name_en || ""}`.toLowerCase();
      const pos = (u.position || "").toLowerCase();
      const dept = (u.department || "").toLowerCase();
      const mail = (u.email || "").toLowerCase();
      const tel = (u.phone || "").toLowerCase();

      return (
        fullNameTh.includes(term) ||
        fullNameEn.includes(term) ||
        pos.includes(term) ||
        dept.includes(term) ||
        mail.includes(term) ||
        tel.includes(term)
      );
    });
  }, [users, searchTerm, statusFilter]);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData(DEFAULT_FORM);
    setShowModal(true);
  };

  const handleOpenEdit = (user: UserItem) => {
    setEditingId(user.id || null);
    setFormData({
      prefix_th: user.prefix_th || "นาย",
      first_name_th: user.first_name_th || "",
      last_name_th: user.last_name_th || "",
      position: user.position || "",
      prefix_en: user.prefix_en || "Mr.",
      first_name_en: user.first_name_en || "",
      last_name_en: user.last_name_en || "",
      email: user.email || "",
      phone: user.phone || "",
      avatar_url: user.avatar_url || "",
      department: user.department || "",
      is_active: user.is_active ?? true,
    });
    setShowModal(true);
  };

  // Image Upload helper (แปลงเป็น Base64)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("ขนาดไฟล์รูปภาพต้องไม่เกิน 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setFormData((prev) => ({ ...prev, avatar_url: base64 }));
    };
    reader.readAsDataURL(file);
  };

  // บันทึกข้อมูล
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.first_name_th.trim() || !formData.last_name_th.trim()) {
      toast.error("กรุณากรอกชื่อและนามสกุลภาษาไทย");
      return;
    }
    if (!formData.position.trim()) {
      toast.error("กรุณาระบุตำแหน่งงาน");
      return;
    }

    setSaving(true);
    try {
      const payloadData: Record<string, unknown> = {
        prefix_th: formData.prefix_th.trim(),
        first_name_th: formData.first_name_th.trim(),
        last_name_th: formData.last_name_th.trim(),
        position: formData.position.trim(),
        prefix_en: formData.prefix_en.trim(),
        first_name_en: formData.first_name_en.trim(),
        last_name_en: formData.last_name_en.trim(),
        email: formData.email?.trim() || null,
        phone: formData.phone?.trim() || null,
        avatar_url: formData.avatar_url || null,
        department: formData.department?.trim() || null,
        is_active: formData.is_active,
      };

      if (editingId) {
        await saveRecord({
          table: "TB_USERS",
          action: "update",
          id: editingId,
          data: payloadData,
        });
        toast.success("แก้ไขข้อมูลบุคลากรเรียบร้อยแล้ว");
      } else {
        await saveRecord({
          table: "TB_USERS",
          action: "insert",
          data: payloadData,
        });
        toast.success("เพิ่มข้อมูลบุคลากรใหม่เรียบร้อยแล้ว");
      }

      setShowModal(false);
      await loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(`บันทึกไม่สำเร็จ: ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  // สลับสถานะ Active
  const handleToggleStatus = async (user: UserItem) => {
    if (!user.id) return;
    try {
      await saveRecord({
        table: "TB_USERS",
        action: "update",
        id: user.id,
        data: { is_active: !user.is_active },
      });
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, is_active: !u.is_active } : u))
      );
      toast.success(
        `เปลี่ยนสถานะเป็น ${!user.is_active ? "กำลังปฏิบัติงาน" : "ปิดการใช้งาน"} เรียบร้อย`
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(`ไม่สามารถเปลี่ยนสถานะได้: ${msg}`);
    }
  };

  // ลบข้อมูล
  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    setSaving(true);
    try {
      await saveRecord({
        table: "TB_USERS",
        action: "delete",
        id: deleteConfirmId,
      });
      toast.success("ลบข้อมูลบุคลากรเรียบร้อยแล้ว");
      setDeleteConfirmId(null);
      await loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(`ไม่สามารถลบข้อมูลได้: ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  const activeCount = users.filter((u) => u.is_active).length;
  const inactiveCount = users.filter((u) => !u.is_active).length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Users className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              จัดการข้อมูลบุคลากร (TB_USERS)
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            บันทึกและจัดการรายชื่อบุคลากร คำนำหน้า ชื่อ-นามสกุล (ไทย / อังกฤษ) และตำแหน่งงาน
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={loading}
            className="rounded-xl gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            รีเฟรช
          </Button>

          <Button
            onClick={handleOpenAdd}
            className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white gap-2 shadow-sm"
          >
            <UserPlus className="w-4 h-4" />
            เพิ่มบุคลากรใหม่
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              บุคลากรทั้งหมด
            </p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{users.length} คน</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
            <Users className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-4 border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-emerald-600 uppercase tracking-wider">
              กำลังปฏิบัติงาน (Active)
            </p>
            <p className="text-2xl font-bold text-emerald-700 mt-1">{activeCount} คน</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-4 border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              ปิดการใช้งาน (Inactive)
            </p>
            <p className="text-2xl font-bold text-slate-600 mt-1">{inactiveCount} คน</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
            <XCircle className="w-5 h-5" />
          </div>
        </Card>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            placeholder="ค้นหาชื่อ, นามสกุล, ตำแหน่ง, อีเมล..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 rounded-xl text-sm"
          />
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-auto w-full sm:w-auto">
          {(["all", "active", "inactive"] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === st
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {st === "all" ? "ทั้งหมด" : st === "active" ? "ใช้งานอยู่" : "ปิดใช้งาน"}
            </button>
          ))}
        </div>
      </div>

      {/* Table List */}
      <Card className="border-slate-200/80 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-xs uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4 w-12 text-center">#</th>
                <th className="py-3.5 px-4">บุคลากร (TH / EN)</th>
                <th className="py-3.5 px-4">ตำแหน่ง / แผนก</th>
                <th className="py-3.5 px-4">ข้อมูลติดต่อ</th>
                <th className="py-3.5 px-4 text-center">สถานะ</th>
                <th className="py-3.5 px-4 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
                      <span>กำลังโหลดข้อมูลบุคลากร...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Users className="w-8 h-8 text-slate-300" />
                      <p className="font-medium text-slate-600">ไม่พบข้อมูลบุคลากร</p>
                      <p className="text-xs text-slate-400">
                        {searchTerm
                          ? "ลองเปลี่ยนคำค้นหา หรือกดล้างตัวกรอง"
                          : "กดปุ่ม 'เพิ่มบุคลากรใหม่' เพื่อเริ่มต้นบันทึกข้อมูล"}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user, idx) => {
                  const fullNameTh = `${user.prefix_th || ""} ${user.first_name_th} ${user.last_name_th}`.trim();
                  const fullNameEn = `${user.prefix_en || ""} ${user.first_name_en || ""} ${user.last_name_en || ""}`.trim();
                  const initials = (user.first_name_th || "U").charAt(0);

                  return (
                    <tr
                      key={user.id || idx}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      <td className="py-3.5 px-4 text-center text-xs text-slate-400 font-mono">
                        {idx + 1}
                      </td>

                      {/* Name & Avatar */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          {user.avatar_url ? (
                            <img
                              src={user.avatar_url}
                              alt={fullNameTh}
                              className="w-10 h-10 rounded-full object-cover border border-slate-200 flex-shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center border border-blue-200 flex-shrink-0">
                              {initials}
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-slate-900 leading-tight">
                              {fullNameTh}
                            </p>
                            {fullNameEn && (
                              <p className="text-xs text-slate-400 mt-0.5 font-normal">
                                {fullNameEn}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Position & Department */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-slate-800 font-medium">
                          <Briefcase className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <span>{user.position}</span>
                        </div>
                        {user.department && (
                          <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                            <Building className="w-3 h-3 text-slate-400" />
                            <span>{user.department}</span>
                          </div>
                        )}
                      </td>

                      {/* Contact */}
                      <td className="py-3.5 px-4 text-xs text-slate-600 space-y-0.5">
                        {user.email ? (
                          <div className="flex items-center gap-1.5">
                            <Mail className="w-3 h-3 text-slate-400" />
                            <a
                              href={`mailto:${user.email}`}
                              className="hover:text-blue-600 hover:underline"
                            >
                              {user.email}
                            </a>
                          </div>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                        {user.phone && (
                          <div className="flex items-center gap-1.5 text-slate-500">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{user.phone}</span>
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(user)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
                            user.is_active
                              ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                              : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                          }`}
                          title="คลิกเพื่อสลับสถานะ"
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              user.is_active ? "bg-emerald-500" : "bg-slate-400"
                            }`}
                          />
                          {user.is_active ? "ปฏิบัติงาน" : "ปิดใช้งาน"}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setViewUser(user)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="ดูข้อมูลแบบเต็ม"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(user)}
                            className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            title="แก้ไขข้อมูล"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(user.id || null)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="ลบข้อมูล"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ========================================================================= */}
      {/* Modal: เพิ่ม / แก้ไข ข้อมูลบุคลากร */}
      {/* ========================================================================= */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingId ? "แก้ไขข้อมูลบุคลากร" : "เพิ่มข้อมูลบุคลากรใหม่"}
        description="กรอกข้อมูลบุคลากร คำนำหน้า ชื่อ-นามสกุล (ไทย/อังกฤษ) และตำแหน่งงาน"
        maxWidth="2xl"
      >
        <form onSubmit={handleSave} className="space-y-6 py-2">
          {/* ส่วนที่ 1: ข้อมูลภาษาไทย */}
          <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 space-y-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-blue-600" />
              1. ข้อมูลภาษาไทย (Thai Information)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              {/* คำนำหน้า TH */}
              <div className="sm:col-span-1">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  คำนำหน้า (TH)
                </label>
                <div className="relative">
                  <input
                    list="prefix_th_list"
                    type="text"
                    value={formData.prefix_th}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, prefix_th: e.target.value }))
                    }
                    placeholder="เช่น นาย, นพ."
                    className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <datalist id="prefix_th_list">
                    {PREFIX_TH_OPTIONS.map((opt) => (
                      <option key={opt} value={opt} />
                    ))}
                  </datalist>
                </div>
              </div>

              {/* ชื่อ TH */}
              <div className="sm:col-span-1.5 sm:col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  ชื่อ (TH) <span className="text-red-500">*</span>
                </label>
                <Input
                  required
                  placeholder="เช่น สมชาย"
                  value={formData.first_name_th}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, first_name_th: e.target.value }))
                  }
                  className="bg-white"
                />
              </div>

              {/* นามสกุล TH */}
              <div className="sm:col-span-1.5 sm:col-span-1">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  นามสกุล (TH) <span className="text-red-500">*</span>
                </label>
                <Input
                  required
                  placeholder="เช่น ใจดี"
                  value={formData.last_name_th}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, last_name_th: e.target.value }))
                  }
                  className="bg-white"
                />
              </div>
            </div>
          </div>

          {/* ส่วนที่ 2: ข้อมูลภาษาอังกฤษ */}
          <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 space-y-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-indigo-600" />
              2. ข้อมูลภาษาอังกฤษ (English Information)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              {/* คำนำหน้า EN */}
              <div className="sm:col-span-1">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  คำนำหน้า (EN)
                </label>
                <div className="relative">
                  <input
                    list="prefix_en_list"
                    type="text"
                    value={formData.prefix_en}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, prefix_en: e.target.value }))
                    }
                    placeholder="เช่น Mr., Dr."
                    className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <datalist id="prefix_en_list">
                    {PREFIX_EN_OPTIONS.map((opt) => (
                      <option key={opt} value={opt} />
                    ))}
                  </datalist>
                </div>
              </div>

              {/* ชื่อ EN */}
              <div className="sm:col-span-1.5 sm:col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  ชื่อ (EN)
                </label>
                <Input
                  placeholder="e.g. Somchai"
                  value={formData.first_name_en}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, first_name_en: e.target.value }))
                  }
                  className="bg-white"
                />
              </div>

              {/* นามสกุล EN */}
              <div className="sm:col-span-1.5 sm:col-span-1">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  นามสกุล (EN)
                </label>
                <Input
                  placeholder="e.g. Jaidee"
                  value={formData.last_name_en}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, last_name_en: e.target.value }))
                  }
                  className="bg-white"
                />
              </div>
            </div>
          </div>

          {/* ส่วนที่ 3: ตำแหน่งและสังกัด */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                ตำแหน่งงาน <span className="text-red-500">*</span>
              </label>
              <Input
                required
                placeholder="เช่น ผู้จัดการทั่วไป, เภสัชกรชำนาญการ"
                value={formData.position}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, position: e.target.value }))
                }
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                แผนก / หน่วยงาน
              </label>
              <Input
                placeholder="เช่น ฝ่ายสารสนเทศทางการแพทย์, แผนกจัดซื้อ"
                value={formData.department}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, department: e.target.value }))
                }
              />
            </div>
          </div>

          {/* ส่วนที่ 4: ข้อมูลติดต่อ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                อีเมล (Email)
              </label>
              <Input
                type="email"
                placeholder="name@topprovider.co.th"
                value={formData.email}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, email: e.target.value }))
                }
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                เบอร์โทรศัพท์ (Phone)
              </label>
              <Input
                type="tel"
                placeholder="02-xxx-xxxx หรือ 08x-xxx-xxxx"
                value={formData.phone}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, phone: e.target.value }))
                }
              />
            </div>
          </div>

          {/* ส่วนที่ 5: รูปโปรไฟล์ */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              รูปภาพประจำตัว (Avatar)
            </label>
            <div className="flex items-center gap-4">
              {formData.avatar_url ? (
                <div className="relative group">
                  <img
                    src={formData.avatar_url}
                    alt="Preview"
                    className="w-16 h-16 rounded-full object-cover border border-slate-300"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData((p) => ({ ...p, avatar_url: "" }))}
                    className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full p-1 text-xs hover:bg-red-700 shadow"
                    title="ลบรูป"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="w-16 h-16 rounded-full bg-slate-100 border border-dashed border-slate-300 flex items-center justify-center text-slate-400">
                  <User className="w-6 h-6" />
                </div>
              )}

              <div className="flex-1 space-y-1.5">
                <label className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium cursor-pointer transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  อัปโหลดรูปภาพ
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-slate-400">
                  รองรับไฟล์ PNG, JPG หรือ WebP ขนาดไม่เกิน 2MB
                </p>
              </div>
            </div>
          </div>

          {/* ส่วนที่ 6: สถานะการใช้งาน */}
          <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-900">
                สถานะการปฏิบัติงาน (Active Status)
              </p>
              <p className="text-xs text-slate-400">
                หากปิดการใช้งาน รายชื่อนี้จะไม่แสดงผลในส่วนหน้าเว็บ
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, is_active: e.target.checked }))
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowModal(false)}
              disabled={saving}
              className="rounded-xl"
            >
              ยกเลิก
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]"
            >
              {saving ? "กำลังบันทึก..." : editingId ? "บันทึกการแก้ไข" : "เพิ่มบุคลากร"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* Modal: View Full Details */}
      {/* ========================================================================= */}
      {viewUser && (
        <Modal
          isOpen={!!viewUser}
          onClose={() => setViewUser(null)}
          title="รายละเอียดบุคลากร"
          maxWidth="md"
        >
          <div className="py-4 space-y-4 text-center">
            {viewUser.avatar_url ? (
              <img
                src={viewUser.avatar_url}
                alt={viewUser.first_name_th}
                className="w-20 h-20 rounded-full mx-auto object-cover border-2 border-blue-500 shadow"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-blue-100 text-blue-700 text-2xl font-bold flex items-center justify-center mx-auto border-2 border-blue-200">
                {(viewUser.first_name_th || "U").charAt(0)}
              </div>
            )}

            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {`${viewUser.prefix_th || ""} ${viewUser.first_name_th} ${viewUser.last_name_th}`}
              </h2>
              {viewUser.first_name_en && (
                <p className="text-sm text-slate-500">
                  {`${viewUser.prefix_en || ""} ${viewUser.first_name_en} ${viewUser.last_name_en || ""}`}
                </p>
              )}
            </div>

            <div className="inline-block px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold">
              {viewUser.position} {viewUser.department ? `• ${viewUser.department}` : ""}
            </div>

            <div className="bg-slate-50 p-4 rounded-xl text-left text-xs space-y-2 border border-slate-200/80">
              <div className="flex justify-between">
                <span className="text-slate-500">อีเมล:</span>
                <span className="font-medium text-slate-800">{viewUser.email || "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">เบอร์โทรศัพท์:</span>
                <span className="font-medium text-slate-800">{viewUser.phone || "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">สถานะ:</span>
                <span
                  className={`font-semibold ${
                    viewUser.is_active ? "text-emerald-600" : "text-slate-400"
                  }`}
                >
                  {viewUser.is_active ? "กำลังปฏิบัติงาน" : "ปิดการใช้งาน"}
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={() => setViewUser(null)}
              className="w-full rounded-xl"
            >
              ปิด
            </Button>
          </div>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* Modal: Confirm Delete */}
      {/* ========================================================================= */}
      <Modal
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        title="ยืนยันการลบข้อมูลบุคลากร"
        maxWidth="sm"
      >
        <div className="py-2 space-y-4">
          <p className="text-sm text-slate-600">
            คุณต้องการลบข้อมูลบุคลากรนี้ออกจากฐานข้อมูลใช่หรือไม่?
            การดำเนินการนี้ไม่สามารถยกเลิกได้
          </p>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteConfirmId(null)}
              disabled={saving}
              className="rounded-xl"
            >
              ยกเลิก
            </Button>
            <Button
              size="sm"
              onClick={handleDelete}
              disabled={saving}
              className="rounded-xl bg-red-600 hover:bg-red-700 text-white"
            >
              {saving ? "กำลังลบ..." : "ยืนยันลบ"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
