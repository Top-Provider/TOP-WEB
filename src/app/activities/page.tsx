import { Metadata } from "next";
import { listActivities } from "@/lib/activity-repository";

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ActivitiesView } from "@/components/activities-view";


export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Company Activities & Events | TOP PROVIDER SYSTEM GROUP",
  description:
    "รวมภาพกิจกรรม งานสัมมนา เวิร์กช็อป และช่วงเวลาสำคัญของทีมและพันธมิตร บริษัท ท็อป โปรไวเดอร์ ซิสเต็ม กรุ๊ป จำกัด",
};

export default async function ActivitiesPage() {
  const { data: initialActivities, total } = await listActivities();

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] selection:bg-blue-600 selection:text-white">
      {/* Sticky Navigation Bar */}
      <Navbar />

      <main className="flex-1 pb-20 sm:pb-28">
        <ActivitiesView initialActivities={initialActivities} initialTotal={total} />
      </main>
      {/* Footer */}
      <Footer />
    </div>
  );
}

