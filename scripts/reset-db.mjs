// Deletes the local database. It is recreated and re-seeded on the next request.
// Must match the location in src/lib/db.ts.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const file = process.env.COY_DB_FILE ?? path.join(os.homedir(), ".coy-discover", "coy.db");
for (const suffix of ["", "-wal", "-shm"]) {
  fs.rmSync(file + suffix, { force: true });
}
console.log(`Database reset (${file}). Restart the dev server to start fresh.`);
