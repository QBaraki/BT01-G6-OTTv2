import { at, initialPieces, icons, type Piece, type Pos } from "./game/engine";

type Script = { id: string; name: string };
type Event = {
  turn: number;
  player: 1 | 2;
  bot: string;
  accepted: boolean;
  move?: { pieceId: string; to: Pos };
  detail?: string;
};
type Match = {
  matchId?: string;
  outcome: string;
  winner: 1 | 2 | null;
  reason: string;
  events: Event[];
  error?: string;
};
let scripts: Script[] = [];
let match: Match | null = null;
let cursor = 0;
let busy = false;
let status = "";
const esc = (s: unknown) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
const root = () => document.querySelector<HTMLDivElement>("#app")!;
const api = async (path: string, body?: object) => {
  const response = await fetch(
    `/api/${path}`,
    body
      ? {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      : undefined,
  );
  const text = await response.text();
  if (!text.trim())
    throw new Error(
      `Backend returned an empty response for /api/${path} (HTTP ${response.status}). Check that npm run dev:all is running.`,
    );
  let result;
  try {
    result = JSON.parse(text);
  } catch {
    throw new Error(
      `Backend returned invalid JSON for /api/${path} (HTTP ${response.status}). Check the backend terminal for errors.`,
    );
  }
  if (typeof result !== "object" || result === null)
    throw new Error(
      `Backend returned an invalid response for /api/${path} (HTTP ${response.status}).`,
    );
  if (!response.ok) throw new Error(result.error || `HTTP ${response.status}`);
  return result;
};
function positions() {
  const pieces: Piece[] = initialPieces();
  for (const e of (match?.events || []).slice(0, cursor)) {
    if (!e.accepted || !e.move) continue;
    const index = pieces.findIndex((p) => p.id === e.move!.pieceId);
    if (index < 0) continue;
    const target = pieces.findIndex(
      (p) =>
        p.position.row === e.move!.to.row && p.position.col === e.move!.to.col,
    );
    if (target >= 0) {
      pieces.splice(target, 1);
    }
    const moving = pieces.find((p) => p.id === e.move!.pieceId);
    if (moving) moving.position = { ...e.move.to };
  }
  return pieces;
}
function board() {
  const pieces = positions();
  let html =
    '<div class="coordinates"><span></span>' +
    [..."abcdefghi"].map((c) => `<span>${c}</span>`).join("") +
    '</div><div class="board">';
  for (let r = 0; r < 9; r++) {
    html += `<span class="row-num">${r + 1}</span>`;
    for (let c = 0; c < 9; c++) {
      const p = at(pieces, { row: r, col: c }),
        goal = (r === 0 && c === 0) || (r === 8 && c === 8);
      html += `<div class="cell ${(r + c) % 2 ? "dark" : "light"} ${p ? "occupied" : ""} ${p?.owner === 1 ? "blue" : p?.owner === 2 ? "orange" : ""} ${goal ? "goal" : ""}" aria-label="${c + 1},${r + 1}">${goal ? '<span class="goal-mark">◆</span>' : ""}${p ? `<span class="token">${icons[p.type]}</span>` : ""}</div>`;
    }
  }
  return html + "</div>";
}
function resultTitle() {
  if (!match) return "Chưa đấu";
  if (match.outcome === "FORFEIT")
    return `Bot ${match.winner || "?"} thắng (đối thủ bị xử thua)`;
  if (match.winner)
    return `${match.winner === 1 ? esc(scripts.find((s) => s.id === selectedA)?.name || "Bot A") : esc(scripts.find((s) => s.id === selectedB)?.name || "Bot B")} chiến thắng!`;
  return match.outcome === "TURN_LIMIT"
    ? "Hòa — hết giới hạn lượt"
    : "Trận đấu hòa";
}
let selectedA = "",
  selectedB = "";
function render() {
  const safeEvents = match?.events || [];
  const last = safeEvents.slice(Math.max(0, cursor - 8), cursor).reverse();
  root().innerHTML = `<div class="shell"><header><div class="brand small">OTT<span>v2</span></div><span class="room-code">CHẾ ĐỘ BOT ARENA</span><button id="bot-home">← Về trang chủ</button></header><main class="layout"><section class="game-area"><div class="game-title"><div><p class="eyebrow">TRẬN ĐẤU TỰ ĐỘNG · ${safeEvents.filter((e) => e.accepted).length} NƯỚC ĐI</p><h1>${esc(resultTitle())}</h1></div></div><div class="player p2"><div class="avatar">02</div><div><small>BOT 2</small><strong>${esc(scripts.find((s) => s.id === selectedB)?.name || "Chưa chọn")}</strong></div></div><div class="board-wrap">${board()}</div><div class="player p1"><div class="avatar">01</div><div><small>BOT 1</small><strong>${esc(scripts.find((s) => s.id === selectedA)?.name || "Chưa chọn")}</strong></div></div><div class="bot-replay"><button id="bot-first" ${cursor === 0 ? "disabled" : ""}>|◀ Đầu</button><button id="bot-prev" ${cursor === 0 ? "disabled" : ""}>◀ Trước</button><span>Lượt ${cursor} / ${safeEvents.length}</span><button id="bot-next" ${cursor === safeEvents.length ? "disabled" : ""}>Tiếp ▶</button><button id="bot-last" ${cursor === safeEvents.length ? "disabled" : ""}>Cuối ▶|</button></div></section><aside><div class="side-card"><p class="eyebrow">GỬI SCRIPT BOT</p><label>Tên bot<input id="bot-name" maxlength="60" placeholder="Tên bot"></label><label>Chọn file .js<input id="bot-file" type="file" accept=".js,text/javascript"></label><label>Hoặc nhập mã nguồn<textarea id="bot-source" spellcheck="false" rows="7" placeholder="export function getMove(state) { return state.legalMoves[0] ?? null; }"></textarea></label><button class="primary" id="bot-submit">Kiểm tra & lưu bot</button><p id="bot-scan-status" class="hint">${esc(status || "Script phải vượt qua kiểm tra tĩnh trước khi chọn đấu.")}</p></div><div class="side-card"><p class="eyebrow">THI ĐẤU</p><label>Bot A<select id="bot-select-a">${scripts.map((s) => `<option value="${esc(s.id)}" ${s.id === selectedA ? "selected" : ""}>${esc(s.name)}</option>`).join("")}</select></label><label>Bot B<select id="bot-select-b">${scripts.map((s) => `<option value="${esc(s.id)}" ${s.id === selectedB ? "selected" : ""}>${esc(s.name)}</option>`).join("")}</select></label><button class="primary" id="bot-fight" ${busy || scripts.length < 2 ? "disabled" : ""}>${busy ? "Đang thi đấu…" : "Bắt đầu trận đấu"}</button>${match ? `<p class="bot-outcome"><strong>${esc(resultTitle())}</strong><span>${esc(match.reason || "")}</span></p>` : ""}</div><div class="side-card history"><p class="eyebrow">8 SỰ KIỆN GẦN NHẤT</p>${last.length ? last.map((e) => `<div>${e.turn}. ${esc(e.bot)} — ${e.accepted ? "Di chuyển " + esc(e.move?.pieceId) + " đến " + String.fromCharCode(97 + (e.move?.to.col || 0)) + ((e.move?.to.row || 0) + 1) : "Lỗi: " + esc(e.detail)}</div>`).join("") : "<p>Chưa có lượt đi.</p>"}<details><summary>Thông tin trận đấu</summary><small>${esc(match?.matchId || "Chưa có mã trận đấu")}</small></details></div></aside></main></div>`;
  root().querySelector<HTMLButtonElement>("#bot-home")!.onclick = () => {
    window.location.hash = "";
    window.dispatchEvent(new Event("ott-bot-home"));
  };
  root().querySelector<HTMLInputElement>("#bot-file")!.onchange = async (e) => {
    const f = (e.target as HTMLInputElement).files?.[0];
    if (f) {
      if (f.size > 65536) {
        status = "File quá 64 KiB";
        render();
        return;
      }
      root().querySelector<HTMLTextAreaElement>("#bot-source")!.value =
        await f.text();
    }
  };
  root().querySelector<HTMLButtonElement>("#bot-submit")!.onclick =
    async () => {
      const name = root()
        .querySelector<HTMLInputElement>("#bot-name")!
        .value.trim();
      const source =
        root().querySelector<HTMLTextAreaElement>("#bot-source")!.value;
      if (!name || !source) {
        status = "Cần nhập tên bot và mã nguồn";
        render();
        return;
      }
      try {
        const value = await api("scripts", { name, source });
        status =
          value.status === "PASSED"
            ? `Đã chấp nhận ${name} (${value.scriptId.slice(0, 8)})`
            : `Từ chối: ${(value.issues || []).map((i: { message: string }) => i.message).join("; ")}`;
        await loadScripts();
      } catch (e) {
        status = String(e);
        render();
      }
    };
  root().querySelector<HTMLSelectElement>("#bot-select-a")!.onchange = (e) => {
    selectedA = (e.target as HTMLSelectElement).value;
    render();
  };
  root().querySelector<HTMLSelectElement>("#bot-select-b")!.onchange = (e) => {
    selectedB = (e.target as HTMLSelectElement).value;
    render();
  };
  root().querySelector<HTMLButtonElement>("#bot-fight")!.onclick = async () => {
    if (!selectedA || !selectedB || selectedA === selectedB) {
      status = "Hãy chọn hai bot khác nhau";
      render();
      return;
    }
    busy = true;
    status = "Đang chạy sandbox trong Docker…";
    render();
    try {
      match = await api("matches", {
        botA: selectedA,
        botB: selectedB,
        maxTurns: 80,
      });
      cursor = match!.events.length;
      status = "Trận đấu đã kết thúc";
    } catch (e) {
      status = `Lỗi trận đấu: ${String(e)}`;
    } finally {
      busy = false;
      render();
    }
  };
  const set = (id: string, n: number) =>
    (root().querySelector<HTMLButtonElement>(id)!.onclick = () => {
      cursor = Math.min(safeEvents.length, Math.max(0, n));
      render();
    });
  set("#bot-first", 0);
  set("#bot-prev", cursor - 1);
  set("#bot-next", cursor + 1);
  set("#bot-last", safeEvents.length);
}
async function loadScripts() {
  try {
    const response = await api("scripts");
    scripts = response.scripts || [];
    if (!scripts.some((s) => s.id === selectedA))
      selectedA = scripts[0]?.id || "";
    if (!scripts.some((s) => s.id === selectedB) || selectedB === selectedA)
      selectedB = scripts.find((s) => s.id !== selectedA)?.id || "";
  } catch (e) {
    status =
      "Không kết nối được backend. Hãy chạy npm run dev:all. " + String(e);
  }
  render();
}
export function showBotMode() {
  render();
  void loadScripts();
}
