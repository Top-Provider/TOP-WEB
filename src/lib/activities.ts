export interface ActivityItem {
  photo_count?: number;
  id: number;
  customerId?: number;
  customerName?: string;
  title: string;
  title_en?: string;
  category: string;
  event_date?: string;
  location?: string;
  short_description?: string;
  content?: string;
  cover_image_url?: string;
  gallery_images: string[];
  tags: string[];
  is_featured: boolean;
  is_active: boolean;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

function parseJsonArray(val: unknown): string[] {
  if (Array.isArray(val)) return val as string[];
  if (typeof val === "string") {
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) return parsed as string[];
    } catch {
      return [];
    }
  }
  return [];
}

export function formatActivityRow(row: Record<string, unknown>): ActivityItem {
  let eventDateStr = "";
  if (row.event_date) {
    if (row.event_date instanceof Date) {
      const d = row.event_date;
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      eventDateStr = `${year}-${month}-${day}`;
    } else {
      eventDateStr = String(row.event_date).split("T")[0];
    }
  }

  return {
    id: Number(row.id),
    customerId: row.customer_id ? Number(row.customer_id) : undefined,
    customerName: row.customer_name ? String(row.customer_name) : undefined,
    title: String(row.title || ""),
    title_en: row.title_en ? String(row.title_en) : undefined,
    category: String(row.category || "culture"),
    event_date: eventDateStr || undefined,
    location: row.location ? String(row.location) : undefined,
    short_description: row.short_description ? String(row.short_description) : undefined,
    content: row.content ? String(row.content) : undefined,
    cover_image_url: row.cover_image_url ? String(row.cover_image_url) : undefined,
    gallery_images: parseJsonArray(row.gallery_images),
    tags: parseJsonArray(row.tags),
    is_featured: Boolean(row.is_featured),
    is_active: row.is_active !== undefined ? Boolean(row.is_active) : true,
    sort_order: Number(row.sort_order || 0),
    created_at: row.created_at ? String(row.created_at) : undefined,
    updated_at: row.updated_at ? String(row.updated_at) : undefined,
  };
}


export const CATEGORY_OPTIONS = [
  { value: "all", label: "ทุกหมวดหมู่ (ทั้งหมด)" },
  { value: "product_innovation", label: "Product Innovation" },
  { value: "hr_development", label: "การพัฒนาบุคลากร" },
  { value: "partner", label: "Partner" },
  { value: "customer", label: "Customer" },
  { value: "seminar", label: "การสัมมนา" },
  { value: "activity_partner", label: "กิจกรรม & Partner" },
  { value: "activity_customer", label: "กิจกรรม & Customer" },
  { value: "orientation", label: "Orientation" },
  { value: "workshop", label: "Workshop" },
  { value: "awards", label: "งานรับรางวัล" },
  { value: "distributor", label: "แต่งตั้งเป็นตัวแทนจำหน่าย" },
  { value: "certification", label: "แต่งตั้งรับรองผลิตภัณฑ์" },
  { value: "religious", label: "พิธีทางศาสนา" },
  { value: "company_internal", label: "กิจกรรมภายในบริษัท" },
];

const THAI_MONTHS = [
  "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
  "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค.",
];

export function formatThaiDate(dateStr?: string): string {
  if (!dateStr) return "";
  try {
    const parts = dateStr.split("T")[0].split("-");
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10) + 543;
      const monthIdx = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const monthName = THAI_MONTHS[monthIdx] || parts[1];
      return `${day} ${monthName} ${year}`;
    }
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      const day = d.getDate();
      const month = THAI_MONTHS[d.getMonth()];
      const year = d.getFullYear() + 543;
      return `${day} ${month} ${year}`;
    }
  } catch {
    // fallback
  }
  return dateStr;
}

export function getCategoryLabel(category: string) {
    switch (category) {
      case "product_innovation":
      case "Product Innovation":
        return "Product Innovation";
      case "hr_development":
      case "การพัฒนาบุคลากร":
        return "การพัฒนาบุคลากร";
      case "partner":
      case "Partner":
        return "Partner";
      case "customer":
      case "Customer":
        return "Customer";
      case "seminar":
      case "การสัมมนา":
      case "การสัมนา":
        return "การสัมมนา";
      case "activity_partner":
      case "กิจกรรม & Partner":
        return "กิจกรรม & Partner";
      case "activity_customer":
      case "กิจกรรม & Customer":
        return "กิจกรรม & Customer";
      case "orientation":
      case "Orientation":
      case "Orieantation":
        return "Orientation";
      case "workshop":
      case "Workshop":
        return "Workshop";
      case "awards":
      case "งานรับรางวัล":
        return "งานรับรางวัล";
      case "distributor":
      case "แต่งตั้งเป็นตัวแทนจำหน่าย":
        return "แต่งตั้งเป็นตัวแทนจำหน่าย";
      case "certification":
      case "แต่งตั้งรับรองผลิตภัณฑ์":
      case "แต่งตั้งรับรองผลัตภัณฑ์":
        return "แต่งตั้งรับรองผลิตภัณฑ์";
      case "religious":
      case "พิธีทางศาสนา":
        return "พิธีทางศาสนา";
      case "company_internal":
      case "culture":
      case "กิจกรรมภายในบริษัท":
        return "กิจกรรมภายในบริษัท";
      case "news":
        return "ข่าวประชาสัมพันธ์";
      case "event":
        return "กิจกรรม & อีเวนต์";
      case "tech":
        return "ความรู้และเทคโนโลยี";
      case "video":
        return "วิดีโอ";
      case "exhibition":
        return "งานสัมมนา & นิทรรศการ";
      case "training":
        return "อบรมและพัฒนาทักษะ";
      case "csr":
        return "เพื่อสังคม (CSR)";
      default:
        return category;
    }
  };

export const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case "product_innovation":
      case "Product Innovation":
        return "bg-blue-600 text-white";
      case "hr_development":
      case "การพัฒนาบุคลากร":
        return "bg-emerald-600 text-white";
      case "partner":
      case "Partner":
        return "bg-indigo-600 text-white";
      case "customer":
      case "Customer":
        return "bg-teal-600 text-white";
      case "seminar":
      case "การสัมมนา":
      case "การสัมนา":
        return "bg-violet-600 text-white";
      case "activity_partner":
      case "กิจกรรม & Partner":
        return "bg-purple-600 text-white";
      case "activity_customer":
      case "กิจกรรม & Customer":
        return "bg-cyan-600 text-white";
      case "orientation":
      case "Orientation":
      case "Orieantation":
        return "bg-amber-600 text-white";
      case "workshop":
      case "Workshop":
        return "bg-orange-600 text-white";
      case "awards":
      case "งานรับรางวัล":
        return "bg-yellow-600 text-white";
      case "distributor":
      case "แต่งตั้งเป็นตัวแทนจำหน่าย":
        return "bg-rose-600 text-white";
      case "certification":
      case "แต่งตั้งรับรองผลิตภัณฑ์":
      case "แต่งตั้งรับรองผลัตภัณฑ์":
        return "bg-green-600 text-white";
      case "religious":
      case "พิธีทางศาสนา":
        return "bg-amber-800 text-white";
      case "company_internal":
      case "culture":
      case "กิจกรรมภายในบริษัท":
        return "bg-pink-600 text-white";
      case "news":
        return "bg-sky-500 text-white";
      case "event":
        return "bg-blue-600 text-white";
      case "tech":
        return "bg-indigo-600 text-white";
      case "video":
        return "bg-cyan-600 text-white";
      default:
        return "bg-slate-700 text-white";
    }
  };

