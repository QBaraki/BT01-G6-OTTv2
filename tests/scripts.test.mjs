import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createScriptRepository } from "../server/scripts.mjs";

test("stores language while keeping legacy scripts as JavaScript", async () => {
  const root = await mkdtemp(join(tmpdir(), "ott-scripts-"));
  try {
    const repository = createScriptRepository(root);
    const python = await repository.save(
      "12345678-1234-1234-1234-123456789abc",
      "Python bot",
      "def get_move(state): return None",
      "hash",
      "python",
    );
    assert.equal(python.language, "python");
    const legacyPath = join(root, "scripts", "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa.json");
    await writeFile(
      legacyPath,
      JSON.stringify({
        id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
        name: "Old bot",
        source: "export function getMove() {}",
        sha256: "old-hash",
        createdAt: "2025-01-01T00:00:00.000Z",
      }),
    );

    assert.equal(
      (await repository.get("12345678-1234-1234-1234-123456789abc")).language,
      "python",
    );
    assert.equal(
      (await repository.list()).find((script) => script.name === "Old bot")
        .language,
      "javascript",
    );
    assert.equal(
      JSON.parse(await readFile(legacyPath, "utf8")).name,
      "Old bot",
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
