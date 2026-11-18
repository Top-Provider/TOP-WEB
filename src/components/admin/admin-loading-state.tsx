import { Loader2 } from "lucide-react";

interface AdminLoadingStateProps {
  label?: string;
  className?: string;
}

/**
 * Shared loading indicator for admin tables and data lists.
 */
export function AdminLoadingState({
  label = "กำลังโหลดข้อมูล...",
  className = "py-14",
}: AdminLoadingStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-2.5 text-center text-slate-500 ${className}`}
    >
      <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      <span className="text-sm font-medium text-slate-500">{label}</span>
    </div>
  );
}
