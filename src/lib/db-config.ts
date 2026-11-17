export function databaseConfig(env: NodeJS.ProcessEnv = process.env) {
  const common = {
    max: 10, idleTimeoutMillis: 30000, connectionTimeoutMillis: 5000,
    ssl: env.DB_SSL === "true" ? { rejectUnauthorized: true } : false as const,
  };
  if (env.DB_PASSWORD !== undefined && env.DB_NAME) return {
    ...common, host: env.DB_HOST || "localhost", port: Number(env.DB_PORT || 15432),
    user: env.DB_USER || "claim", password: env.DB_PASSWORD, database: env.DB_NAME,
  };
  if (env.DATABASE_URL) return { ...common, connectionString: env.DATABASE_URL };
  throw new Error("Configure DATABASE_URL or DB_HOST/DB_PORT/DB_USER/DB_PASSWORD/DB_NAME");
}
