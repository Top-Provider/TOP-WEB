"use client";

import React, { useState, useEffect } from "react";
import { FolderTree, CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { fetchRecords } from "@/lib/crud";

interface Category {
  id: number;
  category_id: string;
  name: string;
  is_active?: boolean;
}

const categories: Category[] = [
  { id: 1, category_id: "Printing", name: "Printing & Supply Solution", is_active: true },
  { id: 2, category_id: "Hardware", name: "Hardware Solution", is_active: true },
  { id: 3, category_id: "Software", name: "Software Solution", is_active: true },
  { id: 4, category_id: "Network",  name: "Network Solution", is_active: true },
  { id: 5, category_id: "Medical",  name: "Medical Equipment", is_active: true },
  { id: 6, category_id: "IoT",      name: "Smart Solution (IoT)", is_active: true },
];

export default function AdminCategoriesPage() {
  const [list, setList] = useState<Category[]>(categories);

  useEffect(() => {
    fetchRecords<Category>({ table: "TBM_PRODUCT_CATEGORIES", orderBy: "id", orderDir: "asc" })
      .then((data) => {
        if (data && data.length > 0) setList(data);
      })
      .catch((err) => console.log("Categories load fallback:", err));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
          หมวดหมู่หลัก (TBM_PRODUCT_CATEGORIES)
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          โครงสร้าง 6 หมวดหมู่หลักตามแท็บด้านบนของหน้าเว็บ (Printing, Hardware, Software, Network, Medical, IoT)
        </p>
      </div>

      <Card className="rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
            <tr>
              <th className="py-3.5 px-4 w-16">Id</th>
              <th className="py-3.5 px-4">Category_Id</th>
              <th className="py-3.5 px-4">Name (ชื่อที่แสดงผล)</th>
              <th className="py-3.5 px-4">สถานะ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {list.map((cat) => (
              <tr key={cat.id} className="hover:bg-slate-50/70">
                <td className="py-3 px-4 font-mono font-bold text-slate-400">
                  {cat.id}
                </td>
                <td className="py-3 px-4">
                  <span className="font-mono font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
                    {cat.category_id}
                  </span>
                </td>
                <td className="py-3 px-4 font-bold text-slate-900">
                  {cat.name}
                </td>
                <td className="py-3 px-4">
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>ใช้งานอยู่</span>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

