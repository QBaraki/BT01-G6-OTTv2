import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { delimiter, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const worker = await readFile(
  join(dirname(fileURLToPath(import.meta.url)), "sandbox-worker.cjs"),
  "utf8",
);
const pythonWorker = await readFile(
  join(dirname(fileURLToPath(import.meta.url)), "sandbox-python-worker.py"),
  "utf8",
);
const IMAGES = {
  javascript: process.env.BOT_DOCKER_IMAGE || "node:22-alpine",
  python: process.env.BOT_PYTHON_DOCKER_IMAGE || "python:3.13-alpine",
  c: process.env.BOT_C_DOCKER_IMAGE || "gcc:14",
};
const dockerCli =
  process.env.BOT_DOCKER_CLI ||
  (process.platform === "win32"
    ? join(
        process.env.ProgramFiles || "C:\\Program Files",
        "Docker",
        "Docker",
        "resources",
        "bin",
        "docker.exe",
      )
    : "docker");
const dockerEnv = {
  PATH: [
    process.platform === "win32" ? dirname(dockerCli) : "",
    process.env.PATH || process.env.Path || "/usr/bin:/bin",
  ]
    .filter(Boolean)
    .join(delimiter),
  ...(process.platform === "win32"
    ? {
        ...(process.env.USERPROFILE
          ? { USERPROFILE: process.env.USERPROFILE }
          : {}),
        ...(process.env.APPDATA ? { APPDATA: process.env.APPDATA } : {}),
        ...(process.env.LOCALAPPDATA
          ? { LOCALAPPDATA: process.env.LOCALAPPDATA }
          : {}),
        ...(process.env.SYSTEMROOT
          ? { SYSTEMROOT: process.env.SYSTEMROOT }
          : {}),
      }
    : {}),
};
const MAX_OUTPUT = 16 * 1024;

export async function runSandboxedMove(bot, snapshot, timeoutMs = 2500) {
  if (!Number.isInteger(timeoutMs) || timeoutMs < 100 || timeoutMs > 10000)
    throw Error("Invalid timeout");
  const language = bot.language || "javascript";
  if (!Object.hasOwn(IMAGES, language))
    throw Error(`Unsupported bot language: ${language}`);
  const name = `ott-bot-${randomUUID()}`;
  const args = [
    "run",
    "--rm",
    "-i",
    "--name",
    name,
    "--network",
    "none",
    "--read-only",
    "--cap-drop",
    "ALL",
    "--security-opt",
    "no-new-privileges",
    "--pids-limit",
    "32",
    "--memory",
    "128m",
    "--memory-swap",
    "128m",
    "--cpus",
    "0.5",
    "--user",
    "65534:65534",
    "--tmpfs",
    "/tmp:rw,noexec,nosuid,size=1m",
    "--tmpfs",
    "/work:rw,exec,nosuid,size=8m,uid=65534,gid=65534,mode=700",
    IMAGES[language],
  ];
  if (language === "javascript")
    args.push("node", "-e", worker);
  else if (language === "python")
    args.push("python3", "-c", pythonWorker);
  else
    args.push(
      "sh",
      "-c",
      "printf '%s' \"$OTT_BOT_SOURCE\" | base64 -d > /work/bot.c && gcc -O2 -std=c11 -o /work/bot /work/bot.c && exec /work/bot",
    );
  if (language === "c")
    args.splice(
      args.length - 4,
      0,
      "--env",
      `OTT_BOT_SOURCE=${Buffer.from(bot.source, "utf8").toString("base64")}`,
    );
  const input =
    language === "c"
      ? JSON.stringify(snapshot)
      : JSON.stringify({ source: bot.source, snapshot });
  return await new Promise((resolve, reject) => {
    const child = spawn(dockerCli, args, {
      stdio: ["pipe", "pipe", "pipe"],
      env: dockerEnv,
      windowsHide: true,
    });
    let output = "",
      err = "",
      done = false;
    const cleanup = () => {
      clearTimeout(timer);
    };
    const fail = (e) => {
      if (done) return;
      done = true;
      cleanup();
      reject(e);
    };
    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      const remove = spawn(dockerCli, ["rm", "-f", name], {
        stdio: "ignore",
        env: dockerEnv,
        windowsHide: true,
      });
      remove.on("error", () => {});
      fail(new Error("Bot timeout: sandbox terminated"));
    }, timeoutMs);
    child.on("error", (e) =>
      fail(new Error(`Docker unavailable: ${e.message}`)),
    );
    child.stdout.on("data", (chunk) => {
      output += chunk.toString();
      if (output.length > MAX_OUTPUT) {
        child.kill("SIGKILL");
        const remove = spawn(dockerCli, ["rm", "-f", name], {
          stdio: "ignore",
          env: dockerEnv,
          windowsHide: true,
        });
        remove.on("error", () => {});
        fail(new Error("Bot output exceeds limit"));
      }
    });
    child.stderr.on("data", (chunk) => {
      err += chunk.toString().slice(0, 1024);
    });
    child.on("close", (code) => {
      if (done) return;
      try {
        const result = JSON.parse(output.trim());
        if (language === "c") {
          if (code !== 0) throw Error(`C bot exited with status ${code}`);
          done = true;
          cleanup();
          resolve(result);
          return;
        }
        if (!result.ok) throw Error(`Bot error: ${result.error}`);
        done = true;
        cleanup();
        resolve(result.decision);
      } catch (e) {
        fail(
          new Error(
            `Sandbox failed (exit ${code}): ${String(e.message).slice(0, 250)} ${err.slice(0, 100)}`,
          ),
        );
      }
    });
    child.stdin.on("error", () => {});
    child.stdin.end(input);
  });
}
