import { mkdir, writeFile, readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
const idPattern = /^[0-9a-f-]{36}$/i;
export function createScriptRepository(root) {
  const dir = join(root, "scripts");
  return {
    async save(id, name, source, sha256) {
      if (!idPattern.test(id)) throw Error("Invalid script ID");
      await mkdir(dir, { recursive: true, mode: 0o700 });
      const record = {
        id,
        name,
        source,
        sha256,
        createdAt: new Date().toISOString(),
      };
      await writeFile(join(dir, `${id}.json`), JSON.stringify(record), {
        flag: "wx",
        mode: 0o600,
      });
      return { id, name, sha256, createdAt: record.createdAt };
    },
    async get(id) {
      if (!idPattern.test(id)) return null;
      try {
        return JSON.parse(await readFile(join(dir, `${id}.json`), "utf8"));
      } catch (e) {
        if (e.code === "ENOENT") return null;
        throw e;
      }
    },
    async list() {
      try {
        const ids = (await readdir(dir))
          .filter((f) => idPattern.test(f.slice(0, -5)) && f.endsWith(".json"))
          .slice(-100);
        const result = await Promise.all(
          ids.map(async (file) => {
            const { source, ...rest } = JSON.parse(
              await readFile(join(dir, file), "utf8"),
            );
            return rest;
          }),
        );
        return result.reverse();
      } catch (e) {
        if (e.code === "ENOENT") return [];
        throw e;
      }
    },
  };
}
