"use client";

import React, { useState, useEffect } from "react";
import {
  FolderTree,
  Printer,
  Package,
  Tag,
  Code,
  CheckCircle,
  Plus,
  Edit,
  Trash2,
  Loader2,
  X,
  Search,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { toast } from "@/components/ui/toast";
import { fetchRecords, saveRecord } from "@/lib/crud";

// Types
export interface MainCategory {
  id: number;
  category_id: string;
  name: string;
  is_active?: boolean;
}

export interface ProgramOption {
  id: number;
  option_type: string;
  value: string;
  label: string;
  display_order?: number;
  is_active?: boolean;
}

export type MasterDataTabId =
  | "main_categories"
  | "printer_options"
  | "supply_options"
  | "brands"
  | "software_options";

export interface TabConfigItem {
  id: MasterDataTabId;
  label: string;
  icon: React.ElementType;
}

export const MASTER_DATA_TABS: TabConfigItem[] = [
  { id: "main_categories", label: "หมวดหมู่หลัก (Main Categories)", icon: FolderTree },
  { id: "printer_options", label: "ตัวเลือกเครื่องพิมพ์ (Printers)", icon: Printer },
  { id: "supply_options", label: "ตัวเลือกวัสดุสิ้นเปลือง (Supplies)", icon: Package },
  { id: "brands", label: "แบรนด์สินค้า (Brands)", icon: Tag },
  { id: "software_options", label: "ตัวเลือกซอฟต์แวร์ (Software Options)", icon: Code },
];

const SOFTWARE_OPTION_TYPES = [
  { value: "solution_group", label: "solution_group (กลุ่มโซลูชัน)" },
  { value: "program_category", label: "program_category (หมวดหมู่โปรแกรม)" },
];

/**
 * Component หลักสำหรับจัดการข้อมูล Master Data
 */
export function MasterDataHub() {
  const [activeTab, setActiveTab] = useState<MasterDataTabId>("main_categories");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Data States
  const [mainCategories, setMainCategories] = useState<MainCategory[]>([]);
  const [programOptions, setProgramOptions] = useState<ProgramOption[]>([]);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [statusModal, setStatusModal] = useState<{
    isOpen: boolean;
    type: "success" | "error";
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: "success",
    title: "",
    message: "",
  });

  // Form State for Main Category
  const [catForm, setCatForm] = useState({
    category_id: "",
    name: "",
    is_active: true,
  });

  // Form State for Program Options
  const [optForm, setOptForm] = useState({
    option_type: "printer",
    value: "",
    label: "",
    display_order: 1,
    is_active: true,
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Fetch Main Categories
  const loadMainCategories = async () => {
    try {
      const res = await fetch("/api/admin/categories");
      const json = await res.json();
      if (json && json.success && Array.isArray(json.categories)) {
        setMainCategories(json.categories);
      } else {
        const data = await fetchRecords<MainCategory>({
          table: "TBM_PRODUCT_CATEGORIES",
          orderBy: "id",
          orderDir: "asc",
        }).catch(() => []);
        if (data && data.length > 0) setMainCategories(data);
      }
    } catch (err) {
      console.log("Categories load error:", err);
    }
  };

  // Fetch Program Options
  const loadProgramOptions = async () => {
    try {
      const data = await fetchRecords<ProgramOption>({
        table: "TBM_PROGRAM_OPTIONS",
        orderBy: "display_order",
        orderDir: "asc",
      }).catch(() => []);
      if (data && Array.isArray(data)) {
        setProgramOptions(data);
      }
    } catch (err) {
      console.log("Program options load error:", err);
    }
  };

  const refreshData = async () => {
    setIsLoading(true);
    await Promise.all([loadMainCategories(), loadProgramOptions()]);
    setIsLoading(false);
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Filter items by tab and query
  const getFilteredItems = (): (MainCategory | ProgramOption)[] => {
    const q = search.toLowerCase().trim();

    if (activeTab === "main_categories") {
      return mainCategories.filter((c) => {
        if (!q) return true;
        return c.category_id.toLowerCase().includes(q) || c.name.toLowerCase().includes(q);
      });
    }

    let targetTypes: string[] = [];
    if (activeTab === "printer_options") targetTypes = ["printer", "printer_category"];
    else if (activeTab === "supply_options") targetTypes = ["supply", "supply_category"];
    else if (activeTab === "brands") targetTypes = ["brand"];
    else if (activeTab === "software_options") targetTypes = ["solution_group", "program_category"];

    return programOptions
      .filter((o) => targetTypes.includes(o.option_type))
      .filter((o) => {
        if (!q) return true;
        return (
          o.value.toLowerCase().includes(q) ||
          o.label.toLowerCase().includes(q) ||
          o.option_type.toLowerCase().includes(q)
        );
      });
  };

  // Open Add
  const handleOpenAdd = () => {
    setEditingId(null);
    setFormErrors({});

    if (activeTab === "main_categories") {
      setCatForm({ category_id: "", name: "", is_active: true });
    } else {
      let defaultType = "printer";
      if (activeTab === "supply_options") defaultType = "supply";
      else if (activeTab === "brands") defaultType = "brand";
      else if (activeTab === "software_options") defaultType = "solution_group";

      setOptForm({
        option_type: defaultType,
        value: "",
        label: "",
        display_order: getFilteredItems().length + 1,
        is_active: true,
      });
    }

    setIsModalOpen(true);
  };

  // Open Edit
  const handleOpenEdit = (item: MainCategory | ProgramOption) => {
    setEditingId(item.id);
    setFormErrors({});

    if (activeTab === "main_categories") {
      const c = item as MainCategory;
      setCatForm({
        category_id: c.category_id,
        name: c.name,
        is_active: c.is_active !== false,
      });
    } else {
      const o = item as ProgramOption;
      setOptForm({
        option_type: o.option_type,
        value: o.value,
        label: o.label,
        display_order: o.display_order ?? 1,
        is_active: o.is_active !== false,
      });
    }

    setIsModalOpen(true);
  };

  // Save / Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      if (activeTab === "main_categories") {
        if (!catForm.category_id.trim()) {
          setFormErrors({ category_id: "กรุณาระบุ CATEGORY_ID" });
          setIsSaving(false);
          return;
        }
        if (!catForm.name.trim()) {
          setFormErrors({ name: "กรุณาระบุชื่อที่แสดงผล" });
          setIsSaving(false);
          return;
        }

        const payload = {
          category_id: catForm.category_id.trim(),
          name: catForm.name.trim(),
          is_active: catForm.is_active,
        };

        const res = await fetch("/api/admin/categories", {
          method: editingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editingId ? { id: editingId, ...payload } : payload),
        });
        const json = await res.json();
        if (!res.ok || !json.success) throw new Error(json.error || "บันทึกข้อมูลไม่สำเร็จ");

        await loadMainCategories();
        setIsModalOpen(false);
        setStatusModal({
          isOpen: true,
          type: "success",
          title: "บันทึกหมวดหมู่สำเร็จ",
          message: editingId ? "อัปเดตข้อมูลหมวดหมู่เรียบร้อยแล้ว" : "เพิ่มหมวดหมู่ใหม่เรียบร้อยแล้ว",
        });
      } else {
        if (!optForm.value.trim()) {
          setFormErrors({ value: "กรุณาระบุ Value / รหัส" });
          setIsSaving(false);
          return;
        }

        const payload = {
          option_type: optForm.option_type,
          value: optForm.value.trim(),
          label: optForm.label.trim() || optForm.value.trim(),
          display_order: Number(optForm.display_order) || 1,
          is_active: optForm.is_active,
        };

        await saveRecord({
          table: "TBM_PROGRAM_OPTIONS",
          action: editingId ? "update" : "insert",
          id: editingId || undefined,
          data: payload,
        });

        await loadProgramOptions();
        setIsModalOpen(false);
        setStatusModal({
          isOpen: true,
          type: "success",
          title: "บันทึกตัวเลือกสำเร็จ",
          message: editingId ? "อัปเดตข้อมูลตัวเลือกเรียบร้อยแล้ว" : "เพิ่มข้อมูลตัวเลือกใหม่เรียบร้อยแล้ว",
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setStatusModal({
        isOpen: true,
        type: "error",
        title: "บันทึกข้อมูลไม่สำเร็จ",
        message: msg || "เกิดข้อผิดพลาดในการบันทึกข้อมูล",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Delete
  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`ยืนยันการลบ "${name}" ?`)) return;

    try {
      if (activeTab === "main_categories") {
        const res = await fetch(`/api/admin/categories?id=${id}`, { method: "DELETE" });
        const json = await res.json();
        if (!res.ok || !json.success) throw new Error(json.error || "ลบไม่สำเร็จ");
        await loadMainCategories();
      } else {
        await saveRecord({
          table: "TBM_PROGRAM_OPTIONS",
          action: "delete",
          id,
        });
        await loadProgramOptions();
      }
      setStatusModal({
        isOpen: true,
        type: "success",
        title: "ลบรายการสำเร็จ",
        message: `ลบรายการ "${name}" ออกจากระบบเรียบร้อยแล้ว`,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setStatusModal({
        isOpen: true,
        type: "error",
        title: "ลบรายการไม่สำเร็จ",
        message: msg || "เกิดข้อผิดพลาดในการลบรายการ",
      });
    }
  };

  const filteredItems = getFilteredItems();

  return (
    <div className="space-y-6">
      {/* Header & Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            จัดการข้อมูลหลัก (Master Data Hub)
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            ศูนย์กลางจัดการหมวดหมู่หลัก ตัวเลือกสินค้า หมวดหมู่ย่อย และแบรนด์ทั้งหมดในระบบ
          </p>
        </div>

        <Button
          type="button"
          onClick={handleOpenAdd}
          className="bg-[#0066FF] hover:bg-[#0052CC] text-white rounded-xl shadow-sm text-xs font-semibold px-4 py-2.5 flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>เพิ่มข้อมูลใหม่</span>
        </Button>
      </div>

      {/* 1. Component Tabs Navigation */}
      <MasterDataTabs
        tabs={MASTER_DATA_TABS}
        activeTab={activeTab}
        onSelectTab={(tabId) => {
          setActiveTab(tabId);
          setSearch("");
        }}
      />

      {/* Search Input Bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาข้อมูล..."
            className="pl-9 pr-8 h-9 text-xs rounded-xl"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <span className="text-xs text-slate-400 font-medium">
          พบ {filteredItems.length} รายการ
        </span>
      </div>

      {/* 2. Component Data Table */}
      <MasterDataTable
        activeTab={activeTab}
        items={filteredItems}
        isLoading={isLoading}
        onEdit={handleOpenEdit}
        onDelete={handleDelete}
      />

      {/* 3. Component Form Modal */}
      <MasterDataModal
        isOpen={isModalOpen}
        activeTab={activeTab}
        editingId={editingId}
        isSaving={isSaving}
        catForm={catForm}
        setCatForm={setCatForm}
        optForm={optForm}
        setOptForm={setOptForm}
        formErrors={formErrors}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
      />

      {/* 4. Alert Status Modal */}
      <Modal
        isOpen={statusModal.isOpen}
        onClose={() => setStatusModal((prev) => ({ ...prev, isOpen: false }))}
        title={statusModal.type === "success" ? "แจ้งเตือนการทำรายการ" : "เกิดข้อผิดพลาด"}
        maxWidth="sm"
      >
        <div className="py-2 text-center space-y-4">
          <div className="flex justify-center">
            {statusModal.type === "success" ? (
              <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>
            ) : (
              <div className="w-14 h-14 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shadow-sm">
                <AlertCircle className="w-8 h-8" />
              </div>
            )}
          </div>

          <div className="space-y-1.5 px-2">
            <h3
              className={`text-base font-bold ${
                statusModal.type === "success" ? "text-slate-900" : "text-rose-700"
              }`}
            >
              {statusModal.title}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {statusModal.message}
            </p>
          </div>

          <div className="pt-2">
            <Button
              type="button"
              onClick={() => setStatusModal((prev) => ({ ...prev, isOpen: false }))}
              className={`w-full py-2.5 rounded-xl text-white text-xs font-semibold cursor-pointer ${
                statusModal.type === "success"
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "bg-slate-800 hover:bg-slate-900"
              }`}
            >
              ตกลง
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

/**
 * Component แถบนำทางแท็บ (MasterDataTabs)
 */
export function MasterDataTabs({
  tabs,
  activeTab,
  onSelectTab,
}: {
  tabs: TabConfigItem[];
  activeTab: MasterDataTabId;
  onSelectTab: (tabId: MasterDataTabId) => void;
}) {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 border-b border-slate-200/80">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onSelectTab(tab.id)}
            className={`shrink-0 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
              isActive
                ? "bg-[#0066FF] text-white shadow-sm"
                : "bg-white text-slate-600 hover:text-blue-600 hover:bg-slate-50 border border-slate-200/80"
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/**
 * Component แสดงตารางข้อมูล (MasterDataTable)
 */
export function MasterDataTable({
  activeTab,
  items,
  isLoading,
  onEdit,
  onDelete,
}: {
  activeTab: MasterDataTabId;
  items: (MainCategory | ProgramOption)[];
  isLoading: boolean;
  onEdit: (item: MainCategory | ProgramOption) => void;
  onDelete: (id: number, name: string) => void;
}) {
  const isMain = activeTab === "main_categories";

  return (
    <Card className="rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
            <tr>
              <th className="py-3.5 px-4 w-16">ID</th>
              {isMain ? (
                <>
                  <th className="py-3.5 px-4">CATEGORY_ID</th>
                  <th className="py-3.5 px-4">NAME (ชื่อที่แสดงผล)</th>
                </>
              ) : (
                <>
                  <th className="py-3.5 px-4">TYPE</th>
                  <th className="py-3.5 px-4">VALUE (ค่าอ้างอิง)</th>
                  <th className="py-3.5 px-4">LABEL (ข้อความที่แสดง)</th>
                  <th className="py-3.5 px-4 text-center w-20">ลำดับ</th>
                </>
              )}
              <th className="py-3.5 px-4">สถานะ</th>
              <th className="py-3.5 px-4 text-right">การจัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {items.length > 0 ? (
              items.map((item) => {
                const mainItem = item as MainCategory;
                const optItem = item as ProgramOption;

                return (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-400">
                      {item.id}
                    </td>

                    {isMain ? (
                      <>
                        <td className="py-3.5 px-4">
                          <Badge variant="outline" className="font-mono text-blue-600 bg-blue-50 border-blue-200 font-semibold">
                            {mainItem.category_id}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900 text-sm">
                          {mainItem.name}
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="py-3.5 px-4">
                          <Badge variant="secondary" className="font-mono text-[11px] font-semibold text-slate-600 bg-slate-100">
                            {optItem.option_type}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-blue-700">
                          {optItem.value}
                        </td>
                        <td className="py-3.5 px-4 text-slate-800">
                          {optItem.label}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-center text-slate-400">
                          {optItem.display_order ?? "-"}
                        </td>
                      </>
                    )}

                    <td className="py-3.5 px-4">
                      {item.is_active !== false ? (
                        <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-100 border gap-1">
                          <CheckCircle className="w-3 h-3 text-emerald-600" />
                          <span>ใช้งานอยู่</span>
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-slate-100 text-slate-400">
                          ปิดใช้งาน
                        </Badge>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          type="button"
                          variant="ghost"
                          size="xs"
                          onClick={() => onEdit(item)}
                          className="text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer"
                          title="แก้ไข"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span className="ml-1 text-xs">แก้ไข</span>
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="xs"
                          onClick={() =>
                            onDelete(
                              item.id,
                              isMain ? mainItem.name : (optItem.label || optItem.value)
                            )
                          }
                          className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                          title="ลบ"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  {isLoading ? "กำลังโหลดข้อมูล..." : "ไม่พบข้อมูลในหมวดหมู่นี้"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

/**
 * Component โมดอลฟอร์ม (MasterDataModal)
 */
export function MasterDataModal({
  isOpen,
  activeTab,
  editingId,
  isSaving,
  catForm,
  setCatForm,
  optForm,
  setOptForm,
  formErrors,
  onClose,
  onSubmit,
}: {
  isOpen: boolean;
  activeTab: MasterDataTabId;
  editingId: number | null;
  isSaving: boolean;
  catForm: { category_id: string; name: string; is_active: boolean };
  setCatForm: React.Dispatch<React.SetStateAction<{ category_id: string; name: string; is_active: boolean }>>;
  optForm: { option_type: string; value: string; label: string; display_order: number; is_active: boolean };
  setOptForm: React.Dispatch<React.SetStateAction<{ option_type: string; value: string; label: string; display_order: number; is_active: boolean }>>;
  formErrors: Record<string, string>;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}) {
  const isMain = activeTab === "main_categories";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        editingId
          ? `แก้ไข${isMain ? "หมวดหมู่หลัก" : "ตัวเลือก"}`
          : `เพิ่ม${isMain ? "หมวดหมู่หลักใหม่" : "ตัวเลือกใหม่"}`
      }
    >
      <form
        onSubmit={onSubmit}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.target as HTMLElement).tagName !== "TEXTAREA") {
            e.preventDefault();
          }
        }}
        className="space-y-4 pt-2"
      >
        {isMain ? (
          <>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                CATEGORY_ID <span className="text-rose-500 font-bold">*</span>
              </label>
              <Input
                type="text"
                required
                placeholder="เช่น Printing, Hardware, Software"
                value={catForm.category_id}
                onChange={(e) => setCatForm((prev) => ({ ...prev, category_id: e.target.value }))}
                className={`h-10 text-xs sm:text-sm rounded-xl font-mono ${
                  formErrors.category_id ? "border-rose-500 ring-2 ring-rose-200" : ""
                }`}
              />
              {formErrors.category_id && (
                <p className="text-[11px] text-rose-500 font-medium mt-1">{formErrors.category_id}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                NAME (ชื่อที่แสดงผล) <span className="text-rose-500 font-bold">*</span>
              </label>
              <Input
                type="text"
                required
                placeholder="เช่น Printing & Supply Solution"
                value={catForm.name}
                onChange={(e) => setCatForm((prev) => ({ ...prev, name: e.target.value }))}
                className={`h-10 text-xs sm:text-sm rounded-xl ${
                  formErrors.name ? "border-rose-500 ring-2 ring-rose-200" : ""
                }`}
              />
              {formErrors.name && (
                <p className="text-[11px] text-rose-500 font-medium mt-1">{formErrors.name}</p>
              )}
            </div>

            <div>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={catForm.is_active}
                  onChange={(e) => setCatForm((prev) => ({ ...prev, is_active: e.target.checked }))}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
                />
                <span className="text-xs font-semibold text-slate-700">เปิดใช้งานหมวดหมู่นี้</span>
              </label>
            </div>
          </>
        ) : (
          <>
            {activeTab === "software_options" && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  ประเภทตัวเลือก <span className="text-rose-500 font-bold">*</span>
                </label>
                <Select
                  value={optForm.option_type}
                  onChange={(val) => setOptForm((prev) => ({ ...prev, option_type: val }))}
                  options={SOFTWARE_OPTION_TYPES}
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                VALUE (ค่าตัวเลือกสำหรับระบบ) <span className="text-rose-500 font-bold">*</span>
              </label>
              <Input
                type="text"
                required
                placeholder="เช่น Laser Printer, Toner, Canon"
                value={optForm.value}
                onChange={(e) => setOptForm((prev) => ({ ...prev, value: e.target.value }))}
                className={`h-10 text-xs sm:text-sm rounded-xl ${
                  formErrors.value ? "border-rose-500 ring-2 ring-rose-200" : ""
                }`}
              />
              {formErrors.value && (
                <p className="text-[11px] text-rose-500 font-medium mt-1">{formErrors.value}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                LABEL (ข้อความที่แสดงใน Dropdown)
              </label>
              <Input
                type="text"
                placeholder="ปล่อยว่างได้ (ถ้าว่างจะใช้ค่า Value แทน)"
                value={optForm.label}
                onChange={(e) => setOptForm((prev) => ({ ...prev, label: e.target.value }))}
                className="h-10 text-xs sm:text-sm rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                ลำดับการแสดงผล (Display Order)
              </label>
              <Input
                type="number"
                value={optForm.display_order}
                onChange={(e) =>
                  setOptForm((prev) => ({ ...prev, display_order: parseInt(e.target.value, 10) || 1 }))
                }
                className="h-10 text-xs sm:text-sm rounded-xl w-32"
              />
            </div>

            <div>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={optForm.is_active}
                  onChange={(e) => setOptForm((prev) => ({ ...prev, is_active: e.target.checked }))}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
                />
                <span className="text-xs font-semibold text-slate-700">เปิดใช้งานตัวเลือกนี้</span>
              </label>
            </div>
          </>
        )}

        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="text-xs rounded-xl cursor-pointer"
          >
            ยกเลิก
          </Button>
          <Button
            type="submit"
            disabled={isSaving}
            className="bg-[#0066FF] hover:bg-[#0052CC] text-white text-xs font-semibold rounded-xl px-5 cursor-pointer flex items-center gap-1.5"
          >
            {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>{editingId ? "บันทึกการแก้ไข" : "บันทึกข้อมูล"}</span>
          </Button>
        </div>
      </form>
    </Modal>
  );
}

