import { pgSelect } from "./db";

export interface TeamMember {
  id?: number;
  name: string;
  role: string;
  badge: string;
  bio: string;
  imageSrc: string;
}

const EXECUTIVE_ROLES = ["CEO", "MD", "CIO", "CFO", "CTO", "COO", "VP"];

export function mapUsersToTeam(users: Record<string, unknown>[]): TeamMember[] {
  const filtered = users.filter((u) => {
    const showHome = Boolean(u.show_on_home);
    const roleStr = String(u.job_role || "").toUpperCase();
    return showHome || EXECUTIVE_ROLES.includes(roleStr);
  });

  return filtered.map((u) => {
    const fullNameEn = [u.prefix_en, u.first_name_en, u.last_name_en]
      .filter(Boolean)
      .join(" ")
      .trim();
    const fullNameTh = [u.prefix_th, u.first_name_th, u.last_name_th]
      .filter(Boolean)
      .join(" ")
      .trim();
    const rawAvatar = typeof u.avatar_url === "string" ? u.avatar_url : "";
    const imageSrc = rawAvatar.startsWith("data:")
      ? `/api/team-image/${u.id}`
      : rawAvatar || "/images/team_1.jpg";

    return {
      id: Number(u.id),
      name: fullNameTh || fullNameEn || "บุคลากรผู้เชี่ยวชาญ",
      role: (u.position as string) || (u.department as string) || "",
      badge:
        (u.badge as string) ||
        (u.job_role as string) ||
        (u.position as string) ||
        "Executive",
      bio: (u.bio as string) || "",
      imageSrc,
    };
  });
}

export async function listTeamMembers(): Promise<TeamMember[]> {
  const rows = await pgSelect({
    table: "TB_USERS",
    select:
      "id,prefix_th,first_name_th,last_name_th,prefix_en,first_name_en,last_name_en,position,department,job_role,badge,bio,avatar_url,sort_order,show_on_home,is_active",
    where: { is_active: true },
    orderBy: "sort_order",
    orderDir: "asc",
  });
  return mapUsersToTeam(rows as Record<string, unknown>[]);
}
