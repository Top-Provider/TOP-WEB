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

export const DEFAULT_SOLUTION_GROUPS = [
  { value: "Healthcare Solution", label: "Healthcare Solution (โซลูชันทางการแพทย์และสาธารณสุข)" },
  { value: "Paperless Solution", label: "Paperless Solution (โซลูชันระบบองค์กรไร้กระดาษ)" },
  { value: "E-Learning Platform", label: "E-Learning Platform (แพลตฟอร์มการเรียนรู้ออนไลน์)" },
  { value: "Disaster & Incident CMS", label: "Disaster & Incident CMS (ระบบจัดการเหตุฉุกเฉินและสาธารณภัย)" },
  { value: "Enterprise Portal", label: "Enterprise Portal (พอร์ทัลบริการข้อมูลองค์กร)" },
];

export const DEFAULT_PROGRAM_CATEGORIES = [
  { value: "Hospital Claim", label: "Hospital Claim (ระบบบริหารและเบิกจ่ายค่ารักษา)" },
  { value: "Smart IPD", label: "Smart IPD (ระบบบริหารจัดการผู้ป่วยในอัจฉริยะ)" },
  { value: "Smart Hospital", label: "Smart Hospital (ระบบบริหารโรงพยาบาลอัจฉริยะ)" },
  { value: "Public Health CMS", label: "Public Health CMS (ระบบสารสนเทศสุขภาพชุมชน/สาธารณสุข)" },
  { value: "Hospital HIS", label: "Hospital HIS (โปรแกรมบริหารจัดการโรงพยาบาลครบวงจร)" },
  { value: "Pharmacy & Stock", label: "Pharmacy & Stock (คลังยาและเวชภัณฑ์)" },
  { value: "Queue & Triage", label: "Queue & Triage (คัดกรองและคิวอัตโนมัติ)" },
  { value: "Medical Record (EMR)", label: "Medical Record / EMR (เวชระเบียน)" },
  { value: "Telemedicine", label: "Telemedicine (การแพทย์ทางไกล)" },
  { value: "Financial & Billing", label: "Financial & Billing (การเงินและบัญชี)" },
];

export const DEFAULT_PRINTER_CATEGORIES = [
  { value: "Black & White Laser Printer", label: "Black & White Laser Printer" },
  { value: "Color Laser Printer", label: "Color Laser Printer" },
  { value: "Inkjet Printer", label: "Inkjet Printer" },
  { value: "Large Format Printer", label: "Large Format Printer" },
  { value: "Thermal Printer", label: "Thermal Printer" },
  { value: "Thermal Wristband Printer", label: "Thermal Wristband Printer" },
  { value: "Dot Matrix Printer", label: "Dot Matrix Printer" },
];

export const DEFAULT_SUPPLY_CATEGORIES = [
  { value: "Toner", label: "Toner" },
  { value: "Sticker", label: "Sticker" },
  { value: "Wristband", label: "Wristband" },
  { value: "Ribbon", label: "Ribbon" },
  { value: "Form", label: "Form" },
];

export const DEFAULT_HARDWARE_CATEGORIES = [
  { value: "Handheld Barcode Scanner", label: "Handheld Barcode Scanner" },
  { value: "Barcode Scanner", label: "Barcode Scanner" },
  { value: "Scanner", label: "Scanner" },
  { value: "UPS", label: "UPS" },
  { value: "Computer", label: "Computer" },
  { value: "Display", label: "Display" },
  { value: "Projector", label: "Projector" },
  { value: "Camera", label: "Camera" },
  { value: "Mobile", label: "Mobile" },
];

export const DEFAULT_NETWORK_CATEGORIES = [
  { value: "Server", label: "Server" },
  { value: "Storage", label: "Storage" },
  { value: "License", label: "License" },
  { value: "Software Install Client", label: "Software Install Client" },
];

export async function GET() {
  try {
    let solutionGroups = [...DEFAULT_SOLUTION_GROUPS];
    let programCategories = [...DEFAULT_PROGRAM_CATEGORIES];
    let printerCategories = [...DEFAULT_PRINTER_CATEGORIES];
    let supplyCategories = [...DEFAULT_SUPPLY_CATEGORIES];
    let hardwareCategories = [...DEFAULT_HARDWARE_CATEGORIES];
    let networkCategories = [...DEFAULT_NETWORK_CATEGORIES];

    // 1. ลองดึงจากตาราง TBM_PROGRAM_OPTIONS
    const { data: optionsData, error: optErr } = await supabase
      .from("TBM_PROGRAM_OPTIONS")
      .select("option_type, value, label, display_order, is_active")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (!optErr && optionsData && optionsData.length > 0) {
      const groups = optionsData
        .filter((o) => o.option_type === "solution_group")
        .map((o) => ({ value: o.value, label: o.label || o.value }));

      const cats = optionsData
        .filter((o) => o.option_type === "program_category")
        .map((o) => ({ value: o.value, label: o.label || o.value }));

      const printers = optionsData
        .filter((o) => o.option_type === "printer" || o.option_type === "printer_category")
        .map((o) => ({ value: o.value, label: o.label || o.value }));

      const supplies = optionsData
        .filter((o) => o.option_type === "supply" || o.option_type === "supply_category")
        .map((o) => ({ value: o.value, label: o.label || o.value }));

      const hardwares = optionsData
        .filter((o) => o.option_type === "hardware" || o.option_type === "hardware_category")
        .map((o) => ({ value: o.value, label: o.label || o.value }));

      const networks = optionsData
        .filter((o) => o.option_type === "network" || o.option_type === "network_category")
        .map((o) => ({ value: o.value, label: o.label || o.value }));

      if (groups.length > 0) solutionGroups = groups;
      if (cats.length > 0) programCategories = cats;
      if (printers.length > 0) printerCategories = printers;
      if (supplies.length > 0) supplyCategories = supplies;
      if (hardwares.length > 0) hardwareCategories = hardwares;
      if (networks.length > 0) networkCategories = networks;

      return NextResponse.json({
        success: true,
        source: "TBM_PROGRAM_OPTIONS",
        solutionGroups,
        programCategories,
        printerCategories,
        supplyCategories,
        hardwareCategories,
        networkCategories,
      });
    }

    return NextResponse.json({
      success: true,
      source: "default_fallback",
      solutionGroups,
      programCategories,
      printerCategories,
      supplyCategories,
      hardwareCategories,
      networkCategories,
    });
  } catch (error) {
    console.error("[program-options API Error]:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error fetching program options",
        solutionGroups: DEFAULT_SOLUTION_GROUPS,
        programCategories: DEFAULT_PROGRAM_CATEGORIES,
        printerCategories: DEFAULT_PRINTER_CATEGORIES,
        supplyCategories: DEFAULT_SUPPLY_CATEGORIES,
        hardwareCategories: DEFAULT_HARDWARE_CATEGORIES,
        networkCategories: DEFAULT_NETWORK_CATEGORIES,
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { option_type, value, label, display_order = 0, is_active = true } = body;

    if (!option_type || !value) {
      return NextResponse.json(
        { success: false, error: "option_type and value are required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("TBM_PROGRAM_OPTIONS")
      .upsert(
        {
          option_type,
          value,
          label: label || value,
          display_order,
          is_active,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "option_type,value" }
      )
      .select();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, error: "id is required" }, { status: 400 });
    }
    const { error } = await supabase.from("TBM_PROGRAM_OPTIONS").delete().eq("id", id);
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
    return NextResponse.json({ success: true, message: "Deleted successfully" });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
