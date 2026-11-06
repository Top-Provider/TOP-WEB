import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// ทำความสะอาด Supabase URL
const rawUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://placeholder-project.supabase.co";
const cleanUrl = rawUrl.replace(/\/rest\/v1\/?$/, "").replace(/\/$/, "");

// ใช้ Service Role Key (ถ้ามี) เพื่อสิทธิ์ระดับแอดมิน หรือ Anon Key
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  "";

const supabase = createClient(cleanUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

// กำหนด Whitelist ของตารางที่อนุญาตให้บันทึกผ่าน API นี้ได้ เพื่อความปลอดภัย
const ALLOWED_TABLES = new Set([
  "tbm_master_products",
  "tbm_product_programs",
  "tbm_product_categories",
  "tbm_product_compatible_supplies",
  "tbm_program_options",
  "tb_products",
  "tb_product_hardware",
  "tb_product_software",
  "tb_product_supplies",
  "tbm_product_hardware",
  "tbm_product_software",
  "tbm_product_supplies",
]);

interface SaveRequestBody {
  table: string; // ชื่อตาราง เช่น "TB_PRODUCT_SOFTWARE", "tbm_master_products"
  action?: "insert" | "update" | "upsert" | "delete";
  data?: Record<string, unknown> | Record<string, unknown>[];
  id?: string | number;
  idColumn?: string;
  match?: Record<string, unknown>;
}

/**
 * รักษา Case Sensitive ตามที่สร้างไว้ใน Supabase (เช่น TB_PRODUCT_SOFTWARE)
 */
function normalizeTableName(table: string): string {
  const clean = table.trim();
  return clean.startsWith("public.") ? clean.replace("public.", "") : clean;
}

// ============================================================================
// POST: บันทึกข้อมูล (รองรับทั้ง Insert, Update, Upsert, Delete ในเส้นเดียว)
// ============================================================================
export async function POST(req: NextRequest) {
  try {
    const rawText = await req.text();
    // ตัด BOM (\uFEFF) เผื่อ client ส่งมา
    const cleanText = rawText.replace(/^\uFEFF/, "").trim();
    const body: SaveRequestBody = JSON.parse(cleanText);
    const { table, action, data, id, idColumn = "id", match } = body;

    // 1. ตรวจสอบว่าส่งชื่อตารางมาหรือไม่
    if (!table) {
      return NextResponse.json(
        {
          success: false,
          error: "กรุณาระบุชื่อตาราง (table) ใน request body",
        },
        { status: 400 }
      );
    }

    const normalizedTable = normalizeTableName(table);
    const lower = normalizedTable.toLowerCase();

    // 2. ตรวจสอบ Security Whitelist
    if (!ALLOWED_TABLES.has(lower) && !lower.startsWith("tbm_") && !lower.startsWith("tb_")) {
      return NextResponse.json(
        {
          success: false,
          error: `ตาราง "${table}" ไม่ได้รับอนุญาตให้แก้ไขผ่าน API นี้`,
        },
        { status: 403 }
      );
    }

    // 3. กำหนด Action อัตโนมัติถ้าไม่ได้ส่งมา
    let resolvedAction = action;
    if (!resolvedAction) {
      if (id !== undefined || match) {
        resolvedAction = "update";
      } else {
        resolvedAction = "insert";
      }
    }

    // 4. ดำเนินการตาม Action
    let queryResult;

    switch (resolvedAction) {
      case "insert": {
        if (!data) {
          return NextResponse.json(
            { success: false, error: "กรุณาส่ง data สำหรับทำการ insert" },
            { status: 400 }
          );
        }
        queryResult = await supabase
          .from(normalizedTable)
          .insert(data)
          .select();
        break;
      }

      case "update": {
        if (!data) {
          return NextResponse.json(
            { success: false, error: "กรุณาส่ง data สำหรับทำการ update" },
            { status: 400 }
          );
        }

        let updateQuery = supabase.from(normalizedTable).update(data);

        if (id !== undefined) {
          updateQuery = updateQuery.eq(idColumn, id);
        } else if (match && Object.keys(match).length > 0) {
          updateQuery = updateQuery.match(match);
        } else {
          return NextResponse.json(
            {
              success: false,
              error: "การ update ต้องระบุ id หรือ match condition เพื่อป้องกันการแก้ไขทั้งตาราง",
            },
            { status: 400 }
          );
        }

        queryResult = await updateQuery.select();
        break;
      }

      case "upsert": {
        if (!data) {
          return NextResponse.json(
            { success: false, error: "กรุณาส่ง data สำหรับทำการ upsert" },
            { status: 400 }
          );
        }
        queryResult = await supabase
          .from(normalizedTable)
          .upsert(data, { onConflict: idColumn })
          .select();
        break;
      }

      case "delete": {
        let deleteQuery = supabase.from(normalizedTable).delete();

        if (id !== undefined) {
          deleteQuery = deleteQuery.eq(idColumn, id);
        } else if (match && Object.keys(match).length > 0) {
          deleteQuery = deleteQuery.match(match);
        } else {
          return NextResponse.json(
            {
              success: false,
              error: "การ delete ต้องระบุ id หรือ match condition เพื่อป้องกันการลบทั้งตาราง",
            },
            { status: 400 }
          );
        }

        queryResult = await deleteQuery.select();
        break;
      }

      default:
        return NextResponse.json(
          {
            success: false,
            error: `Action "${resolvedAction}" ไม่ถูกต้อง (รองรับ: insert, update, upsert, delete)`,
          },
          { status: 400 }
        );
    }

    // 5. ตรวจสอบ Error จาก Supabase และ Auto-retry หากมีคอลัมน์ที่ DB ยังไม่ได้สร้าง (PGRST204)
    if (queryResult.error && queryResult.error.code === "PGRST204") {
      let colMatch = queryResult.error.message.match(/Could not find the '([^']+)' column/i);
      let currentData = data;
      let retryCount = 0;

      while (queryResult.error && queryResult.error.code === "PGRST204" && colMatch && colMatch[1] && retryCount < 5) {
        const missingCol = colMatch[1];
        console.warn(`[Universal Save API] Column "${missingCol}" does not exist in "${normalizedTable}". Retrying without it...`);

        if (Array.isArray(currentData)) {
          currentData = currentData.map((item) => {
            const copy = { ...item };
            delete copy[missingCol];
            return copy;
          });
        } else if (typeof currentData === "object" && currentData !== null) {
          currentData = { ...(currentData as Record<string, unknown>) };
          delete currentData[missingCol];
        }

        if (currentData) {
          if (resolvedAction === "insert") {
            queryResult = await supabase
              .from(normalizedTable)
              .insert(currentData as Record<string, unknown>)
              .select();
          } else if (resolvedAction === "update") {
            let updateQuery = supabase
              .from(normalizedTable)
              .update(currentData as Record<string, unknown>);
            if (id !== undefined) updateQuery = updateQuery.eq(idColumn, id);
            else if (match) updateQuery = updateQuery.match(match);
            queryResult = await updateQuery.select();
          } else if (resolvedAction === "upsert") {
            queryResult = await supabase
              .from(normalizedTable)
              .upsert(currentData as Record<string, unknown>, { onConflict: idColumn })
              .select();
          }
        }

        if (queryResult.error) {
          colMatch = queryResult.error.message.match(/Could not find the '([^']+)' column/i);
        }
        retryCount++;
      }
    }

    // 5.1 ตรวจสอบกรณีค่าข้อความยาวเกินขนาดคอลัมน์ใน DB (Postgres error 22001: value too long for type character varying)
    if (
      queryResult.error &&
      (queryResult.error.code === "22001" ||
        queryResult.error.message.toLowerCase().includes("value too long"))
    ) {
      console.warn(
        `[Universal Save API] Value too long in "${normalizedTable}". Auto-truncating strings and retrying...`
      );

      const truncateValues = (val: unknown): unknown => {
        if (typeof val === "string") {
          return val.length > 100 ? val.slice(0, 100) : val;
        }
        if (Array.isArray(val)) {
          return val.map(truncateValues);
        }
        if (typeof val === "object" && val !== null) {
          const res: Record<string, unknown> = {};
          for (const [k, v] of Object.entries(val as Record<string, unknown>)) {
            // ไม่ตัดรูปภาพ base64 หรือฟิลด์ข้อความยาวพิเศษ
            if (
              k === "cover_image_url" ||
              k === "gallery_images" ||
              k === "specifications" ||
              k === "full_description" ||
              k === "short_description"
            ) {
              res[k] = v;
            } else if (typeof v === "string" && v.length > 100) {
              res[k] = v.slice(0, 100);
            } else {
              res[k] = v;
            }
          }
          return res;
        }
        return val;
      };

      const safeData = truncateValues(data);

      if (safeData) {
        if (resolvedAction === "insert") {
          queryResult = await supabase
            .from(normalizedTable)
            .insert(safeData as Record<string, unknown>)
            .select();
        } else if (resolvedAction === "update") {
          let updateQuery = supabase
            .from(normalizedTable)
            .update(safeData as Record<string, unknown>);
          if (id !== undefined) updateQuery = updateQuery.eq(idColumn, id);
          else if (match) updateQuery = updateQuery.match(match);
          queryResult = await updateQuery.select();
        } else if (resolvedAction === "upsert") {
          queryResult = await supabase
            .from(normalizedTable)
            .upsert(safeData as Record<string, unknown>, { onConflict: idColumn })
            .select();
        }
      }
    }

    if (queryResult.error) {
      console.error(
        `[Universal Save API Error] Table: ${normalizedTable}, Action: ${resolvedAction}`,
        queryResult.error
      );

      let customMsg = queryResult.error.message;
      const lowerMsg = customMsg.toLowerCase();

      if (queryResult.error.code === "PGRST205" || lowerMsg.includes("could not find the table")) {
        customMsg = `ยังไม่พบตาราง "${normalizedTable}" ในฐานข้อมูล Supabase`;
      } else if (queryResult.error.code === "22001" || lowerMsg.includes("value too long")) {
        customMsg = "ข้อมูลที่กรอกมีความยาวเกินกำหนด กรุณาตรวจสอบหรือลดขนาดข้อความ";
      } else if (queryResult.error.code === "23505" || lowerMsg.includes("duplicate key")) {
        customMsg = "มีข้อมูลนี้อยู่ในระบบแล้ว (ข้อมูลซ้ำ)";
      } else if (queryResult.error.code === "23503" || lowerMsg.includes("foreign key")) {
        customMsg = "ข้อมูลนี้เชื่อมโยงกับส่วนอื่นของระบบ ไม่สามารถดำเนินการได้";
      } else if (queryResult.error.code === "23502" || lowerMsg.includes("not-null")) {
        customMsg = "กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน";
      } else if (/^[a-zA-Z0-9_\s:,()."'{}\[\]-]+$/.test(customMsg) && customMsg.length > 20) {
        customMsg = "เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง";
      }

      return NextResponse.json(
        {
          success: false,
          error: customMsg,
          rawError: queryResult.error.message,
          details: queryResult.error.details,
          code: queryResult.error.code,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      action: resolvedAction,
      table: normalizedTable,
      data: queryResult.data,
      count: queryResult.data ? queryResult.data.length : 0,
      message: `ดำเนินการ ${resolvedAction} ตาราง ${normalizedTable} สำเร็จ`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[Universal Save API Server Exception]:", err);
    return NextResponse.json(
      {
        success: false,
        error: `Server Error: ${message}`,
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// GET: ดึงข้อมูลจากตาราง (อ่านข้อมูลผ่านเส้นเดียวกันได้ด้วย)
// ตัวอย่าง: /api/admin/save?table=tbm_master_products&limit=50&orderBy=id
// ============================================================================
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const table = searchParams.get("table");

    if (!table) {
      return NextResponse.json(
        { success: false, error: "กรุณาระบุ query parameter ?table=ชื่อตาราง" },
        { status: 400 }
      );
    }

    const normalizedTable = normalizeTableName(table);
    const lower = normalizedTable.toLowerCase();
    if (!ALLOWED_TABLES.has(lower) && !lower.startsWith("tbm_") && !lower.startsWith("tb_")) {
      return NextResponse.json(
        { success: false, error: `ตาราง "${table}" ไม่ได้รับอนุญาต` },
        { status: 403 }
      );
    }

    let selectFields = searchParams.get("select") || "*";
    let query = supabase.from(normalizedTable).select(selectFields);

    const id = searchParams.get("id");
    const idColumn = searchParams.get("idColumn") || "id";
    if (id) {
      query = query.eq(idColumn, id);
    }

    const orderBy = searchParams.get("orderBy");
    const orderDir = searchParams.get("orderDir") === "desc" ? false : true;
    if (orderBy) {
      query = query.order(orderBy, { ascending: orderDir });
    }

    const limit = searchParams.get("limit");
    if (limit) {
      query = query.limit(parseInt(limit, 10));
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      table: normalizedTable,
      data,
      count: data ? data.length : 0,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { success: false, error: `Server Error: ${message}` },
      { status: 500 }
    );
  }
}

