import { NextRequest } from "next/server";
import { query } from "@/lib/db";
import { hashToken } from "@/lib/password";
import { HttpError } from "@/lib/api-error";

export const SESSION_COOKIE = "top_admin_session";
export const SESSION_SECONDS = 60 * 60 * 8;
export type AccountRole = "admin" | "viewer";

export function checkOrigin(req: Request) {
  const origin = req.headers.get("origin");
  const expected = process.env.APP_ORIGIN || new URL(req.url).origin;
  if (!origin || origin !== expected) throw new HttpError(403, "คำขอนี้ไม่ได้มาจากเว็บไซต์ที่อนุญาต");
}

async function requireAccount(req: NextRequest) {
  if (!["GET", "HEAD"].includes(req.method)) checkOrigin(req);
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token || !/^[a-f0-9]{64}$/.test(token)) throw new HttpError(401, "กรุณาเข้าสู่ระบบ");
  const result = await query(`SELECT a.id, a.username, a.role, a.org_name FROM admin_sessions s
    JOIN admin_accounts a ON a.id = s.account_id
    WHERE s.token_hash = $1 AND s.expires_at > now() AND a.is_active = true`, [hashToken(token)]);
  const user = result.rows[0];
  if (!user) throw new HttpError(401, "เซสชันหมดอายุ กรุณาเข้าสู่ระบบอีกครั้ง");
  return {
    id: Number(user.id),
    username: String(user.username),
    role: String(user.role) as AccountRole,
    org_name: user.org_name ? String(user.org_name) : null,
  };
}

export async function requireAdmin(req: NextRequest) {
  const user = await requireAccount(req);
  if (user.role !== "admin") throw new HttpError(403, "บัญชีนี้ไม่มีสิทธิ์ผู้ดูแลระบบ");
  return { ...user, role: "admin" as const };
}

export async function requireHelpdeskUser(req: NextRequest) {
  const user = await requireAccount(req);
  if (user.role !== "viewer" && user.role !== "admin") {
    throw new HttpError(403, "บัญชีนี้ไม่มีสิทธิ์ใช้งานระบบแจ้งซ่อม");
  }
  return user;
}

export type HelpdeskAccount = Awaited<ReturnType<typeof requireHelpdeskUser>>;

export function canAccessHelpdeskTicket(
  account: HelpdeskAccount,
  ticket: { created_by: string; customer_org: string }
) {
  if (account.role === "admin") return true;
  if (ticket.created_by === account.username) return true;
  return Boolean(account.org_name && ticket.customer_org === account.org_name);
}

export function assertHelpdeskTicketAccess(
  account: HelpdeskAccount,
  ticket: { created_by: string; customer_org: string }
) {
  if (!canAccessHelpdeskTicket(account, ticket)) {
    throw new HttpError(403, "คุณไม่มีสิทธิ์เข้าถึงใบแจ้งซ่อมนี้");
  }
}
