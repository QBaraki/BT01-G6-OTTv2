import { createServer } from "node:http";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { readFile } from "node:fs/promises";
import { scanScript, MAX_SCRIPT_BYTES } from "./scanner.mjs";
import { createStore } from "./store.mjs";
import { createScriptRepository } from "./scripts.mjs";
import { fightScripts } from "./match.mjs";

const base = dirname(fileURLToPath(import.meta.url));
const dataDir = process.env.BOT_DATA_DIR ?? join(base, "data");
const store = createStore(dataDir);
const scripts = createScriptRepository(dataDir);
let matchBusy = false;
const PORT = Number(process.env.PORT ?? 4174);
const HOST = process.env.HOST ?? "127.0.0.1";
const MAX_BODY = MAX_SCRIPT_BYTES + 4096;
function json(res, status, payload) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
  });
  res.end(JSON.stringify(payload));
}
async function readBody(req) {
  let size = 0;
  const chunks = [];
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY) {
      const error = new Error("Request too large");
      error.status = 413;
      throw error;
    }
    chunks.push(chunk);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    const error = new Error("Invalid JSON");
    error.status = 400;
    throw error;
  }
}
const server = createServer(async (req, res) => {
  try {
    const url = new URL(
      req.url ?? "/",
      `http://${req.headers.host ?? "localhost"}`,
    );
    if (req.method === "GET" && url.pathname === "/") {
      const html = await readFile(join(base, "submission.html"));
      res.writeHead(200, {
        "Content-Type": "text/html; charset=utf-8",
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "no-store",
        "Content-Security-Policy":
          "default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self'; base-uri 'none'; form-action 'self'",
      });
      res.end(html);
      return;
    }
    if (req.method === "GET" && url.pathname === "/client.js") {
      res.writeHead(200, {
        "Content-Type": "text/javascript; charset=utf-8",
        "X-Content-Type-Options": "nosniff",
      });
      res.end(await readFile(join(base, "client.js")));
      return;
    }
    if (req.method === "POST" && url.pathname === "/api/scripts") {
      if (
        !req.headers["content-type"]
          ?.toLowerCase()
          .startsWith("application/json")
      )
        return json(res, 415, { error: "Only application/json supported" });
      const body = await readBody(req);
      if (
        typeof body?.name !== "string" ||
        body.name.trim().length < 1 ||
        body.name.length > 60 ||
        typeof body?.source !== "string"
      )
        return json(res, 400, {
          error: "name (1..60) and source (string) are required",
        });
      const scan = scanScript(body.source);
      const scriptId = randomUUID();
      if (scan.status === "PASSED")
        await scripts.save(
          scriptId,
          body.name.trim(),
          body.source,
          store.hash(body.source),
        );
      const record = await store.append({
        kind: "SCRIPT_SCAN",
        scriptId,
        name: body.name.trim(),
        sha256: store.hash(body.source),
        sizeBytes: Buffer.byteLength(body.source, "utf8"),
        status: scan.status,
        issues: scan.issues,
        scannerVersion: scan.scannerVersion,
      });
      return json(res, 201, {
        scriptId: record.scriptId,
        status: scan.status,
        issues: scan.issues,
        logId: record.id,
        notice:
          "Static scan is not a safety guarantee. Passed scripts can only execute in Docker isolation.",
      });
    }
    if (req.method === "GET" && url.pathname === "/api/scripts")
      return json(res, 200, { scripts: await scripts.list() });
    if (req.method === "POST" && url.pathname === "/api/matches") {
      if (matchBusy)
        return json(res, 429, { error: "A match is already running" });
      if (
        !req.headers["content-type"]
          ?.toLowerCase()
          .startsWith("application/json")
      )
        return json(res, 415, { error: "Only application/json supported" });
      const body = await readBody(req);
      if (
        typeof body?.botA !== "string" ||
        typeof body?.botB !== "string" ||
        body.botA === body.botB
      )
        return json(res, 400, { error: "Choose two different saved bot IDs" });
      const a = await scripts.get(body.botA),
        b = await scripts.get(body.botB);
      if (!a || !b)
        return json(res, 404, {
          error: "Bot ID not found or rejected by scanner",
        });
      const maxTurns = body.maxTurns ?? 80;
      if (!Number.isInteger(maxTurns) || maxTurns < 1 || maxTurns > 200)
        return json(res, 400, { error: "maxTurns must be 1..200" });
      matchBusy = true;
      try {
        const result = await fightScripts(a, b, { maxTurns, timeoutMs: 5000 });
        const { game, ...publicResult } = result;
        const record = await store.append({
          kind: "BOT_MATCH",
          botA: a.id,
          botB: b.id,
          outcome: result.outcome,
          winner: result.winner,
          reason: result.reason,
          events: result.events,
        });
        return json(res, 200, { matchId: record.id, ...publicResult });
      } finally {
        matchBusy = false;
      }
    }
    if (req.method === "GET" && url.pathname === "/api/logs")
      return json(res, 200, { logs: await store.list(50) });
    return json(res, 404, { error: "Not found" });
  } catch (error) {
    json(res, error.status ?? 500, {
      error: error.status ? error.message : "Internal server error",
    });
    if (!error.status) console.error(error);
  }
});
server.listen(PORT, HOST, () =>
  console.log(`Bot submission server: http://${HOST}:${PORT}`),
);
