import React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { query } from "@/lib/db";
import { isDbConnectionError } from "@/lib/api-error";
import {
  Package,
  Layers,
  FolderTree,
  ArrowUpRight,
  LayoutGrid,
  Users,
  Calendar,
  Building2,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface DashboardCounts {
  hospitals: number;
  products: number;
  programs: number;
  solutionTopics: number;
  users: number;
  activities: number;
  categories: number;
  recentProducts: Array<{
    id: number;
    name: string;
    sku: string | null;
    category_id: string | null;
    is_active: boolean;
  }>;
  recentPrograms: Array<{
    id: number;
    name: string;
    category_id: string | null;
    video_url: string | null;
    is_active: boolean;
  }>;
}

async function getDashboardCounts(): Promise<DashboardCounts> {
  const [countsRes, recentProductsRes, recentProgramsRes] = await Promise.all([
    query(`
      SELECT
        (SELECT count(*)::int FROM public."TBM_HD_HOSPITALS") AS hospitals,
        (SELECT count(*)::int FROM public."TB_PRODUCTS") AS products,
        (SELECT count(*)::int FROM public."TB_PRODUCT_SOFTWARE") AS programs,
        (SELECT count(*)::int FROM public."TB_SOLUTION_TOPICS") AS solution_topics,
        (SELECT count(*)::int FROM public."TB_USERS") AS users,
        (SELECT count(*)::int FROM public."TB_ACTIVITIES") AS activities,
        (SELECT count(*)::int FROM public."TBM_PRODUCT_CATEGORIES") AS categories
    `),
    query(
      `SELECT id, name, sku, category_id, is_active
       FROM public."TB_PRODUCTS"
       ORDER BY id DESC
       LIMIT 3`
    ),
    query(
      `SELECT id, name, category_id, video_url, is_active
       FROM public."TB_PRODUCT_SOFTWARE"
       ORDER BY id DESC
       LIMIT 3`
    ),
  ]);

  const row = (countsRes.rows[0] || {}) as Record<string, number>;
  return {
    hospitals: Number(row.hospitals || 0),
    products: Number(row.products || 0),
    programs: Number(row.programs || 0),
    solutionTopics: Number(row.solution_topics || 0),
    users: Number(row.users || 0),
    activities: Number(row.activities || 0),
    categories: Number(row.categories || 0),
    recentProducts: recentProductsRes.rows as DashboardCounts["recentProducts"],
    recentPrograms: recentProgramsRes.rows as DashboardCounts["recentPrograms"],
  };
}

export default async function AdminDashboardPage() {
  let stats: DashboardCounts = {
    hospitals: 0,
    products: 0,
    programs: 0,
    solutionTopics: 0,
    users: 0,
    activities: 0,
    categories: 0,
    recentProducts: [],
    recentPrograms: [],
  };

  try {
    stats = await getDashboardCounts();
  } catch (err) {
    if (isDbConnectionError(err)) throw err;
    console.error("Failed to load admin dashboard counts:", err);
  }

  const statCards = [
    {
      title: "Master ลูกค้า",
      count: stats.hospitals.toLocaleString("th-TH"),
      desc: "รายชื่อโรงพยาบาลและโลโก้ลูกค้า",
      href: "/admin/customers",
      icon: Building2,
      color: "bg-teal-50 text-teal-600 border-teal-100",
    },
    {
      title: "จัดการสินค้า (Master)",
      count: stats.products.toLocaleString("th-TH"),
      desc: "เครื่องพิมพ์, หมึกพิมพ์, ฮาร์ดแวร์",
      href: "/admin/products",
      icon: Package,
      color: "bg-blue-50 text-blue-600 border-blue-100",
    },
    {
      title: "จัดการโปรแกรม (Programs)",
      count: stats.programs.toLocaleString("th-TH"),
      desc: "Vitanix Claim, Panacea Plus HIS ฯลฯ",
      href: "/admin/programs",
      icon: Layers,
      color: "bg-emerald-50 text-emerald-600 border-emerald-100",
    },
    {
      title: "การ์ดภาพรวมโซลูชัน",
      count: stats.solutionTopics.toLocaleString("th-TH"),
      desc: "Printer, Supply, Hardware, Network",
      href: "/admin/solution-topics",
      icon: LayoutGrid,
      color: "bg-amber-50 text-amber-600 border-amber-100",
    },
    {
      title: "จัดการบุคลากร (Users)",
      count: stats.users.toLocaleString("th-TH"),
      desc: "ข้อมูลบุคลากร ชื่อ-สกุล (TH/EN) ตำแหน่ง",
      href: "/admin/users",
      icon: Users,
      color: "bg-purple-50 text-purple-600 border-purple-100",
    },
    {
      title: "กิจกรรมบริษัท (Activities)",
      count: stats.activities.toLocaleString("th-TH"),
      desc: "ภาพกิจกรรม, สัมมนา, นิทรรศการ, CSR",
      href: "/admin/activities",
      icon: Calendar,
      color: "bg-rose-50 text-rose-600 border-rose-100",
    },
    {
      title: "ข้อมูลหลัก (Master Data)",
      count: stats.categories.toLocaleString("th-TH"),
      desc: "Printing, Hardware, Software ฯลฯ",
      href: "/admin/categories",
      icon: FolderTree,
      color: "bg-indigo-50 text-indigo-600 border-indigo-100",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner using UI Card */}
      <Card className="p-6 sm:p-8 border-slate-200/80">
        <div>
          <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider block mb-1">
            CONTROL CENTER
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            ยินดีต้อนรับสู่ระบบจัดการ TOP PROVIDER
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            จัดการข้อมูลรายชื่อโรงพยาบาล, สินค้า Master, โปรแกรมซอฟต์แวร์, บุคลากร และกิจกรรมองค์กรได้ครบในที่เดียว
          </p>
        </div>
      </Card>

      {/* Stats Overview using UI Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-5">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.title} href={card.href} className="group block h-full">
              <Card className="p-5 sm:p-6 h-full hover:shadow-md hover:border-blue-300 transition-all cursor-pointer flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-10 h-10 rounded-xl border flex items-center justify-center ${card.color}`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                  </div>
                  <h3 className="text-3xl font-bold text-slate-900">{card.count}</h3>
                  <p className="text-sm font-semibold text-slate-800 mt-1">{card.title}</p>
                </div>
                <p className="text-xs text-slate-500 mt-1">{card.desc}</p>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Quick Action Tables Guide using UI Card */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Master Products Guide */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Package className="w-4 h-4 text-blue-600" />
              <span>สินค้าล่าสุดในระบบ (Products)</span>
            </h3>
            <Link
              href="/admin/products"
              className="text-xs text-blue-600 hover:underline font-medium"
            >
              ดูทั้งหมด →
            </Link>
          </div>
          <div className="divide-y divide-slate-100 text-xs">
            {stats.recentProducts.length === 0 ? (
              <div className="py-4 text-slate-400">ยังไม่มีข้อมูลสินค้า</div>
            ) : (
              stats.recentProducts.map((p) => (
                <div key={p.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-bold text-slate-800 truncate">{p.name}</p>
                    <p className="text-slate-400 truncate">
                      {p.category_id || "Product"}
                      {p.sku ? ` • SKU: ${p.sku}` : ""}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 px-2.5 py-1 rounded-full font-medium ${
                      p.is_active
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {p.is_active ? "พร้อมแสดงผล" : "ปิดใช้งาน"}
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Programs Guide */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600" />
              <span>ซอฟต์แวร์โรงพยาบาล (Programs)</span>
            </h3>
            <Link
              href="/admin/programs"
              className="text-xs text-blue-600 hover:underline font-medium"
            >
              ดูทั้งหมด →
            </Link>
          </div>
          <div className="divide-y divide-slate-100 text-xs">
            {stats.recentPrograms.length === 0 ? (
              <div className="py-4 text-slate-400">ยังไม่มีข้อมูลโปรแกรม</div>
            ) : (
              stats.recentPrograms.map((prog) => (
                <div key={prog.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-bold text-slate-800 truncate">{prog.name}</p>
                    <p className="text-slate-400 truncate">
                      {prog.category_id || "Software"}
                      {prog.video_url ? " • มีคลิปวิดีโอสาธิต" : ""}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 px-2.5 py-1 rounded-full font-medium ${
                      prog.is_active
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {prog.is_active ? "พร้อมแสดงผล" : "ปิดใช้งาน"}
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
