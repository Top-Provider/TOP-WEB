import React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, Layers, FolderTree, ArrowUpRight } from "lucide-react";

export default function AdminDashboardPage() {
  const statCards = [
    {
      title: "Master สินค้าทั้งหมด",
      count: "24",
      desc: "เครื่องพิมพ์, หมึกพิมพ์, ฮาร์ดแวร์",
      href: "/admin/products",
      icon: Package,
      color: "bg-blue-50 text-blue-600 border-blue-100",
    },
    {
      title: "โปรแกรม & ซอฟต์แวร์",
      count: "12",
      desc: "Vitanix Claim, Panacea Plus HIS ฯลฯ",
      href: "/admin/programs",
      icon: Layers,
      color: "bg-emerald-50 text-emerald-600 border-emerald-100",
    },
    {
      title: "หมวดหมู่หลัก (Categories)",
      count: "6",
      desc: "Printing, Hardware, Software ฯลฯ",
      href: "/admin/categories",
      icon: FolderTree,
      color: "bg-indigo-50 text-indigo-600 border-indigo-100",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner using UI Card */}
      <Card className="p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border-slate-200/80">
        <div>
          <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider block mb-1">
            CONTROL CENTER
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            ยินดีต้อนรับสู่ระบบจัดการ TOP PROVIDER
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
            จัดการข้อมูลสินค้า สเปกหมึกพิมพ์ ไฟล์ Datasheet (EN) / TOR (TH) รวมถึงวิดีโอและรายละเอียดของโปรแกรมซอฟต์แวร์ที่แสดงผลหน้าบ้าน
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button asChild size="default" className="rounded-full px-5">
            <Link href="/admin/products">
              <span>+ เพิ่มสินค้าใหม่</span>
            </Link>
          </Button>
        </div>
      </Card>

      {/* Stats Overview using UI Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.title} href={card.href} className="group block">
              <Card className="p-6 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer">
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
                <p className="text-xs text-slate-500 mt-0.5">{card.desc}</p>
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
              <span>สินค้าเครื่องพิมพ์ & หมึกพิมพ์ล่าสุด</span>
            </h3>
            <Link
              href="/admin/products"
              className="text-xs text-blue-600 hover:underline font-medium"
            >
              ดูทั้งหมด →
            </Link>
          </div>
          <div className="divide-y divide-slate-100 text-xs">
            <div className="py-3 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-800">Canon LBP-654CX</p>
                <p className="text-slate-400">Color Laser Printer • SKU: LBP-654CX</p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 font-medium">
                พร้อมแสดงผล
              </span>
            </div>
            <div className="py-3 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-800">Canon Cartridge 046H Series</p>
                <p className="text-slate-400">Toner & Supply • 4 สี (BK/C/M/Y)</p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 font-medium">
                พร้อมแสดงผล
              </span>
            </div>
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
            <div className="py-3 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-800">Vitanix Claim</p>
                <p className="text-slate-400">Hospital Claim Management • มีคลิปวิดีโอสาธิต</p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 font-medium">
                YouTube Embed
              </span>
            </div>
            <div className="py-3 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-800">Panacea Plus Hospital Solution (HIS)</p>
                <p className="text-slate-400">Core Hospital HIS • 30 Standard Modules</p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 font-medium">
                พร้อมแสดงผล
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

