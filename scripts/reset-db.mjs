// Deletes the local database. It is recreated and re-seeded on the next request.
import fs from "node:fs";
import path from "node:path";

const dir = path.join(process.cwd(), "data");
for (const name of ["coy.db", "coy.db-wal", "coy.db-shm"]) {
  fs.rmSync(path.join(dir, name), { force: true });
}
console.log("Database reset. Restart the dev server to start fresh.");
