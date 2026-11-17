import { NextResponse } from "next/server";
import { ZodError } from "zod";

export class HttpError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

export function apiError(error: unknown) {
  if (error instanceof HttpError) return NextResponse.json({ success: false, error: error.message }, { status: error.status });
  if (error instanceof ZodError || error instanceof SyntaxError) {
    return NextResponse.json({ success: false, error: "ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบข้อมูลที่ส่ง" }, { status: 400 });
  }
  console.error("[API error]", error);
  return NextResponse.json({ success: false, error: "ไม่สามารถดำเนินการได้ กรุณาลองใหม่อีกครั้ง" }, { status: 500 });
}
