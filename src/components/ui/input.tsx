import * as React from "react"
import { cn } from "cn"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-10 w-full min-w-0 rounded-xl border border-slate-200/90 bg-white px-3 py-2 text-sm text-slate-800 shadow-2xs transition-all duration-150 outline-none placeholder:text-slate-400",
        // Hover state: เส้นขอบนุ่มนวล ไม่ติดเงาดำ
        "hover:border-blue-400/70 hover:shadow-xs",
        // Focus state: ออร่าสีฟ้าอ่อนสไตล์ Modern SaaS ไม่ดำหนา
        "focus:border-blue-600 focus:ring-3 focus:ring-blue-500/15 focus:bg-white",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Input }
