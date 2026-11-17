import { randomBytes, scrypt as scryptCallback, timingSafeEqual, createHash } from "node:crypto";
import { promisify } from "node:util";
const scrypt = promisify(scryptCallback);

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const key = await scrypt(password, salt, 64) as Buffer;
  return `scrypt:${salt}:${key.toString("hex")}`;
}

export async function verifyPassword(password: string, hash: string) {
  const [scheme, salt, digest] = hash.split(":");
  if (scheme !== "scrypt" || !/^[a-f0-9]{32}$/.test(salt || "") || !/^[a-f0-9]{128}$/.test(digest || "")) return false;
  const key = await scrypt(password, salt, 64) as Buffer;
  return timingSafeEqual(key, Buffer.from(digest, "hex"));
}

export function hashToken(token: string) { return createHash("sha256").update(token).digest("hex"); }
