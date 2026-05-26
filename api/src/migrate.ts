import { readdir, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { pool } from "./db.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function migrate() {
  const migrationsDir = join(__dirname, "migrations");
  const migrationFiles = (await readdir(migrationsDir))
    .filter((file) => file.endsWith(".sql"))
    .sort();

  for (const file of migrationFiles) {
    const migration = await readFile(join(migrationsDir, file), "utf8");
    await pool.query(migration);
  }

  await pool.end();
  console.log("Database migrations complete");
}

migrate().catch(async (error) => {
  console.error(error);
  await pool.end();
  process.exit(1);
});
