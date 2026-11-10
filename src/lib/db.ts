import { Pool, PoolConfig } from 'pg';

let pool: Pool | null = null;

export function getDbPool(): Pool {
  if (!pool) {
    let config: PoolConfig;

    if (process.env.DB_PASSWORD !== undefined && process.env.DB_NAME) {
      config = {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '15432', 10),
        user: process.env.DB_USER || 'claim',
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        ssl: false,
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
      };
    } else if (process.env.DATABASE_URL) {
      config = {
        connectionString: process.env.DATABASE_URL,
        ssl: false,
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
      };
    } else {
      throw new Error('DATABASE_URL or DB_* credentials are not defined in .env.local');
    }

    pool = new Pool(config);

    pool.on('error', (err) => {
      console.error('[PostgreSQL Pool Unexpected Error]:', err);
    });
  }

  return pool;
}

export async function query(text: string, params?: unknown[]) {
  const p = getDbPool();
  return p.query(text, params);
}

// -----------------------------------------------------------------------------
// High-Level PostgreSQL Helpers for CRUD
// -----------------------------------------------------------------------------

export async function pgSelect(options: {
  table: string;
  select?: string;
  id?: string | number;
  idColumn?: string;
  orderBy?: string;
  orderDir?: 'asc' | 'desc';
  limit?: number;
  where?: Record<string, unknown>;
}) {
  const { table, select = '*', id, idColumn = 'id', orderBy, orderDir = 'asc', limit, where } = options;
  const whereClauses: string[] = [];
  const params: unknown[] = [];

  if (id !== undefined) {
    params.push(id);
    whereClauses.push(`"${idColumn}" = $${params.length}`);
  }

  if (where) {
    for (const [key, value] of Object.entries(where)) {
      params.push(value);
      whereClauses.push(`"${key}" = $${params.length}`);
    }
  }

  let sql = `SELECT ${select === '*' ? '*' : select} FROM public."${table}"`;
  if (whereClauses.length > 0) {
    sql += ` WHERE ${whereClauses.join(' AND ')}`;
  }

  if (orderBy) {
    const dir = orderDir.toLowerCase() === 'desc' ? 'DESC' : 'ASC';
    sql += ` ORDER BY "${orderBy}" ${dir}`;
  }

  if (limit) {
    params.push(limit);
    sql += ` LIMIT $${params.length}`;
  }

  const res = await query(sql, params);
  return res.rows;
}

export async function pgInsert(table: string, data: Record<string, unknown>) {
  const keys = Object.keys(data);
  const columns = keys.map(k => `"${k}"`).join(', ');
  const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
  const values = keys.map(k => {
    const v = data[k];
    if (v === null || v === undefined) return null;
    if (typeof v === 'object') return JSON.stringify(v);
    return v;
  });

  const sql = `INSERT INTO public."${table}" (${columns}) VALUES (${placeholders}) RETURNING *;`;
  const res = await query(sql, values);
  return res.rows[0];
}

export async function pgUpdate(table: string, data: Record<string, unknown>, id: string | number, idColumn = 'id') {
  const keys = Object.keys(data).filter(k => k !== idColumn && k !== 'created_at');
  const setClauses = keys.map((k, i) => `"${k}" = $${i + 1}`).join(', ');
  const values = keys.map(k => {
    const v = data[k];
    if (v === null || v === undefined) return null;
    if (typeof v === 'object') return JSON.stringify(v);
    return v;
  });

  values.push(id);
  const sql = `UPDATE public."${table}" SET ${setClauses}, "updated_at" = now() WHERE "${idColumn}" = $${values.length} RETURNING *;`;
  const res = await query(sql, values);
  return res.rows[0];
}

export async function pgDelete(table: string, id: string | number, idColumn = 'id') {
  const sql = `DELETE FROM public."${table}" WHERE "${idColumn}" = $1 RETURNING *;`;
  const res = await query(sql, [id]);
  return res.rows[0];
}
