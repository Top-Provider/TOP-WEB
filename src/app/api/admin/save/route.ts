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
  "tbm_product_hardware",
  "tbm_product_software",
  "tbm_product_supplies",
]);

interface SaveRequestBody {
  table: string; // ชื่อตาราง เช่น "TBM_PRODUCT_SOFTWARE", "tbm_master_products"
  action?: "insert" | "update" | "upsert" | "delete";
  data?: Record<string, unknown> | Record<string, unknown>[];
  id?: string | number;
  idColumn?: string;
  match?: Record<string, unknown>;
}

/**
 * รักษา Case Sensitive ตามที่สร้างไว้ใน Supabase (เช่น TBM_PRODUCT_SOFTWARE)
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
    if (!ALLOWED_TABLES.has(lower) && !lower.startsWith("tbm_")) {
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

    // 5. ตรวจสอบ Error จาก Supabase
    if (queryResult.error) {
      console.error(
        `[Universal Save API Error] Table: ${normalizedTable}, Action: ${resolvedAction}`,
        queryResult.error
      );

      let customMsg = queryResult.error.message;
      if (customMsg.includes("schema cache") || customMsg.includes("Could not find the table")) {
        customMsg = `ยังไม่พบตาราง "${normalizedTable}" ในฐานข้อมูล Supabase (กรุณานำโค้ด SQL จาก supabase/schema_master_products.sql ไปกด Run ในเมนู SQL Editor บน Supabase Dashboard ก่อนครับ)`;
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
    if (!ALLOWED_TABLES.has(lower) && !lower.startsWith("tbm_")) {
      return NextResponse.json(
        { success: false, error: `ตาราง "${table}" ไม่ได้รับอนุญาต` },
        { status: 403 }
      );
    }

    let query = supabase.from(normalizedTable).select("*");

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

