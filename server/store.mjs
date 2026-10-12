import { mkdir, appendFile, readFile } from "node:fs/promises";
import { join } from "node:path";
import { randomUUID, createHash } from "node:crypto";

export function createStore(dataDir) {
  const path = join(dataDir, "submission-events.jsonl");
  let writeQueue = Promise.resolve();
  async function append(event) {
    const row = {
      id: randomUUID(),
      timestamp: new Date().toISOString(),
      ...event,
    };
    writeQueue = writeQueue
      .catch(() => {})
      .then(async () => {
        await mkdir(dataDir, { recursive: true, mode: 0o700 });
        await appendFile(path, JSON.stringify(row) + "\n", {
          encoding: "utf8",
          mode: 0o600,
        });
      });
    await writeQueue;
    return row;
  }
  async function list(limit = 50) {
    await writeQueue;
    try {
      const raw = await readFile(path, "utf8");
      return raw
        .trim()
        .split("\n")
        .filter(Boolean)
        .slice(-Math.max(1, Math.min(limit, 100)))
        .reverse()
        .map((line) => JSON.parse(line));
    } catch (error) {
      if (error.code === "ENOENT") return [];
      throw error;
    }
  }
  return {
    append,
    list,
    hash: (source) => createHash("sha256").update(source).digest("hex"),
  };
}
