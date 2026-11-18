"use client";
export default function ActivitiesError({ reset }: { reset: () => void }) {
  return <main className="mx-auto max-w-xl px-5 py-24 text-center"><h1 className="text-2xl font-semibold">ไม่สามารถโหลดกิจกรรมได้</h1><p className="mt-3 text-slate-500">กรุณาลองใหม่อีกครั้ง</p><button onClick={reset} className="mt-6 rounded-xl bg-blue-600 px-5 py-3 text-white">ลองใหม่</button></main>;
}
