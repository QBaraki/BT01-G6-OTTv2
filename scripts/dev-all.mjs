import { spawn } from "node:child_process";
const processes = [];
const run = (args, name) => {
  const child = spawn(process.execPath, args, {
    stdio: "inherit",
    env: process.env,
  });
  processes.push(child);
  child.on("exit", (code) => {
    if (code && !stopping) {
      console.error(`${name} stopped: ${code}`);
      shutdown();
    }
  });
};
let stopping = false;
function shutdown() {
  if (stopping) return;
  stopping = true;
  for (const p of processes)
    if (p.pid) {
      if (process.platform === "win32") {
        spawn("taskkill", ["/pid", String(p.pid), "/T", "/F"], {
          stdio: "ignore",
        });
      } else p.kill("SIGTERM");
    }
}
process.on("SIGINT", () => {
  shutdown();
  process.exit(0);
});
process.on("SIGTERM", () => {
  shutdown();
  process.exit(0);
});
run(["server/index.mjs"], "backend");
run(["node_modules/vite/bin/vite.js", "--host", "0.0.0.0"], "Vite");
