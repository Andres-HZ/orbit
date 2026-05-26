import "dotenv/config";
import { Pool, type QueryResultRow } from "pg";

export const databaseUrl =
  process.env.DATABASE_URL ?? "postgres://orbit:orbit_dev@172.17.0.1:5432/orbit";

export const pool = new Pool({
  connectionString: databaseUrl
});

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = []
) {
  return pool.query<T>(text, params);
}

export async function closePool() {
  await pool.end();
}
