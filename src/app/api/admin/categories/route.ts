import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const rawUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://placeholder-project.supabase.co";
const cleanUrl = rawUrl.replace(/\/rest\/v1\/?$/, "").replace(/\/$/, "");

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

export const DEFAULT_CATEGORIES = [
  { id: 1, category_id: "Printing", name: "Printing & Supply Solution", is_active: true },
  { id: 2, category_id: "Hardware", name: "Hardware Solution", is_active: true },
  { id: 3, category_id: "Software", name: "Software Solution", is_active: true },
  { id: 4, category_id: "Network", name: "Network Solution", is_active: true },
  { id: 5, category_id: "Medical", name: "Medical Equipment", is_active: true },
  { id: 6, category_id: "IoT", name: "Smart Solution (IoT)", is_active: true },
];

/**
 * GET: ดึงรายการหมวดหมู่ทั้งหมดจาก TBM_PRODUCT_CATEGORIES
 */
export async function GET() {
  try {
    const { data, error } = await supabase
      .from("TBM_PRODUCT_CATEGORIES")
      .select("*")
      .order("id", { ascending: true });

    if (!error && data && data.length > 0) {
      return NextResponse.json({
        success: true,
        source: "database",
        count: data.length,
        categories: data,
      });
    }

    return NextResponse.json({
      success: true,
      source: "fallback",
      count: DEFAULT_CATEGORIES.length,
      categories: DEFAULT_CATEGORIES,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[Categories GET Exception]:", msg);
    return NextResponse.json({
      success: true,
      source: "fallback",
      count: DEFAULT_CATEGORIES.length,
      categories: DEFAULT_CATEGORIES,
    });
  }
}

/**
 * POST: เพิ่มหมวดหมู่ใหม่
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { category_id, name, is_active = true } = body;

    if (!category_id?.trim() || !name?.trim()) {
      return NextResponse.json(
        { success: false, error: "กรุณาระบุ category_id และ name ให้ครบถ้วน" },
        { status: 400 }
      );
    }

    const payload = {
      category_id: category_id.trim(),
      name: name.trim(),
      is_active: Boolean(is_active),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("TBM_PRODUCT_CATEGORIES")
      .insert(payload)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "เพิ่มหมวดหมู่สำเร็จ",
      data,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { success: false, error: `Server Error: ${msg}` },
      { status: 500 }
    );
  }
}

/**
 * PUT: อัปเดตหมวดหมู่เดิม
 */
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, category_id, name, is_active } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "กรุณาระบุ id ของหมวดหมู่ที่ต้องการแก้ไข" },
        { status: 400 }
      );
    }

    const updateFields: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (category_id !== undefined) updateFields.category_id = String(category_id).trim();
    if (name !== undefined) updateFields.name = String(name).trim();
    if (is_active !== undefined) updateFields.is_active = Boolean(is_active);

    const { data, error } = await supabase
      .from("TBM_PRODUCT_CATEGORIES")
      .update(updateFields)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "อัปเดตหมวดหมู่สำเร็จ",
      data,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { success: false, error: `Server Error: ${msg}` },
      { status: 500 }
    );
  }
}

/**
 * DELETE: ลบหมวดหมู่
 */
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    let id = searchParams.get("id");

    if (!id) {
      const body = await req.json().catch(() => ({}));
      id = body.id;
    }

    if (!id) {
      return NextResponse.json(
        { success: false, error: "กรุณาระบุ id ของหมวดหมู่ที่ต้องการลบ" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("TBM_PRODUCT_CATEGORIES")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "ลบหมวดหมู่สำเร็จ",
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { success: false, error: `Server Error: ${msg}` },
      { status: 500 }
    );
  }
}

