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

export const DEFAULT_BRAND_OPTIONS = [
  { value: "", label: "-- ไม่ระบุแบรนด์ (None / Generic) --" },
  { value: "Canon", label: "Canon" },
  { value: "HP", label: "HP" },
  { value: "Epson", label: "Epson" },
  { value: "Brother", label: "Brother" },
  { value: "Zebra", label: "Zebra" },
  { value: "TSC", label: "TSC" },
  { value: "Bixolon", label: "Bixolon" },
  { value: "Ricoh", label: "Ricoh" },
  { value: "Fujifilm", label: "Fujifilm" },
  { value: "Kyocera", label: "Kyocera" },
  { value: "Other", label: "อื่นๆ (กำหนดเอง)" },
];

export async function GET() {
  try {
    // 1. ดึงจาก TBM_PROGRAM_OPTIONS (option_type = 'brand')
    const { data: optData, error: optErr } = await supabase
      .from("TBM_PROGRAM_OPTIONS")
      .select("value, label, display_order, is_active")
      .eq("option_type", "brand")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (!optErr && optData && optData.length > 0) {
      return NextResponse.json({
        success: true,
        source: "TBM_PROGRAM_OPTIONS",
        brands: optData.map((b) => ({
          value: b.value,
          label: b.label || b.value,
        })),
      });
    }

    // 2. ดึงจาก TBM_PRODUCT_BRANDS เผื่อมีการสร้างตารางเฉพาะ
    const { data: brandData, error: brandErr } = await supabase
      .from("TBM_PRODUCT_BRANDS")
      .select("value, label, display_order, is_active")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (!brandErr && brandData && brandData.length > 0) {
      return NextResponse.json({
        success: true,
        source: "TBM_PRODUCT_BRANDS",
        brands: brandData.map((b) => ({
          value: b.value,
          label: b.label || b.value,
        })),
      });
    }

    return NextResponse.json({
      success: true,
      source: "fallback",
      brands: DEFAULT_BRAND_OPTIONS,
    });
  } catch (err) {
    console.log("Error fetching brands from DB (using default fallback):", err);
    return NextResponse.json({
      success: true,
      source: "fallback",
      brands: DEFAULT_BRAND_OPTIONS,
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // กรณีต้องการ Seed ข้อมูลเริ่มต้นทั้งหมดเข้าฐานข้อมูล
    if (body.action === "seed") {
      const recordsToInsert = DEFAULT_BRAND_OPTIONS.map((item, index) => ({
        option_type: "brand",
        value: item.value,
        label: item.label,
        display_order: index + 1,
        is_active: true,
      }));

      const { data, error } = await supabase
        .from("TBM_PROGRAM_OPTIONS")
        .upsert(recordsToInsert, { onConflict: "option_type,value" })
        .select();

      if (error) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Seeded brands successfully",
        data,
      });
    }

    // กรณีเพิ่มแบรนด์ใหม่เดี่ยวๆ
    const { value, label, display_order = 50 } = body;
    if (!value || !label) {
      return NextResponse.json(
        { success: false, error: "value and label are required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("TBM_PROGRAM_OPTIONS")
      .upsert(
        {
          option_type: "brand",
          value,
          label,
          display_order,
          is_active: true,
        },
        { onConflict: "option_type,value" }
      )
      .select();

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Brand saved successfully",
      data,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { success: false, error: msg },
      { status: 500 }
    );
  }
}
