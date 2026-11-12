import { Loader2 } from "lucide-react";

export default function AdminLoading() {
  return (
    <div className="flex h-64 w-full items-center justify-center">
      <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
        <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
        <span>กำลังโหลดข้อมูลระบบแอดมิน...</span>
      </div>
    </div>
  );
}

