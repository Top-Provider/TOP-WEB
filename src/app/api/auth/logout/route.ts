import { NextRequest, NextResponse } from "next/server";
import { checkOrigin, SESSION_COOKIE } from "@/lib/admin-auth";
import { hashToken } from "@/lib/password";
import { query } from "@/lib/db";
import { apiError } from "@/lib/api-error";
export async function POST(req: NextRequest) {
  try {
    checkOrigin(req);
    const token = req.cookies.get(SESSION_COOKIE)?.value;
    if (token) await query("DELETE FROM admin_sessions WHERE token_hash = $1", [hashToken(token)]);
    const response = NextResponse.json({ success: true });
    response.cookies.set(SESSION_COOKIE, "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: 0 });
    return response;
  } catch (error) { return apiError(error); }
}
