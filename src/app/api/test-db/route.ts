import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const startTime = Date.now();
  try {
    // 1. Test basic ping & version
    const versionRes = await query('SELECT version(), current_database(), current_user;');
    const row = versionRes.rows[0];

    // 2. Query available tables in public schema
    const tablesRes = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    const tableNames = tablesRes.rows.map((r: { table_name: string }) => r.table_name);

    // 3. Check counts for our 5 main tables if they exist
    const counts: Record<string, number | string> = {};
    for (const tName of ['TBM_PRODUCT_CATEGORIES', 'TBM_PROGRAM_OPTIONS', 'TB_PRODUCTS', 'TB_PRODUCT_SOFTWARE', 'TB_SOLUTION_TOPICS']) {
      if (tableNames.includes(tName)) {
        try {
          const countRes = await query(`SELECT COUNT(*) FROM public."${tName}"`);
          counts[tName] = parseInt(countRes.rows[0].count, 10);
        } catch {
          counts[tName] = 'error reading';
        }
      } else if (tableNames.includes(tName.toLowerCase())) {
        try {
          const countRes = await query(`SELECT COUNT(*) FROM public.${tName.toLowerCase()}`);
          counts[tName.toLowerCase()] = parseInt(countRes.rows[0].count, 10);
        } catch {
          counts[tName.toLowerCase()] = 'error reading';
        }
      } else {
        counts[tName] = 'not created yet';
      }
    }

    const duration = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      message: '🎉 เชื่อมต่อ PostgreSQL สำเร็จ 100%!',
      latencyMs: duration,
      database: row.current_database,
      user: row.current_user,
      postgresVersion: row.version,
      publicTablesFound: tableNames,
      tableCounts: counts,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('[Database Test Connection Error]:', err);

    return NextResponse.json(
      {
        success: false,
        message: '❌ ไม่สามารถเชื่อมต่อกับ PostgreSQL ได้',
        error: errorMsg,
        suggestion:
          'โปรดตรวจสอบว่า PostgreSQL Service กำลังรันอยู่บนพอร์ต 15432 และชื่อฐานข้อมูลกับรหัสผ่านใน .env.local ถูกต้อง',
      },
      { status: 500 }
    );
  }
}

