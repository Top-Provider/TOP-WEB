/**
 * Client-side helper สำหรับเรียกใช้งาน Universal Save API
 * เส้นทาง: /api/admin/save
 */

export interface SavePayload<T = Record<string, unknown>> {
  table: string; // ชื่อตาราง เช่น "tbm_master_products" หรือ "tbm_product_programs"
  action?: "insert" | "update" | "upsert" | "delete";
  data?: T | T[];
  id?: string | number;
  idColumn?: string;
  match?: Record<string, unknown>;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  action?: string;
  table?: string;
  data?: T;
  count?: number;
  message?: string;
  error?: string;
}

/**
 * ฟังก์ชันหลักสำหรับ บันทึก / แก้ไข / ลบ ข้อมูลผ่าน API เส้นเดียว
 *
 * ตัวอย่างการใช้งาน:
 * 1. เพิ่มข้อมูลใหม่:
 *    await saveRecord({ table: "tbm_master_products", data: { name: "Canon..." } })
 *
 * 2. แก้ไขข้อมูลเดิม:
 *    await saveRecord({ table: "tbm_master_products", id: 12, data: { name: "Canon Updated" } })
 *
 * 3. ลบข้อมูล:
 *    await saveRecord({ table: "tbm_master_products", action: "delete", id: 12 })
 */
export async function saveRecord<T = unknown>(
  payload: SavePayload
): Promise<ApiResponse<T>> {
  try {
    console.log("🚀 [saveRecord] Sending request to /api/admin/save:", payload);
    const res = await fetch("/api/admin/save", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result: ApiResponse<T> = await res.json();

    if (!res.ok || !result.success) {
      throw new Error(result.error || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    }

    return result;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[saveRecord Error]:", message);
    throw new Error(message);
  }
}

/**
 * ดึงข้อมูลจากตารางผ่านเส้นเดียวกัน
 */
export async function fetchRecords<T = unknown>(params: {
  table: string;
  id?: string | number;
  orderBy?: string;
  orderDir?: "asc" | "desc";
  limit?: number;
}): Promise<T[]> {
  try {
    const searchParams = new URLSearchParams();
    searchParams.set("table", params.table);
    if (params.id !== undefined) searchParams.set("id", String(params.id));
    if (params.orderBy) searchParams.set("orderBy", params.orderBy);
    if (params.orderDir) searchParams.set("orderDir", params.orderDir);
    if (params.limit) searchParams.set("limit", String(params.limit));

    const res = await fetch(`/api/admin/save?${searchParams.toString()}`);
    const result = await res.json();

    if (!res.ok || !result.success) {
      throw new Error(result.error || "เกิดข้อผิดพลาดในการดึงข้อมูล");
    }

    return (result.data || []) as T[];
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[fetchRecords Error]:", message);
    throw new Error(message);
  }
}

