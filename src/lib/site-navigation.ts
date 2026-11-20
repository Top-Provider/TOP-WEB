export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "IT Solution & Product", href: "/solutions/software" },
  { label: "Service Solution", href: "/service-solution" },
  { label: "News & Activities", href: "/activities" },
] as const;

export const SOCIAL_CHANNELS = [
  {
    id: "facebook",
    name: "Facebook",
    subtitle: "ติดตามข่าวสารและกิจกรรมผ่าน Facebook",
    href: "https://www.facebook.com/hrtopprovider",
    bgClass: "bg-[#1877F2]/10 text-[#1877F2] border-[#1877F2]/20 hover:bg-[#1877F2]/15",
    iconBgClass: "bg-[#1877F2] text-white",
  },
  {
    id: "line",
    name: "LINE Official",
    subtitle: "แชทสอบถามหรือติดต่อทีมงานทาง LINE",
    href: "https://lin.ee/4iYjD6R",
    bgClass: "bg-[#06C755]/10 text-[#059c42] border-[#06C755]/25 hover:bg-[#06C755]/15",
    iconBgClass: "bg-[#06C755] text-white",
  },
  {
    id: "instagram",
    name: "Instagram",
    subtitle: "อัปเดตภาพบรรยากาศและผลงานทาง IG",
    href: "https://www.instagram.com/topprovider.co.th?igsh=cjdqaXo0eXZxeGl1",
    bgClass: "bg-pink-50 text-pink-700 border-pink-200/80 hover:bg-pink-100/70",
    iconBgClass: "bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white",
  },
  {
    id: "tiktok",
    name: "TikTok",
    subtitle: "รับชมคลิปวิดีโอสั้นและเทคนิคการใช้งาน",
    href: "https://www.tiktok.com/@hr.topprovider?_t=ZS-902k3XbFSLM&_r=1",
    bgClass: "bg-slate-100/90 text-slate-900 border-slate-200 hover:bg-slate-200/70",
    iconBgClass: "bg-slate-900 text-white",
  },
] as const;
