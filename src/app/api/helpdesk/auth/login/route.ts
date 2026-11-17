import { randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { checkOrigin, SESSION_COOKIE, SESSION_SECONDS } from "@/lib/admin-auth";
import { apiError, HttpError } from "@/lib/api-error";
import { query } from "@/lib/db";
import { hashToken, verifyPassword } from "@/lib/password";

const loginSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(1)
      .max(254)
      .transform((value) => value.toLowerCase()),
    password: z.string().min(1).max(256),
  })
  .strict();

export async function POST(req: NextRequest) {
  try {
    checkOrigin(req);
    const { username, password } = loginSchema.parse(await req.json());
    const accountKey = hashToken(`viewer:${username}`);

    const attempts = await query(
      `INSERT INTO admin_login_attempts (account_key) VALUES ($1)
       ON CONFLICT (account_key) DO UPDATE SET
       attempts = CASE WHEN admin_login_attempts.window_start < now() - interval '15 minutes' THEN 1 ELSE admin_login_attempts.attempts + 1 END,
       window_start = CASE WHEN admin_login_attempts.window_start < now() - interval '15 minutes' THEN now() ELSE admin_login_attempts.window_start END
       RETURNING attempts`,
      [accountKey]
    );

    if (attempts.rows[0].attempts > 10) {
      throw new HttpError(429, "เข้าสู่ระบบไม่สำเร็จหลายครั้ง กรุณาลองใหม่ใน 15 นาที");
    }

    const result = await query(
      "SELECT id, password_hash, role, is_active FROM admin_accounts WHERE username = $1",
      [username]
    );
    const account = result.rows[0];
    const dummyHash = `scrypt:${"0".repeat(32)}:${"0".repeat(128)}`;
    const valid = await verifyPassword(password, account?.password_hash || dummyHash);

    if (!valid || !account?.is_active || account.role !== "viewer") {
      throw new HttpError(401, "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
    }

    const token = randomBytes(32).toString("hex");
    await query(
      "INSERT INTO admin_sessions (token_hash, account_id, expires_at) VALUES ($1, $2, now() + interval '8 hours')",
      [hashToken(token), account.id]
    );
    await query("DELETE FROM admin_sessions WHERE expires_at <= now()");
    await query(
      "DELETE FROM admin_login_attempts WHERE account_key = $1 OR window_start < now() - interval '1 day'",
      [accountKey]
    );

    const response = NextResponse.json({
      success: true,
      user: { username, role: "viewer" },
    });
    response.headers.set("Cache-Control", "no-store");
    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: SESSION_SECONDS,
    });
    return response;
  } catch (error) {
    return apiError(error);
  }
}
