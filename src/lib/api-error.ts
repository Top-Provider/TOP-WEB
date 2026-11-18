import { NextResponse } from "next/server";
import { ZodError } from "zod";

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

const DB_CONNECTION_CODES = new Set([
  "ECONNREFUSED",
  "ECONNRESET",
  "ETIMEDOUT",
  "ENOTFOUND",
  "EHOSTUNREACH",
  "08001",
  "08006",
  "57P01",
]);

export function isDbConnectionError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const err = error as { code?: string; message?: string; errors?: unknown[] };
  if (err.code && DB_CONNECTION_CODES.has(err.code)) return true;
  if (Array.isArray(err.errors) && err.errors.some((e) => isDbConnectionError(e))) {
    return true;
  }
  const msg = (err.message || "").toLowerCase();
  return (
    msg.includes("econnrefused") ||
    msg.includes("econnreset") ||
    msg.includes("etimedout") ||
    msg.includes("connection terminated") ||
    msg.includes("timeout exceeded")
  );
}

export function apiError(error: unknown) {
  if (error instanceof HttpError) {
    return NextResponse.json({ success: false, error: error.message }, { status: error.status });
  }
  if (error instanceof ZodError || error instanceof SyntaxError) {
    return NextResponse.json(
      { success: false, error: "ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบข้อมูลที่ส่ง" },
      { status: 400 }
    );
  }
  console.error("[API error]", error);
  if (isDbConnectionError(error)) {
    return NextResponse.json(
      { success: false, error: "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ฐานข้อมูลได้ กรุณาลองใหม่อีกครั้ง" },
      { status: 503 }
    );
  }
  return NextResponse.json(
    { success: false, error: "ไม่สามารถดำเนินการได้ กรุณาลองใหม่อีกครั้ง" },
    { status: 500 }
  );
}
