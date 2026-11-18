"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Mail,
  Phone,
  Search,
  RefreshCw,
  Trash2,
  Eye,
  CheckCircle2,
  Loader2,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "@/components/ui/toast";
import { AdminLoadingState } from "@/components/admin/admin-loading-state";

interface ContactMessageRow {
  id: number;
  first_name: string;
  last_name: string | null;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

function formatThaiDateTime(iso: string) {
  return new Intl.DateTimeFormat("th-TH-u-ca-buddhist", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export default function AdminContactMessagesPage() {
  const [messages, setMessages] = useState<ContactMessageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"ALL" | "UNREAD" | "READ">("ALL");
  const [selected, setSelected] = useState<ContactMessageRow | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadMessages = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/contact", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "โหลดข้อความไม่สำเร็จ");
      setMessages(json.data || []);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "โหลดข้อความไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  const unreadCount = useMemo(
    () => messages.filter((m) => !m.is_read).length,
    [messages]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return messages.filter((m) => {
      if (filter === "UNREAD" && m.is_read) return false;
      if (filter === "READ" && !m.is_read) return false;
      if (!q) return true;
      return (
        m.first_name.toLowerCase().includes(q) ||
        (m.last_name || "").toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        (m.phone || "").toLowerCase().includes(q) ||
        m.subject.toLowerCase().includes(q) ||
        m.message.toLowerCase().includes(q)
      );
    });
  }, [messages, filter, search]);

  const markReadStatus = async (id: number, isRead: boolean) => {
    try {
      const res = await fetch("/api/admin/contact", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, is_read: isRead }),
      });
      if (!res.ok) return;
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, is_read: isRead } : m))
      );
      setSelected((prev) => (prev && prev.id === id ? { ...prev, is_read: isRead } : prev));
    } catch {
      // Ignore background mark-read failure
    }
  };

  const openDetail = (row: ContactMessageRow) => {
    setSelected(row);
    if (!row.is_read) {
      markReadStatus(row.id, true);
    }
  };

  const handleDelete = async () => {
    if (!deleteId || deleting) return;
    setDeleting(true);
    try {
      const res = await fetch("/api/admin/contact", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deleteId }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "ลบข้อความไม่สำเร็จ");
      setMessages((prev) => prev.filter((m) => m.id !== deleteId));
      if (selected?.id === deleteId) setSelected(null);
      setDeleteId(null);
      toast.success("ลบข้อความเรียบร้อยแล้ว");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "ลบข้อความไม่สำเร็จ");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">ข้อความติดต่อจากหน้าเว็บ</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            รายการข้อความที่ลูกค้าส่งเข้ามาผ่านหน้าติดต่อเรา (/contact) · ยังไม่อ่าน {unreadCount} รายการ
          </p>
        </div>
        <Button type="button" variant="outline" onClick={loadMessages} className="gap-1.5 w-fit">
          <RefreshCw className="w-4 h-4" />
          รีเฟรช
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {(
              [
                { key: "ALL", label: `ทั้งหมด (${messages.length})` },
                { key: "UNREAD", label: `ยังไม่อ่าน (${unreadCount})` },
                { key: "READ", label: `อ่านแล้ว (${messages.length - unreadCount})` },
              ] as const
            ).map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setFilter(tab.key)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition cursor-pointer ${
                  filter === tab.key
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 z-10" />
            <Input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหาชื่อ, อีเมล, เบอร์โทร, หัวข้อ..."
              className="pl-9 pr-3"
            />
          </div>
        </div>

        {loading ? (
          <AdminLoadingState label="กำลังโหลดข้อความ..." />
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-sm space-y-2">
            <MessageSquare className="w-8 h-8 mx-auto text-slate-300" />
            <p>ไม่พบข้อความติดต่อ</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((item) => {
              const fullName = [item.first_name, item.last_name].filter(Boolean).join(" ");
              return (
                <div
                  key={item.id}
                  onClick={() => openDetail(item)}
                  className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 transition cursor-pointer ${
                    !item.is_read ? "bg-blue-50/30" : ""
                  }`}
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {!item.is_read && (
                        <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                      )}
                      <span className="text-sm font-bold text-slate-900 truncate">
                        {item.subject}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          item.is_read
                            ? "bg-slate-100 text-slate-500"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {item.is_read ? "อ่านแล้ว" : "ใหม่"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-1">{item.message}</p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 pt-0.5">
                      <span className="font-medium text-slate-700">{fullName}</span>
                      <span className="inline-flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        {item.email}
                      </span>
                      {item.phone && (
                        <span className="inline-flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          {item.phone}
                        </span>
                      )}
                      <span className="text-slate-400">{formatThaiDateTime(item.created_at)}</span>
                    </div>
                  </div>

                  <div
                    className="flex items-center gap-2 shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => openDetail(item)}
                      className="rounded-xl gap-1.5 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      อ่าน
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setDeleteId(item.id)}
                      className="rounded-xl text-rose-600 hover:bg-rose-50 hover:text-rose-700 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* View Detail Modal */}
      <Modal
        isOpen={selected !== null}
        onClose={() => setSelected(null)}
        title={selected?.subject || "รายละเอียดข้อความ"}
        description={
          selected ? `ส่งเมื่อ ${formatThaiDateTime(selected.created_at)}` : undefined
        }
        maxWidth="lg"
        footer={
          selected && (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => markReadStatus(selected.id, !selected.is_read)}
                className="rounded-xl px-4 h-10 text-sm font-medium gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                {selected.is_read ? "ทำเครื่องหมายว่ายังไม่อ่าน" : "ทำเครื่องหมายว่าอ่านแล้ว"}
              </Button>
              <Button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-6 h-10 text-sm font-semibold cursor-pointer"
              >
                ปิดหน้าต่าง
              </Button>
            </>
          )
        }
      >
        {selected && (
          <div className="space-y-4">
            <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-xs text-slate-500">ผู้ส่ง</div>
                <div className="font-semibold text-slate-900 mt-0.5">
                  {[selected.first_name, selected.last_name].filter(Boolean).join(" ")}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500">อีเมล</div>
                <a
                  href={`mailto:${selected.email}`}
                  className="font-semibold text-blue-600 hover:underline mt-0.5 block"
                >
                  {selected.email}
                </a>
              </div>
              {selected.phone && (
                <div>
                  <div className="text-xs text-slate-500">เบอร์โทรศัพท์</div>
                  <a
                    href={`tel:${selected.phone}`}
                    className="font-semibold text-blue-600 hover:underline mt-0.5 block"
                  >
                    {selected.phone}
                  </a>
                </div>
              )}
            </div>

            <div>
              <div className="text-xs font-semibold text-slate-500 mb-1.5">รายละเอียดข้อความ</div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-800 whitespace-pre-line leading-relaxed">
                {selected.message}
              </div>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={deleteId !== null}
        onClose={() => !deleting && setDeleteId(null)}
        onConfirm={handleDelete}
        isLoading={deleting}
        title="ยืนยันการลบข้อความ"
        description="คุณต้องการลบข้อความติดต่อนี้ออกจากระบบใช่หรือไม่?"
      />
    </div>
  );
}
