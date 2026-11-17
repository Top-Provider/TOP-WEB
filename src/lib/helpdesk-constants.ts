export const TICKET_STATUSES = [
  "NEW",
  "OPEN",
  "ASSIGNED",
  "IN_PROGRESS",
  "PENDING_CUSTOMER",
  "PENDING_PARTS",
  "RESOLVED",
  "CLOSED",
  "CANCELLED",
] as const;

export type TicketStatus = (typeof TICKET_STATUSES)[number];

export const TICKET_PRIORITIES = ["P1", "P2", "P3", "P4"] as const;
export type TicketPriority = (typeof TICKET_PRIORITIES)[number];

export const TICKET_IMPACTS = ["ORG", "DEPT", "USER"] as const;
export type TicketImpact = (typeof TICKET_IMPACTS)[number];

export const TICKET_URGENCIES = ["CRITICAL", "HIGH", "NORMAL"] as const;
export type TicketUrgency = (typeof TICKET_URGENCIES)[number];

export const TICKET_QUEUES = ["PRINTER", "GENERAL"] as const;
export type TicketQueue = (typeof TICKET_QUEUES)[number];

export const EQUIPMENT_TYPES = [
  "PRINTER",
  "COMPUTER",
  "NETWORK",
  "SOFTWARE",
  "OTHER",
] as const;
export type EquipmentType = (typeof EQUIPMENT_TYPES)[number];

export const SOURCE_CHANNELS = [
  "WEB",
  "LINE_GROUP",
  "PHONE",
  "QR",
  "WALK_IN",
] as const;
export type SourceChannel = (typeof SOURCE_CHANNELS)[number];

export const STATUS_LABELS: Record<TicketStatus, string> = {
  NEW: "งานใหม่",
  OPEN: "รับเรื่องแล้ว",
  ASSIGNED: "มอบหมายช่างแล้ว",
  IN_PROGRESS: "กำลังดำเนินการ",
  PENDING_CUSTOMER: "รอลูกค้า/รอนัด",
  PENDING_PARTS: "รออะไหล่",
  RESOLVED: "แก้ไขเสร็จแล้ว",
  CLOSED: "ปิดงาน",
  CANCELLED: "ยกเลิก",
};

export const STATUS_BADGE_CLASSES: Record<TicketStatus, string> = {
  NEW: "bg-blue-50 text-blue-700 border-blue-200",
  OPEN: "bg-indigo-50 text-indigo-700 border-indigo-200",
  ASSIGNED: "bg-cyan-50 text-cyan-700 border-cyan-200",
  IN_PROGRESS: "bg-amber-50 text-amber-700 border-amber-200",
  PENDING_CUSTOMER: "bg-purple-50 text-purple-700 border-purple-200",
  PENDING_PARTS: "bg-orange-50 text-orange-700 border-orange-200",
  RESOLVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  CLOSED: "bg-slate-100 text-slate-700 border-slate-200",
  CANCELLED: "bg-rose-50 text-rose-700 border-rose-200",
};

export const PRIORITY_LABELS: Record<TicketPriority, string> = {
  P1: "P1 · วิกฤต",
  P2: "P2 · เร่งด่วน",
  P3: "P3 · ปกติ",
  P4: "P4 · ไม่เร่งด่วน",
};

export const PRIORITY_BADGE_CLASSES: Record<TicketPriority, string> = {
  P1: "bg-rose-100 text-rose-800 border-rose-300",
  P2: "bg-orange-100 text-orange-800 border-orange-300",
  P3: "bg-amber-50 text-amber-800 border-amber-200",
  P4: "bg-emerald-50 text-emerald-800 border-emerald-200",
};

export const EQUIPMENT_LABELS: Record<EquipmentType, string> = {
  PRINTER: "เครื่องพิมพ์ (Printer)",
  COMPUTER: "คอมพิวเตอร์ / ฮาร์ดแวร์",
  NETWORK: "ระบบเครือข่าย (Network / Wi-Fi)",
  SOFTWARE: "ซอฟต์แวร์ / โปรแกรม",
  OTHER: "อุปกรณ์อื่นๆ",
};

export const SOURCE_CHANNEL_LABELS: Record<SourceChannel, string> = {
  WEB: "หน้าเว็บไซต์",
  LINE_GROUP: "กลุ่ม LINE",
  PHONE: "โทรศัพท์",
  QR: "สแกน QR Code",
  WALK_IN: "แจ้งหน้างาน",
};

export const IMPACT_LABELS: Record<TicketImpact, string> = {
  ORG: "ทั้งองค์กร / ระบบหลัก",
  DEPT: "ทั้งแผนก / จุดบริการผู้ป่วย",
  USER: "ผู้ใช้คนเดียว / เครื่องเดียว",
};

export const URGENCY_LABELS: Record<TicketUrgency, string> = {
  CRITICAL: "หยุดงานทันที",
  HIGH: "ทำงานได้แบบจำกัด",
  NORMAL: "ไม่เร่งด่วน",
};

export const QUEUE_LABELS: Record<TicketQueue, string> = {
  PRINTER: "ทีม Printer",
  GENERAL: "ทีม General",
};

export const ALLOWED_STATUS_TRANSITIONS: Record<TicketStatus, TicketStatus[]> = {
  NEW: ["OPEN", "ASSIGNED", "CANCELLED"],
  OPEN: ["ASSIGNED", "IN_PROGRESS", "RESOLVED", "CANCELLED"],
  ASSIGNED: ["IN_PROGRESS", "PENDING_CUSTOMER", "PENDING_PARTS", "RESOLVED", "CANCELLED"],
  IN_PROGRESS: ["PENDING_CUSTOMER", "PENDING_PARTS", "RESOLVED", "CANCELLED"],
  PENDING_CUSTOMER: ["IN_PROGRESS", "RESOLVED", "CANCELLED"],
  PENDING_PARTS: ["IN_PROGRESS", "RESOLVED", "CANCELLED"],
  RESOLVED: ["CLOSED", "IN_PROGRESS"],
  CLOSED: [],
  CANCELLED: [],
};

export const PAUSED_STATUSES: ReadonlySet<TicketStatus> = new Set([
  "PENDING_CUSTOMER",
  "PENDING_PARTS",
]);

