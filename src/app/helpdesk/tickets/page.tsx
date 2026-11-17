"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToastContainer, toast } from "@/components/ui/toast";
import {
  Building2,
  CheckCircle2,
  Clock,
  ExternalLink,
  Loader2,
  Plus,
  RefreshCw,
  Search,
} from "lucide-react";
import { EQUIPMENT_LABELS } from "@/lib/helpdesk-constants";
import type { TicketRow } from "@/lib/helpdesk-repository";
import {
  formatThaiDateTime,
  SlaStatusBadge,
  TicketPriorityBadge,
  TicketStatusBadge,
} from "@/components/helpdesk/sla-badge";

type StatusFilter = "ALL" | "ACTIVE" | "RESOLVED" | "CLOSED";

export default function HelpdeskMyTicketsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState<TicketRow[]>([]);
  const [orgName, setOrgName] = useState<string | null>(null);
  const [filter, setFilter] = useState<StatusFilter>("ALL");
  const [search, setSearch] = useState("");

  const loadTickets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/helpdesk/my-tickets", { cache: "no-store" });
      if (res.status === 401 || res.status === 403) {
        router.replace(`/helpdesk/login?next=${encodeURIComponent("/helpdesk/tickets")}`);
        return;
      }
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "ไม่สามารถโหลดรายการแจ้งซ่อมได้");
      }
      setTickets((json.data || []) as TicketRow[]);
      setOrgName(json.user?.org_name || null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  const counts = useMemo(() => {
    return {
      all: tickets.length,
      active: tickets.filter((t) => !["RESOLVED", "CLOSED", "CANCELLED"].includes(t.status)).length,
      resolved: tickets.filter((t) => t.status === "RESOLVED").length,
      closed: tickets.filter((t) => t.status === "CLOSED").length,
    };
  }, [tickets]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tickets.filter((t) => {
      if (filter === "ACTIVE" && ["RESOLVED", "CLOSED", "CANCELLED"].includes(t.status)) return false;
      if (filter === "RESOLVED" && t.status !== "RESOLVED") return false;
      if (filter === "CLOSED" && t.status !== "CLOSED") return false;
      if (!q) return true;
      return (
        t.ticket_no.toLowerCase().includes(q) ||
        (t.request_group_no || "").toLowerCase().includes(q) ||
        t.title.toLowerCase().includes(q) ||
        (t.serial_number || "").toLowerCase().includes(q)
      );
    });
  }, [tickets, filter, search]);

  return (
    <div className="min-h-screen flex flex-col bg-[radial-gradient(circle_at_15%_10%,rgba(219,234,254,0.8),transparent_35%),radial-gradient(circle_at_85%_20%,rgba(224,242,254,0.7),transparent_30%),#f7faff]">
      <Navbar />
      <main className="flex-1 pt-8 sm:pt-12 pb-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                ติดตามรายการแจ้งซ่อม
              </h1>
              {orgName && (
                <p className="text-sm text-slate-600 mt-1 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  <span>{orgName}</span>
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button type="button" variant="outline" onClick={loadTickets} className="gap-1.5">
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                รีเฟรช
              </Button>
              <Link href="/helpdesk/new">
                <Button type="button" className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5">
                  <Plus className="w-4 h-4" />
                  แจ้งซ่อมใหม่
                </Button>
              </Link>
            </div>
          </div>

          {/* Highlight if any ticket is waiting for customer close confirmation */}
          {counts.resolved > 0 && (
            <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-2.5 text-sm text-emerald-950">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">มีงานซ่อมเสร็จแล้ว {counts.resolved} รายการ รอการตรวจสอบและยืนยันปิดงาน</div>
                  <div className="text-xs text-emerald-800">กดเข้าดูรายการเพื่อตรวจสอบและให้คะแนนความพึงพอใจ</div>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setFilter("RESOLVED")}
                className="bg-white border-emerald-300 text-emerald-800 shrink-0"
              >
                ดูงานที่รอปิด ({counts.resolved})
              </Button>
            </div>
          )}

          {/* Filters & Search */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 space-y-4">
            <div className="flex flex-col md:flex-row gap-3 justify-between">
              <div className="flex flex-wrap gap-1.5">
                {(
                  [
                    { key: "ALL", label: `ทั้งหมด (${counts.all})` },
                    { key: "ACTIVE", label: `กำลังดำเนินการ (${counts.active})` },
                    { key: "RESOLVED", label: `ซ่อมเสร็จ/รอยืนยัน (${counts.resolved})` },
                    { key: "CLOSED", label: `ปิดงานแล้ว (${counts.closed})` },
                  ] as Array<{ key: StatusFilter; label: string }>
                ).map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setFilter(tab.key)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition ${
                      filter === tab.key
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <div className="relative w-full md:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="ค้นหาเลขที่งาน, อาการ, S/N..."
                  className="h-9 pl-9 pr-3"
                />
              </div>
            </div>

            {loading ? (
              <div className="py-14 text-center text-slate-500 text-sm">
                <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                กำลังโหลดรายการแจ้งซ่อม...
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-14 text-center space-y-3">
                <p className="text-sm text-slate-400">ยังไม่มีรายการแจ้งซ่อมในหมวดนี้</p>
                <Link href="/helpdesk/new">
                  <Button type="button" className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5">
                    <Plus className="w-4 h-4" />
                    แจ้งซ่อมอุปกรณ์
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filtered.map((t) => (
                  <Link
                    key={t.id}
                    href={`/helpdesk/ticket/${t.ticket_no}`}
                    className="py-4 px-2 hover:bg-slate-50 rounded-xl transition flex flex-col lg:flex-row lg:items-center justify-between gap-3 block"
                  >
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold text-blue-700">{t.ticket_no}</span>
                        {t.request_group_no && (
                          <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 text-[11px] font-semibold">
                            {t.request_group_no}
                          </span>
                        )}
                        <TicketStatusBadge status={t.status} />
                        <TicketPriorityBadge priority={t.priority} />
                      </div>
                      <div className="font-semibold text-slate-900 truncate">{t.title}</div>
                      <div className="text-xs text-slate-500 flex flex-wrap gap-x-3 gap-y-1">
                        <span>
                          {EQUIPMENT_LABELS[t.equipment_type]}
                          {t.equipment_brand || t.equipment_model
                            ? ` · ${[t.equipment_brand, t.equipment_model].filter(Boolean).join(" ")}`
                            : ""}
                        </span>
                        {t.serial_number && <span>S/N: {t.serial_number}</span>}
                        {t.assigned_to && <span className="text-slate-700 font-medium">ช่าง: {t.assigned_to}</span>}
                      </div>
                    </div>

                    <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between gap-2 shrink-0">
                      <SlaStatusBadge sla={t.sla} />
                      <div className="text-xs text-slate-500 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>กำหนดเสร็จ: {formatThaiDateTime(t.resolve_due_at)}</span>
                        <ExternalLink className="w-3.5 h-3.5 text-blue-600 ml-1" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
      <ToastContainer />
    </div>
  );
}
