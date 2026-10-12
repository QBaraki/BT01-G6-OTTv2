(function () {
  const e = document.createElement("link").relList;
  if (e && e.supports && e.supports("modulepreload")) return;
  for (const r of document.querySelectorAll('link[rel="modulepreload"]')) s(r);
  new MutationObserver((r) => {
    for (const i of r)
      if (i.type === "childList")
        for (const o of i.addedNodes)
          o.tagName === "LINK" && o.rel === "modulepreload" && s(o);
  }).observe(document, { childList: !0, subtree: !0 });
  function n(r) {
    const i = {};
    return (
      r.integrity && (i.integrity = r.integrity),
      r.referrerPolicy && (i.referrerPolicy = r.referrerPolicy),
      r.crossOrigin === "use-credentials"
        ? (i.credentials = "include")
        : r.crossOrigin === "anonymous"
          ? (i.credentials = "omit")
          : (i.credentials = "same-origin"),
      i
    );
  }
  function s(r) {
    if (r.ep) return;
    r.ep = !0;
    const i = n(r);
    fetch(r.href, i);
  }
})();
function Nn() {
  const t = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(t, (e) => e.toString(16).padStart(2, "0")).join("");
}
const Ai = ["rock", "paper", "scissors"],
  Rt = { rock: "✊", paper: "✋", scissors: "✌️" },
  yh = (t) => t.row >= 0 && t.row < 9 && t.col >= 0 && t.col < 9,
  ms = (t, e) => t.row === e.row && t.col === e.col,
  ws = (t) => `${"abcdefghi"[t.col]}${t.row + 1}`,
  Rn = (t, e) => t.find((n) => ms(n.position, e)),
  mh = (t, e) =>
    (t === "rock" && e === "scissors") ||
    (t === "scissors" && e === "paper") ||
    (t === "paper" && e === "rock");
function Xt() {
  const t = [];
  for (const e of [1, 2])
    for (let n = 0; n < 9; n++)
      t.push({
        id: `p${e}-${n}`,
        owner: e,
        type: Ai[n % 3],
        position:
          e === 1
            ? { row: 1 + Math.floor(n / 3), col: n % 3 }
            : { row: 7 - Math.floor(n / 3), col: 8 - (n % 3) },
      });
  return t;
}
const wh = (t) => ({
  gameId: t,
  matchId: Nn(),
  match: 1,
  version: 0,
  status: "WAITING",
  seats: [null, null],
  pieces: [],
  turn: 1,
  winner: null,
  reason: "",
  history: [],
  lastMove: null,
});
function yc(t, e, n) {
  if (
    !yh(n) ||
    Math.max(
      Math.abs(e.position.row - n.row),
      Math.abs(e.position.col - n.col),
    ) !== 1
  )
    return !1;
  const s = Rn(t, n);
  return !s || (s.owner !== e.owner && mh(e.type, s.type));
}
function xi(t, e) {
  const n = [];
  for (let s = -1; s <= 1; s++)
    for (let r = -1; r <= 1; r++) {
      const i = { row: e.position.row + s, col: e.position.col + r };
      yc(t, e, i) && n.push(i);
    }
  return n;
}
function bh(t, e) {
  return t.pieces.some((n) => n.owner === e && xi(t.pieces, n).length > 0);
}
function vh(t, e) {
  if (
    t.status !== "PLAYING" ||
    t.gameId !== e.gameId ||
    t.matchId !== e.matchId ||
    t.version !== e.expectedVersion ||
    t.history.some((d) => d.moveId === e.moveId)
  )
    return t;
  const n = t.seats[t.turn - 1],
    s = t.pieces.find((d) => d.id === e.pieceId);
  if (
    !n ||
    n.id !== e.playerId ||
    !s ||
    s.owner !== t.turn ||
    !ms(s.position, e.from) ||
    !yc(t.pieces, s, e.to)
  )
    return t;
  const r = Rn(t.pieces, e.to),
    i = t.pieces
      .filter((d) => d.id !== r?.id)
      .map((d) => (d.id === s.id ? { ...d, position: { ...e.to } } : d)),
    o = t.turn === 1 ? 2 : 1;
  let a = "",
    c = null;
  (t.turn === 1 && ms(e.to, { row: 8, col: 8 })) ||
  (t.turn === 2 && ms(e.to, { row: 0, col: 0 }))
    ? ((c = t.turn), (a = `Đưa quân vào ${ws(e.to)}`))
    : Ai.some((d) => !i.some((f) => f.owner === o && f.type === d)) &&
      ((c = t.turn), (a = "Loại hết một loại quân đối phương"));
  const l = {
      turn: o,
      status: c ? "FINISHED" : "PLAYING",
      winner: c,
      reason: a,
    },
    u = { pieceId: s.id, player: t.turn, from: { ...e.from }, to: { ...e.to } },
    h = {
      ...t,
      ...l,
      pieces: i,
      version: t.version + 1,
      lastMove: u,
      history: [
        ...t.history,
        {
          moveId: e.moveId,
          text: `${n.name}: ${Rt[s.type]} ${ws(e.from)} → ${ws(e.to)}${r ? " × " + Rt[r.type] : ""}`,
        },
      ],
    };
  return !c && !bh(h, o)
    ? { ...h, status: "FINISHED", reason: "Hòa do hết nước đi", lastMove: u }
    : h;
}
function Ch(t) {
  return t.status !== "WAITING" || !t.seats[0]?.ready || !t.seats[1]?.ready
    ? t
    : {
        ...t,
        status: "PLAYING",
        pieces: Xt(),
        turn: t.match % 2 === 1 ? 1 : 2,
        version: t.version + 1,
        lastMove: null,
      };
}
function Sh(t) {
  return t.status !== "FINISHED" || !t.seats[0]?.rematch || !t.seats[1]?.rematch
    ? t
    : {
        ...t,
        match: t.match + 1,
        matchId: Nn(),
        pieces: Xt(),
        turn: t.match % 2 === 1 ? 2 : 1,
        winner: null,
        reason: "",
        history: [],
        status: "PLAYING",
        version: t.version + 1,
        lastMove: null,
        seats: t.seats.map((e) => (e ? { ...e, rematch: !1 } : null)),
      };
}
let de = [],
  ae = null,
  he = 0,
  Qn = !1,
  Ie = "";
const Y = (t) =>
    String(t ?? "").replace(
      /[&<>"']/g,
      (e) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[e],
    ),
  we = () => document.querySelector("#app"),
  Jr = async (t, e) => {
    const n = await fetch(
        `/api/${t}`,
        e
          ? {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(e),
            }
          : void 0,
      ),
      s = await n.text();
    if (!s.trim())
      throw new Error(
        `Backend returned an empty response for /api/${t} (HTTP ${n.status}). Check that npm run dev:all is running.`,
      );
    let r;
    try {
      r = JSON.parse(s);
    } catch {
      throw new Error(
        `Backend returned invalid JSON for /api/${t} (HTTP ${n.status}). Check the backend terminal for errors.`,
      );
    }
    if (typeof r != "object" || r === null)
      throw new Error(
        `Backend returned an invalid response for /api/${t} (HTTP ${n.status}).`,
      );
    if (!n.ok) throw new Error(r.error || `HTTP ${n.status}`);
    return r;
  };
function _h() {
  const t = Xt();
  for (const e of (ae?.events || []).slice(0, he)) {
    if (
      !e.accepted ||
      !e.move ||
      t.findIndex((i) => i.id === e.move.pieceId) < 0
    )
      continue;
    const s = t.findIndex(
      (i) =>
        i.position.row === e.move.to.row && i.position.col === e.move.to.col,
    );
    s >= 0 && t.splice(s, 1);
    const r = t.find((i) => i.id === e.move.pieceId);
    r && (r.position = { ...e.move.to });
  }
  return t;
}
function Eh() {
  const t = _h();
  let e =
    '<div class="coordinates"><span></span>' +
    [..."abcdefghi"].map((n) => `<span>${n}</span>`).join("") +
    '</div><div class="board">';
  for (let n = 0; n < 9; n++) {
    e += `<span class="row-num">${n + 1}</span>`;
    for (let s = 0; s < 9; s++) {
      const r = Rn(t, { row: n, col: s }),
        i = (n === 0 && s === 0) || (n === 8 && s === 8);
      e += `<div class="cell ${(n + s) % 2 ? "dark" : "light"} ${r ? "occupied" : ""} ${r?.owner === 1 ? "blue" : r?.owner === 2 ? "orange" : ""} ${i ? "goal" : ""}" aria-label="${s + 1},${n + 1}">${i ? '<span class="goal-mark">◆</span>' : ""}${r ? `<span class="token">${Rt[r.type]}</span>` : ""}</div>`;
    }
  }
  return e + "</div>";
}
function Po() {
  return ae
    ? ae.outcome === "FORFEIT"
      ? `Bot ${ae.winner || "?"} thắng (đối thủ bị xử thua)`
      : ae.winner
        ? `${ae.winner === 1 ? Y(de.find((t) => t.id === Ce)?.name || "Bot A") : Y(de.find((t) => t.id === De)?.name || "Bot B")} chiến thắng!`
        : ae.outcome === "TURN_LIMIT"
          ? "Hòa — hết giới hạn lượt"
          : "Trận đấu hòa"
    : "Chưa đấu";
}
let Ce = "",
  De = "";
function be() {
  const t = ae?.events || [],
    e = t.slice(Math.max(0, he - 8), he).reverse();
  ((we().innerHTML = `<div class="shell"><header><div class="brand small">OTT<span>v2</span></div><span class="room-code">CHẾ ĐỘ BOT ARENA</span><button id="bot-home">← Về trang chủ</button></header><main class="layout"><section class="game-area"><div class="game-title"><div><p class="eyebrow">TRẬN ĐẤU TỰ ĐỘNG · ${t.filter((s) => s.accepted).length} NƯỚC ĐI</p><h1>${Y(Po())}</h1></div></div><div class="player p2"><div class="avatar">02</div><div><small>BOT 2</small><strong>${Y(de.find((s) => s.id === De)?.name || "Chưa chọn")}</strong></div></div><div class="board-wrap">${Eh()}</div><div class="player p1"><div class="avatar">01</div><div><small>BOT 1</small><strong>${Y(de.find((s) => s.id === Ce)?.name || "Chưa chọn")}</strong></div></div><div class="bot-replay"><button id="bot-first" ${he === 0 ? "disabled" : ""}>|◀ Đầu</button><button id="bot-prev" ${he === 0 ? "disabled" : ""}>◀ Trước</button><span>Lượt ${he} / ${t.length}</span><button id="bot-next" ${he === t.length ? "disabled" : ""}>Tiếp ▶</button><button id="bot-last" ${he === t.length ? "disabled" : ""}>Cuối ▶|</button></div></section><aside><div class="side-card"><p class="eyebrow">GỬI SCRIPT BOT</p><label>Tên bot<input id="bot-name" maxlength="60" placeholder="Tên bot"></label><label>Chọn file .js<input id="bot-file" type="file" accept=".js,text/javascript"></label><label>Hoặc nhập mã nguồn<textarea id="bot-source" spellcheck="false" rows="7" placeholder="export function getMove(state) { return state.legalMoves[0] ?? null; }"></textarea></label><button class="primary" id="bot-submit">Kiểm tra & lưu bot</button><p id="bot-scan-status" class="hint">${Y(Ie || "Script phải vượt qua kiểm tra tĩnh trước khi chọn đấu.")}</p></div><div class="side-card"><p class="eyebrow">THI ĐẤU</p><label>Bot A<select id="bot-select-a">${de.map((s) => `<option value="${Y(s.id)}" ${s.id === Ce ? "selected" : ""}>${Y(s.name)}</option>`).join("")}</select></label><label>Bot B<select id="bot-select-b">${de.map((s) => `<option value="${Y(s.id)}" ${s.id === De ? "selected" : ""}>${Y(s.name)}</option>`).join("")}</select></label><button class="primary" id="bot-fight" ${Qn || de.length < 2 ? "disabled" : ""}>${Qn ? "Đang thi đấu…" : "Bắt đầu trận đấu"}</button>${ae ? `<p class="bot-outcome"><strong>${Y(Po())}</strong><span>${Y(ae.reason || "")}</span></p>` : ""}</div><div class="side-card history"><p class="eyebrow">8 SỰ KIỆN GẦN NHẤT</p>${e.length ? e.map((s) => `<div>${s.turn}. ${Y(s.bot)} — ${s.accepted ? "Di chuyển " + Y(s.move?.pieceId) + " đến " + String.fromCharCode(97 + (s.move?.to.col || 0)) + ((s.move?.to.row || 0) + 1) : "Lỗi: " + Y(s.detail)}</div>`).join("") : "<p>Chưa có lượt đi.</p>"}<details><summary>Thông tin trận đấu</summary><small>${Y(ae?.matchId || "Chưa có mã trận đấu")}</small></details></div></aside></main></div>`),
    (we().querySelector("#bot-home").onclick = () => {
      ((window.location.hash = ""),
        window.dispatchEvent(new Event("ott-bot-home")));
    }),
    (we().querySelector("#bot-file").onchange = async (s) => {
      const r = s.target.files?.[0];
      if (r) {
        if (r.size > 65536) {
          ((Ie = "File quá 64 KiB"), be());
          return;
        }
        we().querySelector("#bot-source").value = await r.text();
      }
    }),
    (we().querySelector("#bot-submit").onclick = async () => {
      const s = we().querySelector("#bot-name").value.trim(),
        r = we().querySelector("#bot-source").value;
      if (!s || !r) {
        ((Ie = "Cần nhập tên bot và mã nguồn"), be());
        return;
      }
      try {
        const i = await Jr("scripts", { name: s, source: r });
        ((Ie =
          i.status === "PASSED"
            ? `Đã chấp nhận ${s} (${i.scriptId.slice(0, 8)})`
            : `Từ chối: ${(i.issues || []).map((o) => o.message).join("; ")}`),
          await mc());
      } catch (i) {
        ((Ie = String(i)), be());
      }
    }),
    (we().querySelector("#bot-select-a").onchange = (s) => {
      ((Ce = s.target.value), be());
    }),
    (we().querySelector("#bot-select-b").onchange = (s) => {
      ((De = s.target.value), be());
    }),
    (we().querySelector("#bot-fight").onclick = async () => {
      if (!Ce || !De || Ce === De) {
        ((Ie = "Hãy chọn hai bot khác nhau"), be());
        return;
      }
      ((Qn = !0), (Ie = "Đang chạy sandbox trong Docker…"), be());
      try {
        ((ae = await Jr("matches", { botA: Ce, botB: De, maxTurns: 80 })),
          (he = ae.events.length),
          (Ie = "Trận đấu đã kết thúc"));
      } catch (s) {
        Ie = `Lỗi trận đấu: ${String(s)}`;
      } finally {
        ((Qn = !1), be());
      }
    }));
  const n = (s, r) =>
    (we().querySelector(s).onclick = () => {
      ((he = Math.min(t.length, Math.max(0, r))), be());
    });
  (n("#bot-first", 0),
    n("#bot-prev", he - 1),
    n("#bot-next", he + 1),
    n("#bot-last", t.length));
}
async function mc() {
  try {
    ((de = (await Jr("scripts")).scripts || []),
      de.some((e) => e.id === Ce) || (Ce = de[0]?.id || ""),
      (!de.some((e) => e.id === De) || De === Ce) &&
        (De = de.find((e) => e.id !== Ce)?.id || ""));
  } catch (t) {
    Ie = "Không kết nối được backend. Hãy chạy npm run dev:all. " + String(t);
  }
  be();
}
function kh() {
  (be(), mc());
}
const Ah = "modulepreload",
  xh = function (t) {
    return "/" + t;
  },
  Oo = {},
  Ih = function (e, n, s) {
    let r = Promise.resolve();
    if (n && n.length > 0) {
      let c = function (l) {
        return Promise.all(
          l.map((u) =>
            Promise.resolve(u).then(
              (h) => ({ status: "fulfilled", value: h }),
              (h) => ({ status: "rejected", reason: h }),
            ),
          ),
        );
      };
      document.getElementsByTagName("link");
      const o = document.querySelector("meta[property=csp-nonce]"),
        a = o?.nonce || o?.getAttribute("nonce");
      r = c(
        n.map((l) => {
          if (((l = xh(l)), l in Oo)) return;
          Oo[l] = !0;
          const u = l.endsWith(".css"),
            h = u ? '[rel="stylesheet"]' : "";
          if (document.querySelector(`link[href="${l}"]${h}`)) return;
          const d = document.createElement("link");
          if (
            ((d.rel = u ? "stylesheet" : Ah),
            u || (d.as = "script"),
            (d.crossOrigin = ""),
            (d.href = l),
            a && d.setAttribute("nonce", a),
            document.head.appendChild(d),
            u)
          )
            return new Promise((f, p) => {
              (d.addEventListener("load", f),
                d.addEventListener("error", () =>
                  p(new Error(`Unable to preload CSS for ${l}`)),
                ));
            });
        }),
      );
    }
    function i(o) {
      const a = new Event("vite:preloadError", { cancelable: !0 });
      if (((a.payload = o), window.dispatchEvent(a), !a.defaultPrevented))
        throw o;
    }
    return r.then((o) => {
      for (const a of o || []) a.status === "rejected" && i(a.reason);
      return e().catch(i);
    });
  };
var wc = {};
const No = 1,
  Ro = 2,
  Cr = 4,
  Sr = 8,
  wn = 32,
  ze = 64,
  le = 128,
  Xs = 31,
  Xr = 63,
  gt = 127,
  $h = 2147483647,
  _e = Math.floor,
  bs = Math.abs,
  Ii = (t, e) => (t < e ? t : e),
  $t = (t, e) => (t > e ? t : e),
  Dh = Math.pow,
  bc = (t) => (t !== 0 ? t < 0 : 1 / t < 0),
  xs = Number.MAX_SAFE_INTEGER,
  jo = Number.MIN_SAFE_INTEGER,
  Lh =
    Number.isInteger ||
    ((t) => typeof t == "number" && isFinite(t) && _e(t) === t),
  rt = () => new Set(),
  _r = (t) => t[t.length - 1],
  Mh = (t, e) => {
    for (let n = 0; n < e.length; n++) t.push(e[n]);
  },
  Ke = Array.from,
  $i = (t, e) => {
    for (let n = 0; n < t.length; n++) if (!e(t[n], n, t)) return !1;
    return !0;
  },
  vc = (t, e) => {
    for (let n = 0; n < t.length; n++) if (e(t[n], n, t)) return !0;
    return !1;
  },
  Th = (t, e) => {
    const n = new Array(t);
    for (let s = 0; s < t; s++) n[s] = e(s, n);
    return n;
  },
  Zs = Array.isArray,
  Cc = String.fromCharCode,
  Ph = (t) => t.toLowerCase(),
  Oh = /^\s*/g,
  Nh = (t) => t.replace(Oh, ""),
  Rh = /([A-Z])/g,
  Uo = (t, e) => Nh(t.replace(Rh, (n) => `${e}${Ph(n)}`)),
  jh = (t) => {
    const e = unescape(encodeURIComponent(t)),
      n = e.length,
      s = new Uint8Array(n);
    for (let r = 0; r < n; r++) s[r] = e.codePointAt(r);
    return s;
  },
  bn = typeof TextEncoder < "u" ? new TextEncoder() : null,
  Uh = (t) => bn.encode(t),
  Hh = bn ? Uh : jh;
let hn =
  typeof TextDecoder > "u"
    ? null
    : new TextDecoder("utf-8", { fatal: !0, ignoreBOM: !0 });
hn && hn.decode(new Uint8Array()).length === 1 && (hn = null);
const Fh = (t, e) => Th(e, () => t).join(""),
  Oe = (t) => new Error(t),
  Se = () => {
    throw Oe("Method unimplemented");
  },
  pe = () => {
    throw Oe("Unexpected case");
  };
class jn {
  constructor() {
    ((this.cpos = 0), (this.cbuf = new Uint8Array(100)), (this.bufs = []));
  }
}
const J = () => new jn(),
  Di = (t) => {
    let e = t.cpos;
    for (let n = 0; n < t.bufs.length; n++) e += t.bufs[n].length;
    return e;
  },
  $ = (t) => {
    const e = new Uint8Array(Di(t));
    let n = 0;
    for (let s = 0; s < t.bufs.length; s++) {
      const r = t.bufs[s];
      (e.set(r, n), (n += r.length));
    }
    return (e.set(new Uint8Array(t.cbuf.buffer, 0, t.cpos), n), e);
  },
  zh = (t, e) => {
    const n = t.cbuf.length;
    n - t.cpos < e &&
      (t.bufs.push(new Uint8Array(t.cbuf.buffer, 0, t.cpos)),
      (t.cbuf = new Uint8Array($t(n, e) * 2)),
      (t.cpos = 0));
  },
  U = (t, e) => {
    const n = t.cbuf.length;
    (t.cpos === n &&
      (t.bufs.push(t.cbuf), (t.cbuf = new Uint8Array(n * 2)), (t.cpos = 0)),
      (t.cbuf[t.cpos++] = e));
  },
  Zr = U,
  w = (t, e) => {
    for (; e > gt; ) (U(t, le | (gt & e)), (e = _e(e / 128)));
    U(t, gt & e);
  },
  Li = (t, e) => {
    const n = bc(e);
    for (
      n && (e = -e),
        U(t, (e > Xr ? le : 0) | (n ? ze : 0) | (Xr & e)),
        e = _e(e / 64);
      e > 0;

    )
      (U(t, (e > gt ? le : 0) | (gt & e)), (e = _e(e / 128)));
  },
  Qr = new Uint8Array(3e4),
  Wh = Qr.length / 3,
  Kh = (t, e) => {
    if (e.length < Wh) {
      const n = bn.encodeInto(e, Qr).written || 0;
      w(t, n);
      for (let s = 0; s < n; s++) U(t, Qr[s]);
    } else M(t, Hh(e));
  },
  Bh = (t, e) => {
    const n = unescape(encodeURIComponent(e)),
      s = n.length;
    w(t, s);
    for (let r = 0; r < s; r++) U(t, n.codePointAt(r));
  },
  yt = bn && bn.encodeInto ? Kh : Bh,
  Qs = (t, e) => {
    const n = t.cbuf.length,
      s = t.cpos,
      r = Ii(n - s, e.length),
      i = e.length - r;
    (t.cbuf.set(e.subarray(0, r), s),
      (t.cpos += r),
      i > 0 &&
        (t.bufs.push(t.cbuf),
        (t.cbuf = new Uint8Array($t(n * 2, i))),
        t.cbuf.set(e.subarray(r)),
        (t.cpos = i)));
  },
  M = (t, e) => {
    (w(t, e.byteLength), Qs(t, e));
  },
  Mi = (t, e) => {
    zh(t, e);
    const n = new DataView(t.cbuf.buffer, t.cpos, e);
    return ((t.cpos += e), n);
  },
  qh = (t, e) => Mi(t, 4).setFloat32(0, e, !1),
  Vh = (t, e) => Mi(t, 8).setFloat64(0, e, !1),
  Yh = (t, e) => Mi(t, 8).setBigInt64(0, e, !1),
  Ho = new DataView(new ArrayBuffer(4)),
  Gh = (t) => (Ho.setFloat32(0, t), Ho.getFloat32(0) === t),
  vn = (t, e) => {
    switch (typeof e) {
      case "string":
        (U(t, 119), yt(t, e));
        break;
      case "number":
        Lh(e) && bs(e) <= $h
          ? (U(t, 125), Li(t, e))
          : Gh(e)
            ? (U(t, 124), qh(t, e))
            : (U(t, 123), Vh(t, e));
        break;
      case "bigint":
        (U(t, 122), Yh(t, e));
        break;
      case "object":
        if (e === null) U(t, 126);
        else if (Zs(e)) {
          (U(t, 117), w(t, e.length));
          for (let n = 0; n < e.length; n++) vn(t, e[n]);
        } else if (e instanceof Uint8Array) (U(t, 116), M(t, e));
        else {
          U(t, 118);
          const n = Object.keys(e);
          w(t, n.length);
          for (let s = 0; s < n.length; s++) {
            const r = n[s];
            (yt(t, r), vn(t, e[r]));
          }
        }
        break;
      case "boolean":
        U(t, e ? 120 : 121);
        break;
      default:
        U(t, 127);
    }
  };
class Fo extends jn {
  constructor(e) {
    (super(), (this.w = e), (this.s = null), (this.count = 0));
  }
  write(e) {
    this.s === e
      ? this.count++
      : (this.count > 0 && w(this, this.count - 1),
        (this.count = 1),
        this.w(this, e),
        (this.s = e));
  }
}
const zo = (t) => {
  t.count > 0 &&
    (Li(t.encoder, t.count === 1 ? t.s : -t.s),
    t.count > 1 && w(t.encoder, t.count - 2));
};
class vs {
  constructor() {
    ((this.encoder = new jn()), (this.s = 0), (this.count = 0));
  }
  write(e) {
    this.s === e ? this.count++ : (zo(this), (this.count = 1), (this.s = e));
  }
  toUint8Array() {
    return (zo(this), $(this.encoder));
  }
}
const Wo = (t) => {
  if (t.count > 0) {
    const e = t.diff * 2 + (t.count === 1 ? 0 : 1);
    (Li(t.encoder, e), t.count > 1 && w(t.encoder, t.count - 2));
  }
};
class Er {
  constructor() {
    ((this.encoder = new jn()),
      (this.s = 0),
      (this.count = 0),
      (this.diff = 0));
  }
  write(e) {
    this.diff === e - this.s
      ? ((this.s = e), this.count++)
      : (Wo(this), (this.count = 1), (this.diff = e - this.s), (this.s = e));
  }
  toUint8Array() {
    return (Wo(this), $(this.encoder));
  }
}
class Jh {
  constructor() {
    ((this.sarr = []), (this.s = ""), (this.lensE = new vs()));
  }
  write(e) {
    ((this.s += e),
      this.s.length > 19 && (this.sarr.push(this.s), (this.s = "")),
      this.lensE.write(e.length));
  }
  toUint8Array() {
    const e = new jn();
    return (
      this.sarr.push(this.s),
      (this.s = ""),
      yt(e, this.sarr.join("")),
      Qs(e, this.lensE.toUint8Array()),
      $(e)
    );
  }
}
const Sc = Oe("Unexpected end of array"),
  _c = Oe("Integer out of Range");
class er {
  constructor(e) {
    ((this.arr = e), (this.pos = 0));
  }
}
const ct = (t) => new er(t),
  Xh = (t) => t.pos !== t.arr.length,
  Zh = (t, e) => {
    const n = new Uint8Array(t.arr.buffer, t.pos + t.arr.byteOffset, e);
    return ((t.pos += e), n);
  },
  G = (t) => Zh(t, S(t)),
  zt = (t) => t.arr[t.pos++],
  S = (t) => {
    let e = 0,
      n = 1;
    const s = t.arr.length;
    for (; t.pos < s; ) {
      const r = t.arr[t.pos++];
      if (((e = e + (r & gt) * n), (n *= 128), r < le)) return e;
      if (e > xs) throw _c;
    }
    throw Sc;
  },
  Ti = (t) => {
    let e = t.arr[t.pos++],
      n = e & Xr,
      s = 64;
    const r = (e & ze) > 0 ? -1 : 1;
    if ((e & le) === 0) return r * n;
    const i = t.arr.length;
    for (; t.pos < i; ) {
      if (((e = t.arr[t.pos++]), (n = n + (e & gt) * s), (s *= 128), e < le))
        return r * n;
      if (n > xs) throw _c;
    }
    throw Sc;
  },
  Qh = (t) => {
    let e = S(t);
    if (e === 0) return "";
    {
      let n = String.fromCodePoint(zt(t));
      if (--e < 100) for (; e--; ) n += String.fromCodePoint(zt(t));
      else
        for (; e > 0; ) {
          const s = e < 1e4 ? e : 1e4,
            r = t.arr.subarray(t.pos, t.pos + s);
          ((t.pos += s), (n += String.fromCodePoint.apply(null, r)), (e -= s));
        }
      return decodeURIComponent(escape(n));
    }
  },
  ed = (t) => hn.decode(G(t)),
  et = hn ? ed : Qh,
  Pi = (t, e) => {
    const n = new DataView(t.arr.buffer, t.arr.byteOffset + t.pos, e);
    return ((t.pos += e), n);
  },
  td = (t) => Pi(t, 4).getFloat32(0, !1),
  nd = (t) => Pi(t, 8).getFloat64(0, !1),
  sd = (t) => Pi(t, 8).getBigInt64(0, !1),
  rd = [
    (t) => {},
    (t) => null,
    Ti,
    td,
    nd,
    sd,
    (t) => !1,
    (t) => !0,
    et,
    (t) => {
      const e = S(t),
        n = {};
      for (let s = 0; s < e; s++) {
        const r = et(t);
        n[r] = Cn(t);
      }
      return n;
    },
    (t) => {
      const e = S(t),
        n = [];
      for (let s = 0; s < e; s++) n.push(Cn(t));
      return n;
    },
    G,
  ],
  Cn = (t) => rd[127 - zt(t)](t);
class Ko extends er {
  constructor(e, n) {
    (super(e), (this.reader = n), (this.s = null), (this.count = 0));
  }
  read() {
    return (
      this.count === 0 &&
        ((this.s = this.reader(this)),
        Xh(this) ? (this.count = S(this) + 1) : (this.count = -1)),
      this.count--,
      this.s
    );
  }
}
class Cs extends er {
  constructor(e) {
    (super(e), (this.s = 0), (this.count = 0));
  }
  read() {
    if (this.count === 0) {
      this.s = Ti(this);
      const e = bc(this.s);
      ((this.count = 1), e && ((this.s = -this.s), (this.count = S(this) + 2)));
    }
    return (this.count--, this.s);
  }
}
class kr extends er {
  constructor(e) {
    (super(e), (this.s = 0), (this.count = 0), (this.diff = 0));
  }
  read() {
    if (this.count === 0) {
      const e = Ti(this),
        n = e & 1;
      ((this.diff = _e(e / 2)),
        (this.count = 1),
        n && (this.count = S(this) + 2));
    }
    return ((this.s += this.diff), this.count--, this.s);
  }
}
class id {
  constructor(e) {
    ((this.decoder = new Cs(e)),
      (this.str = et(this.decoder)),
      (this.spos = 0));
  }
  read() {
    const e = this.spos + this.decoder.read(),
      n = this.str.slice(this.spos, e);
    return ((this.spos = e), n);
  }
}
const Wt = Date.now,
  re = () => new Map(),
  ei = (t) => {
    const e = re();
    return (
      t.forEach((n, s) => {
        e.set(s, n);
      }),
      e
    );
  },
  He = (t, e, n) => {
    let s = t.get(e);
    return (s === void 0 && t.set(e, (s = n())), s);
  },
  od = (t, e) => {
    const n = [];
    for (const [s, r] of t) n.push(e(r, s));
    return n;
  },
  ad = (t, e) => {
    for (const [n, s] of t) if (e(s, n)) return !0;
    return !1;
  };
class cd {
  constructor() {
    this._observers = re();
  }
  on(e, n) {
    return (He(this._observers, e, rt).add(n), n);
  }
  once(e, n) {
    const s = (...r) => {
      (this.off(e, s), n(...r));
    };
    this.on(e, s);
  }
  off(e, n) {
    const s = this._observers.get(e);
    s !== void 0 && (s.delete(n), s.size === 0 && this._observers.delete(e));
  }
  emit(e, n) {
    return Ke((this._observers.get(e) || re()).values()).forEach((s) =>
      s(...n),
    );
  }
  destroy() {
    this._observers = re();
  }
}
class Ec {
  constructor() {
    this._observers = re();
  }
  on(e, n) {
    He(this._observers, e, rt).add(n);
  }
  once(e, n) {
    const s = (...r) => {
      (this.off(e, s), n(...r));
    };
    this.on(e, s);
  }
  off(e, n) {
    const s = this._observers.get(e);
    s !== void 0 && (s.delete(n), s.size === 0 && this._observers.delete(e));
  }
  emit(e, n) {
    return Ke((this._observers.get(e) || re()).values()).forEach((s) =>
      s(...n),
    );
  }
  destroy() {
    this._observers = re();
  }
}
const Sn = Symbol("Equality"),
  kc = (t, e) => t === e || !!t?.[Sn]?.(e) || !1,
  ld = (t) => typeof t == "object",
  ud = Object.assign,
  hd = Object.keys,
  dd = (t, e) => {
    for (const n in t) e(t[n], n);
  },
  fd = (t, e) => {
    const n = [];
    for (const s in t) n.push(e(t[s], s));
    return n;
  },
  Is = (t) => hd(t).length,
  pd = (t) => {
    for (const e in t) return !1;
    return !0;
  },
  Un = (t, e) => {
    for (const n in t) if (!e(t[n], n)) return !1;
    return !0;
  },
  Oi = (t, e) => Object.prototype.hasOwnProperty.call(t, e),
  gd = (t, e) =>
    t === e ||
    (Is(t) === Is(e) &&
      Un(t, (n, s) => (n !== void 0 || Oi(e, s)) && kc(e[s], n))),
  Ni = (t, e, n = 0) => {
    try {
      for (; n < t.length; n++) t[n](...e);
    } finally {
      n < t.length && Ni(t, e, n + 1);
    }
  },
  yd = (t) => t,
  jt = (t, e) => {
    if (t === e) return !0;
    if (
      t == null ||
      e == null ||
      (t.constructor !== e.constructor &&
        (t.constructor || Object) !== (e.constructor || Object))
    )
      return !1;
    if (t[Sn] != null) return t[Sn](e);
    switch (t.constructor) {
      case ArrayBuffer:
        ((t = new Uint8Array(t)), (e = new Uint8Array(e)));
      case Uint8Array: {
        if (t.byteLength !== e.byteLength) return !1;
        for (let n = 0; n < t.length; n++) if (t[n] !== e[n]) return !1;
        break;
      }
      case Set: {
        if (t.size !== e.size) return !1;
        for (const n of t) if (!e.has(n)) return !1;
        break;
      }
      case Map: {
        if (t.size !== e.size) return !1;
        for (const n of t.keys())
          if (!e.has(n) || !jt(t.get(n), e.get(n))) return !1;
        break;
      }
      case void 0:
      case Object:
        if (Is(t) !== Is(e)) return !1;
        for (const n in t) if (!Oi(t, n) || !jt(t[n], e[n])) return !1;
        break;
      case Array:
        if (t.length !== e.length) return !1;
        for (let n = 0; n < t.length; n++) if (!jt(t[n], e[n])) return !1;
        break;
      default:
        return !1;
    }
    return !0;
  },
  md = (t, e) => e.includes(t),
  wd = crypto.getRandomValues.bind(crypto),
  Ac = () => wd(new Uint32Array(1))[0],
  bd = "10000000-1000-4000-8000" + -1e11,
  vd = () =>
    bd.replace(/[018]/g, (t) => (t ^ (Ac() & (15 >> (t / 4)))).toString(16)),
  Bo = (t) => new Promise(t);
Promise.all.bind(Promise);
const Cd = (t) => (t === void 0 ? null : t);
class Sd {
  constructor() {
    this.map = new Map();
  }
  setItem(e, n) {
    this.map.set(e, n);
  }
  getItem(e) {
    return this.map.get(e);
  }
}
let xc = new Sd(),
  Ri = !0;
try {
  typeof localStorage < "u" && localStorage && ((xc = localStorage), (Ri = !1));
} catch {}
const Ic = xc,
  _d = (t) => Ri || addEventListener("storage", t),
  Ed = (t) => Ri || removeEventListener("storage", t),
  Kt =
    typeof process < "u" &&
    process.release &&
    /node|io\.js/.test(process.release.name) &&
    Object.prototype.toString.call(typeof process < "u" ? process : 0) ===
      "[object process]",
  $c = typeof window < "u" && typeof document < "u" && !Kt;
let xe;
const kd = () => {
    if (xe === void 0)
      if (Kt) {
        xe = re();
        const t = process.argv;
        let e = null;
        for (let n = 0; n < t.length; n++) {
          const s = t[n];
          s[0] === "-"
            ? (e !== null && xe.set(e, ""), (e = s))
            : e !== null && (xe.set(e, s), (e = null));
        }
        e !== null && xe.set(e, "");
      } else
        typeof location == "object"
          ? ((xe = re()),
            (location.search || "?")
              .slice(1)
              .split("&")
              .forEach((t) => {
                if (t.length !== 0) {
                  const [e, n] = t.split("=");
                  (xe.set(`--${Uo(e, "-")}`, n), xe.set(`-${Uo(e, "-")}`, n));
                }
              }))
          : (xe = re());
    return xe;
  },
  ti = (t) => kd().has(t),
  ni = (t) => Cd(Kt ? wc[t.toUpperCase().replaceAll("-", "_")] : Ic.getItem(t)),
  Dc = (t) => ti("--" + t) || ni(t) !== null,
  Ad = Dc("production"),
  xd = Kt && md(wc.FORCE_COLOR, ["true", "1", "2"]),
  Id =
    xd ||
    (!ti("--no-colors") &&
      !Dc("no-color") &&
      (!Kt || process.stdout.isTTY) &&
      (!Kt ||
        ti("--color") ||
        ni("COLORTERM") !== null ||
        (ni("TERM") || "").includes("color"))),
  Lc = (t) => new Uint8Array(t),
  $d = (t, e, n) => new Uint8Array(t, e, n),
  Dd = (t) => new Uint8Array(t),
  Ld = (t) => {
    let e = "";
    for (let n = 0; n < t.byteLength; n++) e += Cc(t[n]);
    return btoa(e);
  },
  Md = (t) =>
    Buffer.from(t.buffer, t.byteOffset, t.byteLength).toString("base64"),
  Td = (t) => {
    const e = atob(t),
      n = Lc(e.length);
    for (let s = 0; s < e.length; s++) n[s] = e.charCodeAt(s);
    return n;
  },
  Pd = (t) => {
    const e = Buffer.from(t, "base64");
    return $d(e.buffer, e.byteOffset, e.byteLength);
  },
  Od = $c ? Ld : Md,
  Nd = $c ? Td : Pd,
  Rd = (t) => {
    const e = Lc(t.byteLength);
    return (e.set(t), e);
  };
class jd {
  constructor(e, n) {
    ((this.left = e), (this.right = n));
  }
}
const Fe = (t, e) => new jd(t, e),
  qo = (t) => t.next() >= 0.5,
  Ar = (t, e, n) => _e(t.next() * (n + 1 - e) + e),
  Mc = (t, e, n) => _e(t.next() * (n + 1 - e) + e),
  ji = (t, e, n) => Mc(t, e, n),
  Ud = (t) => Cc(ji(t, 97, 122)),
  Hd = (t, e = 0, n = 20) => {
    const s = ji(t, e, n);
    let r = "";
    for (let i = 0; i < s; i++) r += Ud(t);
    return r;
  },
  xr = (t, e) => e[ji(t, 0, e.length - 1)],
  Fd = Symbol("0schema");
class zd {
  constructor() {
    this._rerrs = [];
  }
  extend(e, n, s, r = null) {
    this._rerrs.push({ path: e, expected: n, has: s, message: r });
  }
  toString() {
    const e = [];
    for (let n = this._rerrs.length - 1; n > 0; n--) {
      const s = this._rerrs[n];
      e.push(
        Fh(" ", (this._rerrs.length - n) * 2) +
          `${s.path != null ? `[${s.path}] ` : ""}${s.has} doesn't match ${s.expected}. ${s.message}`,
      );
    }
    return e.join(`
`);
  }
}
const si = (t, e) =>
  t === e
    ? !0
    : t == null || e == null || t.constructor !== e.constructor
      ? !1
      : t[Sn]
        ? kc(t, e)
        : Zs(t)
          ? $i(t, (n) => vc(e, (s) => si(n, s)))
          : ld(t)
            ? Un(t, (n, s) => si(n, e[s]))
            : !1;
class te {
  static _dilutes = !1;
  extends(e) {
    let [n, s] = [this.shape, e.shape];
    return (this.constructor._dilutes && ([s, n] = [n, s]), si(n, s));
  }
  equals(e) {
    return this.constructor === e.constructor && jt(this.shape, e.shape);
  }
  [Fd]() {
    return !0;
  }
  [Sn](e) {
    return this.equals(e);
  }
  validate(e) {
    return this.check(e);
  }
  check(e, n) {
    Se();
  }
  get nullable() {
    return Zt(this, ir);
  }
  get optional() {
    return new Oc(this);
  }
  cast(e) {
    return (Vo(e, this), e);
  }
  expect(e) {
    return (Vo(e, this), e);
  }
}
class Ui extends te {
  constructor(e, n) {
    (super(), (this.shape = e), (this._c = n));
  }
  check(e, n = void 0) {
    const s = e?.constructor === this.shape && (this._c == null || this._c(e));
    return (
      !s &&
        n?.extend(
          null,
          this.shape.name,
          e?.constructor.name,
          e?.constructor !== this.shape
            ? "Constructor match failed"
            : "Check failed",
        ),
      s
    );
  }
}
const P = (t, e = null) => new Ui(t, e);
P(Ui);
class Hi extends te {
  constructor(e) {
    (super(), (this.shape = e));
  }
  check(e, n) {
    const s = this.shape(e);
    return (
      !s &&
        n?.extend(
          null,
          "custom prop",
          e?.constructor.name,
          "failed to check custom prop",
        ),
      s
    );
  }
}
const B = (t) => new Hi(t);
P(Hi);
class tr extends te {
  constructor(e) {
    (super(), (this.shape = e));
  }
  check(e, n) {
    const s = this.shape.some((r) => r === e);
    return (!s && n?.extend(null, this.shape.join(" | "), e.toString()), s);
  }
}
const nr = (...t) => new tr(t),
  Tc = P(tr),
  Wd = RegExp.escape || ((t) => t.replace(/[().|&,$^[\]]/g, (e) => "\\" + e)),
  Pc = (t) => {
    if (Bt.check(t)) return [Wd(t)];
    if (Tc.check(t)) return t.shape.map((e) => e + "");
    if (Kc.check(t)) return ["[+-]?\\d+.?\\d*"];
    if (Bc.check(t)) return [".*"];
    if ($s.check(t)) return t.shape.map(Pc).flat(1);
    pe();
  };
class Kd extends te {
  constructor(e) {
    (super(),
      (this.shape = e),
      (this._r = new RegExp(
        "^" +
          e
            .map(Pc)
            .map((n) => `(${n.join("|")})`)
            .join("") +
          "$",
      )));
  }
  check(e, n) {
    const s = this._r.exec(e) != null;
    return (
      !s &&
        n?.extend(
          null,
          this._r.toString(),
          e.toString(),
          "String doesn't match string template.",
        ),
      s
    );
  }
}
P(Kd);
const Bd = Symbol("optional");
class Oc extends te {
  constructor(e) {
    (super(), (this.shape = e));
  }
  check(e, n) {
    const s = e === void 0 || this.shape.check(e);
    return (!s && n?.extend(null, "undefined (optional)", "()"), s);
  }
  get [Bd]() {
    return !0;
  }
}
const qd = P(Oc);
class Vd extends te {
  check(e, n) {
    return (n?.extend(null, "never", typeof e), !1);
  }
}
P(Vd);
class sr extends te {
  constructor(e, n = !1) {
    (super(), (this.shape = e), (this._isPartial = n));
  }
  static _dilutes = !0;
  get partial() {
    return new sr(this.shape, !0);
  }
  check(e, n) {
    return e == null
      ? (n?.extend(null, "object", "null"), !1)
      : Un(this.shape, (s, r) => {
          const i = (this._isPartial && !Oi(e, r)) || s.check(e[r], n);
          return (
            !i &&
              n?.extend(
                r.toString(),
                s.toString(),
                typeof e[r],
                "Object property does not match",
              ),
            i
          );
        });
  }
}
const Yd = (t) => new sr(t),
  Gd = P(sr),
  Jd = B(
    (t) => t != null && (t.constructor === Object || t.constructor == null),
  );
class Nc extends te {
  constructor(e, n) {
    (super(), (this.shape = { keys: e, values: n }));
  }
  check(e, n) {
    return (
      e != null &&
      Un(e, (s, r) => {
        const i = this.shape.keys.check(r, n);
        return (
          !i &&
            n?.extend(
              r + "",
              "Record",
              typeof e,
              i ? "Key doesn't match schema" : "Value doesn't match value",
            ),
          i && this.shape.values.check(s, n)
        );
      })
    );
  }
}
const Rc = (t, e) => new Nc(t, e),
  Xd = P(Nc);
class jc extends te {
  constructor(e) {
    (super(), (this.shape = e));
  }
  check(e, n) {
    return (
      e != null &&
      Un(this.shape, (s, r) => {
        const i = s.check(e[r], n);
        return (!i && n?.extend(r.toString(), "Tuple", typeof s), i);
      })
    );
  }
}
const Zd = (...t) => new jc(t);
P(jc);
class Uc extends te {
  constructor(e) {
    (super(), (this.shape = e.length === 1 ? e[0] : new Fi(e)));
  }
  check(e, n) {
    const s = Zs(e) && $i(e, (r) => this.shape.check(r));
    return (!s && n?.extend(null, "Array", ""), s);
  }
}
const Hc = (...t) => new Uc(t),
  Qd = P(Uc),
  ef = B((t) => Zs(t));
class Fc extends te {
  constructor(e, n) {
    (super(), (this.shape = e), (this._c = n));
  }
  check(e, n) {
    const s = e instanceof this.shape && (this._c == null || this._c(e));
    return (!s && n?.extend(null, this.shape.name, e?.constructor.name), s);
  }
}
const tf = (t, e = null) => new Fc(t, e);
P(Fc);
const nf = tf(te);
class sf extends te {
  constructor(e) {
    (super(),
      (this.len = e.length - 1),
      (this.args = Zd(...e.slice(-1))),
      (this.res = e[this.len]));
  }
  check(e, n) {
    const s = e.constructor === Function && e.length <= this.len;
    return (!s && n?.extend(null, "function", typeof e), s);
  }
}
const rf = P(sf),
  of = B((t) => typeof t == "function");
class af extends te {
  constructor(e) {
    (super(), (this.shape = e));
  }
  check(e, n) {
    const s = $i(this.shape, (r) => r.check(e, n));
    return (!s && n?.extend(null, "Intersectinon", typeof e), s);
  }
}
P(af, (t) => t.shape.length > 0);
class Fi extends te {
  static _dilutes = !0;
  constructor(e) {
    (super(), (this.shape = e));
  }
  check(e, n) {
    const s = vc(this.shape, (r) => r.check(e, n));
    return (n?.extend(null, "Union", typeof e), s);
  }
}
const Zt = (...t) =>
    t.findIndex((e) => $s.check(e)) >= 0
      ? Zt(
          ...t
            .map((e) => _n(e))
            .map((e) => ($s.check(e) ? e.shape : [e]))
            .flat(1),
        )
      : t.length === 1
        ? t[0]
        : new Fi(t),
  $s = P(Fi),
  zc = () => !0,
  Ds = B(zc),
  cf = P(Hi, (t) => t.shape === zc),
  zi = B((t) => typeof t == "bigint"),
  lf = B((t) => t === zi),
  Wc = B((t) => typeof t == "symbol");
B((t) => t === Wc);
const Ut = B((t) => typeof t == "number"),
  Kc = B((t) => t === Ut),
  Bt = B((t) => typeof t == "string"),
  Bc = B((t) => t === Bt),
  rr = B((t) => typeof t == "boolean"),
  uf = B((t) => t === rr),
  qc = nr(void 0);
P(tr, (t) => t.shape.length === 1 && t.shape[0] === void 0);
nr(void 0);
const ir = nr(null),
  hf = P(tr, (t) => t.shape.length === 1 && t.shape[0] === null);
P(Uint8Array);
P(Ui, (t) => t.shape === Uint8Array);
const df = Zt(Ut, Bt, ir, qc, zi, rr, Wc);
(() => {
  const t = Hc(Ds),
    e = Rc(Bt, Ds),
    n = Zt(Ut, Bt, ir, rr, t, e);
  return ((t.shape = n), (e.shape.values = n), n);
})();
const _n = (t) => {
    if (nf.check(t)) return t;
    if (Jd.check(t)) {
      const e = {};
      for (const n in t) e[n] = _n(t[n]);
      return Yd(e);
    } else {
      if (ef.check(t)) return Zt(...t.map(_n));
      if (df.check(t)) return nr(t);
      if (of.check(t)) return P(t);
    }
    pe();
  },
  Vo = Ad
    ? () => {}
    : (t, e) => {
        const n = new zd();
        if (!e.check(t, n))
          throw Oe(`Expected value to be of type ${e.constructor.name}.
${n.toString()}`);
      };
class ff {
  constructor(e) {
    ((this.patterns = []), (this.$state = e));
  }
  if(e, n) {
    return (this.patterns.push({ if: _n(e), h: n }), this);
  }
  else(e) {
    return this.if(Ds, e);
  }
  done() {
    return (e, n) => {
      for (let s = 0; s < this.patterns.length; s++) {
        const r = this.patterns[s];
        if (r.if.check(e)) return r.h(e, n);
      }
      throw Oe("Unhandled pattern");
    };
  }
}
const pf = (t) => new ff(t),
  Vc = pf(Ds)
    .if(Kc, (t, e) => Ar(e, jo, xs))
    .if(Bc, (t, e) => Hd(e))
    .if(uf, (t, e) => qo(e))
    .if(lf, (t, e) => BigInt(Ar(e, jo, xs)))
    .if($s, (t, e) => Lt(e, xr(e, t.shape)))
    .if(Gd, (t, e) => {
      const n = {};
      for (const s in t.shape) {
        let r = t.shape[s];
        if (qd.check(r)) {
          if (qo(e)) continue;
          r = r.shape;
        }
        n[s] = Vc(r, e);
      }
      return n;
    })
    .if(Qd, (t, e) => {
      const n = [],
        s = Mc(e, 0, 42);
      for (let r = 0; r < s; r++) n.push(Lt(e, t.shape));
      return n;
    })
    .if(Tc, (t, e) => xr(e, t.shape))
    .if(hf, (t, e) => null)
    .if(rf, (t, e) => {
      const n = Lt(e, t.res);
      return () => n;
    })
    .if(cf, (t, e) =>
      Lt(e, xr(e, [Ut, Bt, ir, qc, zi, rr, Hc(Ut), Rc(Zt("a", "b", "c"), Ut)])),
    )
    .if(Xd, (t, e) => {
      const n = {},
        s = Ar(e, 0, 3);
      for (let r = 0; r < s; r++) {
        const i = Lt(e, t.shape.keys),
          o = Lt(e, t.shape.values);
        n[i] = o;
      }
      return n;
    })
    .done(),
  Lt = (t, e) => Vc(_n(e), t),
  or = typeof document < "u" ? document : {};
B((t) => t.nodeType === bf);
typeof DOMParser < "u" && new DOMParser();
B((t) => t.nodeType === yf);
B((t) => t.nodeType === mf);
const gf = (t) => od(t, (e, n) => `${n}:${e};`).join(""),
  yf = or.ELEMENT_NODE,
  mf = or.TEXT_NODE,
  wf = or.DOCUMENT_NODE,
  bf = or.DOCUMENT_FRAGMENT_NODE;
B((t) => t.nodeType === wf);
const Ve = Symbol,
  Yc = Ve(),
  Gc = Ve(),
  vf = Ve(),
  Cf = Ve(),
  Sf = Ve(),
  Jc = Ve(),
  _f = Ve(),
  Xc = Ve(),
  Ef = Ve(),
  kf = (t) => {
    t.length === 1 && t[0]?.constructor === Function && (t = t[0]());
    const e = [],
      n = [];
    let s = 0;
    for (; s < t.length; s++) {
      const r = t[s];
      if (r === void 0) break;
      if (r.constructor === String || r.constructor === Number) e.push(r);
      else if (r.constructor === Object) break;
    }
    for (s > 0 && n.push(e.join("")); s < t.length; s++) {
      const r = t[s];
      r instanceof Symbol || n.push(r);
    }
    return n;
  },
  Af = {
    [Yc]: Fe("font-weight", "bold"),
    [Gc]: Fe("font-weight", "normal"),
    [vf]: Fe("color", "blue"),
    [Sf]: Fe("color", "green"),
    [Cf]: Fe("color", "grey"),
    [Jc]: Fe("color", "red"),
    [_f]: Fe("color", "purple"),
    [Xc]: Fe("color", "orange"),
    [Ef]: Fe("color", "black"),
  },
  xf = (t) => {
    t.length === 1 && t[0]?.constructor === Function && (t = t[0]());
    const e = [],
      n = [],
      s = re();
    let r = [],
      i = 0;
    for (; i < t.length; i++) {
      const o = t[i],
        a = Af[o];
      if (a !== void 0) s.set(a.left, a.right);
      else {
        if (o === void 0) break;
        if (o.constructor === String || o.constructor === Number) {
          const c = gf(s);
          i > 0 || c.length > 0 ? (e.push("%c" + o), n.push(c)) : e.push(o);
        } else break;
      }
    }
    for (i > 0 && ((r = n), r.unshift(e.join(""))); i < t.length; i++) {
      const o = t[i];
      o instanceof Symbol || r.push(o);
    }
    return r;
  },
  If = Id ? xf : kf,
  $f = (...t) => {
    (console.log(...If(t)), Df.forEach((e) => e.print(t)));
  },
  Df = rt(),
  Zc = (t) => ({
    [Symbol.iterator]() {
      return this;
    },
    next: t,
  }),
  Lf = (t, e) =>
    Zc(() => {
      let n;
      do n = t.next();
      while (!n.done && !e(n.value));
      return n;
    }),
  Ir = (t, e) =>
    Zc(() => {
      const { done: n, value: s } = t.next();
      return { done: n, value: n ? void 0 : e(s) };
    });
class Wi {
  constructor(e, n) {
    ((this.clock = e), (this.len = n));
  }
}
class Hn {
  constructor() {
    this.clients = new Map();
  }
}
const Qc = (t, e, n) =>
    e.clients.forEach((s, r) => {
      const i = t.doc.store.clients.get(r);
      for (let o = 0; o < s.length; o++) {
        const a = s[o];
        dl(t, i, a.clock, a.len, n);
      }
    }),
  Mf = (t, e) => {
    let n = 0,
      s = t.length - 1;
    for (; n <= s; ) {
      const r = _e((n + s) / 2),
        i = t[r],
        o = i.clock;
      if (o <= e) {
        if (e < o + i.len) return r;
        n = r + 1;
      } else s = r - 1;
    }
    return null;
  },
  el = (t, e) => {
    const n = t.clients.get(e.client);
    return n !== void 0 && Mf(n, e.clock) !== null;
  },
  Ki = (t) => {
    t.clients.forEach((e) => {
      e.sort((r, i) => r.clock - i.clock);
      let n, s;
      for (n = 1, s = 1; n < e.length; n++) {
        const r = e[s - 1],
          i = e[n];
        r.clock + r.len >= i.clock
          ? (r.len = $t(r.len, i.clock + i.len - r.clock))
          : (s < n && (e[s] = i), s++);
      }
      e.length = s;
    });
  },
  Tf = (t) => {
    const e = new Hn();
    for (let n = 0; n < t.length; n++)
      t[n].clients.forEach((s, r) => {
        if (!e.clients.has(r)) {
          const i = s.slice();
          for (let o = n + 1; o < t.length; o++)
            Mh(i, t[o].clients.get(r) || []);
          e.clients.set(r, i);
        }
      });
    return (Ki(e), e);
  },
  Ls = (t, e, n, s) => {
    He(t.clients, e, () => []).push(new Wi(n, s));
  },
  Pf = () => new Hn(),
  Of = (t) => {
    const e = Pf();
    return (
      t.clients.forEach((n, s) => {
        const r = [];
        for (let i = 0; i < n.length; i++) {
          const o = n[i];
          if (o.deleted) {
            const a = o.id.clock;
            let c = o.length;
            if (i + 1 < n.length)
              for (
                let l = n[i + 1];
                i + 1 < n.length && l.deleted;
                l = n[++i + 1]
              )
                c += l.length;
            r.push(new Wi(a, c));
          }
        }
        r.length > 0 && e.clients.set(s, r);
      }),
      e
    );
  },
  Qt = (t, e) => {
    (w(t.restEncoder, e.clients.size),
      Ke(e.clients.entries())
        .sort((n, s) => s[0] - n[0])
        .forEach(([n, s]) => {
          (t.resetDsCurVal(), w(t.restEncoder, n));
          const r = s.length;
          w(t.restEncoder, r);
          for (let i = 0; i < r; i++) {
            const o = s[i];
            (t.writeDsClock(o.clock), t.writeDsLen(o.len));
          }
        }));
  },
  Bi = (t) => {
    const e = new Hn(),
      n = S(t.restDecoder);
    for (let s = 0; s < n; s++) {
      t.resetDsCurVal();
      const r = S(t.restDecoder),
        i = S(t.restDecoder);
      if (i > 0) {
        const o = He(e.clients, r, () => []);
        for (let a = 0; a < i; a++)
          o.push(new Wi(t.readDsClock(), t.readDsLen()));
      }
    }
    return e;
  },
  Yo = (t, e, n) => {
    const s = new Hn(),
      r = S(t.restDecoder);
    for (let i = 0; i < r; i++) {
      t.resetDsCurVal();
      const o = S(t.restDecoder),
        a = S(t.restDecoder),
        c = n.clients.get(o) || [],
        l = F(n, o);
      for (let u = 0; u < a; u++) {
        const h = t.readDsClock(),
          d = h + t.readDsLen();
        if (h < l) {
          l < d && Ls(s, o, l, d - l);
          let f = Ee(c, h),
            p = c[f];
          for (
            !p.deleted &&
            p.id.clock < h &&
            (c.splice(f + 1, 0, Ns(e, p, h - p.id.clock)), f++);
            f < c.length && ((p = c[f++]), p.id.clock < d);

          )
            p.deleted ||
              (d < p.id.clock + p.length &&
                c.splice(f, 0, Ns(e, p, d - p.id.clock)),
              p.delete(e));
        } else Ls(s, o, h, d - h);
      }
    }
    if (s.clients.size > 0) {
      const i = new vt();
      return (w(i.restEncoder, 0), Qt(i, s), i.toUint8Array());
    }
    return null;
  },
  tl = Ac;
class Ae extends cd {
  constructor({
    guid: e = vd(),
    collectionid: n = null,
    gc: s = !0,
    gcFilter: r = () => !0,
    meta: i = null,
    autoLoad: o = !1,
    shouldLoad: a = !0,
  } = {}) {
    (super(),
      (this.gc = s),
      (this.gcFilter = r),
      (this.clientID = tl()),
      (this.guid = e),
      (this.collectionid = n),
      (this.share = new Map()),
      (this.store = new ul()),
      (this._transaction = null),
      (this._transactionCleanups = []),
      (this.subdocs = new Set()),
      (this._item = null),
      (this.shouldLoad = a),
      (this.autoLoad = o),
      (this.meta = i),
      (this.isLoaded = !1),
      (this.isSynced = !1),
      (this.whenLoaded = Bo((l) => {
        this.on("load", () => {
          ((this.isLoaded = !0), l(this));
        });
      })));
    const c = () =>
      Bo((l) => {
        const u = (h) => {
          (h === void 0 || h === !0) && (this.off("sync", u), l());
        };
        this.on("sync", u);
      });
    (this.on("sync", (l) => {
      (l === !1 && this.isSynced && (this.whenSynced = c()),
        (this.isSynced = l === void 0 || l === !0),
        this.isSynced && !this.isLoaded && this.emit("load", [this]));
    }),
      (this.whenSynced = c()));
  }
  load() {
    const e = this._item;
    (e !== null &&
      !this.shouldLoad &&
      x(
        e.parent.doc,
        (n) => {
          n.subdocsLoaded.add(this);
        },
        null,
        !0,
      ),
      (this.shouldLoad = !0));
  }
  getSubdocs() {
    return this.subdocs;
  }
  getSubdocGuids() {
    return new Set(Ke(this.subdocs).map((e) => e.guid));
  }
  transact(e, n = null) {
    return x(this, e, n);
  }
  get(e, n = L) {
    const s = He(this.share, e, () => {
        const i = new n();
        return (i._integrate(this, null), i);
      }),
      r = s.constructor;
    if (n !== L && r !== n)
      if (r === L) {
        const i = new n();
        ((i._map = s._map),
          s._map.forEach((o) => {
            for (; o !== null; o = o.left) o.parent = i;
          }),
          (i._start = s._start));
        for (let o = i._start; o !== null; o = o.right) o.parent = i;
        return (
          (i._length = s._length),
          this.share.set(e, i),
          i._integrate(this, null),
          i
        );
      } else
        throw new Error(
          `Type with the name ${e} has already been defined with a different constructor`,
        );
    return s;
  }
  getArray(e = "") {
    return this.get(e, Le);
  }
  getText(e = "") {
    return this.get(e, Be);
  }
  getMap(e = "") {
    return this.get(e, Ne);
  }
  getXmlElement(e = "") {
    return this.get(e, qe);
  }
  getXmlFragment(e = "") {
    return this.get(e, Re);
  }
  toJSON() {
    const e = {};
    return (
      this.share.forEach((n, s) => {
        e[s] = n.toJSON();
      }),
      e
    );
  }
  destroy() {
    Ke(this.subdocs).forEach((n) => n.destroy());
    const e = this._item;
    if (e !== null) {
      this._item = null;
      const n = e.content;
      ((n.doc = new Ae({ guid: this.guid, ...n.opts, shouldLoad: !1 })),
        (n.doc._item = e),
        x(
          e.parent.doc,
          (s) => {
            const r = n.doc;
            (e.deleted || s.subdocsAdded.add(r), s.subdocsRemoved.add(this));
          },
          null,
          !0,
        ));
    }
    (this.emit("destroyed", [!0]),
      this.emit("destroy", [this]),
      super.destroy());
  }
}
class nl {
  constructor(e) {
    this.restDecoder = e;
  }
  resetDsCurVal() {}
  readDsClock() {
    return S(this.restDecoder);
  }
  readDsLen() {
    return S(this.restDecoder);
  }
}
class sl extends nl {
  readLeftID() {
    return k(S(this.restDecoder), S(this.restDecoder));
  }
  readRightID() {
    return k(S(this.restDecoder), S(this.restDecoder));
  }
  readClient() {
    return S(this.restDecoder);
  }
  readInfo() {
    return zt(this.restDecoder);
  }
  readString() {
    return et(this.restDecoder);
  }
  readParentInfo() {
    return S(this.restDecoder) === 1;
  }
  readTypeRef() {
    return S(this.restDecoder);
  }
  readLen() {
    return S(this.restDecoder);
  }
  readAny() {
    return Cn(this.restDecoder);
  }
  readBuf() {
    return Rd(G(this.restDecoder));
  }
  readJSON() {
    return JSON.parse(et(this.restDecoder));
  }
  readKey() {
    return et(this.restDecoder);
  }
}
class Nf {
  constructor(e) {
    ((this.dsCurrVal = 0), (this.restDecoder = e));
  }
  resetDsCurVal() {
    this.dsCurrVal = 0;
  }
  readDsClock() {
    return ((this.dsCurrVal += S(this.restDecoder)), this.dsCurrVal);
  }
  readDsLen() {
    const e = S(this.restDecoder) + 1;
    return ((this.dsCurrVal += e), e);
  }
}
class qt extends Nf {
  constructor(e) {
    (super(e),
      (this.keys = []),
      S(e),
      (this.keyClockDecoder = new kr(G(e))),
      (this.clientDecoder = new Cs(G(e))),
      (this.leftClockDecoder = new kr(G(e))),
      (this.rightClockDecoder = new kr(G(e))),
      (this.infoDecoder = new Ko(G(e), zt)),
      (this.stringDecoder = new id(G(e))),
      (this.parentInfoDecoder = new Ko(G(e), zt)),
      (this.typeRefDecoder = new Cs(G(e))),
      (this.lenDecoder = new Cs(G(e))));
  }
  readLeftID() {
    return new Ht(this.clientDecoder.read(), this.leftClockDecoder.read());
  }
  readRightID() {
    return new Ht(this.clientDecoder.read(), this.rightClockDecoder.read());
  }
  readClient() {
    return this.clientDecoder.read();
  }
  readInfo() {
    return this.infoDecoder.read();
  }
  readString() {
    return this.stringDecoder.read();
  }
  readParentInfo() {
    return this.parentInfoDecoder.read() === 1;
  }
  readTypeRef() {
    return this.typeRefDecoder.read();
  }
  readLen() {
    return this.lenDecoder.read();
  }
  readAny() {
    return Cn(this.restDecoder);
  }
  readBuf() {
    return G(this.restDecoder);
  }
  readJSON() {
    return Cn(this.restDecoder);
  }
  readKey() {
    const e = this.keyClockDecoder.read();
    if (e < this.keys.length) return this.keys[e];
    {
      const n = this.stringDecoder.read();
      return (this.keys.push(n), n);
    }
  }
}
class rl {
  constructor() {
    this.restEncoder = J();
  }
  toUint8Array() {
    return $(this.restEncoder);
  }
  resetDsCurVal() {}
  writeDsClock(e) {
    w(this.restEncoder, e);
  }
  writeDsLen(e) {
    w(this.restEncoder, e);
  }
}
class Fn extends rl {
  writeLeftID(e) {
    (w(this.restEncoder, e.client), w(this.restEncoder, e.clock));
  }
  writeRightID(e) {
    (w(this.restEncoder, e.client), w(this.restEncoder, e.clock));
  }
  writeClient(e) {
    w(this.restEncoder, e);
  }
  writeInfo(e) {
    Zr(this.restEncoder, e);
  }
  writeString(e) {
    yt(this.restEncoder, e);
  }
  writeParentInfo(e) {
    w(this.restEncoder, e ? 1 : 0);
  }
  writeTypeRef(e) {
    w(this.restEncoder, e);
  }
  writeLen(e) {
    w(this.restEncoder, e);
  }
  writeAny(e) {
    vn(this.restEncoder, e);
  }
  writeBuf(e) {
    M(this.restEncoder, e);
  }
  writeJSON(e) {
    yt(this.restEncoder, JSON.stringify(e));
  }
  writeKey(e) {
    yt(this.restEncoder, e);
  }
}
class il {
  constructor() {
    ((this.restEncoder = J()), (this.dsCurrVal = 0));
  }
  toUint8Array() {
    return $(this.restEncoder);
  }
  resetDsCurVal() {
    this.dsCurrVal = 0;
  }
  writeDsClock(e) {
    const n = e - this.dsCurrVal;
    ((this.dsCurrVal = e), w(this.restEncoder, n));
  }
  writeDsLen(e) {
    (e === 0 && pe(), w(this.restEncoder, e - 1), (this.dsCurrVal += e));
  }
}
class vt extends il {
  constructor() {
    (super(),
      (this.keyMap = new Map()),
      (this.keyClock = 0),
      (this.keyClockEncoder = new Er()),
      (this.clientEncoder = new vs()),
      (this.leftClockEncoder = new Er()),
      (this.rightClockEncoder = new Er()),
      (this.infoEncoder = new Fo(Zr)),
      (this.stringEncoder = new Jh()),
      (this.parentInfoEncoder = new Fo(Zr)),
      (this.typeRefEncoder = new vs()),
      (this.lenEncoder = new vs()));
  }
  toUint8Array() {
    const e = J();
    return (
      w(e, 0),
      M(e, this.keyClockEncoder.toUint8Array()),
      M(e, this.clientEncoder.toUint8Array()),
      M(e, this.leftClockEncoder.toUint8Array()),
      M(e, this.rightClockEncoder.toUint8Array()),
      M(e, $(this.infoEncoder)),
      M(e, this.stringEncoder.toUint8Array()),
      M(e, $(this.parentInfoEncoder)),
      M(e, this.typeRefEncoder.toUint8Array()),
      M(e, this.lenEncoder.toUint8Array()),
      Qs(e, $(this.restEncoder)),
      $(e)
    );
  }
  writeLeftID(e) {
    (this.clientEncoder.write(e.client), this.leftClockEncoder.write(e.clock));
  }
  writeRightID(e) {
    (this.clientEncoder.write(e.client), this.rightClockEncoder.write(e.clock));
  }
  writeClient(e) {
    this.clientEncoder.write(e);
  }
  writeInfo(e) {
    this.infoEncoder.write(e);
  }
  writeString(e) {
    this.stringEncoder.write(e);
  }
  writeParentInfo(e) {
    this.parentInfoEncoder.write(e ? 1 : 0);
  }
  writeTypeRef(e) {
    this.typeRefEncoder.write(e);
  }
  writeLen(e) {
    this.lenEncoder.write(e);
  }
  writeAny(e) {
    vn(this.restEncoder, e);
  }
  writeBuf(e) {
    M(this.restEncoder, e);
  }
  writeJSON(e) {
    vn(this.restEncoder, e);
  }
  writeKey(e) {
    const n = this.keyMap.get(e);
    n === void 0
      ? (this.keyClockEncoder.write(this.keyClock++),
        this.stringEncoder.write(e))
      : this.keyClockEncoder.write(n);
  }
}
const Rf = (t, e, n, s) => {
    s = $t(s, e[0].id.clock);
    const r = Ee(e, s);
    (w(t.restEncoder, e.length - r), t.writeClient(n), w(t.restEncoder, s));
    const i = e[r];
    i.write(t, s - i.id.clock);
    for (let o = r + 1; o < e.length; o++) e[o].write(t, 0);
  },
  qi = (t, e, n) => {
    const s = new Map();
    (n.forEach((r, i) => {
      F(e, i) > r && s.set(i, r);
    }),
      ar(e).forEach((r, i) => {
        n.has(i) || s.set(i, 0);
      }),
      w(t.restEncoder, s.size),
      Ke(s.entries())
        .sort((r, i) => i[0] - r[0])
        .forEach(([r, i]) => {
          Rf(t, e.clients.get(r), r, i);
        }));
  },
  jf = (t, e) => {
    const n = re(),
      s = S(t.restDecoder);
    for (let r = 0; r < s; r++) {
      const i = S(t.restDecoder),
        o = new Array(i),
        a = t.readClient();
      let c = S(t.restDecoder);
      n.set(a, { i: 0, refs: o });
      for (let l = 0; l < i; l++) {
        const u = t.readInfo();
        switch (Xs & u) {
          case 0: {
            const h = t.readLen();
            ((o[l] = new ce(k(a, c), h)), (c += h));
            break;
          }
          case 10: {
            const h = S(t.restDecoder);
            ((o[l] = new fe(k(a, c), h)), (c += h));
            break;
          }
          default: {
            const h = (u & (ze | le)) === 0,
              d = new N(
                k(a, c),
                null,
                (u & le) === le ? t.readLeftID() : null,
                null,
                (u & ze) === ze ? t.readRightID() : null,
                h
                  ? t.readParentInfo()
                    ? e.get(t.readString())
                    : t.readLeftID()
                  : null,
                h && (u & wn) === wn ? t.readString() : null,
                Ll(t, u),
              );
            ((o[l] = d), (c += d.length));
          }
        }
      }
    }
    return n;
  },
  Uf = (t, e, n) => {
    const s = [];
    let r = Ke(n.keys()).sort((f, p) => f - p);
    if (r.length === 0) return null;
    const i = () => {
      if (r.length === 0) return null;
      let f = n.get(r[r.length - 1]);
      for (; f.refs.length === f.i; )
        if ((r.pop(), r.length > 0)) f = n.get(r[r.length - 1]);
        else return null;
      return f;
    };
    let o = i();
    if (o === null) return null;
    const a = new ul(),
      c = new Map(),
      l = (f, p) => {
        const g = c.get(f);
        (g == null || g > p) && c.set(f, p);
      };
    let u = o.refs[o.i++];
    const h = new Map(),
      d = () => {
        for (const f of s) {
          const p = f.id.client,
            g = n.get(p);
          (g
            ? (g.i--,
              a.clients.set(p, g.refs.slice(g.i)),
              n.delete(p),
              (g.i = 0),
              (g.refs = []))
            : a.clients.set(p, [f]),
            (r = r.filter((b) => b !== p)));
        }
        s.length = 0;
      };
    for (;;) {
      if (u.constructor !== fe) {
        const f = He(h, u.id.client, () => F(e, u.id.client)) - u.id.clock;
        if (f < 0) (s.push(u), l(u.id.client, u.id.clock - 1), d());
        else {
          const p = u.getMissing(t, e);
          if (p !== null) {
            s.push(u);
            const g = n.get(p) || { refs: [], i: 0 };
            if (g.refs.length === g.i) (l(p, F(e, p)), d());
            else {
              u = g.refs[g.i++];
              continue;
            }
          } else
            (f === 0 || f < u.length) &&
              (u.integrate(t, f), h.set(u.id.client, u.id.clock + u.length));
        }
      }
      if (s.length > 0) u = s.pop();
      else if (o !== null && o.i < o.refs.length) u = o.refs[o.i++];
      else {
        if (((o = i()), o === null)) break;
        u = o.refs[o.i++];
      }
    }
    if (a.clients.size > 0) {
      const f = new vt();
      return (
        qi(f, a, new Map()),
        w(f.restEncoder, 0),
        { missing: c, update: f.toUint8Array() }
      );
    }
    return null;
  },
  Hf = (t, e) => qi(t, e.doc.store, e.beforeState),
  Ff = (t, e, n, s = new qt(t)) =>
    x(
      e,
      (r) => {
        r.local = !1;
        let i = !1;
        const o = r.doc,
          a = o.store,
          c = jf(s, o),
          l = Uf(r, a, c),
          u = a.pendingStructs;
        if (u) {
          for (const [d, f] of u.missing)
            if (f < F(a, d)) {
              i = !0;
              break;
            }
          if (l) {
            for (const [d, f] of l.missing) {
              const p = u.missing.get(d);
              (p == null || p > f) && u.missing.set(d, f);
            }
            u.update = Ms([u.update, l.update]);
          }
        } else a.pendingStructs = l;
        const h = Yo(s, r, a);
        if (a.pendingDs) {
          const d = new qt(ct(a.pendingDs));
          S(d.restDecoder);
          const f = Yo(d, r, a);
          h && f ? (a.pendingDs = Ms([h, f])) : (a.pendingDs = h || f);
        } else a.pendingDs = h;
        if (i) {
          const d = a.pendingStructs.update;
          ((a.pendingStructs = null), ol(r.doc, d));
        }
      },
      n,
      !1,
    ),
  ol = (t, e, n, s = qt) => {
    const r = ct(e);
    Ff(r, t, n, new s(r));
  },
  zf = (t, e, n) => ol(t, e, n, sl),
  Wf = (t, e, n = new Map()) => {
    (qi(t, e.store, n), Qt(t, Of(e.store)));
  },
  Kf = (t, e = new Uint8Array([0]), n = new vt()) => {
    const s = al(e);
    Wf(n, t, s);
    const r = [n.toUint8Array()];
    if (
      (t.store.pendingDs && r.push(t.store.pendingDs),
      t.store.pendingStructs && r.push(op(t.store.pendingStructs.update, e)),
      r.length > 1)
    ) {
      if (n.constructor === Fn)
        return rp(r.map((i, o) => (o === 0 ? i : cp(i))));
      if (n.constructor === vt) return Ms(r);
    }
    return r[0];
  },
  Bf = (t, e) => Kf(t, e, new Fn()),
  qf = (t) => {
    const e = new Map(),
      n = S(t.restDecoder);
    for (let s = 0; s < n; s++) {
      const r = S(t.restDecoder),
        i = S(t.restDecoder);
      e.set(r, i);
    }
    return e;
  },
  al = (t) => qf(new nl(ct(t))),
  cl = (t, e) => (
    w(t.restEncoder, e.size),
    Ke(e.entries())
      .sort((n, s) => s[0] - n[0])
      .forEach(([n, s]) => {
        (w(t.restEncoder, n), w(t.restEncoder, s));
      }),
    t
  ),
  Vf = (t, e) => cl(t, ar(e.store)),
  Yf = (t, e = new il()) => (
    t instanceof Map ? cl(e, t) : Vf(e, t),
    e.toUint8Array()
  ),
  Gf = (t) => Yf(t, new rl());
class Jf {
  constructor() {
    this.l = [];
  }
}
const Go = () => new Jf(),
  Jo = (t, e) => t.l.push(e),
  Xo = (t, e) => {
    const n = t.l,
      s = n.length;
    ((t.l = n.filter((r) => e !== r)),
      s === t.l.length &&
        console.error(
          "[yjs] Tried to remove event handler that doesn't exist.",
        ));
  },
  ll = (t, e, n) => Ni(t.l, [e, n]);
class Ht {
  constructor(e, n) {
    ((this.client = e), (this.clock = n));
  }
}
const es = (t, e) =>
    t === e ||
    (t !== null && e !== null && t.client === e.client && t.clock === e.clock),
  k = (t, e) => new Ht(t, e),
  Xf = (t) => {
    for (const [e, n] of t.doc.share.entries()) if (n === t) return e;
    throw pe();
  },
  Tt = (t, e) =>
    e === void 0
      ? !t.deleted
      : e.sv.has(t.id.client) &&
        (e.sv.get(t.id.client) || 0) > t.id.clock &&
        !el(e.ds, t.id),
  ri = (t, e) => {
    const n = He(t.meta, ri, rt),
      s = t.doc.store;
    n.has(e) ||
      (e.sv.forEach((r, i) => {
        r < F(s, i) && it(t, k(i, r));
      }),
      Qc(t, e.ds, (r) => {}),
      n.add(e));
  };
class ul {
  constructor() {
    ((this.clients = new Map()),
      (this.pendingStructs = null),
      (this.pendingDs = null));
  }
}
const ar = (t) => {
    const e = new Map();
    return (
      t.clients.forEach((n, s) => {
        const r = n[n.length - 1];
        e.set(s, r.id.clock + r.length);
      }),
      e
    );
  },
  F = (t, e) => {
    const n = t.clients.get(e);
    if (n === void 0) return 0;
    const s = n[n.length - 1];
    return s.id.clock + s.length;
  },
  hl = (t, e) => {
    let n = t.clients.get(e.id.client);
    if (n === void 0) ((n = []), t.clients.set(e.id.client, n));
    else {
      const s = n[n.length - 1];
      if (s.id.clock + s.length !== e.id.clock) throw pe();
    }
    n.push(e);
  },
  Ee = (t, e) => {
    let n = 0,
      s = t.length - 1,
      r = t[s],
      i = r.id.clock;
    if (i === e) return s;
    let o = _e((e / (i + r.length - 1)) * s);
    for (; n <= s; ) {
      if (((r = t[o]), (i = r.id.clock), i <= e)) {
        if (e < i + r.length) return o;
        n = o + 1;
      } else s = o - 1;
      o = _e((n + s) / 2);
    }
    throw pe();
  },
  Zf = (t, e) => {
    const n = t.clients.get(e.client);
    return n[Ee(n, e.clock)];
  },
  $r = Zf,
  ii = (t, e, n) => {
    const s = Ee(e, n),
      r = e[s];
    return r.id.clock < n && r instanceof N
      ? (e.splice(s + 1, 0, Ns(t, r, n - r.id.clock)), s + 1)
      : s;
  },
  it = (t, e) => {
    const n = t.doc.store.clients.get(e.client);
    return n[ii(t, n, e.clock)];
  },
  Zo = (t, e, n) => {
    const s = e.clients.get(n.client),
      r = Ee(s, n.clock),
      i = s[r];
    return (
      n.clock !== i.id.clock + i.length - 1 &&
        i.constructor !== ce &&
        s.splice(r + 1, 0, Ns(t, i, n.clock - i.id.clock + 1)),
      i
    );
  },
  Qf = (t, e, n) => {
    const s = t.clients.get(e.id.client);
    s[Ee(s, e.id.clock)] = n;
  },
  dl = (t, e, n, s, r) => {
    if (s === 0) return;
    const i = n + s;
    let o = ii(t, e, n),
      a;
    do ((a = e[o++]), i < a.id.clock + a.length && ii(t, e, i), r(a));
    while (o < e.length && e[o].id.clock < i);
  };
class ep {
  constructor(e, n, s) {
    ((this.doc = e),
      (this.deleteSet = new Hn()),
      (this.beforeState = ar(e.store)),
      (this.afterState = new Map()),
      (this.changed = new Map()),
      (this.changedParentTypes = new Map()),
      (this._mergeStructs = []),
      (this.origin = n),
      (this.meta = new Map()),
      (this.local = s),
      (this.subdocsAdded = new Set()),
      (this.subdocsRemoved = new Set()),
      (this.subdocsLoaded = new Set()),
      (this._needFormattingCleanup = !1));
  }
}
const Qo = (t, e) =>
    e.deleteSet.clients.size === 0 &&
    !ad(e.afterState, (n, s) => e.beforeState.get(s) !== n)
      ? !1
      : (Ki(e.deleteSet), Hf(t, e), Qt(t, e.deleteSet), !0),
  ea = (t, e, n) => {
    const s = e._item;
    (s === null ||
      (s.id.clock < (t.beforeState.get(s.id.client) || 0) && !s.deleted)) &&
      He(t.changed, e, rt).add(n);
  },
  Ss = (t, e) => {
    let n = t[e],
      s = t[e - 1],
      r = e;
    for (; r > 0; n = s, s = t[--r - 1]) {
      if (
        s.deleted === n.deleted &&
        s.constructor === n.constructor &&
        s.mergeWith(n)
      ) {
        n instanceof N &&
          n.parentSub !== null &&
          n.parent._map.get(n.parentSub) === n &&
          n.parent._map.set(n.parentSub, s);
        continue;
      }
      break;
    }
    const i = e - r;
    return (i && t.splice(e + 1 - i, i), i);
  },
  tp = (t, e, n) => {
    for (const [s, r] of t.clients.entries()) {
      const i = e.clients.get(s);
      for (let o = r.length - 1; o >= 0; o--) {
        const a = r[o],
          c = a.clock + a.len;
        for (
          let l = Ee(i, a.clock), u = i[l];
          l < i.length && u.id.clock < c;
          u = i[++l]
        ) {
          const h = i[l];
          if (a.clock + a.len <= h.id.clock) break;
          h instanceof N && h.deleted && !h.keep && n(h) && h.gc(e, !1);
        }
      }
    }
  },
  np = (t, e) => {
    t.clients.forEach((n, s) => {
      const r = e.clients.get(s);
      for (let i = n.length - 1; i >= 0; i--) {
        const o = n[i],
          a = Ii(r.length - 1, 1 + Ee(r, o.clock + o.len - 1));
        for (let c = a, l = r[c]; c > 0 && l.id.clock >= o.clock; l = r[c])
          c -= 1 + Ss(r, c);
      }
    });
  },
  fl = (t, e) => {
    if (e < t.length) {
      const n = t[e],
        s = n.doc,
        r = s.store,
        i = n.deleteSet,
        o = n._mergeStructs;
      try {
        (Ki(i),
          (n.afterState = ar(n.doc.store)),
          s.emit("beforeObserverCalls", [n, s]));
        const a = [];
        (n.changed.forEach((c, l) =>
          a.push(() => {
            (l._item === null || !l._item.deleted) && l._callObserver(n, c);
          }),
        ),
          a.push(() => {
            n.changedParentTypes.forEach((c, l) => {
              l._dEH.l.length > 0 &&
                (l._item === null || !l._item.deleted) &&
                ((c = c.filter(
                  (u) => u.target._item === null || !u.target._item.deleted,
                )),
                c.forEach((u) => {
                  ((u.currentTarget = l), (u._path = null));
                }),
                c.sort((u, h) => u.path.length - h.path.length),
                ll(l._dEH, c, n));
            });
          }),
          a.push(() => s.emit("afterTransaction", [n, s])),
          Ni(a, []),
          n._needFormattingCleanup && Sp(n));
      } finally {
        (s.gc && tp(i, r, s.gcFilter),
          np(i, r),
          n.afterState.forEach((u, h) => {
            const d = n.beforeState.get(h) || 0;
            if (d !== u) {
              const f = r.clients.get(h),
                p = $t(Ee(f, d), 1);
              for (let g = f.length - 1; g >= p; ) g -= 1 + Ss(f, g);
            }
          }));
        for (let u = o.length - 1; u >= 0; u--) {
          const { client: h, clock: d } = o[u].id,
            f = r.clients.get(h),
            p = Ee(f, d);
          (p + 1 < f.length && Ss(f, p + 1) > 1) || (p > 0 && Ss(f, p));
        }
        if (
          (!n.local &&
            n.afterState.get(s.clientID) !== n.beforeState.get(s.clientID) &&
            ($f(
              Xc,
              Yc,
              "[yjs] ",
              Gc,
              Jc,
              "Changed the client-id because another client seems to be using it.",
            ),
            (s.clientID = tl())),
          s.emit("afterTransactionCleanup", [n, s]),
          s._observers.has("update"))
        ) {
          const u = new Fn();
          Qo(u, n) && s.emit("update", [u.toUint8Array(), n.origin, s, n]);
        }
        if (s._observers.has("updateV2")) {
          const u = new vt();
          Qo(u, n) && s.emit("updateV2", [u.toUint8Array(), n.origin, s, n]);
        }
        const { subdocsAdded: a, subdocsLoaded: c, subdocsRemoved: l } = n;
        ((a.size > 0 || l.size > 0 || c.size > 0) &&
          (a.forEach((u) => {
            ((u.clientID = s.clientID),
              u.collectionid == null && (u.collectionid = s.collectionid),
              s.subdocs.add(u));
          }),
          l.forEach((u) => s.subdocs.delete(u)),
          s.emit("subdocs", [{ loaded: c, added: a, removed: l }, s, n]),
          l.forEach((u) => u.destroy())),
          t.length <= e + 1
            ? ((s._transactionCleanups = []),
              s.emit("afterAllTransactions", [s, t]))
            : fl(t, e + 1));
      }
    }
  },
  x = (t, e, n = null, s = !0) => {
    const r = t._transactionCleanups;
    let i = !1,
      o = null;
    t._transaction === null &&
      ((i = !0),
      (t._transaction = new ep(t, n, s)),
      r.push(t._transaction),
      r.length === 1 && t.emit("beforeAllTransactions", [t]),
      t.emit("beforeTransaction", [t._transaction, t]));
    try {
      o = e(t._transaction);
    } finally {
      if (i) {
        const a = t._transaction === r[0];
        ((t._transaction = null), a && fl(r, 0));
      }
    }
    return o;
  };
function* sp(t) {
  const e = S(t.restDecoder);
  for (let n = 0; n < e; n++) {
    const s = S(t.restDecoder),
      r = t.readClient();
    let i = S(t.restDecoder);
    for (let o = 0; o < s; o++) {
      const a = t.readInfo();
      if (a === 10) {
        const c = S(t.restDecoder);
        (yield new fe(k(r, i), c), (i += c));
      } else if ((Xs & a) !== 0) {
        const c = (a & (ze | le)) === 0,
          l = new N(
            k(r, i),
            null,
            (a & le) === le ? t.readLeftID() : null,
            null,
            (a & ze) === ze ? t.readRightID() : null,
            c ? (t.readParentInfo() ? t.readString() : t.readLeftID()) : null,
            c && (a & wn) === wn ? t.readString() : null,
            Ll(t, a),
          );
        (yield l, (i += l.length));
      } else {
        const c = t.readLen();
        (yield new ce(k(r, i), c), (i += c));
      }
    }
  }
}
class Vi {
  constructor(e, n) {
    ((this.gen = sp(e)),
      (this.curr = null),
      (this.done = !1),
      (this.filterSkips = n),
      this.next());
  }
  next() {
    do this.curr = this.gen.next().value || null;
    while (
      this.filterSkips &&
      this.curr !== null &&
      this.curr.constructor === fe
    );
    return this.curr;
  }
}
class Yi {
  constructor(e) {
    ((this.currClient = 0),
      (this.startClock = 0),
      (this.written = 0),
      (this.encoder = e),
      (this.clientStructs = []));
  }
}
const rp = (t) => Ms(t, sl, Fn),
  ip = (t, e) => {
    if (t.constructor === ce) {
      const { client: n, clock: s } = t.id;
      return new ce(k(n, s + e), t.length - e);
    } else if (t.constructor === fe) {
      const { client: n, clock: s } = t.id;
      return new fe(k(n, s + e), t.length - e);
    } else {
      const n = t,
        { client: s, clock: r } = n.id;
      return new N(
        k(s, r + e),
        null,
        k(s, r + e - 1),
        null,
        n.rightOrigin,
        n.parent,
        n.parentSub,
        n.content.splice(e),
      );
    }
  },
  Ms = (t, e = qt, n = vt) => {
    if (t.length === 1) return t[0];
    const s = t.map((u) => new e(ct(u)));
    let r = s.map((u) => new Vi(u, !0)),
      i = null;
    const o = new n(),
      a = new Yi(o);
    for (
      ;
      (r = r.filter((u) => u.curr !== null)),
        r.sort((u, h) => {
          if (u.curr.id.client === h.curr.id.client) {
            const d = u.curr.id.clock - h.curr.id.clock;
            return d === 0
              ? u.curr.constructor === h.curr.constructor
                ? 0
                : u.curr.constructor === fe
                  ? 1
                  : -1
              : d;
          } else return h.curr.id.client - u.curr.id.client;
        }),
        r.length !== 0;

    ) {
      const u = r[0],
        h = u.curr.id.client;
      if (i !== null) {
        let d = u.curr,
          f = !1;
        for (
          ;
          d !== null &&
          d.id.clock + d.length <= i.struct.id.clock + i.struct.length &&
          d.id.client >= i.struct.id.client;

        )
          ((d = u.next()), (f = !0));
        if (
          d === null ||
          d.id.client !== h ||
          (f && d.id.clock > i.struct.id.clock + i.struct.length)
        )
          continue;
        if (h !== i.struct.id.client)
          (Xe(a, i.struct, i.offset), (i = { struct: d, offset: 0 }), u.next());
        else if (i.struct.id.clock + i.struct.length < d.id.clock)
          if (i.struct.constructor === fe)
            i.struct.length = d.id.clock + d.length - i.struct.id.clock;
          else {
            Xe(a, i.struct, i.offset);
            const p = d.id.clock - i.struct.id.clock - i.struct.length;
            i = {
              struct: new fe(k(h, i.struct.id.clock + i.struct.length), p),
              offset: 0,
            };
          }
        else {
          const p = i.struct.id.clock + i.struct.length - d.id.clock;
          (p > 0 &&
            (i.struct.constructor === fe
              ? (i.struct.length -= p)
              : (d = ip(d, p))),
            i.struct.mergeWith(d) ||
              (Xe(a, i.struct, i.offset),
              (i = { struct: d, offset: 0 }),
              u.next()));
        }
      } else ((i = { struct: u.curr, offset: 0 }), u.next());
      for (
        let d = u.curr;
        d !== null &&
        d.id.client === h &&
        d.id.clock === i.struct.id.clock + i.struct.length &&
        d.constructor !== fe;
        d = u.next()
      )
        (Xe(a, i.struct, i.offset), (i = { struct: d, offset: 0 }));
    }
    (i !== null && (Xe(a, i.struct, i.offset), (i = null)), Gi(a));
    const c = s.map((u) => Bi(u)),
      l = Tf(c);
    return (Qt(o, l), o.toUint8Array());
  },
  op = (t, e, n = qt, s = vt) => {
    const r = al(e),
      i = new s(),
      o = new Yi(i),
      a = new n(ct(t)),
      c = new Vi(a, !1);
    for (; c.curr; ) {
      const u = c.curr,
        h = u.id.client,
        d = r.get(h) || 0;
      if (c.curr.constructor === fe) {
        c.next();
        continue;
      }
      if (u.id.clock + u.length > d)
        for (
          Xe(o, u, $t(d - u.id.clock, 0)), c.next();
          c.curr && c.curr.id.client === h;

        )
          (Xe(o, c.curr, 0), c.next());
      else
        for (
          ;
          c.curr &&
          c.curr.id.client === h &&
          c.curr.id.clock + c.curr.length <= d;

        )
          c.next();
    }
    Gi(o);
    const l = Bi(a);
    return (Qt(i, l), i.toUint8Array());
  },
  pl = (t) => {
    t.written > 0 &&
      (t.clientStructs.push({
        written: t.written,
        restEncoder: $(t.encoder.restEncoder),
      }),
      (t.encoder.restEncoder = J()),
      (t.written = 0));
  },
  Xe = (t, e, n) => {
    (t.written > 0 && t.currClient !== e.id.client && pl(t),
      t.written === 0 &&
        ((t.currClient = e.id.client),
        t.encoder.writeClient(e.id.client),
        w(t.encoder.restEncoder, e.id.clock + n)),
      e.write(t.encoder, n),
      t.written++);
  },
  Gi = (t) => {
    pl(t);
    const e = t.encoder.restEncoder;
    w(e, t.clientStructs.length);
    for (let n = 0; n < t.clientStructs.length; n++) {
      const s = t.clientStructs[n];
      (w(e, s.written), Qs(e, s.restEncoder));
    }
  },
  ap = (t, e, n, s) => {
    const r = new n(ct(t)),
      i = new Vi(r, !1),
      o = new s(),
      a = new Yi(o);
    for (let l = i.curr; l !== null; l = i.next()) Xe(a, e(l), 0);
    Gi(a);
    const c = Bi(r);
    return (Qt(o, c), o.toUint8Array());
  },
  cp = (t) => ap(t, yd, qt, Fn),
  ta = "You must not compute changes after the event-handler fired.";
class cr {
  constructor(e, n) {
    ((this.target = e),
      (this.currentTarget = e),
      (this.transaction = n),
      (this._changes = null),
      (this._keys = null),
      (this._delta = null),
      (this._path = null));
  }
  get path() {
    return this._path || (this._path = lp(this.currentTarget, this.target));
  }
  deletes(e) {
    return el(this.transaction.deleteSet, e.id);
  }
  get keys() {
    if (this._keys === null) {
      if (this.transaction.doc._transactionCleanups.length === 0) throw Oe(ta);
      const e = new Map(),
        n = this.target;
      (this.transaction.changed.get(n).forEach((s) => {
        if (s !== null) {
          const r = n._map.get(s);
          let i, o;
          if (this.adds(r)) {
            let a = r.left;
            for (; a !== null && this.adds(a); ) a = a.left;
            if (this.deletes(r))
              if (a !== null && this.deletes(a))
                ((i = "delete"), (o = _r(a.content.getContent())));
              else return;
            else
              a !== null && this.deletes(a)
                ? ((i = "update"), (o = _r(a.content.getContent())))
                : ((i = "add"), (o = void 0));
          } else if (this.deletes(r))
            ((i = "delete"), (o = _r(r.content.getContent())));
          else return;
          e.set(s, { action: i, oldValue: o });
        }
      }),
        (this._keys = e));
    }
    return this._keys;
  }
  get delta() {
    return this.changes.delta;
  }
  adds(e) {
    return e.id.clock >= (this.transaction.beforeState.get(e.id.client) || 0);
  }
  get changes() {
    let e = this._changes;
    if (e === null) {
      if (this.transaction.doc._transactionCleanups.length === 0) throw Oe(ta);
      const n = this.target,
        s = rt(),
        r = rt(),
        i = [];
      if (
        ((e = { added: s, deleted: r, delta: i, keys: this.keys }),
        this.transaction.changed.get(n).has(null))
      ) {
        let o = null;
        const a = () => {
          o && i.push(o);
        };
        for (let c = n._start; c !== null; c = c.right)
          c.deleted
            ? this.deletes(c) &&
              !this.adds(c) &&
              ((o === null || o.delete === void 0) &&
                (a(), (o = { delete: 0 })),
              (o.delete += c.length),
              r.add(c))
            : this.adds(c)
              ? ((o === null || o.insert === void 0) &&
                  (a(), (o = { insert: [] })),
                (o.insert = o.insert.concat(c.content.getContent())),
                s.add(c))
              : ((o === null || o.retain === void 0) &&
                  (a(), (o = { retain: 0 })),
                (o.retain += c.length));
        o !== null && o.retain === void 0 && a();
      }
      this._changes = e;
    }
    return e;
  }
}
const lp = (t, e) => {
    const n = [];
    for (; e._item !== null && e !== t; ) {
      if (e._item.parentSub !== null) n.unshift(e._item.parentSub);
      else {
        let s = 0,
          r = e._item.parent._start;
        for (; r !== e._item && r !== null; )
          (!r.deleted && r.countable && (s += r.length), (r = r.right));
        n.unshift(s);
      }
      e = e._item.parent;
    }
    return n;
  },
  gl = 80;
let Ji = 0;
class up {
  constructor(e, n) {
    ((e.marker = !0), (this.p = e), (this.index = n), (this.timestamp = Ji++));
  }
}
const hp = (t) => {
    t.timestamp = Ji++;
  },
  yl = (t, e, n) => {
    ((t.p.marker = !1),
      (t.p = e),
      (e.marker = !0),
      (t.index = n),
      (t.timestamp = Ji++));
  },
  dp = (t, e, n) => {
    if (t.length >= gl) {
      const s = t.reduce((r, i) => (r.timestamp < i.timestamp ? r : i));
      return (yl(s, e, n), s);
    } else {
      const s = new up(e, n);
      return (t.push(s), s);
    }
  },
  lr = (t, e) => {
    if (t._start === null || e === 0 || t._searchMarker === null) return null;
    const n =
      t._searchMarker.length === 0
        ? null
        : t._searchMarker.reduce((i, o) =>
            bs(e - i.index) < bs(e - o.index) ? i : o,
          );
    let s = t._start,
      r = 0;
    for (
      n !== null && ((s = n.p), (r = n.index), hp(n));
      s.right !== null && r < e;

    ) {
      if (!s.deleted && s.countable) {
        if (e < r + s.length) break;
        r += s.length;
      }
      s = s.right;
    }
    for (; s.left !== null && r > e; )
      ((s = s.left), !s.deleted && s.countable && (r -= s.length));
    for (
      ;
      s.left !== null &&
      s.left.id.client === s.id.client &&
      s.left.id.clock + s.left.length === s.id.clock;

    )
      ((s = s.left), !s.deleted && s.countable && (r -= s.length));
    return n !== null && bs(n.index - r) < s.parent.length / gl
      ? (yl(n, s, r), n)
      : dp(t._searchMarker, s, r);
  },
  En = (t, e, n) => {
    for (let s = t.length - 1; s >= 0; s--) {
      const r = t[s];
      if (n > 0) {
        let i = r.p;
        for (i.marker = !1; i && (i.deleted || !i.countable); )
          ((i = i.left),
            i && !i.deleted && i.countable && (r.index -= i.length));
        if (i === null || i.marker === !0) {
          t.splice(s, 1);
          continue;
        }
        ((r.p = i), (i.marker = !0));
      }
      (e < r.index || (n > 0 && e === r.index)) &&
        (r.index = $t(e, r.index + n));
    }
  },
  ur = (t, e, n) => {
    const s = t,
      r = e.changedParentTypes;
    for (; He(r, t, () => []).push(n), t._item !== null; ) t = t._item.parent;
    ll(s._eH, n, e);
  };
class L {
  constructor() {
    ((this._item = null),
      (this._map = new Map()),
      (this._start = null),
      (this.doc = null),
      (this._length = 0),
      (this._eH = Go()),
      (this._dEH = Go()),
      (this._searchMarker = null));
  }
  get parent() {
    return this._item ? this._item.parent : null;
  }
  _integrate(e, n) {
    ((this.doc = e), (this._item = n));
  }
  _copy() {
    throw Se();
  }
  clone() {
    throw Se();
  }
  _write(e) {}
  get _first() {
    let e = this._start;
    for (; e !== null && e.deleted; ) e = e.right;
    return e;
  }
  _callObserver(e, n) {
    !e.local && this._searchMarker && (this._searchMarker.length = 0);
  }
  observe(e) {
    Jo(this._eH, e);
  }
  observeDeep(e) {
    Jo(this._dEH, e);
  }
  unobserve(e) {
    Xo(this._eH, e);
  }
  unobserveDeep(e) {
    Xo(this._dEH, e);
  }
  toJSON() {}
}
const ml = (t, e, n) => {
    (e < 0 && (e = t._length + e), n < 0 && (n = t._length + n));
    let s = n - e;
    const r = [];
    let i = t._start;
    for (; i !== null && s > 0; ) {
      if (i.countable && !i.deleted) {
        const o = i.content.getContent();
        if (o.length <= e) e -= o.length;
        else {
          for (let a = e; a < o.length && s > 0; a++) (r.push(o[a]), s--);
          e = 0;
        }
      }
      i = i.right;
    }
    return r;
  },
  wl = (t) => {
    const e = [];
    let n = t._start;
    for (; n !== null; ) {
      if (n.countable && !n.deleted) {
        const s = n.content.getContent();
        for (let r = 0; r < s.length; r++) e.push(s[r]);
      }
      n = n.right;
    }
    return e;
  },
  kn = (t, e) => {
    let n = 0,
      s = t._start;
    for (; s !== null; ) {
      if (s.countable && !s.deleted) {
        const r = s.content.getContent();
        for (let i = 0; i < r.length; i++) e(r[i], n++, t);
      }
      s = s.right;
    }
  },
  bl = (t, e) => {
    const n = [];
    return (
      kn(t, (s, r) => {
        n.push(e(s, r, t));
      }),
      n
    );
  },
  fp = (t) => {
    let e = t._start,
      n = null,
      s = 0;
    return {
      [Symbol.iterator]() {
        return this;
      },
      next: () => {
        if (n === null) {
          for (; e !== null && e.deleted; ) e = e.right;
          if (e === null) return { done: !0, value: void 0 };
          ((n = e.content.getContent()), (s = 0), (e = e.right));
        }
        const r = n[s++];
        return (n.length <= s && (n = null), { done: !1, value: r });
      },
    };
  },
  vl = (t, e) => {
    const n = lr(t, e);
    let s = t._start;
    for (n !== null && ((s = n.p), (e -= n.index)); s !== null; s = s.right)
      if (!s.deleted && s.countable) {
        if (e < s.length) return s.content.getContent()[e];
        e -= s.length;
      }
  },
  Ts = (t, e, n, s) => {
    let r = n;
    const i = t.doc,
      o = i.clientID,
      a = i.store,
      c = n === null ? e._start : n.right;
    let l = [];
    const u = () => {
      l.length > 0 &&
        ((r = new N(
          k(o, F(a, o)),
          r,
          r && r.lastId,
          c,
          c && c.id,
          e,
          null,
          new St(l),
        )),
        r.integrate(t, 0),
        (l = []));
    };
    (s.forEach((h) => {
      if (h === null) l.push(h);
      else
        switch (h.constructor) {
          case Number:
          case Object:
          case Boolean:
          case Array:
          case String:
            l.push(h);
            break;
          default:
            switch ((u(), h.constructor)) {
              case Uint8Array:
              case ArrayBuffer:
                ((r = new N(
                  k(o, F(a, o)),
                  r,
                  r && r.lastId,
                  c,
                  c && c.id,
                  e,
                  null,
                  new zn(new Uint8Array(h)),
                )),
                  r.integrate(t, 0));
                break;
              case Ae:
                ((r = new N(
                  k(o, F(a, o)),
                  r,
                  r && r.lastId,
                  c,
                  c && c.id,
                  e,
                  null,
                  new Wn(h),
                )),
                  r.integrate(t, 0));
                break;
              default:
                if (h instanceof L)
                  ((r = new N(
                    k(o, F(a, o)),
                    r,
                    r && r.lastId,
                    c,
                    c && c.id,
                    e,
                    null,
                    new Ye(h),
                  )),
                    r.integrate(t, 0));
                else
                  throw new Error(
                    "Unexpected content type in insert operation",
                  );
            }
        }
    }),
      u());
  },
  Cl = () => Oe("Length exceeded!"),
  Sl = (t, e, n, s) => {
    if (n > e._length) throw Cl();
    if (n === 0)
      return (
        e._searchMarker && En(e._searchMarker, n, s.length),
        Ts(t, e, null, s)
      );
    const r = n,
      i = lr(e, n);
    let o = e._start;
    for (
      i !== null &&
      ((o = i.p),
      (n -= i.index),
      n === 0 &&
        ((o = o.prev), (n += o && o.countable && !o.deleted ? o.length : 0)));
      o !== null;
      o = o.right
    )
      if (!o.deleted && o.countable) {
        if (n <= o.length) {
          n < o.length && it(t, k(o.id.client, o.id.clock + n));
          break;
        }
        n -= o.length;
      }
    return (
      e._searchMarker && En(e._searchMarker, r, s.length),
      Ts(t, e, o, s)
    );
  },
  pp = (t, e, n) => {
    let s = (e._searchMarker || []).reduce(
      (r, i) => (i.index > r.index ? i : r),
      { index: 0, p: e._start },
    ).p;
    if (s) for (; s.right; ) s = s.right;
    return Ts(t, e, s, n);
  },
  _l = (t, e, n, s) => {
    if (s === 0) return;
    const r = n,
      i = s,
      o = lr(e, n);
    let a = e._start;
    for (
      o !== null && ((a = o.p), (n -= o.index));
      a !== null && n > 0;
      a = a.right
    )
      !a.deleted &&
        a.countable &&
        (n < a.length && it(t, k(a.id.client, a.id.clock + n)),
        (n -= a.length));
    for (; s > 0 && a !== null; )
      (a.deleted ||
        (s < a.length && it(t, k(a.id.client, a.id.clock + s)),
        a.delete(t),
        (s -= a.length)),
        (a = a.right));
    if (s > 0) throw Cl();
    e._searchMarker && En(e._searchMarker, r, -i + s);
  },
  Ps = (t, e, n) => {
    const s = e._map.get(n);
    s !== void 0 && s.delete(t);
  },
  Xi = (t, e, n, s) => {
    const r = e._map.get(n) || null,
      i = t.doc,
      o = i.clientID;
    let a;
    if (s == null) a = new St([s]);
    else
      switch (s.constructor) {
        case Number:
        case Object:
        case Boolean:
        case Array:
        case String:
          a = new St([s]);
          break;
        case Uint8Array:
          a = new zn(s);
          break;
        case Ae:
          a = new Wn(s);
          break;
        default:
          if (s instanceof L) a = new Ye(s);
          else throw new Error("Unexpected content type");
      }
    new N(k(o, F(i.store, o)), r, r && r.lastId, null, null, e, n, a).integrate(
      t,
      0,
    );
  },
  Zi = (t, e) => {
    const n = t._map.get(e);
    return n !== void 0 && !n.deleted
      ? n.content.getContent()[n.length - 1]
      : void 0;
  },
  El = (t) => {
    const e = {};
    return (
      t._map.forEach((n, s) => {
        n.deleted || (e[s] = n.content.getContent()[n.length - 1]);
      }),
      e
    );
  },
  kl = (t, e) => {
    const n = t._map.get(e);
    return n !== void 0 && !n.deleted;
  },
  gp = (t, e) => {
    const n = {};
    return (
      t._map.forEach((s, r) => {
        let i = s;
        for (
          ;
          i !== null &&
          (!e.sv.has(i.id.client) ||
            i.id.clock >= (e.sv.get(i.id.client) || 0));

        )
          i = i.left;
        i !== null && Tt(i, e) && (n[r] = i.content.getContent()[i.length - 1]);
      }),
      n
    );
  },
  ts = (t) => Lf(t.entries(), (e) => !e[1].deleted);
class yp extends cr {}
class Le extends L {
  constructor() {
    (super(), (this._prelimContent = []), (this._searchMarker = []));
  }
  static from(e) {
    const n = new Le();
    return (n.push(e), n);
  }
  _integrate(e, n) {
    (super._integrate(e, n),
      this.insert(0, this._prelimContent),
      (this._prelimContent = null));
  }
  _copy() {
    return new Le();
  }
  clone() {
    const e = new Le();
    return (
      e.insert(
        0,
        this.toArray().map((n) => (n instanceof L ? n.clone() : n)),
      ),
      e
    );
  }
  get length() {
    return this._prelimContent === null
      ? this._length
      : this._prelimContent.length;
  }
  _callObserver(e, n) {
    (super._callObserver(e, n), ur(this, e, new yp(this, e)));
  }
  insert(e, n) {
    this.doc !== null
      ? x(this.doc, (s) => {
          Sl(s, this, e, n);
        })
      : this._prelimContent.splice(e, 0, ...n);
  }
  push(e) {
    this.doc !== null
      ? x(this.doc, (n) => {
          pp(n, this, e);
        })
      : this._prelimContent.push(...e);
  }
  unshift(e) {
    this.insert(0, e);
  }
  delete(e, n = 1) {
    this.doc !== null
      ? x(this.doc, (s) => {
          _l(s, this, e, n);
        })
      : this._prelimContent.splice(e, n);
  }
  get(e) {
    return vl(this, e);
  }
  toArray() {
    return wl(this);
  }
  slice(e = 0, n = this.length) {
    return ml(this, e, n);
  }
  toJSON() {
    return this.map((e) => (e instanceof L ? e.toJSON() : e));
  }
  map(e) {
    return bl(this, e);
  }
  forEach(e) {
    kn(this, e);
  }
  [Symbol.iterator]() {
    return fp(this);
  }
  _write(e) {
    e.writeTypeRef(Hp);
  }
}
const mp = (t) => new Le();
class wp extends cr {
  constructor(e, n, s) {
    (super(e, n), (this.keysChanged = s));
  }
}
class Ne extends L {
  constructor(e) {
    (super(),
      (this._prelimContent = null),
      e === void 0
        ? (this._prelimContent = new Map())
        : (this._prelimContent = new Map(e)));
  }
  _integrate(e, n) {
    (super._integrate(e, n),
      this._prelimContent.forEach((s, r) => {
        this.set(r, s);
      }),
      (this._prelimContent = null));
  }
  _copy() {
    return new Ne();
  }
  clone() {
    const e = new Ne();
    return (
      this.forEach((n, s) => {
        e.set(s, n instanceof L ? n.clone() : n);
      }),
      e
    );
  }
  _callObserver(e, n) {
    ur(this, e, new wp(this, e, n));
  }
  toJSON() {
    const e = {};
    return (
      this._map.forEach((n, s) => {
        if (!n.deleted) {
          const r = n.content.getContent()[n.length - 1];
          e[s] = r instanceof L ? r.toJSON() : r;
        }
      }),
      e
    );
  }
  get size() {
    return [...ts(this._map)].length;
  }
  keys() {
    return Ir(ts(this._map), (e) => e[0]);
  }
  values() {
    return Ir(ts(this._map), (e) => e[1].content.getContent()[e[1].length - 1]);
  }
  entries() {
    return Ir(ts(this._map), (e) => [
      e[0],
      e[1].content.getContent()[e[1].length - 1],
    ]);
  }
  forEach(e) {
    this._map.forEach((n, s) => {
      n.deleted || e(n.content.getContent()[n.length - 1], s, this);
    });
  }
  [Symbol.iterator]() {
    return this.entries();
  }
  delete(e) {
    this.doc !== null
      ? x(this.doc, (n) => {
          Ps(n, this, e);
        })
      : this._prelimContent.delete(e);
  }
  set(e, n) {
    return (
      this.doc !== null
        ? x(this.doc, (s) => {
            Xi(s, this, e, n);
          })
        : this._prelimContent.set(e, n),
      n
    );
  }
  get(e) {
    return Zi(this, e);
  }
  has(e) {
    return kl(this, e);
  }
  clear() {
    this.doc !== null
      ? x(this.doc, (e) => {
          this.forEach(function (n, s, r) {
            Ps(e, r, s);
          });
        })
      : this._prelimContent.clear();
  }
  _write(e) {
    e.writeTypeRef(Fp);
  }
}
const bp = (t) => new Ne(),
  Qe = (t, e) =>
    t === e ||
    (typeof t == "object" && typeof e == "object" && t && e && gd(t, e));
class oi {
  constructor(e, n, s, r) {
    ((this.left = e),
      (this.right = n),
      (this.index = s),
      (this.currentAttributes = r));
  }
  forward() {
    (this.right === null && pe(),
      this.right.content.constructor === j
        ? this.right.deleted || en(this.currentAttributes, this.right.content)
        : this.right.deleted || (this.index += this.right.length),
      (this.left = this.right),
      (this.right = this.right.right));
  }
}
const na = (t, e, n) => {
    for (; e.right !== null && n > 0; )
      (e.right.content.constructor === j
        ? e.right.deleted || en(e.currentAttributes, e.right.content)
        : e.right.deleted ||
          (n < e.right.length &&
            it(t, k(e.right.id.client, e.right.id.clock + n)),
          (e.index += e.right.length),
          (n -= e.right.length)),
        (e.left = e.right),
        (e.right = e.right.right));
    return e;
  },
  ns = (t, e, n, s) => {
    const r = new Map(),
      i = s ? lr(e, n) : null;
    if (i) {
      const o = new oi(i.p.left, i.p, i.index, r);
      return na(t, o, n - i.index);
    } else {
      const o = new oi(null, e._start, 0, r);
      return na(t, o, n);
    }
  },
  Al = (t, e, n, s) => {
    for (
      ;
      n.right !== null &&
      (n.right.deleted === !0 ||
        (n.right.content.constructor === j &&
          Qe(s.get(n.right.content.key), n.right.content.value)));

    )
      (n.right.deleted || s.delete(n.right.content.key), n.forward());
    const r = t.doc,
      i = r.clientID;
    s.forEach((o, a) => {
      const c = n.left,
        l = n.right,
        u = new N(
          k(i, F(r.store, i)),
          c,
          c && c.lastId,
          l,
          l && l.id,
          e,
          null,
          new j(a, o),
        );
      (u.integrate(t, 0), (n.right = u), n.forward());
    });
  },
  en = (t, e) => {
    const { key: n, value: s } = e;
    s === null ? t.delete(n) : t.set(n, s);
  },
  xl = (t, e) => {
    for (
      ;
      t.right !== null &&
      (t.right.deleted ||
        (t.right.content.constructor === j &&
          Qe(e[t.right.content.key] ?? null, t.right.content.value)));

    )
      t.forward();
  },
  Il = (t, e, n, s) => {
    const r = t.doc,
      i = r.clientID,
      o = new Map();
    for (const a in s) {
      const c = s[a],
        l = n.currentAttributes.get(a) ?? null;
      if (!Qe(l, c)) {
        o.set(a, l);
        const { left: u, right: h } = n;
        ((n.right = new N(
          k(i, F(r.store, i)),
          u,
          u && u.lastId,
          h,
          h && h.id,
          e,
          null,
          new j(a, c),
        )),
          n.right.integrate(t, 0),
          n.forward());
      }
    }
    return o;
  },
  Dr = (t, e, n, s, r) => {
    n.currentAttributes.forEach((d, f) => {
      r[f] === void 0 && (r[f] = null);
    });
    const i = t.doc,
      o = i.clientID;
    xl(n, r);
    const a = Il(t, e, n, r),
      c =
        s.constructor === String
          ? new je(s)
          : s instanceof L
            ? new Ye(s)
            : new Dt(s);
    let { left: l, right: u, index: h } = n;
    (e._searchMarker && En(e._searchMarker, n.index, c.getLength()),
      (u = new N(
        k(o, F(i.store, o)),
        l,
        l && l.lastId,
        u,
        u && u.id,
        e,
        null,
        c,
      )),
      u.integrate(t, 0),
      (n.right = u),
      (n.index = h),
      n.forward(),
      Al(t, e, n, a));
  },
  sa = (t, e, n, s, r) => {
    const i = t.doc,
      o = i.clientID;
    xl(n, r);
    const a = Il(t, e, n, r);
    e: for (
      ;
      n.right !== null &&
      (s > 0 ||
        (a.size > 0 && (n.right.deleted || n.right.content.constructor === j)));

    ) {
      if (!n.right.deleted)
        switch (n.right.content.constructor) {
          case j: {
            const { key: c, value: l } = n.right.content,
              u = r[c];
            if (u !== void 0) {
              if (Qe(u, l)) a.delete(c);
              else {
                if (s === 0) break e;
                a.set(c, l);
              }
              n.right.delete(t);
            } else n.currentAttributes.set(c, l);
            break;
          }
          default:
            (s < n.right.length &&
              it(t, k(n.right.id.client, n.right.id.clock + s)),
              (s -= n.right.length));
            break;
        }
      n.forward();
    }
    if (s > 0) {
      let c = "";
      for (; s > 0; s--)
        c += `
`;
      ((n.right = new N(
        k(o, F(i.store, o)),
        n.left,
        n.left && n.left.lastId,
        n.right,
        n.right && n.right.id,
        e,
        null,
        new je(c),
      )),
        n.right.integrate(t, 0),
        n.forward());
    }
    Al(t, e, n, a);
  },
  $l = (t, e, n, s, r) => {
    let i = e;
    const o = re();
    for (; i && (!i.countable || i.deleted); ) {
      if (!i.deleted && i.content.constructor === j) {
        const l = i.content;
        o.set(l.key, l);
      }
      i = i.right;
    }
    let a = 0,
      c = !1;
    for (; e !== i; ) {
      if ((n === e && (c = !0), !e.deleted)) {
        const l = e.content;
        if (l.constructor === j) {
          const { key: u, value: h } = l,
            d = s.get(u) ?? null;
          ((o.get(u) !== l || d === h) &&
            (e.delete(t),
            a++,
            !c &&
              (r.get(u) ?? null) === h &&
              d !== h &&
              (d === null ? r.delete(u) : r.set(u, d))),
            !c && !e.deleted && en(r, l));
        }
      }
      e = e.right;
    }
    return a;
  },
  vp = (t, e) => {
    for (; e && e.right && (e.right.deleted || !e.right.countable); )
      e = e.right;
    const n = new Set();
    for (; e && (e.deleted || !e.countable); ) {
      if (!e.deleted && e.content.constructor === j) {
        const s = e.content.key;
        n.has(s) ? e.delete(t) : n.add(s);
      }
      e = e.left;
    }
  },
  Cp = (t) => {
    let e = 0;
    return (
      x(t.doc, (n) => {
        let s = t._start,
          r = t._start,
          i = re();
        const o = ei(i);
        for (; r; )
          (r.deleted === !1 &&
            (r.content.constructor === j
              ? en(o, r.content)
              : ((e += $l(n, s, r, i, o)), (i = ei(o)), (s = r))),
            (r = r.right));
      }),
      e
    );
  },
  Sp = (t) => {
    const e = new Set(),
      n = t.doc;
    for (const [s, r] of t.afterState.entries()) {
      const i = t.beforeState.get(s) || 0;
      r !== i &&
        dl(t, n.store.clients.get(s), i, r, (o) => {
          !o.deleted &&
            o.content.constructor === j &&
            o.constructor !== ce &&
            e.add(o.parent);
        });
    }
    x(n, (s) => {
      Qc(t, t.deleteSet, (r) => {
        if (r instanceof ce || !r.parent._hasFormatting || e.has(r.parent))
          return;
        const i = r.parent;
        r.content.constructor === j ? e.add(i) : vp(s, r);
      });
      for (const r of e) Cp(r);
    });
  },
  ra = (t, e, n) => {
    const s = n,
      r = ei(e.currentAttributes),
      i = e.right;
    for (; n > 0 && e.right !== null; ) {
      if (e.right.deleted === !1)
        switch (e.right.content.constructor) {
          case Ye:
          case Dt:
          case je:
            (n < e.right.length &&
              it(t, k(e.right.id.client, e.right.id.clock + n)),
              (n -= e.right.length),
              e.right.delete(t));
            break;
        }
      e.forward();
    }
    i && $l(t, i, e.right, r, e.currentAttributes);
    const o = (e.left || e.right).parent;
    return (o._searchMarker && En(o._searchMarker, e.index, -s + n), e);
  };
class _p extends cr {
  constructor(e, n, s) {
    (super(e, n),
      (this.childListChanged = !1),
      (this.keysChanged = new Set()),
      s.forEach((r) => {
        r === null ? (this.childListChanged = !0) : this.keysChanged.add(r);
      }));
  }
  get changes() {
    if (this._changes === null) {
      const e = {
        keys: this.keys,
        delta: this.delta,
        added: new Set(),
        deleted: new Set(),
      };
      this._changes = e;
    }
    return this._changes;
  }
  get delta() {
    if (this._delta === null) {
      const e = this.target.doc,
        n = [];
      (x(e, (s) => {
        const r = new Map(),
          i = new Map();
        let o = this.target._start,
          a = null;
        const c = {};
        let l = "",
          u = 0,
          h = 0;
        const d = () => {
          if (a !== null) {
            let f = null;
            switch (a) {
              case "delete":
                (h > 0 && (f = { delete: h }), (h = 0));
                break;
              case "insert":
                ((typeof l == "object" || l.length > 0) &&
                  ((f = { insert: l }),
                  r.size > 0 &&
                    ((f.attributes = {}),
                    r.forEach((p, g) => {
                      p !== null && (f.attributes[g] = p);
                    }))),
                  (l = ""));
                break;
              case "retain":
                (u > 0 &&
                  ((f = { retain: u }), pd(c) || (f.attributes = ud({}, c))),
                  (u = 0));
                break;
            }
            (f && n.push(f), (a = null));
          }
        };
        for (; o !== null; ) {
          switch (o.content.constructor) {
            case Ye:
            case Dt:
              this.adds(o)
                ? this.deletes(o) ||
                  (d(), (a = "insert"), (l = o.content.getContent()[0]), d())
                : this.deletes(o)
                  ? (a !== "delete" && (d(), (a = "delete")), (h += 1))
                  : o.deleted ||
                    (a !== "retain" && (d(), (a = "retain")), (u += 1));
              break;
            case je:
              this.adds(o)
                ? this.deletes(o) ||
                  (a !== "insert" && (d(), (a = "insert")),
                  (l += o.content.str))
                : this.deletes(o)
                  ? (a !== "delete" && (d(), (a = "delete")), (h += o.length))
                  : o.deleted ||
                    (a !== "retain" && (d(), (a = "retain")), (u += o.length));
              break;
            case j: {
              const { key: f, value: p } = o.content;
              if (this.adds(o)) {
                if (!this.deletes(o)) {
                  const g = r.get(f) ?? null;
                  Qe(g, p)
                    ? p !== null && o.delete(s)
                    : (a === "retain" && d(),
                      Qe(p, i.get(f) ?? null) ? delete c[f] : (c[f] = p));
                }
              } else if (this.deletes(o)) {
                i.set(f, p);
                const g = r.get(f) ?? null;
                Qe(g, p) || (a === "retain" && d(), (c[f] = g));
              } else if (!o.deleted) {
                i.set(f, p);
                const g = c[f];
                g !== void 0 &&
                  (Qe(g, p)
                    ? g !== null && o.delete(s)
                    : (a === "retain" && d(),
                      p === null ? delete c[f] : (c[f] = p)));
              }
              o.deleted || (a === "insert" && d(), en(r, o.content));
              break;
            }
          }
          o = o.right;
        }
        for (d(); n.length > 0; ) {
          const f = n[n.length - 1];
          if (f.retain !== void 0 && f.attributes === void 0) n.pop();
          else break;
        }
      }),
        (this._delta = n));
    }
    return this._delta;
  }
}
class Be extends L {
  constructor(e) {
    (super(),
      (this._pending = e !== void 0 ? [() => this.insert(0, e)] : []),
      (this._searchMarker = []),
      (this._hasFormatting = !1));
  }
  get length() {
    return this._length;
  }
  _integrate(e, n) {
    super._integrate(e, n);
    try {
      this._pending.forEach((s) => s());
    } catch (s) {
      console.error(s);
    }
    this._pending = null;
  }
  _copy() {
    return new Be();
  }
  clone() {
    const e = new Be();
    return (e.applyDelta(this.toDelta()), e);
  }
  _callObserver(e, n) {
    super._callObserver(e, n);
    const s = new _p(this, e, n);
    (ur(this, e, s),
      !e.local && this._hasFormatting && (e._needFormattingCleanup = !0));
  }
  toString() {
    let e = "",
      n = this._start;
    for (; n !== null; )
      (!n.deleted &&
        n.countable &&
        n.content.constructor === je &&
        (e += n.content.str),
        (n = n.right));
    return e;
  }
  toJSON() {
    return this.toString();
  }
  applyDelta(e, { sanitize: n = !0 } = {}) {
    this.doc !== null
      ? x(this.doc, (s) => {
          const r = new oi(null, this._start, 0, new Map());
          for (let i = 0; i < e.length; i++) {
            const o = e[i];
            if (o.insert !== void 0) {
              const a =
                !n &&
                typeof o.insert == "string" &&
                i === e.length - 1 &&
                r.right === null &&
                o.insert.slice(-1) ===
                  `
`
                  ? o.insert.slice(0, -1)
                  : o.insert;
              (typeof a != "string" || a.length > 0) &&
                Dr(s, this, r, a, o.attributes || {});
            } else
              o.retain !== void 0
                ? sa(s, this, r, o.retain, o.attributes || {})
                : o.delete !== void 0 && ra(s, r, o.delete);
          }
        })
      : this._pending.push(() => this.applyDelta(e));
  }
  toDelta(e, n, s) {
    const r = [],
      i = new Map(),
      o = this.doc;
    let a = "",
      c = this._start;
    function l() {
      if (a.length > 0) {
        const h = {};
        let d = !1;
        i.forEach((p, g) => {
          ((d = !0), (h[g] = p));
        });
        const f = { insert: a };
        (d && (f.attributes = h), r.push(f), (a = ""));
      }
    }
    const u = () => {
      for (; c !== null; ) {
        if (Tt(c, e) || (n !== void 0 && Tt(c, n)))
          switch (c.content.constructor) {
            case je: {
              const h = i.get("ychange");
              (e !== void 0 && !Tt(c, e)
                ? (h === void 0 ||
                    h.user !== c.id.client ||
                    h.type !== "removed") &&
                  (l(),
                  i.set(
                    "ychange",
                    s ? s("removed", c.id) : { type: "removed" },
                  ))
                : n !== void 0 && !Tt(c, n)
                  ? (h === void 0 ||
                      h.user !== c.id.client ||
                      h.type !== "added") &&
                    (l(),
                    i.set("ychange", s ? s("added", c.id) : { type: "added" }))
                  : h !== void 0 && (l(), i.delete("ychange")),
                (a += c.content.str));
              break;
            }
            case Ye:
            case Dt: {
              l();
              const h = { insert: c.content.getContent()[0] };
              if (i.size > 0) {
                const d = {};
                ((h.attributes = d),
                  i.forEach((f, p) => {
                    d[p] = f;
                  }));
              }
              r.push(h);
              break;
            }
            case j:
              Tt(c, e) && (l(), en(i, c.content));
              break;
          }
        c = c.right;
      }
      l();
    };
    return (
      e || n
        ? x(
            o,
            (h) => {
              (e && ri(h, e), n && ri(h, n), u());
            },
            "cleanup",
          )
        : u(),
      r
    );
  }
  insert(e, n, s) {
    if (n.length <= 0) return;
    const r = this.doc;
    r !== null
      ? x(r, (i) => {
          const o = ns(i, this, e, !s);
          (s ||
            ((s = {}),
            o.currentAttributes.forEach((a, c) => {
              s[c] = a;
            })),
            Dr(i, this, o, n, s));
        })
      : this._pending.push(() => this.insert(e, n, s));
  }
  insertEmbed(e, n, s) {
    const r = this.doc;
    r !== null
      ? x(r, (i) => {
          const o = ns(i, this, e, !s);
          Dr(i, this, o, n, s || {});
        })
      : this._pending.push(() => this.insertEmbed(e, n, s || {}));
  }
  delete(e, n) {
    if (n === 0) return;
    const s = this.doc;
    s !== null
      ? x(s, (r) => {
          ra(r, ns(r, this, e, !0), n);
        })
      : this._pending.push(() => this.delete(e, n));
  }
  format(e, n, s) {
    if (n === 0) return;
    const r = this.doc;
    r !== null
      ? x(r, (i) => {
          const o = ns(i, this, e, !1);
          o.right !== null && sa(i, this, o, n, s);
        })
      : this._pending.push(() => this.format(e, n, s));
  }
  removeAttribute(e) {
    this.doc !== null
      ? x(this.doc, (n) => {
          Ps(n, this, e);
        })
      : this._pending.push(() => this.removeAttribute(e));
  }
  setAttribute(e, n) {
    this.doc !== null
      ? x(this.doc, (s) => {
          Xi(s, this, e, n);
        })
      : this._pending.push(() => this.setAttribute(e, n));
  }
  getAttribute(e) {
    return Zi(this, e);
  }
  getAttributes() {
    return El(this);
  }
  _write(e) {
    e.writeTypeRef(zp);
  }
}
const Ep = (t) => new Be();
class Lr {
  constructor(e, n = () => !0) {
    ((this._filter = n),
      (this._root = e),
      (this._currentNode = e._start),
      (this._firstCall = !0));
  }
  [Symbol.iterator]() {
    return this;
  }
  next() {
    let e = this._currentNode,
      n = e && e.content && e.content.type;
    if (e !== null && (!this._firstCall || e.deleted || !this._filter(n)))
      do
        if (
          ((n = e.content.type),
          !e.deleted &&
            (n.constructor === qe || n.constructor === Re) &&
            n._start !== null)
        )
          e = n._start;
        else
          for (; e !== null; )
            if (e.right !== null) {
              e = e.right;
              break;
            } else e.parent === this._root ? (e = null) : (e = e.parent._item);
      while (e !== null && (e.deleted || !this._filter(e.content.type)));
    return (
      (this._firstCall = !1),
      e === null
        ? { value: void 0, done: !0 }
        : ((this._currentNode = e), { value: e.content.type, done: !1 })
    );
  }
}
class Re extends L {
  constructor() {
    (super(), (this._prelimContent = []));
  }
  get firstChild() {
    const e = this._first;
    return e ? e.content.getContent()[0] : null;
  }
  _integrate(e, n) {
    (super._integrate(e, n),
      this.insert(0, this._prelimContent),
      (this._prelimContent = null));
  }
  _copy() {
    return new Re();
  }
  clone() {
    const e = new Re();
    return (
      e.insert(
        0,
        this.toArray().map((n) => (n instanceof L ? n.clone() : n)),
      ),
      e
    );
  }
  get length() {
    return this._prelimContent === null
      ? this._length
      : this._prelimContent.length;
  }
  createTreeWalker(e) {
    return new Lr(this, e);
  }
  querySelector(e) {
    e = e.toUpperCase();
    const n = new Lr(
      this,
      (s) => s.nodeName && s.nodeName.toUpperCase() === e,
    ).next();
    return n.done ? null : n.value;
  }
  querySelectorAll(e) {
    return (
      (e = e.toUpperCase()),
      Ke(new Lr(this, (n) => n.nodeName && n.nodeName.toUpperCase() === e))
    );
  }
  _callObserver(e, n) {
    ur(this, e, new xp(this, n, e));
  }
  toString() {
    return bl(this, (e) => e.toString()).join("");
  }
  toJSON() {
    return this.toString();
  }
  toDOM(e = document, n = {}, s) {
    const r = e.createDocumentFragment();
    return (
      s !== void 0 && s._createAssociation(r, this),
      kn(this, (i) => {
        r.insertBefore(i.toDOM(e, n, s), null);
      }),
      r
    );
  }
  insert(e, n) {
    this.doc !== null
      ? x(this.doc, (s) => {
          Sl(s, this, e, n);
        })
      : this._prelimContent.splice(e, 0, ...n);
  }
  insertAfter(e, n) {
    if (this.doc !== null)
      x(this.doc, (s) => {
        const r = e && e instanceof L ? e._item : e;
        Ts(s, this, r, n);
      });
    else {
      const s = this._prelimContent,
        r = e === null ? 0 : s.findIndex((i) => i === e) + 1;
      if (r === 0 && e !== null) throw Oe("Reference item not found");
      s.splice(r, 0, ...n);
    }
  }
  delete(e, n = 1) {
    this.doc !== null
      ? x(this.doc, (s) => {
          _l(s, this, e, n);
        })
      : this._prelimContent.splice(e, n);
  }
  toArray() {
    return wl(this);
  }
  push(e) {
    this.insert(this.length, e);
  }
  unshift(e) {
    this.insert(0, e);
  }
  get(e) {
    return vl(this, e);
  }
  slice(e = 0, n = this.length) {
    return ml(this, e, n);
  }
  forEach(e) {
    kn(this, e);
  }
  _write(e) {
    e.writeTypeRef(Kp);
  }
}
const kp = (t) => new Re();
class qe extends Re {
  constructor(e = "UNDEFINED") {
    (super(), (this.nodeName = e), (this._prelimAttrs = new Map()));
  }
  get nextSibling() {
    const e = this._item ? this._item.next : null;
    return e ? e.content.type : null;
  }
  get prevSibling() {
    const e = this._item ? this._item.prev : null;
    return e ? e.content.type : null;
  }
  _integrate(e, n) {
    (super._integrate(e, n),
      this._prelimAttrs.forEach((s, r) => {
        this.setAttribute(r, s);
      }),
      (this._prelimAttrs = null));
  }
  _copy() {
    return new qe(this.nodeName);
  }
  clone() {
    const e = new qe(this.nodeName),
      n = this.getAttributes();
    return (
      dd(n, (s, r) => {
        typeof s == "string" && e.setAttribute(r, s);
      }),
      e.insert(
        0,
        this.toArray().map((s) => (s instanceof L ? s.clone() : s)),
      ),
      e
    );
  }
  toString() {
    const e = this.getAttributes(),
      n = [],
      s = [];
    for (const a in e) s.push(a);
    s.sort();
    const r = s.length;
    for (let a = 0; a < r; a++) {
      const c = s[a];
      n.push(c + '="' + e[c] + '"');
    }
    const i = this.nodeName.toLocaleLowerCase(),
      o = n.length > 0 ? " " + n.join(" ") : "";
    return `<${i}${o}>${super.toString()}</${i}>`;
  }
  removeAttribute(e) {
    this.doc !== null
      ? x(this.doc, (n) => {
          Ps(n, this, e);
        })
      : this._prelimAttrs.delete(e);
  }
  setAttribute(e, n) {
    this.doc !== null
      ? x(this.doc, (s) => {
          Xi(s, this, e, n);
        })
      : this._prelimAttrs.set(e, n);
  }
  getAttribute(e) {
    return Zi(this, e);
  }
  hasAttribute(e) {
    return kl(this, e);
  }
  getAttributes(e) {
    return e ? gp(this, e) : El(this);
  }
  toDOM(e = document, n = {}, s) {
    const r = e.createElement(this.nodeName),
      i = this.getAttributes();
    for (const o in i) {
      const a = i[o];
      typeof a == "string" && r.setAttribute(o, a);
    }
    return (
      kn(this, (o) => {
        r.appendChild(o.toDOM(e, n, s));
      }),
      s !== void 0 && s._createAssociation(r, this),
      r
    );
  }
  _write(e) {
    (e.writeTypeRef(Wp), e.writeKey(this.nodeName));
  }
}
const Ap = (t) => new qe(t.readKey());
class xp extends cr {
  constructor(e, n, s) {
    (super(e, s),
      (this.childListChanged = !1),
      (this.attributesChanged = new Set()),
      n.forEach((r) => {
        r === null
          ? (this.childListChanged = !0)
          : this.attributesChanged.add(r);
      }));
  }
}
class Vt extends Ne {
  constructor(e) {
    (super(), (this.hookName = e));
  }
  _copy() {
    return new Vt(this.hookName);
  }
  clone() {
    const e = new Vt(this.hookName);
    return (
      this.forEach((n, s) => {
        e.set(s, n);
      }),
      e
    );
  }
  toDOM(e = document, n = {}, s) {
    const r = n[this.hookName];
    let i;
    return (
      r !== void 0
        ? (i = r.createDom(this))
        : (i = document.createElement(this.hookName)),
      i.setAttribute("data-yjs-hook", this.hookName),
      s !== void 0 && s._createAssociation(i, this),
      i
    );
  }
  _write(e) {
    (e.writeTypeRef(Bp), e.writeKey(this.hookName));
  }
}
const Ip = (t) => new Vt(t.readKey());
class Ct extends Be {
  get nextSibling() {
    const e = this._item ? this._item.next : null;
    return e ? e.content.type : null;
  }
  get prevSibling() {
    const e = this._item ? this._item.prev : null;
    return e ? e.content.type : null;
  }
  _copy() {
    return new Ct();
  }
  clone() {
    const e = new Ct();
    return (e.applyDelta(this.toDelta()), e);
  }
  toDOM(e = document, n, s) {
    const r = e.createTextNode(this.toString());
    return (s !== void 0 && s._createAssociation(r, this), r);
  }
  toString() {
    return this.toDelta()
      .map((e) => {
        const n = [];
        for (const r in e.attributes) {
          const i = [];
          for (const o in e.attributes[r])
            i.push({ key: o, value: e.attributes[r][o] });
          (i.sort((o, a) => (o.key < a.key ? -1 : 1)),
            n.push({ nodeName: r, attrs: i }));
        }
        n.sort((r, i) => (r.nodeName < i.nodeName ? -1 : 1));
        let s = "";
        for (let r = 0; r < n.length; r++) {
          const i = n[r];
          s += `<${i.nodeName}`;
          for (let o = 0; o < i.attrs.length; o++) {
            const a = i.attrs[o];
            s += ` ${a.key}="${a.value}"`;
          }
          s += ">";
        }
        s += e.insert;
        for (let r = n.length - 1; r >= 0; r--) s += `</${n[r].nodeName}>`;
        return s;
      })
      .join("");
  }
  toJSON() {
    return this.toString();
  }
  _write(e) {
    e.writeTypeRef(qp);
  }
}
const $p = (t) => new Ct();
class Qi {
  constructor(e, n) {
    ((this.id = e), (this.length = n));
  }
  get deleted() {
    throw Se();
  }
  mergeWith(e) {
    return !1;
  }
  write(e, n, s) {
    throw Se();
  }
  integrate(e, n) {
    throw Se();
  }
}
const Dp = 0;
class ce extends Qi {
  get deleted() {
    return !0;
  }
  delete() {}
  mergeWith(e) {
    return this.constructor !== e.constructor
      ? !1
      : ((this.length += e.length), !0);
  }
  integrate(e, n) {
    (n > 0 && ((this.id.clock += n), (this.length -= n)),
      hl(e.doc.store, this));
  }
  write(e, n) {
    (e.writeInfo(Dp), e.writeLen(this.length - n));
  }
  getMissing(e, n) {
    return null;
  }
}
class zn {
  constructor(e) {
    this.content = e;
  }
  getLength() {
    return 1;
  }
  getContent() {
    return [this.content];
  }
  isCountable() {
    return !0;
  }
  copy() {
    return new zn(this.content);
  }
  splice(e) {
    throw Se();
  }
  mergeWith(e) {
    return !1;
  }
  integrate(e, n) {}
  delete(e) {}
  gc(e) {}
  write(e, n) {
    e.writeBuf(this.content);
  }
  getRef() {
    return 3;
  }
}
const Lp = (t) => new zn(t.readBuf());
class An {
  constructor(e) {
    this.len = e;
  }
  getLength() {
    return this.len;
  }
  getContent() {
    return [];
  }
  isCountable() {
    return !1;
  }
  copy() {
    return new An(this.len);
  }
  splice(e) {
    const n = new An(this.len - e);
    return ((this.len = e), n);
  }
  mergeWith(e) {
    return ((this.len += e.len), !0);
  }
  integrate(e, n) {
    (Ls(e.deleteSet, n.id.client, n.id.clock, this.len), n.markDeleted());
  }
  delete(e) {}
  gc(e) {}
  write(e, n) {
    e.writeLen(this.len - n);
  }
  getRef() {
    return 1;
  }
}
const Mp = (t) => new An(t.readLen()),
  Dl = (t, e) =>
    new Ae({ guid: t, ...e, shouldLoad: e.shouldLoad || e.autoLoad || !1 });
class Wn {
  constructor(e) {
    (e._item &&
      console.error(
        "This document was already integrated as a sub-document. You should create a second instance instead with the same guid.",
      ),
      (this.doc = e));
    const n = {};
    ((this.opts = n),
      e.gc || (n.gc = !1),
      e.autoLoad && (n.autoLoad = !0),
      e.meta !== null && (n.meta = e.meta));
  }
  getLength() {
    return 1;
  }
  getContent() {
    return [this.doc];
  }
  isCountable() {
    return !0;
  }
  copy() {
    return new Wn(Dl(this.doc.guid, this.opts));
  }
  splice(e) {
    throw Se();
  }
  mergeWith(e) {
    return !1;
  }
  integrate(e, n) {
    ((this.doc._item = n),
      e.subdocsAdded.add(this.doc),
      this.doc.shouldLoad && e.subdocsLoaded.add(this.doc));
  }
  delete(e) {
    e.subdocsAdded.has(this.doc)
      ? e.subdocsAdded.delete(this.doc)
      : e.subdocsRemoved.add(this.doc);
  }
  gc(e) {}
  write(e, n) {
    (e.writeString(this.doc.guid), e.writeAny(this.opts));
  }
  getRef() {
    return 9;
  }
}
const Tp = (t) => new Wn(Dl(t.readString(), t.readAny()));
class Dt {
  constructor(e) {
    this.embed = e;
  }
  getLength() {
    return 1;
  }
  getContent() {
    return [this.embed];
  }
  isCountable() {
    return !0;
  }
  copy() {
    return new Dt(this.embed);
  }
  splice(e) {
    throw Se();
  }
  mergeWith(e) {
    return !1;
  }
  integrate(e, n) {}
  delete(e) {}
  gc(e) {}
  write(e, n) {
    e.writeJSON(this.embed);
  }
  getRef() {
    return 5;
  }
}
const Pp = (t) => new Dt(t.readJSON());
class j {
  constructor(e, n) {
    ((this.key = e), (this.value = n));
  }
  getLength() {
    return 1;
  }
  getContent() {
    return [];
  }
  isCountable() {
    return !1;
  }
  copy() {
    return new j(this.key, this.value);
  }
  splice(e) {
    throw Se();
  }
  mergeWith(e) {
    return !1;
  }
  integrate(e, n) {
    const s = n.parent;
    ((s._searchMarker = null), (s._hasFormatting = !0));
  }
  delete(e) {}
  gc(e) {}
  write(e, n) {
    (e.writeKey(this.key), e.writeJSON(this.value));
  }
  getRef() {
    return 6;
  }
}
const Op = (t) => new j(t.readKey(), t.readJSON());
class Os {
  constructor(e) {
    this.arr = e;
  }
  getLength() {
    return this.arr.length;
  }
  getContent() {
    return this.arr;
  }
  isCountable() {
    return !0;
  }
  copy() {
    return new Os(this.arr);
  }
  splice(e) {
    const n = new Os(this.arr.slice(e));
    return ((this.arr = this.arr.slice(0, e)), n);
  }
  mergeWith(e) {
    return ((this.arr = this.arr.concat(e.arr)), !0);
  }
  integrate(e, n) {}
  delete(e) {}
  gc(e) {}
  write(e, n) {
    const s = this.arr.length;
    e.writeLen(s - n);
    for (let r = n; r < s; r++) {
      const i = this.arr[r];
      e.writeString(i === void 0 ? "undefined" : JSON.stringify(i));
    }
  }
  getRef() {
    return 2;
  }
}
const Np = (t) => {
  const e = t.readLen(),
    n = [];
  for (let s = 0; s < e; s++) {
    const r = t.readString();
    r === "undefined" ? n.push(void 0) : n.push(JSON.parse(r));
  }
  return new Os(n);
};
class St {
  constructor(e) {
    this.arr = e;
  }
  getLength() {
    return this.arr.length;
  }
  getContent() {
    return this.arr;
  }
  isCountable() {
    return !0;
  }
  copy() {
    return new St(this.arr);
  }
  splice(e) {
    const n = new St(this.arr.slice(e));
    return ((this.arr = this.arr.slice(0, e)), n);
  }
  mergeWith(e) {
    return ((this.arr = this.arr.concat(e.arr)), !0);
  }
  integrate(e, n) {}
  delete(e) {}
  gc(e) {}
  write(e, n) {
    const s = this.arr.length;
    e.writeLen(s - n);
    for (let r = n; r < s; r++) {
      const i = this.arr[r];
      e.writeAny(i);
    }
  }
  getRef() {
    return 8;
  }
}
const Rp = (t) => {
  const e = t.readLen(),
    n = [];
  for (let s = 0; s < e; s++) n.push(t.readAny());
  return new St(n);
};
class je {
  constructor(e) {
    this.str = e;
  }
  getLength() {
    return this.str.length;
  }
  getContent() {
    return this.str.split("");
  }
  isCountable() {
    return !0;
  }
  copy() {
    return new je(this.str);
  }
  splice(e) {
    const n = new je(this.str.slice(e));
    this.str = this.str.slice(0, e);
    const s = this.str.charCodeAt(e - 1);
    return (
      s >= 55296 &&
        s <= 56319 &&
        ((this.str = this.str.slice(0, e - 1) + "�"),
        (n.str = "�" + n.str.slice(1))),
      n
    );
  }
  mergeWith(e) {
    return ((this.str += e.str), !0);
  }
  integrate(e, n) {}
  delete(e) {}
  gc(e) {}
  write(e, n) {
    e.writeString(n === 0 ? this.str : this.str.slice(n));
  }
  getRef() {
    return 4;
  }
}
const jp = (t) => new je(t.readString()),
  Up = [mp, bp, Ep, Ap, kp, Ip, $p],
  Hp = 0,
  Fp = 1,
  zp = 2,
  Wp = 3,
  Kp = 4,
  Bp = 5,
  qp = 6;
class Ye {
  constructor(e) {
    this.type = e;
  }
  getLength() {
    return 1;
  }
  getContent() {
    return [this.type];
  }
  isCountable() {
    return !0;
  }
  copy() {
    return new Ye(this.type._copy());
  }
  splice(e) {
    throw Se();
  }
  mergeWith(e) {
    return !1;
  }
  integrate(e, n) {
    this.type._integrate(e.doc, n);
  }
  delete(e) {
    let n = this.type._start;
    for (; n !== null; )
      (n.deleted
        ? n.id.clock < (e.beforeState.get(n.id.client) || 0) &&
          e._mergeStructs.push(n)
        : n.delete(e),
        (n = n.right));
    (this.type._map.forEach((s) => {
      s.deleted
        ? s.id.clock < (e.beforeState.get(s.id.client) || 0) &&
          e._mergeStructs.push(s)
        : s.delete(e);
    }),
      e.changed.delete(this.type));
  }
  gc(e) {
    let n = this.type._start;
    for (; n !== null; ) (n.gc(e, !0), (n = n.right));
    ((this.type._start = null),
      this.type._map.forEach((s) => {
        for (; s !== null; ) (s.gc(e, !0), (s = s.left));
      }),
      (this.type._map = new Map()));
  }
  write(e, n) {
    this.type._write(e);
  }
  getRef() {
    return 7;
  }
}
const Vp = (t) => new Ye(Up[t.readTypeRef()](t)),
  Ns = (t, e, n) => {
    const { client: s, clock: r } = e.id,
      i = new N(
        k(s, r + n),
        e,
        k(s, r + n - 1),
        e.right,
        e.rightOrigin,
        e.parent,
        e.parentSub,
        e.content.splice(n),
      );
    return (
      e.deleted && i.markDeleted(),
      e.keep && (i.keep = !0),
      e.redone !== null && (i.redone = k(e.redone.client, e.redone.clock + n)),
      (e.right = i),
      i.right !== null && (i.right.left = i),
      t._mergeStructs.push(i),
      i.parentSub !== null &&
        i.right === null &&
        i.parent._map.set(i.parentSub, i),
      (e.length = n),
      i
    );
  };
class N extends Qi {
  constructor(e, n, s, r, i, o, a, c) {
    (super(e, c.getLength()),
      (this.origin = s),
      (this.left = n),
      (this.right = r),
      (this.rightOrigin = i),
      (this.parent = o),
      (this.parentSub = a),
      (this.redone = null),
      (this.content = c),
      (this.info = this.content.isCountable() ? Ro : 0));
  }
  set marker(e) {
    (this.info & Sr) > 0 !== e && (this.info ^= Sr);
  }
  get marker() {
    return (this.info & Sr) > 0;
  }
  get keep() {
    return (this.info & No) > 0;
  }
  set keep(e) {
    this.keep !== e && (this.info ^= No);
  }
  get countable() {
    return (this.info & Ro) > 0;
  }
  get deleted() {
    return (this.info & Cr) > 0;
  }
  set deleted(e) {
    this.deleted !== e && (this.info ^= Cr);
  }
  markDeleted() {
    this.info |= Cr;
  }
  getMissing(e, n) {
    if (
      this.origin &&
      this.origin.client !== this.id.client &&
      this.origin.clock >= F(n, this.origin.client)
    )
      return this.origin.client;
    if (
      this.rightOrigin &&
      this.rightOrigin.client !== this.id.client &&
      this.rightOrigin.clock >= F(n, this.rightOrigin.client)
    )
      return this.rightOrigin.client;
    if (
      this.parent &&
      this.parent.constructor === Ht &&
      this.id.client !== this.parent.client &&
      this.parent.clock >= F(n, this.parent.client)
    )
      return this.parent.client;
    if (
      (this.origin &&
        ((this.left = Zo(e, n, this.origin)), (this.origin = this.left.lastId)),
      this.rightOrigin &&
        ((this.right = it(e, this.rightOrigin)),
        (this.rightOrigin = this.right.id)),
      (this.left && this.left.constructor === ce) ||
        (this.right && this.right.constructor === ce))
    )
      this.parent = null;
    else if (!this.parent)
      (this.left &&
        this.left.constructor === N &&
        ((this.parent = this.left.parent),
        (this.parentSub = this.left.parentSub)),
        this.right &&
          this.right.constructor === N &&
          ((this.parent = this.right.parent),
          (this.parentSub = this.right.parentSub)));
    else if (this.parent.constructor === Ht) {
      const s = $r(n, this.parent);
      s.constructor === ce
        ? (this.parent = null)
        : (this.parent = s.content.type);
    }
    return null;
  }
  integrate(e, n) {
    if (
      (n > 0 &&
        ((this.id.clock += n),
        (this.left = Zo(e, e.doc.store, k(this.id.client, this.id.clock - 1))),
        (this.origin = this.left.lastId),
        (this.content = this.content.splice(n)),
        (this.length -= n)),
      this.parent)
    ) {
      if (
        (!this.left && (!this.right || this.right.left !== null)) ||
        (this.left && this.left.right !== this.right)
      ) {
        let s = this.left,
          r;
        if (s !== null) r = s.right;
        else if (this.parentSub !== null)
          for (
            r = this.parent._map.get(this.parentSub) || null;
            r !== null && r.left !== null;

          )
            r = r.left;
        else r = this.parent._start;
        const i = new Set(),
          o = new Set();
        for (; r !== null && r !== this.right; ) {
          if ((o.add(r), i.add(r), es(this.origin, r.origin))) {
            if (r.id.client < this.id.client) ((s = r), i.clear());
            else if (es(this.rightOrigin, r.rightOrigin)) break;
          } else if (r.origin !== null && o.has($r(e.doc.store, r.origin)))
            i.has($r(e.doc.store, r.origin)) || ((s = r), i.clear());
          else break;
          r = r.right;
        }
        this.left = s;
      }
      if (this.left !== null) {
        const s = this.left.right;
        ((this.right = s), (this.left.right = this));
      } else {
        let s;
        if (this.parentSub !== null)
          for (
            s = this.parent._map.get(this.parentSub) || null;
            s !== null && s.left !== null;

          )
            s = s.left;
        else ((s = this.parent._start), (this.parent._start = this));
        this.right = s;
      }
      (this.right !== null
        ? (this.right.left = this)
        : this.parentSub !== null &&
          (this.parent._map.set(this.parentSub, this),
          this.left !== null && this.left.delete(e)),
        this.parentSub === null &&
          this.countable &&
          !this.deleted &&
          (this.parent._length += this.length),
        hl(e.doc.store, this),
        this.content.integrate(e, this),
        ea(e, this.parent, this.parentSub),
        ((this.parent._item !== null && this.parent._item.deleted) ||
          (this.parentSub !== null && this.right !== null)) &&
          this.delete(e));
    } else new ce(this.id, this.length).integrate(e, 0);
  }
  get next() {
    let e = this.right;
    for (; e !== null && e.deleted; ) e = e.right;
    return e;
  }
  get prev() {
    let e = this.left;
    for (; e !== null && e.deleted; ) e = e.left;
    return e;
  }
  get lastId() {
    return this.length === 1
      ? this.id
      : k(this.id.client, this.id.clock + this.length - 1);
  }
  mergeWith(e) {
    if (
      this.constructor === e.constructor &&
      es(e.origin, this.lastId) &&
      this.right === e &&
      es(this.rightOrigin, e.rightOrigin) &&
      this.id.client === e.id.client &&
      this.id.clock + this.length === e.id.clock &&
      this.deleted === e.deleted &&
      this.redone === null &&
      e.redone === null &&
      this.content.constructor === e.content.constructor &&
      this.content.mergeWith(e.content)
    ) {
      const n = this.parent._searchMarker;
      return (
        n &&
          n.forEach((s) => {
            s.p === e &&
              ((s.p = this),
              !this.deleted && this.countable && (s.index -= this.length));
          }),
        e.keep && (this.keep = !0),
        (this.right = e.right),
        this.right !== null && (this.right.left = this),
        (this.length += e.length),
        !0
      );
    }
    return !1;
  }
  delete(e) {
    if (!this.deleted) {
      const n = this.parent;
      (this.countable && this.parentSub === null && (n._length -= this.length),
        this.markDeleted(),
        Ls(e.deleteSet, this.id.client, this.id.clock, this.length),
        ea(e, n, this.parentSub),
        this.content.delete(e));
    }
  }
  gc(e, n) {
    if (!this.deleted) throw pe();
    (this.content.gc(e),
      n
        ? Qf(e, this, new ce(this.id, this.length))
        : (this.content = new An(this.length)));
  }
  write(e, n) {
    const s = n > 0 ? k(this.id.client, this.id.clock + n - 1) : this.origin,
      r = this.rightOrigin,
      i = this.parentSub,
      o =
        (this.content.getRef() & Xs) |
        (s === null ? 0 : le) |
        (r === null ? 0 : ze) |
        (i === null ? 0 : wn);
    if (
      (e.writeInfo(o),
      s !== null && e.writeLeftID(s),
      r !== null && e.writeRightID(r),
      s === null && r === null)
    ) {
      const a = this.parent;
      if (a._item !== void 0) {
        const c = a._item;
        if (c === null) {
          const l = Xf(a);
          (e.writeParentInfo(!0), e.writeString(l));
        } else (e.writeParentInfo(!1), e.writeLeftID(c.id));
      } else
        a.constructor === String
          ? (e.writeParentInfo(!0), e.writeString(a))
          : a.constructor === Ht
            ? (e.writeParentInfo(!1), e.writeLeftID(a))
            : pe();
      i !== null && e.writeString(i);
    }
    this.content.write(e, n);
  }
}
const Ll = (t, e) => Yp[e & Xs](t),
  Yp = [
    () => {
      pe();
    },
    Mp,
    Np,
    Lp,
    jp,
    Pp,
    Op,
    Vp,
    Rp,
    Tp,
    () => {
      pe();
    },
  ],
  Gp = 10;
class fe extends Qi {
  get deleted() {
    return !0;
  }
  delete() {}
  mergeWith(e) {
    return this.constructor !== e.constructor
      ? !1
      : ((this.length += e.length), !0);
  }
  integrate(e, n) {
    pe();
  }
  write(e, n) {
    (e.writeInfo(Gp), w(e.restEncoder, this.length - n));
  }
  getMissing(e, n) {
    return null;
  }
}
const Ml =
    typeof globalThis < "u"
      ? globalThis
      : typeof window < "u"
        ? window
        : typeof global < "u"
          ? global
          : {},
  Tl = "__ $YJS$ __";
Ml[Tl] === !0 &&
  console.error(
    "Yjs was already imported. This breaks constructor checks and will lead to issues! - https://github.com/yjs/yjs/issues/438",
  );
Ml[Tl] = !0;
const Mr = 3e4;
class Jp extends Ec {
  constructor(e) {
    (super(),
      (this.doc = e),
      (this.clientID = e.clientID),
      (this.states = new Map()),
      (this.meta = new Map()),
      (this._checkInterval = setInterval(
        () => {
          const n = Wt();
          this.getLocalState() !== null &&
            Mr / 2 <= n - this.meta.get(this.clientID).lastUpdated &&
            this.setLocalState(this.getLocalState());
          const s = [];
          (this.meta.forEach((r, i) => {
            i !== this.clientID &&
              Mr <= n - r.lastUpdated &&
              this.states.has(i) &&
              s.push(i);
          }),
            s.length > 0 && eo(this, s, "timeout"));
        },
        _e(Mr / 10),
      )),
      e.on("destroy", () => {
        this.destroy();
      }),
      this.setLocalState({}));
  }
  destroy() {
    (this.emit("destroy", [this]),
      this.setLocalState(null),
      super.destroy(),
      clearInterval(this._checkInterval));
  }
  getLocalState() {
    return this.states.get(this.clientID) || null;
  }
  setLocalState(e) {
    const n = this.clientID,
      s = this.meta.get(n),
      r = s === void 0 ? 0 : s.clock + 1,
      i = this.states.get(n);
    (e === null ? this.states.delete(n) : this.states.set(n, e),
      this.meta.set(n, { clock: r, lastUpdated: Wt() }));
    const o = [],
      a = [],
      c = [],
      l = [];
    (e === null
      ? l.push(n)
      : i == null
        ? e != null && o.push(n)
        : (a.push(n), jt(i, e) || c.push(n)),
      (o.length > 0 || c.length > 0 || l.length > 0) &&
        this.emit("change", [{ added: o, updated: c, removed: l }, "local"]),
      this.emit("update", [{ added: o, updated: a, removed: l }, "local"]));
  }
  setLocalStateField(e, n) {
    const s = this.getLocalState();
    s !== null && this.setLocalState({ ...s, [e]: n });
  }
  getStates() {
    return this.states;
  }
}
const eo = (t, e, n) => {
    const s = [];
    for (let r = 0; r < e.length; r++) {
      const i = e[r];
      if (t.states.has(i)) {
        if ((t.states.delete(i), i === t.clientID)) {
          const o = t.meta.get(i);
          t.meta.set(i, { clock: o.clock + 1, lastUpdated: Wt() });
        }
        s.push(i);
      }
    }
    s.length > 0 &&
      (t.emit("change", [{ added: [], updated: [], removed: s }, n]),
      t.emit("update", [{ added: [], updated: [], removed: s }, n]));
  },
  dn = (t, e, n = t.states) => {
    const s = e.length,
      r = J();
    w(r, s);
    for (let i = 0; i < s; i++) {
      const o = e[i],
        a = n.get(o) || null,
        c = t.meta.get(o).clock;
      (w(r, o), w(r, c), yt(r, JSON.stringify(a)));
    }
    return $(r);
  },
  Xp = (t, e, n) => {
    const s = ct(e),
      r = Wt(),
      i = [],
      o = [],
      a = [],
      c = [],
      l = S(s);
    for (let u = 0; u < l; u++) {
      const h = S(s);
      let d = S(s);
      const f = JSON.parse(et(s)),
        p = t.meta.get(h),
        g = t.states.get(h),
        b = p === void 0 ? 0 : p.clock;
      (b < d || (b === d && f === null && t.states.has(h))) &&
        (f === null
          ? h === t.clientID && t.getLocalState() != null
            ? d++
            : t.states.delete(h)
          : t.states.set(h, f),
        t.meta.set(h, { clock: d, lastUpdated: r }),
        p === void 0 && f !== null
          ? i.push(h)
          : p !== void 0 && f === null
            ? c.push(h)
            : f !== null && (jt(f, g) || a.push(h), o.push(h)));
    }
    ((i.length > 0 || a.length > 0 || c.length > 0) &&
      t.emit("change", [{ added: i, updated: a, removed: c }, n]),
      (i.length > 0 || o.length > 0 || c.length > 0) &&
        t.emit("update", [{ added: i, updated: o, removed: c }, n]));
  },
  Pl = 0,
  to = 1,
  Ol = 2,
  ai = (t, e) => {
    w(t, Pl);
    const n = Gf(e);
    M(t, n);
  },
  Nl = (t, e, n) => {
    (w(t, to), M(t, Bf(e, n)));
  },
  Zp = (t, e, n) => Nl(e, n, G(t)),
  Rl = (t, e, n, s) => {
    try {
      zf(e, G(t), n);
    } catch (r) {
      (s?.(r), console.error("Caught error while handling a Yjs update", r));
    }
  },
  Qp = (t, e) => {
    (w(t, Ol), M(t, e));
  },
  eg = Rl,
  tg = (t, e, n, s, r) => {
    const i = S(t);
    switch (i) {
      case Pl:
        Zp(t, e, n);
        break;
      case to:
        Rl(t, n, s, r);
        break;
      case Ol:
        eg(t, n, s, r);
        break;
      default:
        throw new Error("Unknown message type");
    }
    return i;
  },
  jl = new Map();
class ng {
  constructor(e) {
    ((this.room = e),
      (this.onmessage = null),
      (this._onChange = (n) =>
        n.key === e &&
        this.onmessage !== null &&
        this.onmessage({ data: Nd(n.newValue || "") })),
      _d(this._onChange));
  }
  postMessage(e) {
    Ic.setItem(this.room, Od(Dd(e)));
  }
  close() {
    Ed(this._onChange);
  }
}
const sg = typeof BroadcastChannel > "u" ? ng : BroadcastChannel,
  no = (t) =>
    He(jl, t, () => {
      const e = rt(),
        n = new sg(t);
      return (
        (n.onmessage = (s) => e.forEach((r) => r(s.data, "broadcastchannel"))),
        { bc: n, subs: e }
      );
    }),
  rg = (t, e) => (no(t).subs.add(e), e),
  ig = (t, e) => {
    const n = no(t),
      s = n.subs.delete(e);
    return (s && n.subs.size === 0 && (n.bc.close(), jl.delete(t)), s);
  },
  Pt = (t, e, n = null) => {
    const s = no(t);
    (s.bc.postMessage(e), s.subs.forEach((r) => r(e, n)));
  },
  og = (t) =>
    fd(t, (e, n) => `${encodeURIComponent(n)}=${encodeURIComponent(e)}`).join(
      "&",
    );
let ag = "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict",
  cg = (t = 21) => {
    let e = "",
      n = crypto.getRandomValues(new Uint8Array((t |= 0)));
    for (; t--; ) e += ag[n[t] & 63];
    return e;
  };
const lg = 0,
  ug = (t, e, n) => {
    S(t) === lg && n(e, et(t));
  },
  hg = typeof window > "u",
  Kn = [];
Kn[0] = (t, e, n, s, r) => {
  w(t, 0);
  const i = tg(e, t, n.doc, n);
  s && i === to && !n.synced && (n.synced = !0);
};
Kn[3] = (t, e, n, s, r) => {
  (w(t, 1), M(t, dn(n.awareness, Array.from(n.awareness.getStates().keys()))));
};
Kn[1] = (t, e, n, s, r) => {
  Xp(n.awareness, G(e), n);
};
Kn[2] = (t, e, n, s, r) => {
  ug(e, n.doc, (i, o) => dg(n, o));
};
function dg(t, e) {
  console.warn(`Permission denied to access ${t.url}.
${e}`);
}
function Ul(t, e, n) {
  const s = ct(e),
    r = J(),
    i = S(s),
    o = t.messageHandlers[i];
  return (o ? o(r, s, t, n, i) : console.error("Unable to compute message"), r);
}
function ia(t) {
  if (t.shouldConnect && t.ws === null) {
    if (!t._WS)
      throw new Error(
        "No WebSocket implementation available, did you forget to pass options.WebSocketPolyfill?",
      );
    const e = new t._WS(t.url);
    ((e.binaryType = "arraybuffer"),
      (t.ws = e),
      (t.wsconnecting = !0),
      (t.wsconnected = !1),
      (t.synced = !1),
      e.addEventListener("message", (n) => {
        if (typeof n.data == "string") {
          if (n.data.startsWith("__YPS:")) {
            const r = n.data.slice(6);
            t.emit("custom-message", [r]);
          }
          return;
        }
        t.wsLastMessageReceived = Wt();
        const s = Ul(t, new Uint8Array(n.data), !0);
        Di(s) > 1 && e.send($(s));
      }),
      e.addEventListener("error", (n) => {
        t.emit("connection-error", [n, t]);
      }),
      e.addEventListener("close", (n) => {
        if (
          (t.emit("connection-close", [n, t]),
          (t.ws = null),
          (t.wsconnecting = !1),
          t.wsconnected)
        ) {
          ((t.wsconnected = !1), (t.synced = !1));
          const s = Array.from(t.awareness.getStates().keys()).filter(
            (r) => r !== t.doc.clientID,
          );
          eo(t.awareness, s, t);
          for (const r of s) t.awareness.meta.delete(r);
          t.emit("status", [{ status: "disconnected" }]);
        } else t.wsUnsuccessfulReconnects++;
        setTimeout(
          () => {
            t.shouldConnect &&
              Promise.resolve(t._reconnectWS()).catch((s) => {
                console.error("Reconnection failed", s);
              });
          },
          Ii(Dh(2, t.wsUnsuccessfulReconnects) * 100, t.maxBackoffTime),
        );
      }),
      e.addEventListener("open", () => {
        ((t.wsLastMessageReceived = Wt()),
          (t.wsconnecting = !1),
          (t.wsconnected = !0),
          (t.wsUnsuccessfulReconnects = 0),
          t.emit("status", [{ status: "connected" }]));
        const n = J();
        if (
          (w(n, 0),
          ai(n, t.doc),
          e.send($(n)),
          t.awareness.getLocalState() !== null)
        ) {
          t.awareness.setLocalState(t.awareness.getLocalState());
          const s = J();
          (w(s, 1), M(s, dn(t.awareness, [t.doc.clientID])), e.send($(s)));
        }
      }),
      t.emit("status", [{ status: "connecting" }]));
  }
}
function Tr(t, e) {
  const n = t.ws;
  (t.wsconnected && n && n.readyState === n.OPEN && n.send(e),
    t.bcconnected && Pt(t.bcChannel, e, t));
}
const fg = typeof WebSocket > "u" ? null : WebSocket;
var pg = class extends Ec {
  maxBackoffTime;
  bcChannel;
  url;
  roomname;
  doc;
  _WS;
  awareness;
  wsconnected;
  wsconnecting;
  bcconnected;
  disableBc;
  wsUnsuccessfulReconnects;
  messageHandlers;
  _synced;
  ws;
  wsLastMessageReceived;
  shouldConnect;
  _resyncInterval;
  _bcSubscriber;
  _updateHandler;
  _awarenessUpdateHandler;
  _unloadHandler;
  constructor(
    t,
    e,
    n,
    {
      connect: s = !0,
      awareness: r = new Jp(n),
      params: i = {},
      isPrefixedUrl: o = !1,
      WebSocketPolyfill: a = fg,
      resyncInterval: c = -1,
      maxBackoffTime: l = 2500,
      disableBc: u = hg,
    } = {},
  ) {
    for (super(); t[t.length - 1] === "/"; ) t = t.slice(0, t.length - 1);
    const h = og(i);
    ((this.maxBackoffTime = l),
      (this.bcChannel = `${t}/${e}`),
      (this.url = o ? t : `${t}/${e}${h.length === 0 ? "" : `?${h}`}`),
      (this.roomname = e),
      (this.doc = n),
      (this._WS = a),
      (this.awareness = r),
      (this.wsconnected = !1),
      (this.wsconnecting = !1),
      (this.bcconnected = !1),
      (this.disableBc = u),
      (this.wsUnsuccessfulReconnects = 0),
      (this.messageHandlers = Kn.slice()),
      (this._synced = !1),
      (this.ws = null),
      (this.wsLastMessageReceived = 0),
      (this.shouldConnect = s),
      (this._resyncInterval = 0),
      c > 0 &&
        (this._resyncInterval = setInterval(() => {
          if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            const d = J();
            (w(d, 0), ai(d, n), this.ws.send($(d)));
          }
        }, c)),
      (this._bcSubscriber = (d, f) => {
        if (f !== this) {
          const p = Ul(this, new Uint8Array(d), !1);
          Di(p) > 1 && Pt(this.bcChannel, $(p), this);
        }
      }),
      (this._updateHandler = (d, f) => {
        if (f !== this) {
          const p = J();
          (w(p, 0), Qp(p, d), Tr(this, $(p)));
        }
      }),
      this.doc.on("update", this._updateHandler),
      (this._awarenessUpdateHandler = (
        { added: d, updated: f, removed: p },
        g,
      ) => {
        const b = d.concat(f).concat(p),
          m = J();
        (w(m, 1), M(m, dn(r, b)), Tr(this, $(m)));
      }),
      (this._unloadHandler = () => {
        eo(this.awareness, [n.clientID], "window unload");
      }),
      typeof window < "u"
        ? window.addEventListener("unload", this._unloadHandler)
        : typeof process < "u" &&
          typeof process.on == "function" &&
          process.on("exit", this._unloadHandler),
      r.on("change", this._awarenessUpdateHandler),
      clearInterval(r._checkInterval),
      s && this.connect());
  }
  get synced() {
    return this._synced;
  }
  set synced(t) {
    this._synced !== t &&
      ((this._synced = t), this.emit("synced", [t]), this.emit("sync", [t]));
  }
  destroy() {
    (this._resyncInterval !== 0 && clearInterval(this._resyncInterval),
      this.disconnect(),
      typeof window < "u"
        ? window.removeEventListener("unload", this._unloadHandler)
        : typeof process < "u" &&
          typeof process.off == "function" &&
          process.off("exit", this._unloadHandler),
      this.awareness.off("change", this._awarenessUpdateHandler),
      this.doc.off("update", this._updateHandler),
      super.destroy());
  }
  connectBc() {
    if (this.disableBc) return;
    this.bcconnected ||
      (rg(this.bcChannel, this._bcSubscriber), (this.bcconnected = !0));
    const t = J();
    (w(t, 0), ai(t, this.doc), Pt(this.bcChannel, $(t), this));
    const e = J();
    (w(e, 0), Nl(e, this.doc), Pt(this.bcChannel, $(e), this));
    const n = J();
    (w(n, 3), Pt(this.bcChannel, $(n), this));
    const s = J();
    (w(s, 1),
      M(s, dn(this.awareness, [this.doc.clientID])),
      Pt(this.bcChannel, $(s), this));
  }
  disconnectBc() {
    const t = J();
    (w(t, 1),
      M(t, dn(this.awareness, [this.doc.clientID], new Map())),
      Tr(this, $(t)),
      this.bcconnected &&
        (ig(this.bcChannel, this._bcSubscriber), (this.bcconnected = !1)));
  }
  disconnect() {
    ((this.shouldConnect = !1),
      this.disconnectBc(),
      this.ws !== null && this.ws.close());
  }
  _reconnectWS() {
    ia(this);
  }
  connect() {
    ((this.shouldConnect = !0),
      !this.wsconnected && this.ws === null && (ia(this), this.connectBc()));
  }
};
function oa(t, e, n) {
  if (typeof t !== n)
    throw new Error(
      `Invalid "${e}" parameter provided to YProvider. Expected: ${n}, received: ${t}`,
    );
}
var so = class extends pg {
  id;
  #e;
  constructor(t, e, n, s = {}) {
    (oa(t, "host", "string"),
      oa(e, "room", "string"),
      (t = t.replace(/^(http|https|ws|wss):\/\//, "")),
      t.endsWith("/") && (t = t.slice(0, -1)));
    const r = `${s.protocol || (t.startsWith("localhost:") || t.startsWith("127.0.0.1:") || t.startsWith("192.168.") || t.startsWith("10.") || (t.startsWith("172.") && t.split(".")[1] >= "16" && t.split(".")[1] <= "31") ? "ws" : "wss")}://${t}${s.prefix || `/parties/${s.party || "main"}`}`,
      i = s.connectionId ?? cg(10),
      { params: o, connect: a = !0, ...c } = s,
      l = { ...c, isPrefixedUrl: !!s.prefix, connect: !1 };
    (super(r, e, n ?? new Ae(), l),
      (this.id = i),
      (this.#e = o),
      a && this.connect());
  }
  async #t() {
    const t = typeof this.#e == "function" ? await this.#e() : this.#e,
      e = new URLSearchParams([["_pk", this.id]]);
    if (t) for (const [s, r] of Object.entries(t)) r != null && e.append(s, r);
    const n = new URL(this.url);
    ((n.search = e.toString()), (this.url = n.toString()));
  }
  async connect() {
    try {
      (await this.#t(), super.connect());
    } catch (t) {
      throw (console.error("Failed to open connecton to PartyServer", t), t);
    }
  }
  async _reconnectWS() {
    try {
      await this.#t();
    } catch (t) {
      console.error(
        "Failed to refresh params, reconnecting with stale params",
        t,
      );
    }
    super._reconnectWS();
  }
  sendMessage(t) {
    this.ws?.send(`__YPS:${t}`);
  }
};
const Hl = ["data-playhtml-hover", "data-playhtml-focus"],
  gg = [
    "__playhtml-element",
    "ph-flash",
    "ph-inspect-highlight",
    "ph-inspect-highlight-hover",
    "ph-inspect-selected",
    "playhtml-loading",
  ],
  yg = { "aria-busy": "true", "aria-live": "polite" },
  mg = {
    defaultData: (t) => fn(t),
    myDefaultAwareness: { hover: !1, focus: !1 },
    onMount: ({ getElement: t, setData: e, setMyAwareness: n }) => {
      const s = t(),
        r = e,
        i = wg(s, (c) => {
          const l = c.filter(
            (u) =>
              u.type !== "attributes" || !Hl.includes(u.attributeName || ""),
          );
          l.length !== 0 &&
            r((u) => {
              bg(u, l);
            });
        });
      ((s.__playhtml_observer = i),
        s.addEventListener("mouseenter", () => {
          (n({ hover: !0, focus: s.hasAttribute("data-playhtml-focus") }),
            s.setAttribute("data-playhtml-hover", ""));
        }),
        s.addEventListener("mouseleave", () => {
          (n({ hover: !1, focus: s.hasAttribute("data-playhtml-focus") }),
            s.removeAttribute("data-playhtml-hover"));
        }),
        s.addEventListener("focusin", () => {
          (n({ hover: s.hasAttribute("data-playhtml-hover"), focus: !0 }),
            s.setAttribute("data-playhtml-focus", ""));
        }),
        s.addEventListener("focusout", () => {
          (n({ hover: s.hasAttribute("data-playhtml-hover"), focus: !1 }),
            s.removeAttribute("data-playhtml-focus"));
        }));
      const o = (c, l) => {
          if (
            (c.formState && (l.formState = c.formState),
            c.children && l.children)
          )
            for (let u = 0; u < c.children.length; u++) {
              const h = c.children[u];
              h.nodeType === "HTMLElement" &&
                l.children[u] &&
                o(h, l.children[u]);
            }
        },
        a = () => {
          r((c) => {
            const l = fn(s);
            (o(l, c),
              l.children &&
                c.children.splice(0, c.children.length, ...l.children));
          });
        };
      (s.addEventListener("input", a), s.addEventListener("change", a));
    },
    updateElement: ({ element: t, data: e }) => {
      const n = fn(t);
      if (ro(n, e)) return;
      const s = t.__playhtml_observer;
      (s && (s.takeRecords(), s.disconnect()),
        _s(t, e),
        s &&
          s.observe(t, {
            childList: !0,
            attributes: !0,
            subtree: !1,
            characterData: !0,
          }));
    },
    updateElementAwareness: ({ element: t, awareness: e }) => {
      const n = e.some((r) => r?.hover),
        s = e.some((r) => r?.focus);
      (n
        ? t.setAttribute("data-playhtml-hover", "")
        : t.removeAttribute("data-playhtml-hover"),
        s
          ? t.setAttribute("data-playhtml-focus", "")
          : t.removeAttribute("data-playhtml-focus"));
    },
  };
function aa(t) {
  return t.nodeType === "HTMLElement";
}
function ro(t, e) {
  if (t.nodeType !== e.nodeType) return !1;
  if (t.nodeType === "Text" && e.nodeType === "Text")
    return t.textContent === e.textContent;
  if (aa(t) && aa(e)) {
    if (t.tagName !== e.tagName) return !1;
    const n = ci(t.attributes),
      s = ci(e.attributes);
    if (Object.keys(n).length !== Object.keys(s).length) return !1;
    for (const [c, l] of Object.entries(n)) if (s[c] !== l) return !1;
    const r = t.formState,
      i = e.formState;
    if (
      (r || i) &&
      (!r ||
        !i ||
        r.checked !== i.checked ||
        r.value !== i.value ||
        r.selectedIndex !== i.selectedIndex)
    )
      return !1;
    const o = Rs(t.children),
      a = Rs(e.children);
    if (o.length !== a.length) return !1;
    for (let c = 0; c < o.length; c++) if (!ro(o[c], a[c])) return !1;
  }
  return !0;
}
function wg(t, e, n) {
  const s = {
      childList: !0,
      attributes: !0,
      subtree: !1,
      characterData: !0,
      ...n,
    },
    r = (o) => {
      const a = o.filter((c) => {
        if (c.target !== t) return !1;
        if (s.childList && c.type === "childList") return !0;
        if (s.attributes && c.type === "attributes")
          if (s.attributeFilter) {
            if (s.attributeFilter.includes(c.attributeName || "")) return !0;
          } else return !0;
        return !!(
          (s.characterData && c.type === "characterData") ||
          (s.subtree && c.type === "childList")
        );
      });
      e(a);
    },
    i = new MutationObserver(r);
  return (i.observe(t, s), i);
}
function bg(t, e) {
  e.forEach((n) => {
    switch (n.type) {
      case "attributes":
        vg(t, n);
        break;
      case "childList":
        Cg(t, n);
        break;
      case "characterData":
        Sg(t, n);
        break;
    }
  });
}
function vg(t, e) {
  if (t.nodeType !== "Text" && e.target instanceof HTMLElement) {
    const n = e.attributeName,
      s = e.target.getAttribute(n),
      r = ao(e.target);
    if (s !== null) {
      const i = co(n, s, r);
      i === null
        ? n in t.attributes && delete t.attributes[n]
        : t.attributes[n] !== i && (t.attributes[n] = i);
    } else n in t.attributes && delete t.attributes[n];
  }
}
function Cg(t, e) {
  if (t.nodeType === "Text" || !(e.target instanceof HTMLElement)) return;
  const n = [];
  e.target.childNodes.forEach((r) => {
    io(r) && n.push(fn(r));
  });
  const s = Rs(t.children);
  (s.length === t.children.length && kg(s, n)) ||
    t.children.splice(0, t.children.length, ...n);
}
function Sg(t, e) {
  const n = e.target;
  switch (t.nodeType) {
    case "Text":
      if (n instanceof Text) return ((t.textContent = n.textContent || ""), !0);
      break;
  }
  return !1;
}
function _g(t) {
  return t instanceof HTMLElement || t instanceof Text;
}
function Fl(t) {
  return t instanceof HTMLElement && t.classList.contains("ph-inspect-label");
}
function io(t) {
  return _g(t) && !Fl(t);
}
function oo(t, e) {
  return !!t?.split(/\s+/).includes(e);
}
function Eg(t) {
  return (
    t.nodeType === "HTMLElement" && oo(t.attributes.class, "ph-inspect-label")
  );
}
function Rs(t) {
  return t.filter((e) => !Eg(e));
}
function kg(t, e) {
  return t.length !== e.length ? !1 : t.every((n, s) => ro(n, e[s]));
}
function zl(t, e) {
  const n = new Set(gg);
  return (e && oo(t, "playhtml-loading") && n.add(e), n);
}
function ao(t) {
  const e = t.getAttribute("class") || void 0;
  return {
    classValue: e,
    localClassNames: zl(e, t.getAttribute("loading-class")),
  };
}
function Ag(t) {
  return {
    classValue: t.class,
    localClassNames: zl(t.class, t["loading-class"]),
  };
}
function Wl(t, e, n) {
  return Hl.includes(t)
    ? !0
    : oo(n.classValue, "playhtml-loading") && yg[t] === e;
}
function co(t, e, n) {
  return Wl(t, e, n)
    ? null
    : t === "class"
      ? xg(e, n.localClassNames) || null
      : e;
}
function ci(t) {
  const e = {},
    n = Ag(t);
  for (const [s, r] of Object.entries(t)) {
    const i = co(s, r, n);
    i !== null && (e[s] = i);
  }
  return e;
}
function xg(t, e) {
  return t
    .split(/\s+/)
    .filter((n) => n && !e.has(n))
    .join(" ");
}
function Kl(t, e) {
  return t
    .split(/\s+/)
    .filter((n) => e.has(n))
    .join(" ");
}
function Ig(t, e, n) {
  const s = [
    ...t.split(/\s+/).filter(Boolean),
    ...Kl(e, n).split(/\s+/).filter(Boolean),
  ];
  return Array.from(new Set(s)).join(" ");
}
function $g(t) {
  if (t instanceof HTMLInputElement) {
    const e = {};
    return (
      t.type === "checkbox" || t.type === "radio"
        ? (e.checked = t.checked)
        : (e.value = t.value),
      e
    );
  }
  if (t instanceof HTMLTextAreaElement) return { value: t.value };
  if (t instanceof HTMLSelectElement)
    return { selectedIndex: t.selectedIndex, value: t.value };
}
function fn(t) {
  if (t instanceof Text)
    return { nodeType: "Text", textContent: t.textContent || "" };
  const e = {
      nodeType: "HTMLElement",
      tagName: t.tagName.toLowerCase(),
      attributes: {},
      children: [],
    },
    n = ao(t);
  for (const r of t.attributes) {
    const i = co(r.name, r.value, n);
    i !== null && (e.attributes[r.name] = i);
  }
  const s = $g(t);
  return (
    s && (e.formState = s),
    t.childNodes.forEach((r) => {
      io(r) && e.children.push(fn(r));
    }),
    e
  );
}
function Dg(t, e) {
  e &&
    (t instanceof HTMLInputElement
      ? (t.type === "checkbox" || t.type === "radio") && e.checked !== void 0
        ? (t.checked = e.checked)
        : e.value !== void 0 && (t.value = e.value)
      : t instanceof HTMLTextAreaElement && e.value !== void 0
        ? (t.value = e.value)
        : t instanceof HTMLSelectElement &&
          e.selectedIndex !== void 0 &&
          (t.selectedIndex = e.selectedIndex));
}
function _s(t, e) {
  (Lg(t, e),
    e.nodeType === "HTMLElement" && (Mg(t, e), Dg(t, e.formState), Pg(t, e)));
}
function Lg(t, e) {
  e &&
    e.nodeType === "Text" &&
    t.textContent !== e.textContent &&
    (t.textContent = e.textContent || "");
}
function Mg(t, e) {
  if (!e) return;
  const n =
      e.attributes && typeof e.attributes == "object" ? ci(e.attributes) : {},
    s = ao(t);
  for (const [r, i] of Object.entries(n)) {
    const o =
      r === "class"
        ? Ig(i, t.getAttribute("class") || "", s.localClassNames)
        : i;
    t.getAttribute(r) !== o && t.setAttribute(r, o);
  }
  Array.from(t.attributes).forEach((r) => {
    if (!Wl(r.name, r.value, s)) {
      if (r.name === "class") {
        const i = Kl(r.value, s.localClassNames);
        if (!("class" in n) && i) {
          t.setAttribute("class", i);
          return;
        }
      }
      r.name in n || t.removeAttribute(r.name);
    }
  });
}
function ca(t) {
  return t.nodeType === "Text"
    ? document.createTextNode(t.textContent)
    : document.createElement(t.tagName);
}
function Tg(t, e) {
  return e.nodeType === "Text"
    ? t instanceof Text
    : t instanceof HTMLElement && t.tagName.toLowerCase() === e.tagName;
}
function Pg(t, e) {
  const n = Array.from(t.childNodes).filter(io),
    s = Rs(e.children),
    r = Math.min(n.length, s.length);
  for (let i = 0; i < r; i++) {
    const o = n[i],
      a = s[i];
    if (Tg(o, a)) _s(o, a);
    else {
      const c = ca(a);
      (t.replaceChild(c, o), _s(c, a));
    }
  }
  for (let i = r; i < s.length; i++) {
    const o = s[i],
      a = ca(o),
      c = Array.from(t.childNodes).find(Fl);
    (t.insertBefore(a, c ?? null), _s(a, o));
  }
  for (let i = n.length - 1; i >= r; i--) t.removeChild(n[i]);
}
const li = 16,
  dt = 512,
  Bl = /[\u0000-\u001f\u007f]/,
  Og = 150;
function Ng() {
  return `hsl(${Math.floor(Math.random() * 360)}, 70%, 60%)`;
}
function la(t) {
  return t !== null && typeof t == "object" && !Array.isArray(t);
}
function ql(t) {
  if (!la(t) || !ua(t.publicKey)) return null;
  const e = la(t.playerStyle) ? t.playerStyle : {},
    n = Array.isArray(e.colorPalette)
      ? e.colorPalette.filter(ua).slice(0, li)
      : [],
    s = { publicKey: t.publicKey, playerStyle: { colorPalette: n } },
    r = ha(t.name);
  r !== void 0 && (s.name = r);
  const i = ha(e.cursorStyle);
  return (
    i !== void 0 && (s.playerStyle.cursorStyle = i),
    Number.isFinite(t.createdAt) && (s.createdAt = Number(t.createdAt)),
    s
  );
}
function ua(t) {
  return typeof t == "string" && t.length > 0 && t.length <= dt && !Bl.test(t);
}
function ha(t) {
  if (typeof t == "string" && !Bl.test(t)) return t.slice(0, dt);
}
function Rg() {
  const t = crypto
      .getRandomValues(new Uint8Array(16))
      .reduce((s, r) => s + r.toString(16).padStart(2, "0"), ""),
    e = Math.floor(Math.random() * 360),
    n = [
      `hsl(${e}, 70%, 60%)`,
      `hsl(${(e + 120) % 360}, 70%, 60%)`,
      `hsl(${(e + 240) % 360}, 70%, 60%)`,
    ];
  return {
    publicKey: t,
    playerStyle: { colorPalette: n },
    createdAt: Date.now(),
  };
}
function jg(t) {
  const e = t.playerStyle?.colorPalette?.[0];
  return typeof e == "string" && e.length > 0;
}
function ui(t) {
  try {
    localStorage.setItem(Vl, JSON.stringify(t));
  } catch (e) {
    console.warn("Failed to save player identity to localStorage:", e);
  }
}
function Ug(t) {
  return jg(t)
    ? !1
    : (t.playerStyle || (t.playerStyle = { colorPalette: [] }),
      Array.isArray(t.playerStyle.colorPalette) ||
        (t.playerStyle.colorPalette = []),
      (t.playerStyle.colorPalette[0] = Ng()),
      !0);
}
const Vl = "playhtml_player_identity";
let ss = null;
function Yl() {
  if (ss) return ss;
  const t = localStorage.getItem(Vl);
  if (t)
    try {
      const n = JSON.parse(t),
        s = ql(n);
      if (s)
        return (
          (Ug(s) || JSON.stringify(s) !== JSON.stringify(n)) && ui(s),
          (ss = s),
          s
        );
    } catch {
      console.warn(
        "Failed to parse stored player identity, generating new one",
      );
    }
  const e = Rg();
  return (ui(e), (ss = e), e);
}
const lo = 512,
  js = 4096;
function Pr(t) {
  if (!K(t)) throw new Error("Presence message must be an object");
  switch (t.type) {
    case "presence-join":
      return (Hg(t), t);
    case "presence-update":
      return (fa(t.channel), Fg(t.channel, t.value), t);
    case "presence-clear":
      return (fa(t.channel), t);
    default:
      throw new Error("Unsupported presence message type");
  }
}
function Hg(t) {
  (Zl(t), Us(t.page, "page", lo), t.identity !== void 0 && Gl(t.identity));
}
function Fg(t, e) {
  if (e === void 0) throw new Error("Presence value must not be undefined");
  (Zl(e), t === "cursor" && zg(e), t === "identity" && Gl(e));
}
function zg(t) {
  if (!K(t)) throw new Error("cursor presence value must be an object");
  if (!("cursor" in t))
    throw new Error("cursor presence value must include cursor");
  if (
    (t.cursor !== null && Bg(t.cursor),
    t.zone !== void 0 && t.zone !== null && qg(t.zone),
    Us(t.page, "page", lo),
    t.at !== void 0 && !Number.isFinite(t.at))
  )
    throw new Error("cursor at must be a finite number");
}
function Wg(t) {
  try {
    return (Jl(t), !0);
  } catch {
    return !1;
  }
}
function Gl(t) {
  Jl(t);
}
function Jl(t) {
  if (!K(t)) throw new Error("identity must be an object");
  if (
    (da(t, ["publicKey", "name", "playerStyle", "createdAt"], "identity"),
    Or(t.publicKey, "identity.publicKey", dt),
    !K(t.playerStyle))
  )
    throw new Error("identity.playerStyle must be an object");
  da(t.playerStyle, ["colorPalette", "cursorStyle"], "identity.playerStyle");
  const e = t.playerStyle.colorPalette;
  if (!Array.isArray(e))
    throw new Error("identity.playerStyle.colorPalette must be an array");
  if (e.length > li)
    throw new Error(
      `identity.playerStyle.colorPalette must have ${li} colors or less`,
    );
  Or(e[0], "identity.playerStyle.colorPalette[0]", dt);
  for (let n = 1; n < e.length; n++)
    Or(e[n], `identity.playerStyle.colorPalette[${n}]`, dt);
  if (
    (Us(t.name, "identity.name", dt),
    Us(t.playerStyle.cursorStyle, "identity.playerStyle.cursorStyle", dt),
    t.createdAt !== void 0 && !Number.isFinite(t.createdAt))
  )
    throw new Error("identity.createdAt must be a finite number");
}
function da(t, e, n) {
  for (const s of Object.keys(t))
    if (!e.includes(s))
      throw new Error(`${n} must only include public presence fields`);
}
function Kg(t) {
  try {
    return (Xl(t), !0);
  } catch {
    return !1;
  }
}
function Bg(t) {
  Xl(t);
}
function Xl(t) {
  if (!K(t)) throw new Error("cursor must be an object");
  if (!Number.isFinite(t.x))
    throw new Error("cursor.x must be a finite number");
  if (!Number.isFinite(t.y))
    throw new Error("cursor.y must be a finite number");
  if (typeof t.pointer != "string" || t.pointer.length === 0)
    throw new Error("cursor.pointer must be a non-empty string");
}
function qg(t) {
  if (!K(t)) throw new Error("cursor zone must be an object");
  if (typeof t.zoneId != "string" || t.zoneId.length === 0)
    throw new Error("cursor zoneId must be a non-empty string");
  if (!Number.isFinite(t.relX))
    throw new Error("cursor zone relX must be a finite number");
  if (!Number.isFinite(t.relY))
    throw new Error("cursor zone relY must be a finite number");
}
function fa(t) {
  if (typeof t != "string" || t.length === 0)
    throw new Error("Presence channel must be a non-empty string");
  uo(t, "Presence channel", 128);
}
function Or(t, e, n) {
  if (typeof t != "string" || t.length === 0)
    throw new Error(`${e} must be a non-empty string`);
  uo(t, e, n);
}
function Us(t, e, n) {
  if (t !== void 0) {
    if (typeof t != "string") throw new Error(`${e} must be a string`);
    uo(t, e, n);
  }
}
function uo(t, e, n) {
  if (t.length > n) throw new Error(`${e} must be ${n} characters or less`);
  if (/[\u0000-\u001f\u007f]/.test(t))
    throw new Error(`${e} must not contain control characters`);
}
function Zl(t) {
  try {
    if (JSON.stringify(t) === void 0)
      throw new Error("Presence value must be JSON-serializable");
  } catch {
    throw new Error("Presence value must be JSON-serializable");
  }
}
function K(t) {
  return t !== null && typeof t == "object" && !Array.isArray(t);
}
function Nr(t) {
  return (
    t !== null &&
    typeof t == "object" &&
    Object.getPrototypeOf(t) === Object.prototype
  );
}
function Hs(t, e) {
  if (e != null) {
    if (Array.isArray(e)) {
      t.splice(0, t.length, ...e);
      return;
    }
    if (Nr(e)) {
      for (const n of Object.keys(t)) n in e || delete t[n];
      for (const [n, s] of Object.entries(e))
        Array.isArray(s)
          ? (Array.isArray(t[n]) || (t[n] = []), Hs(t[n], s))
          : Nr(s)
            ? (Nr(t[n]) || (t[n] = {}), Hs(t[n], s))
            : (t[n] = s);
      return;
    }
    t = e;
  }
}
function ot(t) {
  try {
    if (typeof structuredClone == "function") return structuredClone(t);
  } catch {}
  return t == null
    ? t
    : typeof t == "object"
      ? JSON.parse(JSON.stringify(t))
      : t;
}
function Ql(t) {
  const [e, n] = t.split("#");
  if (!e || !n) throw new Error("Invalid data-source attribute value");
  const s = e.indexOf("/"),
    r = s === -1 ? e : e.slice(0, s),
    i = s === -1 ? "/" : e.slice(s);
  return { domain: r, path: i, elementId: n };
}
const Vg = "LOCAL";
function Yg(t) {
  return t ? t.replace(/^www\./i, "") : Vg;
}
function pa(t) {
  if (!t) return "/";
  const e = t.replace(/\.[^/.]+$/, "");
  return e.startsWith("/") ? e : `/${e}`;
}
function Fs(t) {
  return Math.round(t * 10) / 10 + 0;
}
function ln(t) {
  const e = t?.trim();
  if (!e) return null;
  const n = e.startsWith("#") ? e.slice(1) : e;
  return document.getElementById(n) ?? document.querySelector(e);
}
function ga(t) {
  return ln(t.getAttribute(ey));
}
const ya = 1,
  ma = 60;
function Gg(t) {
  const e = t.getAttribute(ty);
  if (e == null) return ya;
  const n = parseFloat(e);
  return Number.isFinite(n) ? Math.max(0, Math.min(1, n)) : ya;
}
function Jg(t) {
  const e = t.getAttribute(ny);
  if (e == null) return ma;
  const n = parseFloat(e);
  return !Number.isFinite(n) || n < 0 ? ma : n;
}
function wa(t, e, n) {
  return Math.min(t, Math.max(t * e, n));
}
function hi(t, e, n) {
  const s = t.getBoundingClientRect(),
    r = e.getBoundingClientRect();
  return {
    x: s.left - r.left - e.clientLeft - n.x,
    y: s.top - r.top - e.clientTop - n.y,
  };
}
function Xg(t, e, n, s, r = hi(t, e, n)) {
  const i = Gg(t),
    o = Jg(t),
    a = t.offsetWidth,
    c = t.offsetHeight,
    l = wa(a, i, o),
    u = wa(c, i, o),
    h = l - a - r.x,
    d = e.clientWidth - l - r.x,
    f = u - c - r.y,
    p = e.clientHeight - u - r.y;
  return {
    x: d < h ? 0 : Math.min(d, Math.max(h, s.x)),
    y: p < f ? 0 : Math.min(p, Math.max(f, s.y)),
  };
}
function Zg(t) {
  return { x: Fs(t.x), y: Fs(t.y) };
}
const Qg = "can-duplicate-to",
  ey = "can-move-bounds",
  ty = "can-move-bounds-min-visible",
  ny = "can-move-bounds-min-visible-px";
var Q = ((t) => (
  (t.CanPlay = "can-play"),
  (t.CanMove = "can-move"),
  (t.CanSpin = "can-spin"),
  (t.CanGrow = "can-grow"),
  (t.CanToggle = "can-toggle"),
  (t.CanDuplicate = "can-duplicate"),
  (t.CanHover = "can-hover"),
  (t.CanMirror = "can-mirror"),
  t
))(Q || {});
function Bn(t) {
  return t.getAttribute("data-source") ? sy(t) : t.id;
}
function sy(t) {
  const e = t.getAttribute("data-source");
  if (!e) throw new Error("Element has no data-source attribute");
  const [n, s] = e.split("#");
  if (!n || !s) throw new Error("Invalid data-source attribute");
  return s;
}
const eu = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg'  width='44' height='53' viewport='0 0 100 100' style='fill:black;font-size:26px;'><text y='40%'>🚿</text></svg>")
      16 0,
    auto`,
  ry = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg'  width='40' height='48' viewport='0 0 100 100' style='fill:black;font-size:24px;'><text y='50%'>✂️</text></svg>") 16 0,auto`;
function ba(
  t,
  { getData: e, getElement: n, getLocalData: s, setLocalData: r },
) {
  const i = e(),
    o = s(),
    a = n();
  if (((o.isHovering = !0), t.altKey)) {
    if (i.scale <= 0.5) {
      a.style.cursor = "not-allowed";
      return;
    }
    a.style.cursor = ry;
  } else {
    if (i.scale >= i.maxScale) {
      a.style.cursor = "not-allowed";
      return;
    }
    a.style.cursor = eu;
  }
  r(o);
}
function rs(t) {
  if ("touches" in t) {
    const { clientX: e, clientY: n } = t.touches[0];
    return { clientX: e, clientY: n };
  }
  return { clientX: t.clientX, clientY: t.clientY };
}
const tu = {
  "can-move": {
    defaultData: { x: 0, y: 0 },
    defaultLocalData: { startMouseX: 0, startMouseY: 0 },
    updateElement: ({ element: t, data: e }) => {
      t.style.transform = `translate(${e.x}px, ${e.y}px)`;
    },
    onDragStart: (t, { data: e, element: n, setLocalData: s }) => {
      const { clientX: r, clientY: i } = rs(t),
        o = ga(n),
        a = o ? hi(n, o, e) : void 0;
      s({
        startMouseX: r,
        startMouseY: i,
        dragX: e.x,
        dragY: e.y,
        boundsBaseX: a?.x,
        boundsBaseY: a?.y,
      });
    },
    onDrag: (
      t,
      { data: e, localData: n, setData: s, setLocalData: r, element: i },
    ) => {
      const { clientX: o, clientY: a } = rs(t),
        c = e.x + o - n.startMouseX,
        l = e.y + a - n.startMouseY,
        u = ga(i);
      if (u) {
        const m = { x: n.dragX ?? e.x, y: n.dragY ?? e.y },
          C = m.x + o - n.startMouseX,
          v = m.y + a - n.startMouseY,
          _ =
            n.boundsBaseX !== void 0 && n.boundsBaseY !== void 0
              ? { x: n.boundsBaseX, y: n.boundsBaseY }
              : hi(i, u, m),
          I = Xg(i, u, m, { x: C, y: v }, _),
          y = Zg(I);
        s(y);
        const E = I.x - m.x,
          q = I.y - m.y;
        r({
          startMouseX: n.startMouseX + E,
          startMouseY: n.startMouseY + q,
          dragX: y.x,
          dragY: y.y,
          boundsBaseX: _.x,
          boundsBaseY: _.y,
        });
        return;
      }
      const {
          top: h,
          left: d,
          bottom: f,
          right: p,
        } = i.getBoundingClientRect(),
        g = window.visualViewport?.width ?? window.innerWidth,
        b = window.visualViewport?.height ?? window.innerHeight;
      (p > g && o > n.startMouseX) ||
        (f > b && a > n.startMouseY) ||
        (d < 0 && o < n.startMouseX) ||
        (h < 0 && a < n.startMouseY) ||
        (s({ x: Fs(c), y: Fs(l) }), r({ startMouseX: o, startMouseY: a }));
    },
    resetShortcut: "shiftKey",
  },
  "can-spin": {
    defaultData: { rotation: 0 },
    defaultLocalData: { startMouseX: 0 },
    updateElement: ({ element: t, data: e }) => {
      t.style.transform = `rotate(${e.rotation}deg)`;
    },
    onDragStart: (t, { setLocalData: e }) => {
      const { clientX: n } = rs(t);
      e({ startMouseX: n });
    },
    onDrag: (t, { data: e, localData: n, setData: s, setLocalData: r }) => {
      const { clientX: i } = rs(t);
      let o = Math.abs(i - n.startMouseX) * 2,
        a = e.rotation;
      (i > n.startMouseX ? (a += o) : i < n.startMouseX && (a -= o),
        s({ rotation: a }),
        r({ startMouseX: i }));
    },
    resetShortcut: "shiftKey",
  },
  "can-toggle": {
    defaultData: { on: !1 },
    updateElement: ({ element: t, data: e }) => {
      const n = typeof e == "object" ? e.on : e;
      (t.classList.toggle("toggled", n), t.classList.toggle("clicked", n));
    },
    onClick: (t, { data: e, setData: n }) => {
      const s = typeof e == "object" ? e.on : e;
      n({ on: !s });
    },
    resetShortcut: "shiftKey",
  },
  "can-grow": {
    defaultData: { scale: 1 },
    defaultLocalData: { maxScale: 2, isHovering: !1 },
    updateElement: ({ element: t, data: e }) => {
      t.style.transform = `scale(${e.scale})`;
    },
    onClick: (t, { data: e, element: n, setData: s, localData: r }) => {
      let { scale: i } = e;
      if (t.altKey) {
        if (e.scale <= 0.5) return;
        i -= 0.1;
      } else {
        if (((n.style.cursor = eu), e.scale >= r.maxScale)) return;
        i += 0.1;
      }
      s({ ...e, scale: i });
    },
    onMount: (t) => {
      const e = t.getElement();
      let n = !1;
      const s = (o) => ba(o, t),
        r = (o) => {
          (ba(o, t),
            !n &&
              ((n = !0),
              document.addEventListener("keydown", s),
              document.addEventListener("keyup", s)));
        },
        i = () => {
          n &&
            ((n = !1),
            document.removeEventListener("keydown", s),
            document.removeEventListener("keyup", s));
        };
      (e.addEventListener("mouseenter", r),
        e.addEventListener("mouseleave", i));
    },
    resetShortcut: "shiftKey",
  },
  "can-duplicate": {
    defaultData: [],
    defaultLocalData: [],
    updateElement: ({ data: t, localData: e, setLocalData: n, element: s }) => {
      const r = s.getAttribute("can-duplicate"),
        i = ln(r);
      let o = document.getElementById(e.slice(-1)?.[0]) ?? null;
      if (!i) {
        console.error(`Element ${r} not found. Cannot duplicate.`);
        return;
      }
      const a = ln(s.getAttribute(Qg));
      function c(u) {
        if (a) {
          a.appendChild(u);
          return;
        }
        i.parentNode.insertBefore(u, (o || i).nextSibling);
      }
      const l = new Set(e);
      for (const u of t) {
        if (l.has(u)) continue;
        const h = i.cloneNode(!0);
        (Object.assign(h, { ...i }),
          (h.id = u),
          c(h),
          e.push(u),
          window.playhtml.setupPlayElement(h),
          (o = h));
      }
      n(e);
    },
    onClick: (t, { data: e, element: n, setData: s }) => {
      const r = ln(n.getAttribute("can-duplicate"));
      if (!r) return;
      const i = r.id + "-" + Math.random().toString(36).substr(2, 9);
      s((o) => {
        o.push(i);
      });
    },
    isValidElementForTag: (t) => {
      const e = t.getAttribute("can-duplicate");
      return e
        ? (ln(e) ||
            console.warn(
              `can-duplicate element (${t.id}) duplicate element ("${e}") not found.`,
            ),
          !0)
        : !1;
    },
  },
  "can-hover": {
    defaultData: {},
    myDefaultAwareness: { hover: !1 },
    onMount: ({ getElement: t, setMyAwareness: e }) => {
      const n = t();
      (n.addEventListener("mouseenter", () => {
        (e({ hover: !0 }), n.setAttribute("data-playhtml-hover", ""));
      }),
        n.addEventListener("mouseleave", () => {
          (e({ hover: !1 }), n.removeAttribute("data-playhtml-hover"));
        }));
    },
    updateElement: () => {},
    updateElementAwareness: ({ element: t, awareness: e }) => {
      e.some((n) => n?.hover)
        ? t.setAttribute("data-playhtml-hover", "")
        : t.removeAttribute("data-playhtml-hover");
    },
  },
  "can-mirror": mg,
};
function iy() {
  const t = [];
  if (
    (document.querySelectorAll("[shared]").forEach((e) => {
      const n = e,
        s = n.id;
      if (!s) return;
      const r = `${window.location.host}${pa(window.location.pathname)}#${s}`;
      t.push({
        type: "source",
        elementId: s,
        dataSource: r,
        normalized: r,
        permissions: n.getAttribute("shared")?.includes("read-only")
          ? "read-only"
          : "read-write",
        element: n,
      });
    }),
    document.querySelectorAll("[data-source]").forEach((e) => {
      const n = e,
        s = n.getAttribute("data-source") || "",
        [r, i] = s.split("#");
      if (!r || !i) return;
      const o = r.indexOf("/"),
        a = o === -1 ? r : r.slice(0, o),
        c = o === -1 ? "/" : r.slice(o),
        l = `${a}${pa(c)}#${i}`;
      t.push({
        type: "consumer",
        elementId: i,
        dataSource: s,
        normalized: l,
        element: n,
      });
    }),
    t.length > 0)
  )
    try {
      console.table(
        t.map((e) => ({
          type: e.type,
          elementId: e.elementId,
          dataSource: e.dataSource,
          normalized: e.normalized,
          permissions: e.permissions || "",
        })),
      );
    } catch {}
  return t;
}
function oy(t) {
  let e = !1,
    n = !1,
    s = !1;
  async function r() {
    if (!s) {
      if (e) {
        n = !0;
        return;
      }
      e = !0;
      try {
        await t();
      } finally {
        ((e = !1), n && !s && ((n = !1), await r()));
      }
    }
  }
  return {
    trigger: r,
    destroy() {
      ((s = !0), (n = !1));
    },
  };
}
function ay(t) {
  const e = () => {
      t.trigger();
    },
    n = () => {
      t.trigger();
    };
  window.addEventListener("popstate", e);
  const s = window.navigation;
  return (
    s &&
      typeof s.addEventListener == "function" &&
      s.addEventListener("navigate", n),
    () => {
      (window.removeEventListener("popstate", e),
        s &&
          typeof s.removeEventListener == "function" &&
          s.removeEventListener("navigate", n));
    }
  );
}
function nu(t) {
  document.dispatchEvent(
    new CustomEvent("playhtml:navigated", { detail: { room: t } }),
  );
}
function xn() {
  return (
    (xn =
      Object.assign ||
      function (t) {
        for (var e = 1; e < arguments.length; e++) {
          var n = arguments[e];
          for (var s in n)
            Object.prototype.hasOwnProperty.call(n, s) && (t[s] = n[s]);
        }
        return t;
      }),
    xn.apply(this, arguments)
  );
}
function cy(t, e) {
  ((t.prototype = Object.create(e.prototype)),
    (t.prototype.constructor = t),
    di(t, e));
}
function di(t, e) {
  return (
    (di =
      Object.setPrototypeOf ||
      function (n, s) {
        return ((n.__proto__ = s), n);
      }),
    di(t, e)
  );
}
function ly(t) {
  if (t === void 0)
    throw new ReferenceError(
      "this hasn't been initialised - super() hasn't been called",
    );
  return t;
}
var su = (function () {
    function t(n) {
      ((this.trigger = n), (this.observing = new Map()));
    }
    var e = t.prototype;
    return (
      (e.registerConnection = function (n) {
        var s = this.observing.get(n.observable);
        (s ||
          ((s = { byKey: new Set(), iterate: !1 }),
          this.observing.set(n.observable, s)),
          n.type === "iterate" ? (s.iterate = !0) : s.byKey.add(n.key));
      }),
      (e.removeObservers = function () {
        var n = this;
        (this.observing.forEach(function (s, r) {
          (s.iterate && r[R].connections.iterate.delete(n),
            s.byKey.forEach(function (i) {
              r[R].connections.byKey.get(i).delete(n);
            }));
        }),
          this.observing.clear());
      }),
      t
    );
  })(),
  mt = [],
  hr = (function (t) {
    cy(e, t);
    function e(s, r, i) {
      var o;
      if (
        ((o =
          t.call(this, function () {
            return o._trigger();
          }) || this),
        (o.func = s),
        (o.options = r),
        (o.effect = i),
        (o.isInitial = !0),
        (o.reaction = function () {
          mt.push(ly(o));
          try {
            o.func();
          } finally {
            mt.pop();
          }
          (o.effect &&
            (!o.isInitial || o.options.fireImmediately) &&
            o.effect(),
            (o.isInitial = !1));
        }),
        !i && !o.options.fireImmediately)
      )
        throw new Error(
          "if no effect function passed, should always fireImmediately",
        );
      return (o.reaction(), o);
    }
    var n = e.prototype;
    return (
      (n._trigger = function () {
        if (mt.includes(this)) throw new Error("already running reaction");
        (this.removeObservers(), this.reaction());
      }),
      e
    );
  })(su);
function ru() {
  return !!mt.length;
}
function iu() {
  return mt.length ? mt[mt.length - 1] : void 0;
}
function uy(t, e, n) {
  var s = xn({ name: "unnamed", fireImmediately: !0 }, n),
    r = new hr(t, s, e);
  return r;
}
var Es = 0;
function ou() {
  return Es > 0;
}
function fi(t) {
  Es++;
  try {
    return t();
  } finally {
    (Es--, Es === 0 && dy());
  }
}
var pi = !1;
function au() {
  return pi;
}
function cu(t) {
  pi = !0;
  try {
    t();
  } finally {
    pi = !1;
  }
}
function hy(t) {
  return function () {
    return cu(t);
  };
}
var gi = [];
function dy() {
  var t = [].concat(gi);
  ((gi = []), lu(t));
}
function lu(t) {
  var e = new Set();
  (t.forEach(function (n) {
    var s;
    ((n.type === "add" || n.type === "delete") &&
      n.observable[R].connections.iterate.forEach(function (r) {
        e.add(r);
      }),
      (s = n.observable[R].connections.byKey.get(n.key)) == null ||
        s.forEach(function (r) {
          e.add(r);
        }));
  }),
    e.forEach(function (n) {
      n.trigger();
    }));
}
function is(t) {
  if (ou()) {
    gi.push(t);
    return;
  }
  lu([t]);
}
function va(t, e) {
  if (t.type === "iterate") t.observable[R].connections.iterate.add(e);
  else {
    var n = t.observable[R].connections.byKey.get(t.key);
    (n || ((n = new Set()), t.observable[R].connections.byKey.set(t.key, n)),
      n.add(e));
  }
}
function os(t, e) {
  if (!au()) {
    var n = iu();
    (n && (va(t, n), n.registerConnection(t)),
      e && (va(t, e), e.registerConnection(t)));
  }
}
var ho = Symbol("$skipreactive"),
  R = Symbol("$reactive"),
  ge = Symbol("$reactiveproxy");
function qn(t, e) {
  return !!(t && t[ge] && t[ge].implicitObserver === e);
}
function fo(t) {
  return ((t[ho] = !0), t);
}
function uu(t) {
  return !!(t && !qn(t) && t[R]);
}
function yi(t, e, n) {
  if ((n === void 0 && (n = !1), t[ho] || qn(t, e))) return t;
  var s = fy(t, n);
  if (!e) return s;
  var r = s[R].proxiesWithImplicitObserver.get(e);
  if (!r) {
    var i = { implicitObserver: e };
    (Object.setPrototypeOf(i, hu),
      (r = new Proxy(s[R].raw, i)),
      s[R].proxiesWithImplicitObserver.set(e, r));
  }
  return r;
}
var In = yi;
function fy(t, e) {
  if ((e === void 0 && (e = !1), qn(t))) return t;
  if (uu(t)) return t[R].proxy;
  if (t[R] || t[ge]) throw new Error("unexpected");
  var n = {
    connections: { iterate: new Set(), byKey: new Map() },
    proxy: {},
    raw: t,
    proxiesWithImplicitObserver: new Map(),
    shallow: e,
  };
  Object.defineProperty(t, R, {
    enumerable: !1,
    writable: !0,
    configurable: !0,
    value: n,
  });
  var s = new Proxy(t, hu);
  return ((n.proxy = s), s);
}
var hu = {
  has: function (t, e) {
    var n = Reflect.has(t, e);
    return (
      typeof e == "symbol" ||
        os({ observable: t, key: e, type: "has" }, this.implicitObserver),
      n
    );
  },
  get: function (t, e, n) {
    if (e === ge) return { implicitObserver: this.implicitObserver };
    var s = Reflect.get(t, e, n);
    if (typeof e == "symbol")
      return (
        e.toString() === "Symbol($reactiveproxy)" &&
          console.error(
            "warning, Symbol($reactiveproxy) passed, but does not match $reactiveproxy. Multiple Reactive libraries loaded?",
          ),
        s
      );
    if (
      (e === "length" && Array.isArray(t)
        ? os({ observable: t, type: "iterate" }, this.implicitObserver)
        : os({ observable: t, key: e, type: "get" }, this.implicitObserver),
      uu(s))
    )
      return yi(s, this.implicitObserver);
    if (t[R].shallow) return s;
    if (
      typeof s == "object" &&
      s !== null &&
      !qn(s, this.implicitObserver) &&
      !Object.isFrozen(s)
    ) {
      var r = Reflect.getOwnPropertyDescriptor(t, e);
      if (
        (!r || !(r.writable === !1 && r.configurable === !1)) &&
        (ru() || this.implicitObserver)
      )
        return yi(s, this.implicitObserver);
    }
    return s;
  },
  ownKeys: function (t) {
    return (
      os({ observable: t, type: "iterate" }, this.implicitObserver),
      Reflect.ownKeys(t)
    );
  },
  set: function (t, e, n, s) {
    return fi(function () {
      if (typeof e == "symbol") return Reflect.set(t, e, n, s);
      var r = Object.hasOwnProperty.call(t, e),
        i = Reflect.get(t, e, s),
        o = Reflect.set(t, e, n, s);
      if (!r) is({ observable: t, key: e, value: n, type: "add" });
      else if (n !== i)
        if (e === "length" && Array.isArray(t)) {
          if (!(i < n))
            for (var a = n + 1; a <= i; a++)
              is({
                observable: t,
                key: "" + (a - 1),
                oldValue: void 0,
                type: "delete",
              });
        } else
          is({ observable: t, key: e, value: n, oldValue: i, type: "update" });
      return o;
    });
  },
  deleteProperty: function (t, e) {
    return fi(function () {
      if (typeof e == "symbol") return Reflect.deleteProperty(t, e);
      var n = Object.hasOwnProperty.call(t, e),
        s = Reflect.get(t, e),
        r = Reflect.deleteProperty(t, e);
      return (
        n && is({ observable: t, key: e, oldValue: s, type: "delete" }),
        r
      );
    });
  },
  preventExtensions: function (t) {
    throw new Error("Dynamic observable objects cannot be frozen");
  },
};
function py(t, e) {
  var n = xn({ name: "unnamed", fireImmediately: !0 }, e),
    s = new hr(t, n);
  return s;
}
function gy(t, e, n) {
  var s = xn({ name: "unnamed", fireImmediately: !0 }, n),
    r = new hr(function () {
      t(e);
    }, s);
  return ((e = In(e, r)), s.fireImmediately && r.trigger(), r);
}
var du = (function () {
  function t() {
    this._observable = In({ _key: 1 });
  }
  var e = t.prototype;
  return (
    (e.reportObserved = function (n) {
      return In(this._observable, n)._key;
    }),
    (e.reportChanged = function () {
      this._observable._key++;
    }),
    t
  );
})();
function yy(t, e, n) {
  return new du();
}
const my = Object.freeze(
  Object.defineProperty(
    {
      __proto__: null,
      $reactive: R,
      $reactiveproxy: ge,
      $skipreactive: ho,
      Atom: du,
      Observer: su,
      Reaction: hr,
      autorun: py,
      autorunAsync: gy,
      createAtom: yy,
      hasRunningReaction: ru,
      isActionRunning: ou,
      isReactive: qn,
      isTrackingDisabled: au,
      markRaw: fo,
      reaction: uy,
      reactive: In,
      runInAction: fi,
      runningReaction: iu,
      untracked: cu,
      untrackedCB: hy,
    },
    Symbol.toStringTag,
    { value: "Module" },
  ),
);
let mi,
  wi,
  wy = (t) => t();
function by(t, e) {
  if (wi) return wi(t, e);
  wy(t);
}
function _t(t, e, n) {
  if (mi) return mi.apply(null, arguments);
  throw new Error(
    "observable implementation not provided. Call enableReactiveBindings, enableVueBindings or enableMobxBindings.",
  );
}
function vy(t) {
  ((mi = function (e, n, s) {
    const r = t.createAtom(e);
    return (n && n(), r);
  }),
    (wi = (e, n) => t.reaction(e, n, { fireImmediately: !1 })));
}
const Ca = new WeakSet();
function Cy(t) {
  if (Ca.has(t)) return t;
  Ca.add(t);
  let e;
  const n = new Map();
  function s() {
    if (!e) {
      const h = (d) => {
        (d.changes.added.size ||
          d.changes.deleted.size ||
          d.changes.keys.size ||
          d.changes.delta.length) &&
          e.reportChanged();
      };
      e = _t(
        "map",
        () => {
          t.observe(h);
        },
        () => {
          t.unobserve(h);
        },
      );
    }
    e.reportObserved(t._implicitObserver);
  }
  function r(h) {
    let d = n.get(h);
    if (!d) {
      const f = (p) => {
        d.reportChanged();
      };
      ((d = _t(
        h + "",
        () => {
          t.observe(f);
        },
        () => {
          t.unobserve(f);
        },
      )),
        n.set(h, d));
    }
    d.reportObserved(t._implicitObserver);
  }
  const i = t.get;
  t.get = function (h) {
    if (typeof h != "number") throw new Error("unexpected");
    return (r(h), Reflect.apply(i, this, arguments));
  };
  function o(h) {
    const d = t[h];
    t[h] = function () {
      return (s(), Reflect.apply(d, this, arguments));
    };
  }
  function a(h) {
    let d = t,
      f = Object.getOwnPropertyDescriptor(d, h);
    if (
      (f ||
        ((d = Object.getPrototypeOf(d)),
        (f = Object.getOwnPropertyDescriptor(d, h))),
      f ||
        ((d = Object.getPrototypeOf(d)),
        (f = Object.getOwnPropertyDescriptor(d, h))),
      !f)
    )
      throw new Error("property not found");
    const p = f.get;
    ((f.get = function () {
      return (this._disableTracking || s(), Reflect.apply(p, this, arguments));
    }),
      Object.defineProperty(t, h, f));
  }
  function c(h, d) {
    let f = t,
      p = Object.getOwnPropertyDescriptor(f, h);
    if (
      (p ||
        ((f = Object.getPrototypeOf(f)),
        (p = Object.getOwnPropertyDescriptor(f, h))),
      p ||
        ((f = Object.getPrototypeOf(f)),
        (p = Object.getOwnPropertyDescriptor(f, h))),
      !p)
    )
      throw new Error("property not found");
    Object.defineProperty(t, d, p);
  }
  (o("forEach"),
    o("toJSON"),
    o("toArray"),
    o("slice"),
    o("map"),
    c("length", "lengthUntracked"),
    a("length"));
  const l = t.push;
  t.push = function (h) {
    this._disableTracking = !0;
    const d = l.call(this, h);
    return ((this._disableTracking = !1), d);
  };
  const u = t.slice;
  return (
    (t.slice = function (h, d) {
      this._disableTracking = !0;
      const f = u.call(this, h, d);
      return ((this._disableTracking = !1), f);
    }),
    t
  );
}
const Sa = new WeakSet();
function Sy(t) {
  if (Sa.has(t)) return t;
  Sa.add(t);
  let e;
  function n() {
    if (!e) {
      let i = Array.from(t.share.keys());
      const o = (a) => {
        const c = Array.from(t.share.keys());
        JSON.stringify(i) !== JSON.stringify(c) && ((i = c), e.reportChanged());
      };
      e = _t(
        "map",
        () => {
          t.on("beforeObserverCalls", o);
        },
        () => {
          t.off("beforeObserverCalls", o);
        },
      );
    }
    e.reportObserved(t._implicitObserver);
  }
  const s = t.get;
  t.get = function (i) {
    if (typeof i != "string") throw new Error("unexpected");
    const o = Reflect.apply(s, this, arguments);
    return (dr(o), o);
  };
  function r(i) {
    const o = t[i];
    let a;
    t[i] = function () {
      let c,
        l = arguments;
      return (
        n(),
        a && a.removeObservers(),
        (a = by(
          () => ((c = Reflect.apply(o, t, l)), c),
          () => e.reportChanged(),
        )),
        c
      );
    };
  }
  return (
    r("toJSON"),
    Object.defineProperty(t, "keys", {
      get: () => (n(), Object.keys(t.share)),
    }),
    t
  );
}
const _a = new WeakSet();
function _y(t) {
  if (_a.has(t)) return t;
  _a.add(t);
  let e;
  const n = new Map();
  function s() {
    if (!e) {
      const a = (c) => {
        (c.changes.added.size ||
          c.changes.deleted.size ||
          c.changes.keys.size ||
          c.changes.delta.length) &&
          e.reportChanged();
      };
      e = _t(
        "map",
        () => {
          t.observe(a);
        },
        () => {
          t.unobserve(a);
        },
      );
    }
    e.reportObserved(t._implicitObserver);
  }
  function r(a) {
    let c = n.get(a);
    if (!c) {
      const l = (u) => {
        u.keysChanged.has(a) &&
          (u.changes.added.size ||
            u.changes.deleted.size ||
            u.changes.keys.size ||
            u.changes.delta.length) &&
          c.reportChanged();
      };
      ((c = _t(
        a,
        () => {
          t.observe(l);
        },
        () => {
          t.unobserve(l);
        },
      )),
        n.set(a, c));
    }
    c.reportObserved(t._implicitObserver);
  }
  const i = t.get;
  t.get = function (a) {
    if (typeof a != "string") throw new Error("unexpected");
    return (r(a), Reflect.apply(i, this, arguments));
  };
  function o(a) {
    const c = t[a];
    t[a] = function () {
      return (s(), Reflect.apply(c, this, arguments));
    };
  }
  return (o("values"), o("entries"), o("keys"), o("forEach"), o("toJSON"), t);
}
const Ea = new WeakSet();
function Ey(t) {
  if (Ea.has(t)) return t;
  Ea.add(t);
  let e;
  const n = (r) => {
    e.reportChanged();
  };
  e = _t(
    "text",
    () => {
      t.observe(n);
    },
    () => {
      t.unobserve(n);
    },
  );
  function s(r) {
    const i = t[r];
    t[r] = function () {
      return (
        e.reportObserved(this._implicitObserver),
        Reflect.apply(i, this, arguments)
      );
    };
  }
  return (s("toString"), s("toJSON"), t);
}
const ka = new WeakSet();
function ky(t) {
  if (ka.has(t)) return t;
  ka.add(t);
  let e;
  const n = (i) => {
    (i.changes.added.size ||
      i.changes.deleted.size ||
      i.changes.keys.size ||
      i.changes.delta.length) &&
      e.reportChanged();
  };
  e = _t(
    "xml",
    () => {
      t.observe(n);
    },
    () => {
      t.unobserve(n);
    },
  );
  function s(i) {
    const o = t[i];
    t[i] = function () {
      return (
        e.reportObserved(this._implicitObserver),
        Reflect.apply(o, this, arguments)
      );
    };
  }
  function r(i) {
    let o = t,
      a = Object.getOwnPropertyDescriptor(o, i);
    if (
      (a ||
        ((o = Object.getPrototypeOf(o)),
        (a = Object.getOwnPropertyDescriptor(o, i))),
      a ||
        ((o = Object.getPrototypeOf(o)),
        (a = Object.getOwnPropertyDescriptor(o, i))),
      !a)
    )
      throw new Error("property not found");
    const c = a.get;
    ((a.get = function () {
      return (
        e.reportObserved(this._implicitObserver),
        Reflect.apply(c, this, arguments)
      );
    }),
      Object.defineProperty(t, i, a));
  }
  return (
    s("toString"),
    s("toDOM"),
    s("toArray"),
    s("getAttribute"),
    r("firstChild"),
    t
  );
}
function dr(t) {
  return t instanceof Ct || t instanceof Be
    ? Ey(t)
    : t instanceof Le
      ? Cy(t)
      : t instanceof Ne
        ? _y(t)
        : t instanceof Ae || Object.prototype.hasOwnProperty.call(t, "autoLoad")
          ? Sy(t)
          : t instanceof Re || t instanceof qe
            ? ky(t)
            : t;
}
function Aa(t) {
  t.share.forEach((e) => {
    e.constructor !== L && dr(e);
  });
}
function xa(t, e) {
  for (let s = t.length - 1; s >= e; s--) {
    let r = t[s];
    if (!r.deleted) {
      var n;
      if (r instanceof ce) continue;
      (n = r.content) == null ||
        n.getContent().forEach((i) => {
          i instanceof L && dr(i);
        });
    }
  }
}
const Ia = new WeakSet();
function Ay(t) {
  Ia.has(t) ||
    (Ia.add(t),
    dr(t),
    t.store.clients.forEach((e) => {
      e && xa(e, 0);
    }),
    Aa(t),
    t.on("beforeObserverCalls", (e) => {
      (Aa(t),
        e.afterState.forEach((n, s) => {
          const r = e.beforeState.get(s) || 0;
          if (r !== n) {
            const i = e.doc.store.clients.get(s);
            if (!i) return;
            const o = Ee(i, r);
            xa(i, o);
          }
        }));
    }));
}
class $n {
  constructor(e) {
    ((this.value = void 0), (this.value = e));
  }
}
function xy(t) {
  return ArrayBuffer.isView(t) ? new $n(t) : new $n(Object.freeze(t));
}
function Iy(t) {
  const e = function () {
      var o;
      let a = (o = this[ge]) == null ? void 0 : o.implicitObserver;
      return (
        (t._implicitObserver = a),
        t.slice
          .bind(t)
          .apply(t, arguments)
          .map((c) => {
            const l = fr(c, a);
            return a && typeof l == "object" ? In(l, a) : l;
          })
      );
    },
    n = function (o) {
      return o.map((a) => {
        const c = po(a);
        let l = ke(c) || c;
        if ((l instanceof $n && (l = l.value), l instanceof L && l.parent))
          throw new Error(
            "Not supported: reassigning object that already occurs in the tree.",
          );
        return l;
      });
    },
    s = function () {
      return [].findIndex.apply(e.apply(this), arguments);
    },
    r = {
      slice: e,
      unshift: (...o) => (t.unshift(n(o)), t.lengthUntracked),
      push: (...o) => (t.push(n(o)), t.lengthUntracked),
      insert: t.insert.bind(t),
      toJSON: t.toJSON.bind(t),
      forEach: function () {
        return [].forEach.apply(e.apply(this), arguments);
      },
      every: function () {
        return [].every.apply(e.apply(this), arguments);
      },
      filter: function () {
        return [].filter.apply(e.apply(this), arguments);
      },
      find: function () {
        return [].find.apply(e.apply(this), arguments);
      },
      findIndex: s,
      some: function () {
        return [].some.apply(e.apply(this), arguments);
      },
      includes: function () {
        return [].includes.apply(e.apply(this), arguments);
      },
      map: function () {
        return [].map.apply(e.apply(this), arguments);
      },
      indexOf: function () {
        const o = arguments[0];
        return s.call(this, (a) => My(a, o));
      },
      splice: function () {
        let o =
            arguments[0] < 0 ? t.length - Math.abs(arguments[0]) : arguments[0],
          a = arguments[1],
          c = Array.from(Array.from(arguments).slice(2)),
          l = e.apply(this, [o, Number.isInteger(a) ? o + a : void 0]);
        return (
          t.doc
            ? t.doc.transact(() => {
                (t.delete(o, a), t.insert(o, n(c)));
              })
            : (t.delete(o, a), t.insert(o, n(c))),
          l
        );
      },
    },
    i = [];
  for (let o in r) i[o] = r[o];
  return i;
}
function sn(t) {
  if (typeof t == "string" && t.trim().length) {
    const e = Number(t);
    if (Number.isInteger(e)) return e;
  }
  return t;
}
function $a(t, e = new Le()) {
  if (e[R]) throw new Error("unexpected");
  const n = Iy(e),
    s = new Proxy(n, {
      set: (r, i, o) => {
        throw typeof sn(i) != "number"
          ? new Error()
          : new Error("array assignment is not implemented / supported");
      },
      get: (r, i, o) => {
        const a = sn(i);
        if (a === pr) return e;
        if (typeof a == "number") {
          let l;
          if (o && o[ge]) {
            var c;
            ((l = (c = o[ge]) == null ? void 0 : c.implicitObserver),
              (e._implicitObserver = l));
          }
          let u = e.get(a);
          return ((u = fr(u, l)), u);
        }
        if (a === Symbol.toStringTag) return "Array";
        if (a === Symbol.iterator) {
          const l = e.slice();
          return Reflect.get(l, a);
        }
        return a === "length" ? e.length : Reflect.get(r, a, o);
      },
      deleteProperty: (r, i) => {
        const o = sn(i);
        if (typeof o != "number") throw new Error();
        return o < e.lengthUntracked && o >= 0 ? (e.delete(o), !0) : !1;
      },
      has: (r, i) => {
        const o = sn(i);
        return typeof o != "number"
          ? Reflect.has(r, o)
          : o < e.lengthUntracked && o >= 0;
      },
      getOwnPropertyDescriptor(r, i) {
        const o = sn(i);
        if (o === "length")
          return { enumerable: !1, configurable: !1, writable: !0 };
        if (typeof o == "number" && o >= 0 && o < e.lengthUntracked)
          return { enumerable: !0, configurable: !0, writable: !0 };
      },
      ownKeys: (r) => {
        const i = [];
        for (let o = 0; o < e.length; o++) i.push(o + "");
        return (i.push("length"), i);
      },
    });
  return (n.push.apply(s, t), s);
}
function Da(t, e = new Ne()) {
  if (e[R]) throw new Error("unexpected");
  const n = new Proxy(
    {},
    {
      set: (s, r, i) => {
        if (typeof r != "string") throw new Error();
        const o = po(i);
        let a = ke(o) || o;
        if ((a instanceof $n && (a = a.value), a instanceof L && a.parent))
          throw new Error(
            "Not supported: reassigning object that already occurs in the tree.",
          );
        return (e.set(r, a), !0);
      },
      get: (s, r, i) => {
        if (r === pr) return e;
        if (typeof r != "string") return Reflect.get(s, r);
        let o;
        if (i && i[ge]) {
          var a;
          ((o = (a = i[ge]) == null ? void 0 : a.implicitObserver),
            (e._implicitObserver = o));
        }
        let c = e.get(r);
        return ((c = fr(c, o)), c);
      },
      deleteProperty: (s, r) => {
        if (typeof r != "string") throw new Error();
        return e.has(r) ? (e.delete(r), !0) : !1;
      },
      has: (s, r) => !!(typeof r == "string" && e.has(r)),
      getOwnPropertyDescriptor(s, r) {
        if (typeof r == "string" && e.has(r))
          return { enumerable: !0, configurable: !0 };
      },
      ownKeys: (s) => Array.from(e.keys()),
    },
  );
  pn.set(e, n);
  for (let s in t) n[s] = t[s];
  return n;
}
function $y(t) {
  return t instanceof L;
}
const pn = new WeakMap();
function fr(t, e) {
  if ($y(t)) {
    if (((t._implicitObserver = e), t instanceof Le || t instanceof Ne)) {
      if (!pn.has(t)) {
        const n = po(t);
        pn.set(t, n);
      }
      t = pn.get(t);
    } else if (
      t instanceof qe ||
      t instanceof Re ||
      t instanceof Ct ||
      t instanceof Vt ||
      t instanceof Be
    )
      (fo(t), (t.__v_skip = !0));
    else throw new Error("unknown YType");
    return t;
  } else {
    if (t === null) return null;
    if (typeof t == "object") return xy(t);
  }
  return t;
}
function po(t) {
  if (t == null) return t;
  if (((t = ke(t) || t), t instanceof Le)) return $a([], t);
  if (t instanceof Ne) return Da({}, t);
  if (typeof t == "string") return t;
  if (Array.isArray(t)) return $a(t);
  if (
    t instanceof qe ||
    t instanceof Re ||
    t instanceof Ct ||
    t instanceof Vt ||
    t instanceof Be
  )
    return t;
  if (typeof t == "object") return t instanceof $n ? t : Da(t);
  if (typeof t == "number" || typeof t == "boolean") return t;
  throw new Error("invalid");
}
function Dy(t) {
  for (let [e, n] of Object.entries(t))
    if (Array.isArray(n)) {
      if (n.length !== 0)
        throw new Error("Root Array initializer must always be empty array");
    } else if (n && typeof n == "object") {
      if (
        Object.keys(n).length !== 0 ||
        Object.getPrototypeOf(n) !== Object.prototype
      )
        throw new Error("Root Object initializer must always be {}");
    } else if (n !== "xml" && n !== "text")
      throw new Error("unknown Root initializer");
}
function La(t, e, n) {
  let s = e[n];
  if (!s) {
    n !== "__v_raw" &&
      n !== "__v_isRef" &&
      n !== "__v_isReadonly" &&
      console.warn("property not found on root doc", n);
    return;
  }
  return s === "xml"
    ? t.getXmlFragment(n)
    : s === "text"
      ? t.getText(n)
      : Array.isArray(s)
        ? t.getArray(n)
        : t.getMap(n);
}
function Ly(t, e) {
  if (t[R]) throw new Error("unexpected");
  Dy(e);
  const n = new Proxy(
    {},
    {
      set: (s, r, i) => {
        throw typeof r != "string"
          ? new Error()
          : new Error("cannot set new elements on root doc");
      },
      get: (s, r, i) => {
        if (r === pr) return t;
        if (typeof r != "string") return Reflect.get(s, r);
        let o;
        if (i && i[ge]) {
          var a;
          ((o = (a = i[ge]) == null ? void 0 : a.implicitObserver),
            (t._implicitObserver = o));
        }
        if (r === "toJSON") {
          for (let l of Object.keys(e)) La(t, e, l);
          return Reflect.get(t, r);
        }
        let c = La(t, e, r);
        return ((c = fr(c, o)), c);
      },
      deleteProperty: (s, r) => {
        throw new Error("deleteProperty not available for doc");
      },
      has: (s, r) => !!(typeof r == "string" && t.share.has(r)),
      getOwnPropertyDescriptor(s, r) {
        if ((typeof r == "string" && t.share.has(r)) || r === "toJSON")
          return { enumerable: !0, configurable: !0 };
      },
      ownKeys: (s) => Array.from(t.share.keys()),
    },
  );
  return (pn.set(t, n), n);
}
vy(my);
const pr = Symbol("INTERNAL_SYMBOL");
function fu(t) {
  const e = ke(t);
  if (!(e instanceof Ae))
    throw new Error("store is not a valid syncedStore that maps to a Y.Doc");
  return e;
}
function ke(t) {
  if (typeof t != "object" || t === null) return;
  const e = t[pr];
  return (e && (fo(e), (e.__v_skip = !0)), e);
}
function My(t, e) {
  if (t === e) return !0;
  if (typeof t == "object" && typeof e == "object") {
    const n = ke(t),
      s = ke(e);
    return !n || !s ? !1 : n === s;
  }
  return !1;
}
function pu(t, e = new Ae()) {
  return (Ay(e), Ly(e, t));
}
const go = globalThis,
  Ma = (t) => t,
  zs = go.trustedTypes,
  Ta = zs ? zs.createPolicy("lit-html", { createHTML: (t) => t }) : void 0,
  gu = "$lit$",
  Ze = `lit$${Math.random().toFixed(9).slice(2)}$`,
  yu = "?" + Ze,
  Ty = `<${yu}>`,
  Et = document,
  Dn = () => Et.createComment(""),
  Ln = (t) => t === null || (typeof t != "object" && typeof t != "function"),
  yo = Array.isArray,
  Py = (t) => yo(t) || typeof t?.[Symbol.iterator] == "function",
  Rr = `[ 	
\f\r]`,
  rn = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,
  Pa = /-->/g,
  Oa = />/g,
  lt = RegExp(
    `>|${Rr}(?:([^\\s"'>=/]+)(${Rr}*=${Rr}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,
    "g",
  ),
  Na = /'/g,
  Ra = /"/g,
  mu = /^(?:script|style|textarea|title)$/i,
  Mn = Symbol.for("lit-noChange"),
  H = Symbol.for("lit-nothing"),
  ja = new WeakMap(),
  ft = Et.createTreeWalker(Et, 129);
function wu(t, e) {
  if (!yo(t) || !t.hasOwnProperty("raw"))
    throw Error("invalid template strings array");
  return Ta !== void 0 ? Ta.createHTML(e) : e;
}
const Oy = (t, e) => {
  const n = t.length - 1,
    s = [];
  let r,
    i = e === 2 ? "<svg>" : e === 3 ? "<math>" : "",
    o = rn;
  for (let a = 0; a < n; a++) {
    const c = t[a];
    let l,
      u,
      h = -1,
      d = 0;
    for (; d < c.length && ((o.lastIndex = d), (u = o.exec(c)), u !== null); )
      ((d = o.lastIndex),
        o === rn
          ? u[1] === "!--"
            ? (o = Pa)
            : u[1] !== void 0
              ? (o = Oa)
              : u[2] !== void 0
                ? (mu.test(u[2]) && (r = RegExp("</" + u[2], "g")), (o = lt))
                : u[3] !== void 0 && (o = lt)
          : o === lt
            ? u[0] === ">"
              ? ((o = r ?? rn), (h = -1))
              : u[1] === void 0
                ? (h = -2)
                : ((h = o.lastIndex - u[2].length),
                  (l = u[1]),
                  (o = u[3] === void 0 ? lt : u[3] === '"' ? Ra : Na))
            : o === Ra || o === Na
              ? (o = lt)
              : o === Pa || o === Oa
                ? (o = rn)
                : ((o = lt), (r = void 0)));
    const f = o === lt && t[a + 1].startsWith("/>") ? " " : "";
    i +=
      o === rn
        ? c + Ty
        : h >= 0
          ? (s.push(l), c.slice(0, h) + gu + c.slice(h) + Ze + f)
          : c + Ze + (h === -2 ? a : f);
  }
  return [
    wu(
      t,
      i + (t[n] || "<?>") + (e === 2 ? "</svg>" : e === 3 ? "</math>" : ""),
    ),
    s,
  ];
};
class Tn {
  constructor({ strings: e, _$litType$: n }, s) {
    let r;
    this.parts = [];
    let i = 0,
      o = 0;
    const a = e.length - 1,
      c = this.parts,
      [l, u] = Oy(e, n);
    if (
      ((this.el = Tn.createElement(l, s)),
      (ft.currentNode = this.el.content),
      n === 2 || n === 3)
    ) {
      const h = this.el.content.firstChild;
      h.replaceWith(...h.childNodes);
    }
    for (; (r = ft.nextNode()) !== null && c.length < a; ) {
      if (r.nodeType === 1) {
        if (r.hasAttributes())
          for (const h of r.getAttributeNames())
            if (h.endsWith(gu)) {
              const d = u[o++],
                f = r.getAttribute(h).split(Ze),
                p = /([.?@])?(.*)/.exec(d);
              (c.push({
                type: 1,
                index: i,
                name: p[2],
                strings: f,
                ctor:
                  p[1] === "."
                    ? Ry
                    : p[1] === "?"
                      ? jy
                      : p[1] === "@"
                        ? Uy
                        : gr,
              }),
                r.removeAttribute(h));
            } else
              h.startsWith(Ze) &&
                (c.push({ type: 6, index: i }), r.removeAttribute(h));
        if (mu.test(r.tagName)) {
          const h = r.textContent.split(Ze),
            d = h.length - 1;
          if (d > 0) {
            r.textContent = zs ? zs.emptyScript : "";
            for (let f = 0; f < d; f++)
              (r.append(h[f], Dn()),
                ft.nextNode(),
                c.push({ type: 2, index: ++i }));
            r.append(h[d], Dn());
          }
        }
      } else if (r.nodeType === 8)
        if (r.data === yu) c.push({ type: 2, index: i });
        else {
          let h = -1;
          for (; (h = r.data.indexOf(Ze, h + 1)) !== -1; )
            (c.push({ type: 7, index: i }), (h += Ze.length - 1));
        }
      i++;
    }
  }
  static createElement(e, n) {
    const s = Et.createElement("template");
    return ((s.innerHTML = e), s);
  }
}
function Yt(t, e, n = t, s) {
  if (e === Mn) return e;
  let r = s !== void 0 ? n._$Co?.[s] : n._$Cl;
  const i = Ln(e) ? void 0 : e._$litDirective$;
  return (
    r?.constructor !== i &&
      (r?._$AO?.(!1),
      i === void 0 ? (r = void 0) : ((r = new i(t)), r._$AT(t, n, s)),
      s !== void 0 ? ((n._$Co ??= [])[s] = r) : (n._$Cl = r)),
    r !== void 0 && (e = Yt(t, r._$AS(t, e.values), r, s)),
    e
  );
}
class Ny {
  constructor(e, n) {
    ((this._$AV = []), (this._$AN = void 0), (this._$AD = e), (this._$AM = n));
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(e) {
    const {
        el: { content: n },
        parts: s,
      } = this._$AD,
      r = (e?.creationScope ?? Et).importNode(n, !0);
    ft.currentNode = r;
    let i = ft.nextNode(),
      o = 0,
      a = 0,
      c = s[0];
    for (; c !== void 0; ) {
      if (o === c.index) {
        let l;
        (c.type === 2
          ? (l = new Vn(i, i.nextSibling, this, e))
          : c.type === 1
            ? (l = new c.ctor(i, c.name, c.strings, this, e))
            : c.type === 6 && (l = new Hy(i, this, e)),
          this._$AV.push(l),
          (c = s[++a]));
      }
      o !== c?.index && ((i = ft.nextNode()), o++);
    }
    return ((ft.currentNode = Et), r);
  }
  p(e) {
    let n = 0;
    for (const s of this._$AV)
      (s !== void 0 &&
        (s.strings !== void 0
          ? (s._$AI(e, s, n), (n += s.strings.length - 2))
          : s._$AI(e[n])),
        n++);
  }
}
class Vn {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(e, n, s, r) {
    ((this.type = 2),
      (this._$AH = H),
      (this._$AN = void 0),
      (this._$AA = e),
      (this._$AB = n),
      (this._$AM = s),
      (this.options = r),
      (this._$Cv = r?.isConnected ?? !0));
  }
  get parentNode() {
    let e = this._$AA.parentNode;
    const n = this._$AM;
    return (n !== void 0 && e?.nodeType === 11 && (e = n.parentNode), e);
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(e, n = this) {
    ((e = Yt(this, e, n)),
      Ln(e)
        ? e === H || e == null || e === ""
          ? (this._$AH !== H && this._$AR(), (this._$AH = H))
          : e !== this._$AH && e !== Mn && this._(e)
        : e._$litType$ !== void 0
          ? this.$(e)
          : e.nodeType !== void 0
            ? this.T(e)
            : Py(e)
              ? this.k(e)
              : this._(e));
  }
  O(e) {
    return this._$AA.parentNode.insertBefore(e, this._$AB);
  }
  T(e) {
    this._$AH !== e && (this._$AR(), (this._$AH = this.O(e)));
  }
  _(e) {
    (this._$AH !== H && Ln(this._$AH)
      ? (this._$AA.nextSibling.data = e)
      : this.T(Et.createTextNode(e)),
      (this._$AH = e));
  }
  $(e) {
    const { values: n, _$litType$: s } = e,
      r =
        typeof s == "number"
          ? this._$AC(e)
          : (s.el === void 0 &&
              (s.el = Tn.createElement(wu(s.h, s.h[0]), this.options)),
            s);
    if (this._$AH?._$AD === r) this._$AH.p(n);
    else {
      const i = new Ny(r, this),
        o = i.u(this.options);
      (i.p(n), this.T(o), (this._$AH = i));
    }
  }
  _$AC(e) {
    let n = ja.get(e.strings);
    return (n === void 0 && ja.set(e.strings, (n = new Tn(e))), n);
  }
  k(e) {
    yo(this._$AH) || ((this._$AH = []), this._$AR());
    const n = this._$AH;
    let s,
      r = 0;
    for (const i of e)
      (r === n.length
        ? n.push((s = new Vn(this.O(Dn()), this.O(Dn()), this, this.options)))
        : (s = n[r]),
        s._$AI(i),
        r++);
    r < n.length && (this._$AR(s && s._$AB.nextSibling, r), (n.length = r));
  }
  _$AR(e = this._$AA.nextSibling, n) {
    for (this._$AP?.(!1, !0, n); e !== this._$AB; ) {
      const s = Ma(e).nextSibling;
      (Ma(e).remove(), (e = s));
    }
  }
  setConnected(e) {
    this._$AM === void 0 && ((this._$Cv = e), this._$AP?.(e));
  }
}
class gr {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(e, n, s, r, i) {
    ((this.type = 1),
      (this._$AH = H),
      (this._$AN = void 0),
      (this.element = e),
      (this.name = n),
      (this._$AM = r),
      (this.options = i),
      s.length > 2 || s[0] !== "" || s[1] !== ""
        ? ((this._$AH = Array(s.length - 1).fill(new String())),
          (this.strings = s))
        : (this._$AH = H));
  }
  _$AI(e, n = this, s, r) {
    const i = this.strings;
    let o = !1;
    if (i === void 0)
      ((e = Yt(this, e, n, 0)),
        (o = !Ln(e) || (e !== this._$AH && e !== Mn)),
        o && (this._$AH = e));
    else {
      const a = e;
      let c, l;
      for (e = i[0], c = 0; c < i.length - 1; c++)
        ((l = Yt(this, a[s + c], n, c)),
          l === Mn && (l = this._$AH[c]),
          (o ||= !Ln(l) || l !== this._$AH[c]),
          l === H ? (e = H) : e !== H && (e += (l ?? "") + i[c + 1]),
          (this._$AH[c] = l));
    }
    o && !r && this.j(e);
  }
  j(e) {
    e === H
      ? this.element.removeAttribute(this.name)
      : this.element.setAttribute(this.name, e ?? "");
  }
}
class Ry extends gr {
  constructor() {
    (super(...arguments), (this.type = 3));
  }
  j(e) {
    this.element[this.name] = e === H ? void 0 : e;
  }
}
class jy extends gr {
  constructor() {
    (super(...arguments), (this.type = 4));
  }
  j(e) {
    this.element.toggleAttribute(this.name, !!e && e !== H);
  }
}
class Uy extends gr {
  constructor(e, n, s, r, i) {
    (super(e, n, s, r, i), (this.type = 5));
  }
  _$AI(e, n = this) {
    if ((e = Yt(this, e, n, 0) ?? H) === Mn) return;
    const s = this._$AH,
      r =
        (e === H && s !== H) ||
        e.capture !== s.capture ||
        e.once !== s.once ||
        e.passive !== s.passive,
      i = e !== H && (s === H || r);
    (r && this.element.removeEventListener(this.name, this, s),
      i && this.element.addEventListener(this.name, this, e),
      (this._$AH = e));
  }
  handleEvent(e) {
    typeof this._$AH == "function"
      ? this._$AH.call(this.options?.host ?? this.element, e)
      : this._$AH.handleEvent(e);
  }
}
class Hy {
  constructor(e, n, s) {
    ((this.element = e),
      (this.type = 6),
      (this._$AN = void 0),
      (this._$AM = n),
      (this.options = s));
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(e) {
    Yt(this, e);
  }
}
const Fy = go.litHtmlPolyfillSupport;
(Fy?.(Tn, Vn), (go.litHtmlVersions ??= []).push("3.3.3"));
const zy = (t, e, n) => {
    const s = e;
    let r = s._$litPart$;
    return (
      r === void 0 &&
        (s._$litPart$ = r =
          new Vn(e.insertBefore(Dn(), null), null, void 0, {})),
      r._$AI(t),
      r
    );
  },
  Ua = (t, e = 300) => {
    let n;
    return function (...s) {
      (clearTimeout(n), (n = setTimeout(() => t.apply(this, s), e)));
    };
  };
class Wy {
  defaultData;
  localData;
  awareness = [];
  awarenessByStableId = new Map();
  selfAwareness;
  element;
  _data;
  onChange;
  onAwarenessChange;
  debouncedOnChange;
  resetShortcut;
  updateElement;
  view;
  updateElementAwareness;
  triggerAwarenessUpdate;
  devMode;
  isRendering = !1;
  onUnmount;
  onAfterRender;
  descendantObserver;
  dataUpdateListeners = new Set();
  scheduleSetupDataWrite;
  clickListener;
  touchStartListener;
  mouseDownListener;
  resetShortcutListener;
  activeDragCleanup;
  onClick;
  onDrag;
  onDragStart;
  constructor(e, n = {}) {
    const {
      element: s,
      onChange: r,
      onAwarenessChange: i,
      defaultData: o,
      defaultLocalData: a,
      myDefaultAwareness: c,
      data: l,
      awareness: u,
      updateElement: h,
      view: d,
      updateElementAwareness: f,
      onMount: p,
      debounceMs: g,
      triggerAwarenessUpdate: b,
      devMode: m,
    } = e;
    ((this.scheduleSetupDataWrite = n.scheduleSetupDataWrite),
      (this.element = s),
      (this.view = d),
      (this.devMode = m),
      (this.defaultData = o instanceof Function ? o(s) : o),
      (this.localData = a instanceof Function ? a(s) : a),
      (this.triggerAwarenessUpdate = b),
      (this.onChange = r),
      (this.debouncedOnChange = Ua(this.onChange, g)),
      (this.onAwarenessChange = i),
      (this.updateElement = h),
      (this.updateElementAwareness = f));
    const C = l === void 0 ? this.defaultData : l;
    u !== void 0 && (this.awareness = u);
    const v = c instanceof Function ? c(s) : c;
    if (
      (v !== void 0 && this.setMyAwareness(v),
      (this._data = C),
      (this.__data = C),
      this.reinitializeElementData(e),
      p)
    ) {
      const _ = p(this.getSetupData());
      typeof _ == "function" && (this.onUnmount = _);
    }
  }
  destroy() {
    (this.descendantObserver?.disconnect(),
      (this.descendantObserver = void 0),
      this.clickListener &&
        (this.element.removeEventListener("click", this.clickListener),
        (this.clickListener = void 0)),
      this.touchStartListener &&
        (this.element.removeEventListener(
          "touchstart",
          this.touchStartListener,
        ),
        (this.touchStartListener = void 0)),
      this.mouseDownListener &&
        (this.element.removeEventListener("mousedown", this.mouseDownListener),
        (this.mouseDownListener = void 0)),
      this.resetShortcutListener &&
        (this.element.removeEventListener("click", this.resetShortcutListener),
        (this.resetShortcutListener = void 0)),
      this.removeActiveDragListeners(),
      (this.onClick = void 0),
      (this.onDrag = void 0),
      (this.onDragStart = void 0),
      (this.resetShortcut = void 0));
    const e = this.onUnmount;
    if (((this.onUnmount = void 0), e))
      try {
        e();
      } catch (n) {
        console.error(
          `[playhtml] onMount cleanup for "${this.element.id}" threw`,
          n,
        );
      }
  }
  reinitializeElementData({
    element: e,
    onChange: n,
    onAwarenessChange: s,
    updateElement: r,
    view: i,
    updateElementAwareness: o,
    onClick: a,
    onDrag: c,
    onDragStart: l,
    resetShortcut: u,
    debounceMs: h,
    triggerAwarenessUpdate: d,
    devMode: f,
  }) {
    ((this.triggerAwarenessUpdate = d),
      (this.onChange = n),
      (this.debouncedOnChange = Ua(this.onChange, h)),
      (this.onAwarenessChange = s),
      (this.updateElement = r),
      (this.view = i),
      (this.devMode = f),
      i &&
        this.updateElement &&
        (console.error(
          `[playhtml] "${e.id}" provides both \`view\` and \`updateElement\`. They are mutually exclusive — \`view\` is used and \`updateElement\` is ignored.`,
        ),
        (this.updateElement = void 0)),
      i &&
        (a || c || l) &&
        (console.error(
          `[playhtml] "${e.id}" provides a \`view\` alongside onClick/onDrag/onDragStart. In view mode these are ignored — attach events inside the template (e.g. @click). `,
        ),
        (a = void 0),
        (c = void 0),
        (l = void 0)),
      this.setEventHandlers({ onClick: a, onDrag: c, onDragStart: l }),
      u &&
        !this.resetShortcutListener &&
        ((e.reset = this.reset),
        (this.resetShortcutListener = (p) => {
          switch (this.resetShortcut) {
            case "ctrlKey":
              if (!p.ctrlKey) return;
              break;
            case "altKey":
              if (!p.altKey) return;
              break;
            case "shiftKey":
              if (!p.shiftKey) return;
              break;
            case "metaKey":
              if (!p.metaKey) return;
              break;
            default:
              return;
          }
          (this.reset(), p.preventDefault(), p.stopPropagation());
        }),
        e.addEventListener("click", this.resetShortcutListener)),
      (this.resetShortcut = u));
  }
  setEventHandlers({ onClick: e, onDrag: n, onDragStart: s }) {
    const r = this.element,
      i = !!(this.onDrag || this.onDragStart);
    if (this.view) {
      (i && this.removeActiveDragListeners(),
        (this.onClick = void 0),
        (this.onDrag = void 0),
        (this.onDragStart = void 0));
      return;
    }
    const o = !!(n || s);
    (i && !o && this.removeActiveDragListeners(),
      e &&
        !this.clickListener &&
        ((this.clickListener = (a) => {
          this.onClick?.(a, this.getEventHandlerData());
        }),
        r.addEventListener("click", this.clickListener)),
      o &&
        !this.touchStartListener &&
        ((this.touchStartListener = (a) => {
          if (!this.onDrag && !this.onDragStart) return;
          (a.preventDefault(),
            this.removeActiveDragListeners(),
            r.classList.add("cursordown"),
            this.onDragStart?.(a, this.getEventHandlerData()));
          const c = (u) => {
              (u.preventDefault(),
                this.onDrag?.(u, this.getEventHandlerData()));
            },
            l = () => {
              (r.classList.remove("cursordown"),
                document.removeEventListener("touchmove", c),
                document.removeEventListener("touchend", l),
                this.activeDragCleanup === l &&
                  (this.activeDragCleanup = void 0));
            };
          ((this.activeDragCleanup = l),
            document.addEventListener("touchmove", c),
            document.addEventListener("touchend", l));
        }),
        r.addEventListener("touchstart", this.touchStartListener)),
      o &&
        !this.mouseDownListener &&
        ((this.mouseDownListener = (a) => {
          if (!this.onDrag && !this.onDragStart) return;
          (a.preventDefault(),
            this.removeActiveDragListeners(),
            this.onDragStart?.(a, this.getEventHandlerData()),
            r.classList.add("cursordown"));
          const c = (u) => {
              (u.preventDefault(),
                this.onDrag?.(u, this.getEventHandlerData()));
            },
            l = () => {
              (r.classList.remove("cursordown"),
                document.removeEventListener("mousemove", c),
                document.removeEventListener("mouseup", l),
                this.activeDragCleanup === l &&
                  (this.activeDragCleanup = void 0));
            };
          ((this.activeDragCleanup = l),
            document.addEventListener("mousemove", c),
            document.addEventListener("mouseup", l));
        }),
        r.addEventListener("mousedown", this.mouseDownListener)),
      (this.onClick = e),
      (this.onDrag = n),
      (this.onDragStart = s));
  }
  removeActiveDragListeners() {
    (this.activeDragCleanup?.(),
      (this.activeDragCleanup = void 0),
      this.element.classList.remove("cursordown"));
  }
  get data() {
    return this._data;
  }
  onDataUpdate(e) {
    return (
      this.dataUpdateListeners.add(e),
      () => {
        this.dataUpdateListeners.delete(e);
      }
    );
  }
  setLocalData(e) {
    this.rejectWriteDuringRender("setLocalData") ||
      (typeof e == "function" ? e(this.localData) : (this.localData = e),
      this.view && this.render());
  }
  set __data(e) {
    ((this._data = e), this.render());
    for (const n of this.dataUpdateListeners) n();
  }
  render() {
    if (this.view) {
      this.isRendering = !0;
      try {
        zy(this.view(this.getEventHandlerData()), this.element);
      } finally {
        this.isRendering = !1;
      }
      return;
    }
    this.updateElement?.(this.getEventHandlerData());
  }
  observeDescendants() {
    !this.onAfterRender ||
      this.descendantObserver ||
      (this.onAfterRender(this.element),
      typeof MutationObserver < "u" &&
        ((this.descendantObserver = new MutationObserver(() => {
          this.onAfterRender?.(this.element);
        })),
        this.descendantObserver.observe(this.element, {
          childList: !0,
          subtree: !0,
        })));
  }
  requestUpdate() {
    !this.view || this.isRendering || this.render();
  }
  rejectWriteDuringRender(e) {
    return this.isRendering
      ? (console.error(
          `[playhtml] ${e}() was called during a view render for "${this.element.id}". Views must be pure — drive writes from @event handlers (e.g. @click) instead. Ignoring this write.`,
        ),
        !0)
      : !1;
  }
  updateAwareness(e, n) {
    ((this.awareness = e), (this.awarenessByStableId = n));
    try {
      this.updateElementAwareness?.(this.getAwarenessEventHandlerData());
    } catch (s) {
      console.error("[playhtml] updateElementAwareness callback threw:", s);
    }
    this.view && this.render();
  }
  getEventHandlerData() {
    return {
      element: this.element,
      data: this.data,
      localData: this.localData,
      awareness: this.awareness,
      awarenessByStableId: this.awarenessByStableId,
      setData: (e) => this.setData(e),
      setLocalData: (e) => this.setLocalData(e),
      setMyAwareness: (e) => this.setMyAwareness(e),
      requestUpdate: () => this.requestUpdate(),
    };
  }
  getAwarenessEventHandlerData() {
    return { ...this.getEventHandlerData(), myAwareness: this.selfAwareness };
  }
  getSetupData() {
    return {
      getElement: () => this.element,
      getData: () => this.data,
      getLocalData: () => this.localData,
      getAwareness: () => this.awareness,
      setData: (e) => this.setSetupData(e),
      setLocalData: (e) => this.setLocalData(e),
      setMyAwareness: (e) => this.setMyAwareness(e),
      requestUpdate: () => this.requestUpdate(),
    };
  }
  setSetupData(e) {
    if (!this.scheduleSetupDataWrite) {
      this.setData(e);
      return;
    }
    this.rejectWriteDuringRender("setData") ||
      this.scheduleSetupDataWrite(() => {
        this.onChange(e);
      });
  }
  setData(e) {
    this.rejectWriteDuringRender("setData") || this.onChange(e);
  }
  setMyAwareness(e) {
    this.rejectWriteDuringRender("setMyAwareness") ||
      (e !== this.selfAwareness &&
        ((this.selfAwareness = e),
        this.onAwarenessChange(e),
        this.triggerAwarenessUpdate?.()));
  }
  setDataDebounced(e) {
    this.debouncedOnChange(e);
  }
  reset() {
    this.defaultData !== void 0 && this.setData(this.defaultData);
  }
}
async function Ky(t, e) {
  const n = new TextEncoder().encode(`${t}-${e.outerHTML}}`),
    s = await crypto.subtle.digest("SHA-1", n);
  return Array.from(new Uint8Array(s))
    .map((r) => r.toString(16).padStart(2, "0"))
    .join("");
}
function kt(t, e) {
  const n = t.__playhtml_cursors__;
  return (
    t.__playhtml_identity__?.publicKey ??
    n?.playerIdentity?.publicKey ??
    String(e)
  );
}
function By(t) {
  const e = [],
    n = Array.from(t.keys()).sort((s, r) => s - r);
  for (const s of n) {
    const r = t.get(s);
    if (!r) continue;
    const i = Object.keys(r)
      .filter((o) => !o.startsWith("__"))
      .sort();
    for (const o of i) {
      const a = r[o];
      if (a == null || typeof a != "object") continue;
      const c = a,
        l = Object.keys(c).sort();
      for (const u of l)
        try {
          e.push(`${s}:${o}:${u}:${JSON.stringify(c[u])}`);
        } catch {}
    }
  }
  return e.join("|");
}
class qy {
  cellSize;
  grid = new Map();
  constructor(e = 200) {
    this.cellSize = e;
  }
  getCellKey(e, n) {
    const s = Math.floor(e / this.cellSize),
      r = Math.floor(n / this.cellSize);
    return `${s},${r}`;
  }
  getNearbyCellKeys(e, n, s) {
    const r = [],
      i = Math.ceil(s / this.cellSize),
      o = Math.floor(e / this.cellSize),
      a = Math.floor(n / this.cellSize);
    for (let c = -i; c <= i; c++)
      for (let l = -i; l <= i; l++) r.push(`${o + c},${a + l}`);
    return r;
  }
  insert(e) {
    const n = this.getCellKey(e.x, e.y);
    (this.grid.has(n) || this.grid.set(n, new Map()),
      this.grid.get(n).set(e.id, e));
  }
  remove(e, n, s) {
    if (n !== void 0 && s !== void 0) {
      const r = this.getCellKey(n, s),
        i = this.grid.get(r);
      if (i && i.has(e))
        return (i.delete(e), i.size === 0 && this.grid.delete(r), !0);
    } else
      for (const [r, i] of this.grid)
        if (i.has(e))
          return (i.delete(e), i.size === 0 && this.grid.delete(r), !0);
    return !1;
  }
  update(e, n, s) {
    (n !== void 0 && s !== void 0 ? this.remove(e.id, n, s) : this.remove(e.id),
      this.insert(e));
  }
  findNearby(e, n, s, r) {
    const i = [],
      o = this.getNearbyCellKeys(e, n, s),
      a = s * s;
    for (const c of o) {
      const l = this.grid.get(c);
      if (l)
        for (const u of l.values()) {
          if (r && u.id === r) continue;
          const h = u.x - e,
            d = u.y - n;
          h * h + d * d <= a && i.push(u);
        }
    }
    return i;
  }
  getAll() {
    const e = [];
    for (const n of this.grid.values()) e.push(...n.values());
    return e;
  }
  clear() {
    this.grid.clear();
  }
  getCellCount() {
    return this.grid.size;
  }
  getItemCount() {
    let e = 0;
    for (const n of this.grid.values()) e += n.size;
    return e;
  }
}
const as = "__playhtml_identity__",
  Ha = "__playhtml_cursors__";
function mo(t) {
  const e = t.playerStyle?.colorPalette?.[0];
  if (e == null || e === "")
    throw new Error(
      "[playhtml] Player identity must have playerStyle.colorPalette[0] (primary color).",
    );
  return e;
}
function Fa(t) {
  if (!t.publicKey)
    throw new Error("[playhtml] Player identity must have publicKey.");
  mo(t);
}
function on(t, e) {
  return { pid: t.publicKey, name: t.name, color: mo(t), isMe: e };
}
function bu(t, e) {
  let n = t;
  Fa(n);
  const s = new Set(),
    r = new Set(),
    i = new WeakSet();
  let o = null,
    a = null,
    c = "";
  function l() {
    e.getAwareness().setLocalStateField(as, n);
  }
  function u() {
    e.getAwareness().getLocalState()?.[as] || l();
  }
  function h(y, E, q) {
    for (const O of y)
      try {
        O(E);
      } catch (V) {
        console.error(`[playhtml] ${q} subscriber threw:`, V);
      }
  }
  function d() {
    h(s, n, "users self-change");
  }
  function f() {
    if (r.size === 0) return;
    const y = v();
    h(r, y, "users change");
  }
  function p() {
    const y = e.getAwareness();
    o !== y &&
      ((o = y),
      !i.has(y) && (i.add(y), (c = g(y.getStates())), y.on("change", b)));
  }
  function g(y) {
    const E = [],
      q = Array.from(y.keys()).sort((O, V) => O - V);
    for (const O of q) {
      const V = y.get(O);
      if (!V) continue;
      const Xn = V[as] ?? V[Ha]?.playerIdentity;
      try {
        E.push(`${O}:${JSON.stringify(Xn ?? null)}`);
      } catch {
        E.push(`${O}:null`);
      }
    }
    return E.join("|");
  }
  function b() {
    const y = e.getAwareness().getStates(),
      E = g(y);
    E !== c && ((c = E), f());
  }
  function m() {
    if ((u(), p(), !a && e.onCursorPresencesChange)) {
      const y = e.onCursorPresencesChange(() => {
        f();
      });
      y && (a = y);
    }
  }
  function C() {
    const y = e.getAwareness(),
      E = y.getLocalState();
    return E ? kt(E, y.clientID) : n.publicKey;
  }
  function v() {
    const y = new Map(),
      E = e.getAwareness(),
      q = E.getStates(),
      O = C(),
      V = new Map();
    q.forEach((Ge, ye) => {
      const me = kt(Ge, ye),
        Zn = me === O,
        nn = V.get(me);
      if (nn === void 0) {
        V.set(me, ye);
        return;
      }
      if (Zn && ye === E.clientID) {
        V.set(me, ye);
        return;
      }
      (Zn && nn === E.clientID) || (ye > nn && V.set(me, ye));
    });
    for (const [Ge, ye] of V) {
      const me = q.get(ye);
      if (!me) continue;
      const Zn = Ge === O,
        nn = me[Ha],
        To = me[as] ?? nn?.playerIdentity;
      if (Zn) y.set(Ge, on(n, !0));
      else if (To)
        try {
          y.set(Ge, on(To, !1));
        } catch {}
    }
    y.has(O) || y.set(O, on(n, !0));
    const Xn = e.getCursorPresences?.();
    if (Xn)
      for (const [Ge, ye] of Xn) {
        if (!ye.playerIdentity) continue;
        const me = Ge === O;
        try {
          y.set(Ge, me ? on(n, !0) : on(ye.playerIdentity, !1));
        } catch {}
      }
    return Array.from(y.values());
  }
  function _(y) {
    (y(), ui(n), l(), d(), f());
  }
  const I = {
    get pid() {
      return n.publicKey;
    },
    get name() {
      return n.name;
    },
    set name(y) {
      n.name !== y &&
        _(() => {
          n.name = y;
        });
    },
    get color() {
      return mo(n);
    },
    set color(y) {
      if (y == null || y === "")
        throw new Error(
          "[playhtml] users.me.color cannot be set to empty; player identity must have a primary color.",
        );
      n.playerStyle.colorPalette[0] !== y &&
        _(() => {
          n.playerStyle.colorPalette[0] = y;
        });
    },
  };
  return (
    u(),
    {
      me: I,
      getAll() {
        return (m(), v());
      },
      onChange(y) {
        return (
          m(),
          r.add(y),
          y(v()),
          () => {
            r.delete(y);
          }
        );
      },
      onSelfChange(y) {
        return (
          s.add(y),
          () => {
            s.delete(y);
          }
        );
      },
      adoptIdentity(y) {
        (Fa(y),
          n !== y &&
            _(() => {
              n = y;
            }));
      },
      getIdentity() {
        return n;
      },
      destroy() {
        (s.clear(), r.clear(), a?.(), (a = null), (o = null));
      },
    }
  );
}
function Vy() {
  return Yl();
}
function jr(t) {
  return Array.from(new Set(t.map((e) => e.color)));
}
class Yy {
  listening = !1;
  message = "";
  chatElement = null;
  styleElement = null;
  keydownHandler = null;
  timeout = null;
  options;
  constructor(e = {}) {
    ((this.options = e), this.initialize());
  }
  initialize() {
    (this.setupKeyboardHandlers(), this.createChatElement());
  }
  setupKeyboardHandlers() {
    ((this.keydownHandler = (e) => {
      if (
        (this.timeout && clearTimeout(this.timeout),
        (this.timeout = setTimeout(() => {
          (this.setListening(!1), this.setMessage(""));
        }, 1e4)),
        !this.listening)
      )
        e.key === "/" &&
          (this.setMessage(""),
          this.setListening(!0),
          e.preventDefault(),
          e.stopPropagation());
      else if (!e.metaKey && !e.ctrlKey && !e.altKey) {
        if (e.key === "Enter") this.setListening(!1);
        else if (e.key === "Escape")
          (this.setListening(!1), this.setMessage(""));
        else if (e.key === "Backspace")
          this.setMessage(this.message.slice(0, -1));
        else if (e.key.length === 1) {
          const n =
            this.message.length < 42 ? this.message + e.key : this.message;
          this.setMessage(n);
        }
        return (e.preventDefault(), e.stopPropagation(), !1);
      }
    }),
      document.addEventListener("keydown", this.keydownHandler));
  }
  setListening(e) {
    ((this.listening = e), this.updateChatDisplay());
  }
  setMessage(e) {
    ((this.message = e),
      this.updateChatDisplay(),
      this.options.onMessageUpdate?.(e.length > 0 ? e : null));
  }
  createChatElement() {
    this.chatElement ||
      ((this.styleElement = document.createElement("style")),
      (this.styleElement.textContent = `
      .playhtml-chat-container {
        box-sizing: border-box;
        position: fixed;
        bottom: 24px;
        right: 32px;
        padding: 8px;
        height: 48px;
        border-radius: 24px;
        min-width: 4.4em;
        background-color: rgba(52, 199, 89, 1);
        color: white;
        display: flex;
        justify-content: end;
        align-items: center;
        gap: 8px;
        font-family: system-ui, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
        font-weight: 320;
        z-index: 1000000;
      }
      
      .playhtml-chat-input {
        box-sizing: border-box;
        padding: 0px 4px 0px 4px;
        margin: 0px;
        font-size: 24px;
        line-height: 1;
        white-space: nowrap;
        background: transparent;
        border: none;
        outline: none;
        color: white;
      }
      
      .playhtml-chat-button {
        box-sizing: border-box;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 24px;
        font-weight: 250;
        padding: 0px;
        margin: 0px;
        border: 0.5px solid rgba(255,255,255,0.75);
        cursor: pointer;
        color: white;
        background-color: transparent;
      }
    `),
      document.head.appendChild(this.styleElement),
      (this.chatElement = document.createElement("div")),
      (this.chatElement.className = "playhtml-chat-container"),
      (this.chatElement.style.display = "none"),
      document.body.appendChild(this.chatElement));
  }
  updateChatDisplay() {
    this.chatElement &&
      (this.listening || this.message
        ? ((this.chatElement.innerHTML = `
        <div class="playhtml-chat-input">${this.message || "..."}</div>
        <div class="playhtml-chat-button">&times;</div>
      `),
          (this.chatElement.style.display = "flex"),
          this.chatElement
            .querySelector(".playhtml-chat-button")
            ?.addEventListener("click", () => {
              (this.setListening(!1), this.setMessage(""));
            }))
        : (this.chatElement.style.display = "none"));
  }
  showCTA() {
    this.chatElement &&
      !this.listening &&
      !this.message &&
      ((this.chatElement.innerHTML =
        '<div class="playhtml-chat-input">Type / to reply</div>'),
      (this.chatElement.style.display = "flex"));
  }
  hideCTA() {
    this.chatElement &&
      !this.listening &&
      !this.message &&
      (this.chatElement.style.display = "none");
  }
  getCurrentMessage() {
    return this.message.length > 0 ? this.message : null;
  }
  destroy() {
    (this.keydownHandler &&
      (document.removeEventListener("keydown", this.keydownHandler),
      (this.keydownHandler = null)),
      this.timeout !== null &&
        (clearTimeout(this.timeout), (this.timeout = null)),
      this.chatElement &&
        (this.chatElement.remove(), (this.chatElement = null)),
      this.styleElement &&
        (this.styleElement.remove(), (this.styleElement = null)));
  }
}
function cs(t) {
  return t === void 0
    ? document.body
    : typeof t == "string"
      ? document.querySelector(t)
      : typeof t == "function"
        ? t()
        : t;
}
const Gy = 60,
  Jy = 30,
  Xy = 30,
  Zy = 15e4;
function Qy(t) {
  const e = Math.max(1, Math.ceil(t));
  return e <= Xy ? Gy : Math.min(Jy, Zy / (e * (e - 1)));
}
function em(t) {
  return 1e3 / Qy(t);
}
const vu = "identity",
  wo = "element:",
  bo = "presence:",
  tm = new Set(["playerIdentity", "cursor", "isMe"]);
function Ur(t) {
  return tm.has(t);
}
function Cu(t) {
  return t.startsWith(wo);
}
function Su(t) {
  return t.startsWith(bo);
}
function Hr(t) {
  return `${bo}${t}`;
}
function nm(t) {
  return t.slice(bo.length);
}
const yr = 3e4,
  sm = 1e4;
function rm(t, e, n = yr) {
  return Number.isFinite(t) ? e - Number(t) <= n : !0;
}
function im(t, e, n = yr) {
  return !K(t) || !("at" in t) ? !0 : rm(t.at, e, n);
}
function _u(t, e = sm) {
  const n = setInterval(() => {
    t();
  }, e);
  return () => clearInterval(n);
}
function om(t, e = Date.now()) {
  return { at: e, value: t };
}
function za(t) {
  return K(t) && "value" in t && "at" in t ? t.value : t;
}
function Eu(t) {
  try {
    const e = JSON.stringify(t);
    return e === void 0 ? 1 / 0 : new TextEncoder().encode(e).byteLength;
  } catch {
    return 1 / 0;
  }
}
function ku(t) {
  const e = t[vu];
  return K(e) && typeof e.publicKey == "string" ? e.publicKey : void 0;
}
function Au(t, e, n, s) {
  if (Eu(n) > js)
    return (
      console.warn(
        `[playhtml] Failed to publish ${s}:`,
        new Error(`Presence value must be ${js} bytes or less`),
      ),
      !1
    );
  try {
    return (t.update(e, n), !0);
  } catch (r) {
    return (console.warn(`[playhtml] Failed to publish ${s}:`, r), !1);
  }
}
function Ws(t, e, n) {
  try {
    t.clear(e);
  } catch (s) {
    console.warn(`[playhtml] Failed to clear ${n}:`, s);
  }
}
function Me(t, e) {
  try {
    return (t(), !0);
  } catch (n) {
    return (console.error(`[playhtml] ${e} callback threw:`, n), !1);
  }
}
function am(t) {
  return K(t) && "cursor" in t;
}
function Wa(t) {
  return K(t) ? Object.values(t).every(K) : !1;
}
function cm(t) {
  return K(t)
    ? Object.values(t).every(
        (e) => Array.isArray(e) && e.every((n) => typeof n == "string"),
      )
    : !1;
}
function lm(t) {
  return t == null ? null : typeof t == "string" ? t : null;
}
function um(t) {
  return typeof t == "string" ? t : void 0;
}
class hm {
  constructor(e) {
    this.peerStore = e;
  }
  get peers() {
    return this.peerStore.getPeers();
  }
  getRemotePresences(e) {
    const n = new Map(),
      s = Array.from(this.peers.keys()).sort();
    for (const r of s) {
      const i = this.getPresenceForConnection(r);
      if (!i || i.playerIdentity.publicKey === e) continue;
      const o = i.playerIdentity.publicKey,
        a = n.get(o);
      (!a || Ka(a, i)) && n.set(o, i);
    }
    return n;
  }
  getPresenceByStableId(e) {
    let n = null;
    for (const s of Array.from(this.peers.keys()).sort()) {
      const r = this.getPresenceForConnection(s);
      r?.playerIdentity.publicKey === e && (!n || Ka(n, r)) && (n = r);
    }
    return n;
  }
  getPresenceForConnection(e) {
    const n = this.peers.get(e);
    if (!n) return null;
    const s = n.identity;
    if (!Wg(s)) return null;
    const r = n.cursor;
    let i = null,
      o,
      a = um(n.page),
      c = null;
    if (r !== void 0) {
      if (!am(r)) return null;
      if (r.cursor !== null) {
        if (!Kg(r.cursor)) return null;
        i = r.cursor;
      }
      ((o = r.at), (a = r.page ?? a), (c = r.zone ?? null));
    }
    return {
      cursor: i,
      playerIdentity: s,
      lastSeen: o,
      message: lm(n.message),
      page: a,
      zone: c,
    };
  }
}
function Ka(t, e) {
  if (e.cursor && !t.cursor) return !0;
  if (!e.cursor && t.cursor) return !1;
  const n = Ba(t.lastSeen);
  return Ba(e.lastSeen) > n;
}
function Ba(t) {
  return Number.isFinite(t) ? Number(t) : Number.NEGATIVE_INFINITY;
}
const un = "__playhtml_cursors__";
function ve(t) {
  const e = t.playerStyle?.colorPalette?.[0];
  if (e == null || e === "")
    throw new Error(
      "[playhtml] Player identity must have playerStyle.colorPalette[0] (primary color).",
    );
  return e;
}
function dm(t) {
  if (!t.publicKey)
    throw new Error("[playhtml] Player identity must have publicKey.");
  ve(t);
}
function qa(t, e) {
  const n = t?.[un];
  if (!n?.cursor || !n.playerIdentity?.publicKey) return null;
  try {
    ve(n.playerIdentity);
  } catch {
    return null;
  }
  return n;
}
function Fr(t, e) {
  return Math.sqrt(Math.pow(t.x - e.x, 2) + Math.pow(t.y - e.y, 2));
}
function xu() {
  return window.visualViewport?.scale ?? 1;
}
function fm(t, e, n) {
  const s = xu();
  if (n === "relative") {
    const r = window.visualViewport,
      i = r?.width ?? window.innerWidth,
      o = r?.height ?? window.innerHeight,
      a = r?.offsetLeft ?? 0,
      c = r?.offsetTop ?? 0;
    return { x: ((t + a) / (i * s)) * 100, y: ((e + c) / (o * s)) * 100 };
  } else {
    const r = window.visualViewport,
      i = r ? r.pageLeft : window.scrollX,
      o = r ? r.pageTop : window.scrollY,
      a = r?.offsetLeft ?? 0,
      c = r?.offsetTop ?? 0;
    return { x: (t + a) / s + i, y: (e + c) / s + o };
  }
}
function pm(t, e, n) {
  const s = xu();
  if (n === "relative") {
    const r = window.visualViewport,
      i = r?.width ?? window.innerWidth,
      o = r?.height ?? window.innerHeight,
      a = r?.offsetLeft ?? 0,
      c = r?.offsetTop ?? 0;
    return { x: (t / 100) * i * s - a, y: (e / 100) * o * s - c };
  } else {
    const r = window.visualViewport,
      i = r ? r.pageLeft : window.scrollX,
      o = r ? r.pageTop : window.scrollY,
      a = r?.offsetLeft ?? 0,
      c = r?.offsetTop ?? 0;
    return { x: (t - i) * s - a, y: (e - o) * s - c };
  }
}
class gm {
  position;
  velocity;
  target;
  stiffness;
  damping;
  mass;
  animationFrame = null;
  onUpdate;
  constructor(e, n, s = {}) {
    ((this.position = { ...e }),
      (this.velocity = { x: 0, y: 0 }),
      (this.target = { ...e }),
      (this.onUpdate = n),
      (this.stiffness = s.stiffness ?? 170),
      (this.damping = s.damping ?? 26),
      (this.mass = s.mass ?? 0.5));
  }
  setTarget(e) {
    ((this.target = { ...e }), this.animationFrame === null && this.animate());
  }
  animate = () => {
    const e = 0.016666666666666666,
      n = (this.target.x - this.position.x) * this.stiffness,
      s = (this.target.y - this.position.y) * this.stiffness,
      r = this.velocity.x * this.damping,
      i = this.velocity.y * this.damping,
      o = (n - r) / this.mass,
      a = (s - i) / this.mass;
    ((this.velocity.x += o * e),
      (this.velocity.y += a * e),
      (this.position.x += this.velocity.x * e),
      (this.position.y += this.velocity.y * e),
      this.onUpdate(this.position));
    const c = Math.sqrt(
        Math.pow(this.target.x - this.position.x, 2) +
          Math.pow(this.target.y - this.position.y, 2),
      ),
      l = Math.sqrt(
        Math.pow(this.velocity.x, 2) + Math.pow(this.velocity.y, 2),
      );
    c < 0.5 && l < 0.5
      ? ((this.position = { ...this.target }),
        (this.velocity = { x: 0, y: 0 }),
        this.onUpdate(this.position),
        (this.animationFrame = null))
      : (this.animationFrame = requestAnimationFrame(this.animate));
  };
  snapTo(e) {
    (this.animationFrame !== null &&
      (cancelAnimationFrame(this.animationFrame), (this.animationFrame = null)),
      (this.position = { ...e }),
      (this.target = { ...e }),
      (this.velocity = { x: 0, y: 0 }),
      this.onUpdate(this.position));
  }
  destroy() {
    this.animationFrame !== null &&
      (cancelAnimationFrame(this.animationFrame), (this.animationFrame = null));
  }
}
function Iu(t) {
  ((t = t.replace(/"/g, "'")),
    (t = t.replace(/>\s{1,}</g, "><")),
    (t = t.replace(/\s{2,}/g, " ")));
  const e = /[\r\n%#()<>?[\\\]^`{|}]/g;
  return t.replace(e, encodeURIComponent);
}
function $u(t) {
  return `<svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="10 9 18 18"
    width="18"
    height="18"
    fill="none"
    fillRule="evenodd"
  >
    <g fill="rgba(0,0,0,.2)" transform="translate(1,1)">
      <path d="m12 24.4219v-16.015l11.591 11.619h-6.781l-.411.124z" />
      <path d="m21.0845 25.0962-3.605 1.535-4.682-11.089 3.686-1.553z" />
    </g>
    <g fill="white">
      <path d="m12 24.4219v-16.015l11.591 11.619h-6.781l-.411.124z" />
      <path d="m21.0845 25.0962-3.605 1.535-4.682-11.089 3.686-1.553z" />
    </g>
    <g fill="${t}">
      <path d="m19.751 24.4155-1.844.774-3.1-7.374 1.841-.775z" />
      <path d="m13 10.814v11.188l2.969-2.866.428-.139h4.768z" />
    </g>
  </svg>`;
}
function zr(t) {
  return `url("data:image/svg+xml,${Iu($u(t))}"), auto`;
}
function Va(t) {
  return t.startsWith("--")
    ? t
    : t.replace(/[A-Z]/g, (e) => "-" + e.toLowerCase());
}
function Wr(t, e, n) {
  const s = new Set();
  for (const r of Object.keys(n)) {
    if (/^\d+$/.test(r)) continue;
    s.add(r);
    const i = n[r];
    t.style.setProperty(Va(r), String(i));
  }
  for (const r of e) s.has(r) || t.style.removeProperty(Va(r));
  e.clear();
  for (const r of s) e.add(r);
}
function ym(t) {
  if (!t.startsWith('url("')) return;
  const e = t.indexOf('")', 5);
  if (e !== -1) return t.slice(5, e);
}
function tt() {
  const t = window.location.pathname;
  return t.length <= lo ? t : void 0;
}
function mm(t) {
  if (t.trim() !== t || /["'<>\s\u0000-\u001f\u007f]/.test(t)) return !1;
  try {
    const e = new URL(t, window.location.href);
    return e.protocol === "http:" || e.protocol === "https:"
      ? !0
      : e.protocol !== "data:"
        ? !1
        : /^data:image\/(?:png|jpeg|jpg|gif|webp);base64,/i.test(t);
  } catch {
    return !1;
  }
}
function ls(t) {
  return t
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
function wm(t) {
  const e = t.trim();
  return /^#[0-9a-fA-F]{3,8}$/.test(e) ||
    /^rgba?\([0-9.,%\s]+\)$/.test(e) ||
    /^hsla?\([0-9.,%\s]+\)$/.test(e) ||
    /^[a-zA-Z]+$/.test(e)
    ? e
    : "black";
}
class bm {
  constructor(e, n = {}, s, r) {
    ((this.provider = e),
      (this.options = n),
      (this.presenceTransport = s),
      r
        ? ((this.users = r),
          n.playerIdentity && this.users.adoptIdentity(n.playerIdentity))
        : ((this.users = bu(n.playerIdentity ?? Yl(), {
            getAwareness: () => this.provider.awareness,
            getCursorPresences: () => this.getCursorPresences(),
            onCursorPresencesChange: (i) => this.onCursorPresencesChange(i),
          })),
          (this.ownsUsers = !0)),
      dm(this.playerIdentity),
      (this.visibilityThreshold = n.visibilityThreshold || void 0),
      (this.coordinateMode = n.coordinateMode || "absolute"),
      this.options.enableChat === !0 &&
        (this.chat = new Yy({
          onMessageUpdate: (i) => {
            ((this.currentMessage = i), this.updateCursorAwareness());
          },
        })),
      (this.lastKnownColor = ve(this.playerIdentity)),
      (this.lastKnownName = this.playerIdentity.name),
      (this.unsubscribeSelfChange = this.users.onSelfChange(() => {
        this.handleSelfIdentityChange();
      })),
      this.initialize(),
      this.setupGlobalAPI(),
      (this.unsubscribeUsersChange = this.users.onChange((i) => {
        this.handleUsersChange(i);
      })));
  }
  cursors = new Map();
  cursorAnimators = new Map();
  spatialGrid = new qy(300);
  proximityUsers = new Set();
  currentCursor = null;
  users;
  ownsUsers = !1;
  unsubscribeSelfChange = null;
  unsubscribeUsersChange = null;
  awarenessUpdateTimeout = null;
  lastUpdate = 0;
  pointerFrame = null;
  pendingPointerSample = null;
  cursorEventCleanups = [];
  ownCursorSvgCache = null;
  visibilityThreshold;
  isStylesAdded = !1;
  globalApiListeners = new Map();
  activeAnimationCleanups = new Map();
  chat = null;
  currentMessage = null;
  otherUsersWithMessages = new Set();
  lastSentMessage = null;
  cursorPresenceChangeCallbacks = new Map();
  coordinateMode;
  presenceStore = null;
  presenceTransportUnsubscribe = null;
  serverCursorMaxHz = null;
  getContainerMatrix() {
    const e = cs(this.options.container);
    if (!e || e === document.body || typeof DOMMatrixReadOnly > "u")
      return null;
    const n = getComputedStyle(e).transform;
    return {
      matrix:
        !n || n === "none" ? new DOMMatrixReadOnly() : new DOMMatrixReadOnly(n),
      rect: e.getBoundingClientRect(),
      el: e,
    };
  }
  clientToStorage(e, n) {
    const s = this.getContainerMatrix();
    if (s) {
      const r = s.matrix.a,
        i = s.matrix.b,
        o = s.matrix.c,
        a = s.matrix.d,
        c = r * a - i * o;
      if (c === 0) return { x: 0, y: 0 };
      const l = e - s.rect.left,
        u = n - s.rect.top;
      return { x: (a * l - o * u) / c, y: (r * u - i * l) / c };
    }
    return fm(e, n, this.coordinateMode);
  }
  storageToClient(e, n) {
    const s = this.getContainerMatrix();
    if (s) {
      const r = s.matrix.a,
        i = s.matrix.b,
        o = s.matrix.c,
        a = s.matrix.d;
      return { x: r * e + o * n + s.rect.left, y: i * e + a * n + s.rect.top };
    }
    return pm(e, n, this.coordinateMode);
  }
  zones = new Map();
  currentZone = null;
  cursorZoneState = new Map();
  cursorStyleKeys = new Map();
  lastKnownContainer = null;
  clientIdToStableId = new Map();
  pendingRemovals = new Map();
  get playerIdentity() {
    return this.users.getIdentity();
  }
  lastKnownColor = "";
  lastKnownName;
  lastKnownAllColors = [];
  handleSelfIdentityChange() {
    this.ownCursorSvgCache = null;
    const e = ve(this.playerIdentity);
    ((document.documentElement.style.cursor = zr(e)),
      this.updateCursorAwareness());
    const n = this.playerIdentity.name;
    (e !== this.lastKnownColor &&
      ((this.lastKnownColor = e), this.emitGlobalEvent("color", e)),
      n !== this.lastKnownName &&
        ((this.lastKnownName = n), this.emitGlobalEvent("name", n)));
  }
  handleUsersChange(e) {
    const n = jr(e);
    (n.length === this.lastKnownAllColors.length &&
      n.every((s, r) => s === this.lastKnownAllColors[r])) ||
      ((this.lastKnownAllColors = n), this.emitGlobalEvent("allColors", n));
  }
  initialize() {
    (this.addCursorStyles(),
      this.setupCursorTracking(),
      this.presenceTransport
        ? this.setupPresenceTransportHandling()
        : this.setupAwarenessHandling(),
      (document.documentElement.style.cursor = zr(ve(this.playerIdentity))));
  }
  setupAwarenessHandling() {
    (this.provider.awareness.on(
      "change",
      ({ added: e, updated: n, removed: s }) => {
        this.handleAwarenessChange(e, n, s);
      },
    ),
      this.updateCursorAwareness(),
      this.syncExistingAwareness());
  }
  setupPresenceTransportHandling() {
    if (!this.presenceTransport) return;
    ((this.presenceStore = new hm(this.presenceTransport.peers)),
      this.publishPresenceTransportState());
    const e = () => this.onPeerCursorChange(),
      n = this.presenceTransport.peers.subscribe("cursor", e),
      s = this.presenceTransport.peers.subscribe("identity", e),
      r = this.presenceTransport.subscribe((i) => {
        this.handlePresenceControlMessage(i);
      });
    this.presenceTransportUnsubscribe = () => {
      (n(), s(), r());
    };
  }
  onPeerCursorChange() {
    this.renderPresenceStore();
  }
  handlePresenceControlMessage(e) {
    e.type === "presence-rate" && this.handlePresenceRate(e.channel, e.hz);
  }
  handlePresenceRate(e, n) {
    e === "cursor" &&
      (!Number.isFinite(n) || n <= 0 || (this.serverCursorMaxHz = n));
  }
  renderPresenceStore() {
    const e = new Set();
    for (const [n, s] of this.cursorPresenceEntries())
      (e.add(n),
        s.cursor
          ? this.updateCursor(n, { ...s, cursor: s.cursor })
          : this.removeCursor(n),
        s.message
          ? this.otherUsersWithMessages.add(n)
          : this.otherUsersWithMessages.delete(n));
    for (const n of Array.from(this.cursors.keys()))
      e.has(n) || (this.otherUsersWithMessages.delete(n), this.removeCursor(n));
    (this.rebuildSpatialGrid(),
      this.updateChatCTA(),
      this.checkProximityOptimized(),
      this.notifyCursorPresenceListeners());
  }
  syncExistingAwareness() {
    const e = this.provider.awareness.getStates(),
      n = Array.from(e.keys());
    this.handleAwarenessChange(n, [], []);
  }
  handleAwarenessChange(e, n, s) {
    const r = this.provider.awareness.getStates(),
      i = this.provider.awareness.clientID,
      o = this.playerIdentity.publicKey;
    ([...e, ...n].forEach((a) => {
      const c = r.get(a);
      let l = c ? kt(c, a) : String(a);
      if (
        (l === String(a) && (l = this.clientIdToStableId.get(a) ?? l),
        this.clientIdToStableId.set(a, l),
        a === i || l === o)
      )
        return;
      const u = qa(c);
      (u
        ? this.updateCursor(l, u)
        : this.hasOtherClientForStableId(l, a) || this.removeCursor(l),
        c?.[un]?.message
          ? this.otherUsersWithMessages.add(l)
          : this.otherUsersWithMessages.delete(l));
    }),
      s.forEach((a) => {
        const c = this.clientIdToStableId.get(a);
        (this.clientIdToStableId.delete(a),
          c &&
            (this.otherUsersWithMessages.delete(c),
            this.hasOtherClientForStableId(c, a) || this.removeCursor(c)));
      }),
      this.rebuildSpatialGrid(),
      this.updateChatCTA(),
      this.checkProximityOptimized(),
      this.notifyCursorPresenceListeners());
  }
  hasOtherClientForStableId(e, n) {
    for (const [s, r] of this.clientIdToStableId)
      if (r === e && s !== n) return !0;
    return !1;
  }
  *cursorPresenceEntries(e = {}) {
    if (this.presenceTransport && this.presenceStore) {
      const i = this.presenceStore.getRemotePresences(
        this.playerIdentity.publicKey,
      );
      for (const [o, a] of i) yield [o, a];
      return;
    }
    const n = this.provider.awareness.getStates(),
      s = this.provider.awareness.clientID,
      r = this.playerIdentity.publicKey;
    for (const [i, o] of n) {
      const a = kt(o, i);
      if (!e.includeLocalAwareness && (i === s || a === r)) continue;
      const c = qa(o);
      c && (yield [a, c]);
    }
  }
  *activeCursorPresenceEntries(e = {}) {
    const n = e.now ?? Date.now();
    for (const [s, r] of this.cursorPresenceEntries())
      r.cursor &&
        ((e.freshOnly && !this.isFreshCursorPresence(r, n)) ||
          (yield [s, { ...r, cursor: r.cursor }]));
  }
  isFreshCursorPresence(e, n) {
    return this.presenceTransport
      ? Number.isFinite(e.lastSeen)
        ? n - Number(e.lastSeen) <= yr
        : !1
      : !0;
  }
  rebuildSpatialGrid() {
    this.spatialGrid.clear();
    for (const [e, n] of this.activeCursorPresenceEntries()) {
      const s = this.storageToClient(n.cursor.x, n.cursor.y);
      this.spatialGrid.insert({ id: e, x: s.x, y: s.y, data: n });
    }
  }
  checkProximityOptimized() {
    if (!this.currentCursor) return;
    const e = new Set(),
      n = this.options.proximityThreshold || Og,
      s = this.storageToClient(this.currentCursor.x, this.currentCursor.y),
      r = this.spatialGrid.findNearby(s.x, s.y, n);
    for (const i of r) {
      const o = i.data;
      if (!o.cursor) continue;
      const a = this.storageToClient(o.cursor.x, o.cursor.y);
      if (
        Fr(
          { x: s.x, y: s.y, pointer: this.currentCursor.pointer },
          { x: a.x, y: a.y, pointer: o.cursor.pointer },
        ) < n &&
        (e.add(i.id), !this.proximityUsers.has(i.id))
      ) {
        const c = {
            ours: { x: this.currentCursor.x, y: this.currentCursor.y },
            theirs: { x: o.cursor.x, y: o.cursor.y },
          },
          l = o.cursor.x - this.currentCursor.x,
          u = o.cursor.y - this.currentCursor.y,
          h = Math.atan2(u, l);
        this.options.onProximityEntered?.(o.playerIdentity, c, h);
      }
    }
    for (const i of this.proximityUsers)
      e.has(i) || this.options.onProximityLeft?.(i);
    this.proximityUsers = e;
  }
  addCursorStyles() {
    if (this.isStylesAdded || document.getElementById("playhtml-cursor-styles"))
      return;
    const e = document.createElement("style");
    ((e.id = "playhtml-cursor-styles"),
      (e.textContent = `
      .playhtml-cursor-other {
        position: fixed;
        width: 32px;
        height: 32px;
        pointer-events: none;
        z-index: 999999;
        transition: all 0.1s ease;
        transform-origin: center;
      }
      
      .playhtml-cursor-fade-in {
        animation: cursorFadeIn 0.3s ease-out;
      }
      
      .playhtml-cursor-fade-out {
        animation: cursorFadeOut 0.3s ease-out;
        opacity: 0;
      }
      
      @keyframes cursorFadeIn {
        from { opacity: 0; transform: scale(0.8); }
        to { opacity: 1; transform: scale(1); }
      }
      
      @keyframes cursorFadeOut {
        from { opacity: 1; transform: scale(1); }
        to { opacity: 0; transform: scale(0.8); }
      }
    `));
    const n = cs(this.options.container);
    (n && n !== document.body ? n.appendChild(e) : document.head.appendChild(e),
      (this.isStylesAdded = !0));
  }
  createCursorPositionCallback(e) {
    return (n) => {
      const s = this.cursors.get(e);
      s &&
        ((s.style.position =
          this.coordinateMode === "absolute" || this.getContainerMatrix()
            ? "absolute"
            : "fixed"),
        (s.style.left = `${n.x}px`),
        (s.style.top = `${n.y}px`),
        (s.style.zIndex = "999999"),
        (s.style.pointerEvents = "none"));
    };
  }
  resolveTargetCoords(e, n) {
    return this.coordinateMode === "absolute" || this.getContainerMatrix()
      ? { x: e, y: n }
      : this.storageToClient(e, n);
  }
  applyZoneStyling(e, n, s, r) {
    let i = this.cursorStyleKeys.get(r);
    if ((i || ((i = new Set()), this.cursorStyleKeys.set(r, i)), s)) {
      const o = this.zones.get(s);
      if (o?.options?.getCursorStyle) {
        Wr(e, i, o.options.getCursorStyle(n));
        return;
      }
    }
    this.options.getCursorStyle
      ? Wr(e, i, this.options.getCursorStyle(n))
      : Wr(e, i, {});
  }
  hitTestZones(e, n) {
    let s = null,
      r = 1 / 0;
    for (const [i, { element: o }] of this.zones) {
      if (!document.contains(o)) continue;
      const a = o.getBoundingClientRect();
      if (e >= a.left && e <= a.right && n >= a.top && n <= a.bottom) {
        const c = a.width * a.height;
        c < r &&
          ((r = c),
          (s = {
            zoneId: i,
            relX: Math.max(0, Math.min(1, (e - a.left) / a.width)),
            relY: Math.max(0, Math.min(1, (n - a.top) / a.height)),
          }));
      }
    }
    return s;
  }
  getOwnCursorSvg() {
    const e = ve(this.playerIdentity);
    return (
      this.ownCursorSvgCache?.color !== e &&
        (this.ownCursorSvgCache = { color: e, svg: Iu($u(e)) }),
      this.ownCursorSvgCache.svg
    );
  }
  addCursorEventListener(e, n, s, r) {
    (e.addEventListener(n, s, r),
      this.cursorEventCleanups.push(() => {
        e.removeEventListener(n, s, r);
      }));
  }
  requestPointerFrame(e) {
    return typeof window.requestAnimationFrame == "function"
      ? window.requestAnimationFrame(e)
      : window.setTimeout(() => e(performance.now()), 1e3 / 60);
  }
  cancelPointerFrame(e) {
    typeof window.cancelAnimationFrame == "function"
      ? window.cancelAnimationFrame(e)
      : window.clearTimeout(e);
  }
  queuePointerSample(e, n, s) {
    ((this.pendingPointerSample = { clientX: e, clientY: n, input: s }),
      this.pointerFrame === null &&
        (this.pointerFrame = this.requestPointerFrame(() => {
          this.pointerFrame = null;
          const r = this.pendingPointerSample;
          ((this.pendingPointerSample = null),
            r && this.processPointerSample(r));
        })));
  }
  processPointerSample(e) {
    let n = e.input;
    if (e.input === "mouse") {
      n = "mouse";
      const r = document.elementFromPoint(e.clientX, e.clientY);
      if (r) {
        const i = window.getComputedStyle(r),
          o = ym(i.cursor);
        o && !o.includes(this.getOwnCursorSvg()) && (n = o);
      }
      n === "mouse"
        ? (document.documentElement.style.cursor = zr(ve(this.playerIdentity)))
        : (document.documentElement.style.cursor = "auto");
    }
    const s = this.clientToStorage(e.clientX, e.clientY);
    ((this.currentCursor = { x: s.x, y: s.y, pointer: n }),
      (this.currentZone = this.hitTestZones(e.clientX, e.clientY)),
      this.scheduleCursorAwarenessUpdate(),
      this.updateAllCursorVisibility());
  }
  setupCursorTracking() {
    const e = (o) => {
        const a = o;
        this.queuePointerSample(a.clientX, a.clientY, "mouse");
      },
      n = (o) => {
        const a = o.touches[0];
        a && this.queuePointerSample(a.clientX, a.clientY, "touch");
      },
      s = () => {};
    (this.addCursorEventListener(document, "mousemove", e),
      this.addCursorEventListener(document, "touchmove", n, { passive: !0 }),
      this.addCursorEventListener(document, "touchend", s),
      this.addCursorEventListener(document, "mouseleave", () => {
        this.showAllCursors();
      }));
    let r = null;
    const i = () => {
      r === null &&
        (r = requestAnimationFrame(() => {
          ((r = null), this.repositionAllCursors());
        }));
    };
    (this.addCursorEventListener(window, "scroll", i, { passive: !0 }),
      this.addCursorEventListener(window, "resize", i),
      window.visualViewport &&
        (this.addCursorEventListener(window.visualViewport, "scroll", i),
        this.addCursorEventListener(window.visualViewport, "resize", i)),
      this.addCursorEventListener(window, "beforeunload", () => {
        this.presenceTransport
          ? this.presenceTransport.clear("cursor")
          : this.provider.awareness.setLocalStateField(un, null);
      }));
  }
  repositionAllCursors() {
    for (const [e, n] of this.activeCursorPresenceEntries())
      this.snapCursorToPresence(e, n);
    this.updateAllCursorVisibility();
  }
  snapCursorToPresence(e, n) {
    const s = this.cursorAnimators.get(e);
    if (!s) return;
    if (n.zone) {
      const i = this.zones.get(n.zone.zoneId);
      if (i && document.contains(i.element)) {
        const o = i.element.getBoundingClientRect(),
          a = this.cursors.get(e),
          c = a ? a.offsetWidth / 2 : 0,
          l = a ? a.offsetHeight / 2 : 0,
          u = o.left + n.zone.relX * o.width - c,
          h = o.top + n.zone.relY * o.height - l;
        this.coordinateMode === "absolute"
          ? s.snapTo({ x: u + window.scrollX, y: h + window.scrollY })
          : s.snapTo({ x: u, y: h });
        return;
      }
    }
    if (this.coordinateMode === "absolute" || this.getContainerMatrix()) return;
    const r = this.storageToClient(n.cursor.x, n.cursor.y);
    s.snapTo({ x: r.x, y: r.y });
  }
  getActiveCursorConnectionCount() {
    const e = this.currentCursor ? 1 : 0;
    let n = 0;
    for (const s of this.activeCursorPresenceEntries({ freshOnly: !0 })) n++;
    return Math.max(1, e + n);
  }
  scheduleCursorAwarenessUpdate() {
    if (this.awarenessUpdateTimeout !== null) return;
    const e = performance.now() - this.lastUpdate,
      n = em(this.getActiveCursorConnectionCount()),
      s = this.serverCursorMaxHz ? 1e3 / this.serverCursorMaxHz : 0,
      r = Math.max(n, s);
    e >= r
      ? this.updateCursorAwareness()
      : (this.awarenessUpdateTimeout = setTimeout(() => {
          ((this.awarenessUpdateTimeout = null), this.updateCursorAwareness());
        }, r - e));
  }
  updateCursorAwareness() {
    this.awarenessUpdateTimeout !== null &&
      (clearTimeout(this.awarenessUpdateTimeout),
      (this.awarenessUpdateTimeout = null));
    const e = Date.now(),
      n = {
        cursor: this.currentCursor,
        playerIdentity: this.playerIdentity,
        lastSeen: e,
        message: this.currentMessage,
        page: tt(),
        zone: this.currentZone,
      };
    if (this.presenceTransport) {
      (this.presenceTransport.update("cursor", {
        cursor: n.cursor,
        page: n.page,
        zone: n.zone,
        at: e,
      }),
        this.currentMessage !== this.lastSentMessage &&
          (this.presenceTransport.update("message", this.currentMessage),
          (this.lastSentMessage = this.currentMessage)),
        (this.lastUpdate = performance.now()),
        this.checkProximityOptimized(),
        this.notifyCursorPresenceListeners());
      return;
    }
    (this.provider.awareness.setLocalStateField(un, n),
      (this.lastUpdate = performance.now()));
  }
  publishPresenceTransportState() {
    if (!this.presenceTransport) return;
    const e = tt();
    (this.presenceTransport.join({ identity: this.playerIdentity, page: e }),
      this.currentCursor &&
        this.presenceTransport.update("cursor", {
          cursor: this.currentCursor,
          page: e,
          zone: this.currentZone,
          at: Date.now(),
        }),
      (this.currentMessage !== null || this.lastSentMessage !== null) &&
        (this.presenceTransport.update("message", this.currentMessage),
        (this.lastSentMessage = this.currentMessage)));
  }
  getContainer() {
    const e = cs(this.options.container) ?? document.body;
    return ((this.lastKnownContainer = e), e);
  }
  refreshContainer() {
    const e = cs(this.options.container) ?? document.body;
    if (e === this.lastKnownContainer) return;
    const n = this.lastKnownContainer;
    ((this.lastKnownContainer = e),
      n &&
        n
          .querySelectorAll(".playhtml-cursor-other")
          .forEach((r) => e.appendChild(r)));
    const s = document.getElementById("playhtml-cursor-styles");
    s && s.parentElement !== e && e.appendChild(s);
  }
  refreshCursorStyles() {
    if (!(!this.options.getCursorStyle && this.zones.size === 0))
      for (const [e, n] of this.cursors.entries()) {
        const s = this.findAwarenessByStableId(e);
        if (!s) continue;
        const r = this.cursorZoneState.get(e) ?? null;
        this.applyZoneStyling(n, s, r, e);
      }
  }
  findAwarenessByStableId(e) {
    for (const [n, s] of this.activeCursorPresenceEntries())
      if (n === e) return s;
    return null;
  }
  updateCursor(e, n) {
    const s = this.pendingRemovals.get(e);
    if (s) {
      (clearTimeout(s), this.pendingRemovals.delete(e));
      const m = this.cursors.get(e);
      m &&
        (m.classList.remove("playhtml-cursor-fade-out"),
        m.classList.add("playhtml-cursor-fade-in"));
    }
    const r = n.playerIdentity;
    if (
      this.options.shouldRenderCursor &&
      !this.options.shouldRenderCursor(n)
    ) {
      this.removeCursor(e);
      return;
    }
    let i = this.cursors.get(e);
    const o = n.cursor,
      a = i && i.dataset.pointerType !== o.pointer;
    !i || a
      ? (i && i.remove(),
        (i = this.createCursorElement(r, o.pointer, n.message, e, n)),
        (i.dataset.pointerType = o.pointer),
        this.cursors.set(e, i),
        this.getContainer().appendChild(i))
      : i &&
        (this.updateCursorMessage(i, r, n.message),
        this.updateCursorName(i, r));
    const c = n.zone,
      l = this.cursorZoneState.get(e) ?? null,
      u = c?.zoneId ?? null,
      h = l !== u;
    this.cursorZoneState.set(e, u);
    let d,
      f = !1;
    if (c) {
      const m = this.zones.get(c.zoneId);
      if (m && document.contains(m.element)) {
        const C = m.element.getBoundingClientRect(),
          v = this.cursors.get(e),
          _ = v ? v.offsetWidth / 2 : 0,
          I = v ? v.offsetHeight / 2 : 0,
          y = C.left + c.relX * C.width - _,
          E = C.top + c.relY * C.height - I;
        (this.coordinateMode === "absolute"
          ? (d = { x: y + window.scrollX, y: E + window.scrollY })
          : (d = { x: y, y: E }),
          (f = !0));
      } else d = this.resolveTargetCoords(o.x, o.y);
    } else d = this.resolveTargetCoords(o.x, o.y);
    this.applyZoneStyling(i, n, f ? u : null, e);
    let p = d.x,
      g = d.y;
    if (this.coordinateMode === "relative") {
      const m = window.innerWidth,
        C = window.innerHeight;
      ((p = Math.max(-18, Math.min(m - 2, d.x))),
        (g = Math.max(-18, Math.min(C - 2, d.y))));
    }
    let b = this.cursorAnimators.get(e);
    if (
      (b ||
        ((b = new gm({ x: p, y: g }, this.createCursorPositionCallback(e))),
        this.cursorAnimators.set(e, b)),
      h ? b.snapTo({ x: p, y: g }) : b.setTarget({ x: p, y: g }),
      this.currentCursor)
    ) {
      const m = this.storageToClient(
          this.currentCursor.x,
          this.currentCursor.y,
        ),
        C = Fr(
          { x: d.x, y: d.y, pointer: o.pointer },
          { x: m.x, y: m.y, pointer: this.currentCursor.pointer },
        ),
        v = this.visibilityThreshold ? C < this.visibilityThreshold : !0;
      ((i.style.display = v ? "block" : "none"),
        (i.style.opacity = v ? "1" : "0"),
        i.dataset.animating ||
          (i.style.transform = v ? "scale(1)" : "scale(0.8)"));
    } else
      ((i.style.display = "block"),
        (i.style.opacity = "1"),
        i.dataset.animating || (i.style.transform = "scale(1)"));
  }
  createCursorElement(e, n = "mouse", s, r, i) {
    const o = document.createElement("div");
    if (
      ((o.className = "playhtml-cursor-other playhtml-cursor-fade-in"),
      r && this.options.onCustomCursorRender)
    ) {
      const c = this.options.onCustomCursorRender(r, o);
      if (c) return c;
    }
    const a = wm(ve(e));
    switch (n) {
      case "mouse":
        o.innerHTML = this.getMouseCursorSVG(a);
        break;
      case "touch":
        o.innerHTML = this.getTouchCursorSVG(a);
        break;
      default:
        o.innerHTML = mm(n)
          ? this.getCustomCursorSVG(a, n)
          : this.getMouseCursorSVG(a);
        break;
    }
    if (
      (this.options.cursorStyle &&
        (o.style.cssText += this.options.cursorStyle),
      this.updateCursorMessage(o, e, s),
      this.updateCursorName(o, e),
      this.options.getCursorStyle && i)
    ) {
      const c = this.options.getCursorStyle(i);
      Object.assign(o.style, c);
    }
    return o;
  }
  getMouseCursorSVG(e) {
    return `
      <svg
        height="32"
        viewBox="0 0 32 32"
        width="32"
        xmlns="http://www.w3.org/2000/svg"
        style="pointer-events: none;"
      >
        <g fill="none" fillRule="evenodd" transform="translate(10 7)">
          <path
            d="m6.148 18.473 1.863-1.003 1.615-.839-2.568-4.816h4.332l-11.379-11.408v16.015l3.316-3.221z"
            fill="#fff"
          />
          <path
            d="m6.431 17 1.765-.941-2.775-5.202h3.604l-8.025-8.043v11.188l2.53-2.442z"
            fill="${ls(e)}"
          />
        </g>
      </svg>
    `;
  }
  getTouchCursorSVG(e) {
    return `
      <svg
        height="32"
        viewBox="0 0 32 32"
        width="32"
        xmlns="http://www.w3.org/2000/svg"
        style="pointer-events: none;"
      >
        <g fill="none" fillRule="evenodd" transform="translate(9 8)">
          <path
            d="m3.8852309 13.5522788c.15029277.1354048.25406355.2326609.57471053.5372549.31406586.2983172.46594413.439273.60482646.5572091.05791893.0487853.10729946.1792495.12686364.3731628.01609788.1595565.01049553.3375341-.0090192.5090254-.00674888.0593077-.01325791.1020883-.01698742.1224696-.04186639.2287942.13249226.4401222.36507344.4424801.20929712.0021219.37056581.00472.79741331.0123273.10679864.0019014.10679864.0019014.21395196.0037648 1.16029156.0199598 1.75290683.01448 2.1782236-.039003.45462139-.05716.92282087-.6061887 1.32754658-1.2951218.3429437.6096032.818651 1.2048784 1.2990136 1.282277.1525992.0243739.3372104.0319365.5511764.0270146.1595258-.0036697.328349-.0141847.4987188-.0294071.1284742-.0114791.2308379-.0230173.2919821-.0309462.2259121-.0292954.3737346-.2515956.31337-.4712558-.0130388-.0474468-.0339905-.1345046-.0551176-.2441066-.0244927-.1270617-.0421932-.2511642-.0502379-.3642189-.0051002-.0716765-.0061057-.1365707-.0028638-.1926702.0056365-.097781.007395-.1525378.0101327-.2790463.0010457-.0470941.0010457-.0470941.0024433-.0883088.0052898-.134881.0234093-.2629524.0820463-.5422232.0251901-.1212103.1472903-.3531692.3395862-.6402332.0572734-.0854992.1198813-.1747825.1869659-.2669588.127207-.1747861.2641214-.3514011.4010853-.5204043.0820457-.1012383.1454717-.1769623.1807968-.2180763.2962199-.424403.6120842-1.1191696.7281396-1.5253635.111416-.3904017.2005405-1.10937558.2553074-1.81604479.0300143-.40088807.0411211-.72405394.0411211-1.23097561.0000507-.08891816.0000507-.08891816.0002032-.16234685.0002858-.12025251.0003032-.16573976-.0000887-.22195195-.0010706-.15358041-.0055478-.30580145-.0203882-.6940256-.0319191-.81365149-.4778003-1.3396911-1.1348711-1.44115781-.5589865-.08632026-1.2393839.37795756-1.2393839.37795756s-.1514404-.5228127-.2537197-.6842075c-.1661957-.25934741-.5941748-.58982828-.9213451-.65421118-.3365014-.0653413-.7354024-.05811592-1.1017193.00667481-.3207944.05740454-.64034865.34382687-.82518751.65277182-.13223727.22039488-.00786932-.01169164-.14013104-.2396787-.1830552-.31402315-.60932935-.59522407-1.01524567-.67822294-.34396352-.07112559-.73801897-.04403625-1.09795562.06293793-.46304125.13836397-.53675291.49073282-.55516748.38984626-.06158674-.3382385-.06727482-.3160095-.105656-.55729603-.14258072-.89527436-.30213161-1.51473549-.54406219-2.05528331.01391678.0310773-.08860981-.20214701-.12592279-.28256779-.06461002-.13925416-.12910532-.2652956-.19999629-.38652204-.21850342-.37364978-.46891278-.65340904-.7830908-.81233894-.54561037-.27629378-1.3634177-.14183064-1.75105565.31064856-.38495968.44966797-.4491432 1.20149287-.3521966 2.13184003.03702376.36121263.16678627 1.02066144.28444961 1.50812387.04160602.1691894.07805979.32348903.14491578.60851331.01149723.04848415.01149723.04848415.02309483.09698036.05172236.21571896.09707607.39320067.15122332.5879629-.00568154-.02030261.09701461.344086.11888835.42472961.00727686.02691587.00727686.02691587.01448296.05395339.04082856.15377935.08074083.31959314.14309954.5963099.03412572.1521447.06742545.31468601.09999775.48699018.08883553.46993091.089274.37207374.00375852.27186198-.05907319-.06922522-.11463055-.13209255-.16830659-.19003644-.09976937-.10770214-.19148509-.19677225-.2785569-.2678141-.6343975-.51905295-1.02312991-.74839425-1.55681885-.79878106-.87541567-.08410158-1.70619803.53426712-1.83111632 1.36882761-.07682697.51169638-.05207639.74723271.18463583 1.19942735.13026223.24432805.35060714.53942202.76172732 1.04735429.02515953.031068.02515953.031068.05030428.06206416.50464537.62186746.55962098.69095396.67961467.86473786.32435479.4706845 1.1139501 1.8221455 1.25748612 2.0035872z"
            fill="${ls(e)}"
          />
          <path
            d="m1.68266944 9.2716401c-.02488625-.03067752-.02488625-.03067752-.04970567-.06132555-.37729166-.46613768-.58418002-.74321015-.68156241-.9258495-.15281729-.29195235-.1611316-.37107459-.10605794-.73788601.06473349-.43247455.53181583-.78013371 1.01829549-.73339767.33660502.03178017.63068475.20527903 1.15339692.63295262.0565942.04617564.12482853.1124417.20288232.19670163.04616569.04983637.09513192.10524534.14800114.16720042.0794093.0930562.34702847.42052231.30761424.37286894.05814283.06991619.09971852.12407704.14721655.19045018.0941062.13434104.14705111.20894642.21874992.30454484-.0336171-.04487143.21473082.29843305.26732159.34863333.27859812.26593456.68203289.04195871.65675979-.31244785-.00421914-.05916537-.01812774-.12308431-.04717934-.23466885-.11487425-.81923739-.15505751-1.08218312-.24678252-1.56739907-.03407352-.18024544-.06905328-.35098727-.10521102-.5121905-.06435409-.28557213-.10635725-.46007245-.14994794-.62425526-.00774801-.02907063-.00774801-.02907063-.01552357-.05783095-.02300644-.08481964-.12725123-.45470311-.12030828-.42989063-.05134381-.18468043-.0945453-.35373996-.14431997-.56133562-.01130896-.04728909-.01130896-.04728909-.02259904-.09489949-.06649254-.28350912-.10387999-.44176072-.14606063-.6132721-.10998732-.45567652-.23425389-1.08719519-.2671036-1.40768017-.07546665-.72422018-.02339381-1.33418457.17582284-1.56688778.15554834-.1815673.59641015-.25405339.84271752-.12932486.16107512.0814814.32204278.26131571.47435101.521769.05764302.09857191.11172763.20426801.16708381.32357735.0335256.07225783.13292567.29837003.12172905.27336705.21032209.46992469.354801 1.03086841.48791736 1.86671535.03939531.24766201.08813662.52823537.15063928.87150416.01857903.10178746.01857903.10178746.03722922.20314381.30139226 1.63533599.27933797 1.51139381.28367122 1.64182468.01580667.47578071.71810567.4869267.74900255.01188722.00979855-.15065269.00630989-.2851661-.01107827-.67146517-.00245496-.05465243-.00245496-.05465243-.00481877-.10910149-.01521525-.35590459-.01433687-.56066672.00670546-.67705709.03834708-.21223125.22887-.4499778.40434754-.50241339.24641865-.07323589.51640341-.09179599.73269877-.04707051.20703808.0423346.44864736.20171736.51796318.32062499.08353628.14399789.15516008.36337367.21006107.63530456.04431149.21947986.07480439.45493493.0962536.70624261.00667352.0781897.01103024.13859819.01772256.23854675.00285005.04183594.00285005.04183594.00568968.07635213.00160285.01731471.00160285.01731471.00551199.04467336.00303535.01917374.00303535.01917374.01734216.06773608.00727602.13782339.00727602.13782339.56081544.18893151.16530264-.19982737.16530264-.19982737.16077268-.23486454.02708074-.1183491.04365279-.250265.06727822-.49813693.01508098-.16112409.02268576-.24033521.03157416-.32249887.036794-.34012028.0835164-.55621578.140511-.65120691.0707148-.11819408.3197845-.28280909.4314962-.30279961.2805348-.04961763.5886064-.0551978.8264635-.00901194.1077347.021202.3705429.22413969.4327499.32121002.1277282.20156171.2519621.8513817.3219188 1.49611734-.0110122.04228902-.0110122.04228902.1607163.28760404.5903408-.06730286.5903408-.06730286.5737568-.17389206.0155734-.03799147.0279666-.08191522.0455068-.15013809.0421947-.1597068.0701719-.25243998.1118273-.35635899.0288165-.07188915.0591935-.13335501.0903398-.18227881.120675-.18992919.4330876-.31896311.7070596-.2766556.2942545.0454396.4817569.26665023.4998934.72896761.0145423.38042999.0188438.52667972.0198445.67022961.0003693.0529684.0003531.09548963.0000723.21509672-.0001536.07391241-.0001536.07391241-.000205.16397385 0 .48892448-.010469.79353263-.0389535 1.17400348-.0506294.653266-.1361064 1.34281542-.228649 1.66708482-.094456.330596-.3764591.9508823-.5997469 1.2734975-.0158389.0153017-.0838055.0964468-.1706932.2036597-.1445918.1784155-.2892331.364998-.4248114.5512865-.0725632.099704-.140705.1968792-.2036767.2908847-.2436695.3637558-.4000227.6607868-.4506249.9042828-.0664376.3164194-.0901813.4842425-.0973169.666189-.0017426.0515155-.0017426.0515155-.0028439.1014735-.0025547.1180556-.0040857.165727-.0090621.2520573-.0052398.0906702-.0037444.1871795.0035093.2891187.0103883.145992.0000001.3454812.0000001.3454812s-.1266332-.0118299-.2678551-.0085813c-.1725177.0039685-.3159859-.0019087-.4151297-.0177442-.143046-.0230487-.5293508-.5064503-.7271506-.8830611-.3022704-.5764228-1.03604858-.5484427-1.33684295-.0394061-.27130191.4618137-.65965243.9172085-.77493336.9317029-.37460536.047106-.95471158.0524702-2.07175566.0332544-.10679478-.0018572-.10679478-.0018572-.21348729-.0037567-.42889761-.0076439-.41241496.0647655-.40363307-.0124079.02506967-.2203068.02222332-.1790312.00000011-.3992999-.03726222-.36933-.15125405-.6704984-.38877094-.8705429-.12286946-.1043424-.26983033-.2407345-.56500741-.5211097-.33722428-.3203411-.44283686-.4193233-.57299128-.5337266l-.80130455-.8907189c-.08795856-.1124788-.86002339-1.4339349-1.21248613-1.9454077-.13710846-.19857111-.18839645-.26302343-.71461353-.9114734zm9.50873056.0037599v3.459c0 .5.75.5.75 0v-3.459c0-.5-.75-.5-.75 0zm-2.03159602-.00057241.016 3.47300001c.00230346.4999947.7522955.4965395.74999204-.0034552l-.016-3.47299999c-.00230346-.4999947-.7522955-.49653951-.74999204.00345518zm-1.20911102 3.45357381-.021-3.42599996c-.00306475-.4999906-.75305066-.49539349-.74998592.00459712l.021 3.42600004c.00306475.4999906.75305066.4953935.74998592-.0045972z"
            fill="#fff"
          />
        </g>
      </svg>
    `;
  }
  getCustomCursorSVG(e, n) {
    return `
      <svg
        height="32"
        viewBox="0 0 32 32"
        width="32"
        xmlns="http://www.w3.org/2000/svg"
        style="filter: drop-shadow(0 0 0.25rem ${ls(e)}); pointer-events: none;"
      >
        <g fill="none" fillRule="evenodd" transform="translate(9 8)">
          <image href="${ls(n)}" width="32" height="32"></image>
        </g>
      </svg>
    `;
  }
  removeCursor(e) {
    const n = this.cursors.get(e);
    if (n) {
      (n.classList.remove("playhtml-cursor-fade-in"),
        n.classList.add("playhtml-cursor-fade-out"));
      const r = this.pendingRemovals.get(e);
      r && clearTimeout(r);
      const i = setTimeout(() => {
        (n.remove(), this.cursors.delete(e), this.pendingRemovals.delete(e));
      }, 300);
      this.pendingRemovals.set(e, i);
    }
    const s = this.cursorAnimators.get(e);
    (s && (s.destroy(), this.cursorAnimators.delete(e)),
      this.cursorZoneState.delete(e),
      this.cursorStyleKeys.delete(e));
  }
  setupGlobalAPI() {
    const e = this;
    window.cursors = {
      get allColors() {
        return jr(e.users.getAll());
      },
      get color() {
        return e.users.me.color;
      },
      set color(n) {
        e.users.me.color = n;
      },
      get name() {
        return e.users.me.name;
      },
      set name(n) {
        e.users.me.name = n;
      },
      on: (n, s) => {
        (e.globalApiListeners.has(n) || e.globalApiListeners.set(n, new Set()),
          e.globalApiListeners.get(n).add(s));
      },
      off: (n, s) => {
        const r = e.globalApiListeners.get(n);
        r && r.delete(s);
      },
    };
  }
  emitGlobalEvent(e, n) {
    const s = this.globalApiListeners.get(e);
    if (s)
      for (const r of s)
        try {
          r(n);
        } catch (i) {
          console.error(`[playhtml] cursors "${e}" subscriber threw:`, i);
        }
  }
  updateChatCTA() {
    this.chat &&
      (this.otherUsersWithMessages.size > 0
        ? this.chat.showCTA()
        : this.chat.hideCTA());
  }
  updateCursorMessage(e, n, s) {
    const r = e.querySelector(".playhtml-cursor-message");
    if ((r && r.remove(), s)) {
      const i = document.createElement("div");
      ((i.className = "playhtml-cursor-message"),
        (i.style.cssText = `
        position: absolute;
        font-size: 16px;
        font-style: normal;
        font-family: system-ui, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
        color: white;
        padding: 4px 9px 4px 9px;
        border-radius: 16px 16px 16px 16px;
        white-space: nowrap;
        background-color: rgba(52,199,89,1);
        top: 17px;
        left: 22px;
      `),
        (i.textContent = s),
        e.appendChild(i));
    }
  }
  updateCursorName(e, n) {
    const s = e.querySelector(".playhtml-cursor-name");
    s && s.remove();
    const r = n?.name;
    if (r && n) {
      const i = ve(n),
        o = r.length > 10 ? r.slice(0, 10) + ".." : r,
        a = this.opacifyColor(i, 0.6),
        c = this.opacifyColor(i, 0.3),
        l = this.getContrastColor(i),
        u = document.createElement("div");
      ((u.className = "playhtml-cursor-name"),
        (u.style.cssText = `
        position: absolute;
        white-space: nowrap;
        padding: 4px 6px;
        font-size: 12px;
        background: ${i};
        border-radius: 14px;
        top: 14px;
        left: 18px;
        opacity: 0.75;
        border: 1px solid ${a};
        box-shadow: 1px 1px 4px 2px ${c};
        color: ${l};
      `),
        (u.textContent = o),
        e.appendChild(u));
    }
  }
  opacifyColor(e, n) {
    if (e.startsWith("#")) {
      const s = e.replace("#", ""),
        r = parseInt(s.substring(0, 2), 16),
        i = parseInt(s.substring(2, 4), 16),
        o = parseInt(s.substring(4, 6), 16);
      return `rgba(${r}, ${i}, ${o}, ${n})`;
    } else {
      if (e.startsWith("rgba")) return e.replace(/[\d\.]+\)$/, `${n})`);
      if (e.startsWith("rgb"))
        return e.replace("rgb", "rgba").replace(")", `, ${n})`);
      if (e.startsWith("hsl")) {
        const s = e.match(
          /hsl\((\d+(?:\.\d+)?),\s*(\d+(?:\.\d+)?)%,\s*(\d+(?:\.\d+)?)%\)/,
        );
        if (s) {
          const [, r, i, o] = s.map(Number),
            [a, c, l] = this.hslToRgb(r, i, o);
          return `rgba(${a}, ${c}, ${l}, ${n})`;
        }
      }
    }
    return e;
  }
  hslToRgb(e, n, s) {
    ((e /= 360), (n /= 100), (s /= 100));
    let r, i, o;
    if (n === 0) r = i = o = s;
    else {
      const a = (u, h, d) => (
          d < 0 && (d += 1),
          d > 1 && (d -= 1),
          d < 0.16666666666666666
            ? u + (h - u) * 6 * d
            : d < 0.5
              ? h
              : d < 0.6666666666666666
                ? u + (h - u) * (0.6666666666666666 - d) * 6
                : u
        ),
        c = s < 0.5 ? s * (1 + n) : s + n - s * n,
        l = 2 * s - c;
      ((r = a(l, c, e + 1 / 3)), (i = a(l, c, e)), (o = a(l, c, e - 1 / 3)));
    }
    return [Math.round(r * 255), Math.round(i * 255), Math.round(o * 255)];
  }
  getLuminance(e) {
    let n, s, r;
    if (e.startsWith("#")) {
      const c = e.replace("#", "");
      ((n = parseInt(c.substring(0, 2), 16)),
        (s = parseInt(c.substring(2, 4), 16)),
        (r = parseInt(c.substring(4, 6), 16)));
    } else if (e.startsWith("rgb")) {
      const c = e.match(/\d+/g);
      if (!c || c.length < 3) return 0;
      [n, s, r] = c.map(Number);
    } else if (e.startsWith("hsl")) {
      const c = e.match(/\d+(\.\d+)?/g);
      if (!c || c.length < 3) return 0;
      const [l, u, h] = c.map(Number);
      [n, s, r] = this.hslToRgb(l, u, h);
    } else return 0;
    const [i, o, a] = [n / 255, s / 255, r / 255].map((c) =>
      c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4),
    );
    return 0.2126 * i + 0.7152 * o + 0.0722 * a;
  }
  getContrastColor(e) {
    return this.getLuminance(e) > 0.5 ? "#000000" : "#ffffff";
  }
  updateAllCursorVisibility() {
    if (!this.currentCursor || !this.visibilityThreshold) return;
    const e = this.storageToClient(this.currentCursor.x, this.currentCursor.y);
    this.cursors.forEach((n, s) => {
      const r = this.spatialGrid.getAll().find((i) => i.id === s)?.data;
      if (r && r.cursor) {
        const i = this.storageToClient(r.cursor.x, r.cursor.y),
          o =
            Fr(
              { ...e, pointer: this.currentCursor.pointer },
              { ...i, pointer: r.cursor.pointer },
            ) < this.visibilityThreshold;
        ((n.style.display = o ? "block" : "none"),
          (n.style.opacity = o ? "1" : "0"),
          n.dataset.animating ||
            (n.style.transform = o ? "scale(1)" : "scale(0.8)"));
      }
    });
  }
  showAllCursors() {
    this.cursors.forEach((e) => {
      ((e.style.display = "block"),
        (e.style.opacity = "1"),
        e.dataset.animating || (e.style.transform = "scale(1)"));
    });
  }
  configure(e) {
    if ((Object.assign(this.options, e), e.shouldRenderCursor !== void 0))
      for (const [n, s] of this.activeCursorPresenceEntries())
        this.updateCursor(n, s);
    (e.visibilityThreshold !== void 0 &&
      ((this.visibilityThreshold = e.visibilityThreshold),
      this.updateAllCursorVisibility()),
      e.playerIdentity !== void 0 &&
        this.users.adoptIdentity(e.playerIdentity));
  }
  registerZone(e, n) {
    if (!e.id)
      throw new Error("[playhtml] Zone element must have an id attribute.");
    this.zones.set(e.id, { element: e, options: n });
  }
  unregisterZone(e) {
    this.zones.delete(e);
  }
  hideCursor(e) {
    const n = this.cursors.get(e);
    n && (n.style.display = "none");
  }
  showCursor(e) {
    const n = this.cursors.get(e);
    n && (n.style.display = "block");
  }
  destroy() {
    (this.unsubscribeSelfChange?.(),
      (this.unsubscribeSelfChange = null),
      this.unsubscribeUsersChange?.(),
      (this.unsubscribeUsersChange = null),
      this.ownsUsers && this.users.destroy(),
      this.cursorEventCleanups.forEach((e) => e()),
      (this.cursorEventCleanups = []),
      this.pointerFrame !== null &&
        (this.cancelPointerFrame(this.pointerFrame),
        (this.pointerFrame = null)),
      (this.pendingPointerSample = null),
      this.awarenessUpdateTimeout !== null &&
        (clearTimeout(this.awarenessUpdateTimeout),
        (this.awarenessUpdateTimeout = null)),
      this.cursors.forEach((e) => e.remove()),
      this.cursors.clear(),
      this.cursorAnimators.forEach((e) => e.destroy()),
      this.cursorAnimators.clear(),
      this.spatialGrid.clear(),
      this.zones.clear(),
      this.cursorZoneState.clear(),
      this.cursorStyleKeys.clear(),
      this.clientIdToStableId.clear(),
      this.pendingRemovals.forEach((e) => clearTimeout(e)),
      this.pendingRemovals.clear(),
      this.chat && this.chat.destroy(),
      this.presenceTransport
        ? (this.presenceTransportUnsubscribe?.(),
          (this.presenceTransportUnsubscribe = null),
          this.presenceTransport.clear("cursor"))
        : this.provider.awareness.setLocalStateField(un, null));
  }
  getDebugInfo() {
    const e = this.spatialGrid.getItemCount(),
      n = this.spatialGrid.getCellCount();
    return {
      totalCursors: e,
      gridCells: n,
      avgCursorsPerCell: n > 0 ? e / n : 0,
    };
  }
  on(e, n) {
    (this.globalApiListeners.has(e) ||
      this.globalApiListeners.set(e, new Set()),
      this.globalApiListeners.get(e).add(n));
  }
  off(e, n) {
    const s = this.globalApiListeners.get(e);
    s && s.delete(n);
  }
  getSnapshot() {
    return {
      allColors: jr(this.users.getAll()),
      color: ve(this.playerIdentity),
      name: this.playerIdentity.name ?? void 0,
    };
  }
  getMyPlayerIdentity() {
    return this.playerIdentity;
  }
  getProvider() {
    return this.provider;
  }
  getCursorPresences() {
    const e = new Map();
    if (this.presenceTransport) {
      const n = tt(),
        s = this.currentCursor
          ? this.storageToClient(this.currentCursor.x, this.currentCursor.y)
          : null;
      e.set(this.playerIdentity.publicKey, {
        cursor:
          s && this.currentCursor
            ? { x: s.x, y: s.y, pointer: this.currentCursor.pointer }
            : null,
        playerIdentity: this.playerIdentity,
        zone: this.currentZone,
        page: n,
      });
    }
    for (const [n, s] of this.cursorPresenceEntries({
      includeLocalAwareness: !this.presenceTransport,
    })) {
      const r = s.cursor ? this.storageToClient(s.cursor.x, s.cursor.y) : null;
      e.set(n, {
        cursor:
          r && s.cursor ? { x: r.x, y: r.y, pointer: s.cursor.pointer } : null,
        playerIdentity: s.playerIdentity,
        zone: s.zone,
        page: s.page,
      });
    }
    return e;
  }
  onCursorPresencesChange(e) {
    const n = Math.random().toString(36);
    return (
      this.cursorPresenceChangeCallbacks.set(n, e),
      () => {
        this.cursorPresenceChangeCallbacks.delete(n);
      }
    );
  }
  notifyCursorPresenceListeners() {
    const e = this.getCursorPresences();
    this.cursorPresenceChangeCallbacks.forEach((n) => n(e));
  }
  triggerCursorAnimation(e, n, s = 1500) {
    const r = this.activeAnimationCleanups.get(e);
    if ((r && r(), e === this.playerIdentity.publicKey))
      return this.triggerSelfCursorAnimation(n, s);
    const i = this.cursors.get(e);
    if (!i) return !1;
    const o = i.querySelector("svg") ?? i;
    i.dataset.animating = "true";
    const a = i.style.display,
      c = i.style.opacity;
    ((i.style.display = "block"), (i.style.opacity = "1"));
    const l = i.style.transition;
    ((i.style.transition = "none"), o.classList.add(n));
    let u = !1;
    const h = () => {
      u ||
        ((u = !0),
        o.classList.remove(n),
        delete i.dataset.animating,
        (i.style.transition = l),
        (i.style.display = a),
        (i.style.opacity = c),
        this.activeAnimationCleanups.delete(e));
    };
    this.activeAnimationCleanups.set(e, h);
    const d = () => {
      (h(), o.removeEventListener("animationend", d));
    };
    return (o.addEventListener("animationend", d), window.setTimeout(d, s), !0);
  }
  triggerSelfCursorAnimation(e, n) {
    if (!this.currentCursor) return !1;
    const s = ve(this.playerIdentity),
      r = this.storageToClient(this.currentCursor.x, this.currentCursor.y),
      i = document.createElement("div");
    ((i.className = `playhtml-cursor-other ${e}`),
      (i.style.cssText = `
      position: fixed;
      left: ${r.x - 16}px;
      top: ${r.y - 16}px;
      width: 32px;
      height: 32px;
      z-index: 999999;
      pointer-events: none;
      opacity: 0.3;
      transform-origin: top left;
    `),
      (i.innerHTML = this.getMouseCursorSVG(s)),
      document.body.appendChild(i));
    const o = this.playerIdentity.publicKey;
    let a = !1;
    const c = () => {
      a ||
        ((a = !0),
        i.removeEventListener("animationend", l),
        i.remove(),
        this.activeAnimationCleanups.delete(o));
    };
    this.activeAnimationCleanups.set(o, c);
    const l = () => c();
    return (i.addEventListener("animationend", l), window.setTimeout(c, n), !0);
  }
}
const us = "__presence__",
  Ya = "__playhtml_cursors__",
  bi = "__playhtml_identity__",
  vm = new Set(["playerIdentity", "cursor", "isMe"]);
function Du(t) {
  const e = new Map(),
    n = new WeakSet();
  let s = null,
    r = 0;
  function i() {
    return t.getAwareness();
  }
  function o() {
    t.publishIdentity !== !1 && Cm(i(), t.getPlayerIdentity());
  }
  function a(g, b) {
    const m = [],
      C = Array.from(g.keys()).sort((v, _) => v - _);
    for (const v of C) {
      const _ = g.get(v);
      if (!_) continue;
      let I;
      b === "cursor" ? (I = _[Ya]?.cursor) : (I = _[us]?.[b]);
      try {
        m.push(`${v}:${JSON.stringify(I ?? null)}`);
      } catch {
        m.push(`${v}:null`);
      }
    }
    return m.join("|");
  }
  function c() {
    if (e.size === 0) return;
    const g = i().getStates();
    let b = null;
    const m = () => (b || (b = f()), b);
    for (const C of e.values()) {
      const v = a(g, C.channel);
      v !== C.lastFingerprint && ((C.lastFingerprint = v), C.callback(m()));
    }
  }
  function l() {
    const g = i();
    s !== g && ((s = g), !n.has(g) && (n.add(g), g.on("change", c)));
  }
  function u() {
    e.size > 0 && l();
  }
  function h(g, b) {
    const m = g[Ya],
      C = g[bi] ?? m?.playerIdentity,
      v = m?.cursor ?? null,
      _ = g[us] ?? {},
      I = { playerIdentity: C, cursor: v, isMe: b };
    for (const [y, E] of Object.entries(_))
      !vm.has(y) && E != null && (I[y] = E);
    return I;
  }
  function d() {
    const g = i(),
      b = g.getLocalState();
    return b ? kt(b, g.clientID) : t.getPlayerIdentity().publicKey;
  }
  function f() {
    const g = new Map(),
      b = i(),
      m = b.getStates(),
      C = b.clientID,
      v = d();
    let _ = !1;
    const I = new Map();
    m.forEach((y, E) => {
      const q = kt(y, E),
        O = q === v,
        V = I.get(q);
      if (V === void 0) {
        I.set(q, E);
        return;
      }
      if (O && E === C) {
        I.set(q, E);
        return;
      }
      (O && V === C) || (E > V && I.set(q, E));
    });
    for (const [y, E] of I) {
      const q = m.get(E);
      if (!q) continue;
      const O = y === v;
      (O && (_ = !0), g.set(y, h(q, O)));
    }
    if (!_) {
      const y = b.getLocalState() ?? {},
        E = h(y, !0);
      ((E.playerIdentity = t.getPlayerIdentity()), g.set(v, E));
    }
    return (p(g, v), g);
  }
  function p(g, b) {
    const m = t.getCursorPresences?.();
    if (m)
      for (const [C, v] of m) {
        const _ = g.get(C);
        g.set(C, {
          ..._,
          playerIdentity: v.playerIdentity ?? _?.playerIdentity,
          cursor: v.cursor ?? null,
          isMe: C === b,
        });
      }
  }
  return {
    setMyPresence(g, b) {
      (o(), u());
      const m = i(),
        C = (m.getLocalState() ?? {})[us] ?? {};
      let v;
      if (b == null) {
        const { [g]: _, ...I } = C;
        v = I;
      } else v = { ...C, [g]: b };
      m.setLocalStateField(us, v);
    },
    getPresences() {
      return (o(), u(), f());
    },
    onPresenceChange(g, b) {
      if ((o(), g === "cursor" && t.onCursorPresencesChange)) {
        const _ = t.onCursorPresencesChange(() => {
          b(f());
        });
        return (b(f()), _);
      }
      const m = String(r++),
        C = i().getStates(),
        v = a(C, g);
      return (
        e.set(m, { channel: g, callback: b, lastFingerprint: v }),
        l(),
        b(f()),
        () => {
          e.delete(m);
        }
      );
    },
    getMyIdentity() {
      return t.getPlayerIdentity();
    },
  };
}
function Cm(t, e) {
  t.getLocalState()?.[bi] || t.setLocalStateField(bi, e);
}
const Lu = new Map();
function Mu(t, e) {
  Lu.set(t, e);
}
function Sm() {
  const t = [];
  return (
    document.querySelectorAll("[shared]").forEach((e) => {
      if (!e.id) return;
      let n = "read-write";
      const s = e.getAttribute("shared");
      if (s && s !== "") {
        const r = s.toLowerCase();
        (r.includes("read-only") || r === "ro") && (n = "read-only");
      }
      t.push({
        elementId: e.id,
        permissions: n,
        path: window.location.pathname,
      });
    }),
    t
  );
}
function _m() {
  const t = [];
  return (
    document.querySelectorAll("[data-source]").forEach((e) => {
      const n = e.getAttribute("data-source");
      if (n)
        try {
          const { domain: s, path: r, elementId: i } = Ql(n);
          t.push({ domain: s, path: r, elementId: i });
        } catch {}
    }),
    t
  );
}
function Em(t, e) {
  if (t.hasAttribute("data-source") && t.hasAttribute("data-source-read-only"))
    return !0;
  const n = e ?? Bn(t);
  return n ? Lu.get(n) === "read-only" : !1;
}
const Z = "__page__";
function Tu(t) {
  return `${Z}:${t}`;
}
function Pu(t, e, n) {
  const { getStorePlay: s, yObserverByKey: r } = e,
    i = Tu(t);
  if (r.has(i)) return;
  const o = ke(s()[Z]?.[t]);
  if (!o || typeof o.observeDeep != "function") return;
  let a = !1;
  const c = () => {
    a ||
      ((a = !0),
      queueMicrotask(() => {
        a = !1;
        const l = s()[Z]?.[t];
        if (!l) return;
        const u = ot(l);
        for (const h of n) h(u);
      }));
  };
  (o.observeDeep(c), r.set(i, c));
}
function Ou(t) {
  const { channelListeners: e, getStorePlay: n } = t;
  for (const [s, r] of e) {
    const i = n()[Z]?.[s];
    if (!i) continue;
    Pu(s, t, r);
    const o = ot(i);
    for (const a of r) a(o);
  }
}
function km(t, e, n) {
  const {
      ensureProxy: s,
      getProxy: r,
      getDoc: i,
      getStorePlay: o,
      proxyByTagAndId: a,
      yObserverByKey: c,
      channelRefCounts: l,
      channelListeners: u,
    } = n,
    h = () => o(),
    d = () => i();
  ((h()[Z] ??= {}), s(Z, t, e), u.has(t) || u.set(t, new Set()));
  const f = u.get(t),
    p = new Set();
  function g() {
    Pu(t, n, f);
  }
  const b = (l.get(t) ?? 0) + 1;
  (l.set(t, b), g());
  let m = !1;
  return {
    getData() {
      if (m) throw new Error(`PageDataChannel "${t}" has been destroyed`);
      return ot(h()[Z]?.[t] ?? e);
    },
    setData(C) {
      if (m) throw new Error(`PageDataChannel "${t}" has been destroyed`);
      let v = r(Z, t);
      v == null && ((v = s(Z, t, e)), g());
      const _ = v;
      typeof C == "function"
        ? d().transact(() => {
            C(_);
          })
        : d().transact(() => {
            Hs(_, C);
          });
    },
    onUpdate(C) {
      if (m) throw new Error(`PageDataChannel "${t}" has been destroyed`);
      return (
        f.add(C),
        p.add(C),
        () => {
          (f.delete(C), p.delete(C));
        }
      );
    },
    destroy() {
      if (m) return;
      m = !0;
      for (const v of p) f.delete(v);
      p.clear();
      const C = (l.get(t) ?? 1) - 1;
      if ((l.set(t, C), C <= 0)) {
        (l.delete(t), u.delete(t));
        const v = Tu(t),
          _ = c.get(v);
        if (_) {
          const y = ke(h()[Z]?.[t]);
          (y && typeof y.unobserveDeep == "function" && y.unobserveDeep(_),
            c.delete(v));
        }
        const I = a.get(Z);
        I && I.delete(t);
      }
    },
  };
}
const Am = "playhtml.syncedStore is read-only.",
  xm = new Set([
    "copyWithin",
    "fill",
    "pop",
    "push",
    "reverse",
    "shift",
    "sort",
    "splice",
    "unshift",
  ]);
function Mt() {
  throw new Error(Am);
}
function Im(t) {
  return Array.isArray(t) ? [] : {};
}
function Ga(t, e) {
  !Array.isArray(t) || !Array.isArray(e) || (e.length = t.length);
}
function Nu(t) {
  const e = new WeakMap();
  function n(s) {
    if (s === null || typeof s != "object") return s;
    const r = e.get(s);
    if (r) return r;
    const i = s,
      o = Im(i),
      a = new Proxy(o, {
        get(c, l) {
          return Array.isArray(i) && xm.has(l) ? Mt : n(Reflect.get(i, l, i));
        },
        getOwnPropertyDescriptor(c, l) {
          if ((Ga(i, o), Array.isArray(i) && l === "length"))
            return Reflect.getOwnPropertyDescriptor(o, l);
          const u = Reflect.getOwnPropertyDescriptor(i, l);
          return (
            u &&
            ("value" in u
              ? { ...u, configurable: !0, value: n(u.value), writable: !1 }
              : {
                  configurable: !0,
                  enumerable: u.enumerable,
                  value: n(Reflect.get(i, l, i)),
                  writable: !1,
                })
          );
        },
        has(c, l) {
          return l in i;
        },
        ownKeys() {
          return (Ga(i, o), Reflect.ownKeys(i));
        },
        getPrototypeOf() {
          return Reflect.getPrototypeOf(i);
        },
        set: Mt,
        deleteProperty: Mt,
        defineProperty: Mt,
        setPrototypeOf: Mt,
        preventExtensions: Mt,
      });
    return (e.set(s, a), a);
  }
  return n(t);
}
(!globalThis.EventTarget || !globalThis.Event) &&
  console.error(`
  PartySocket requires a global 'EventTarget' class to be available!
  You can polyfill this global by adding this to your code before any partysocket imports: 
  
  \`\`\`
  import 'partysocket/event-target-polyfill';
  \`\`\`
  Please file an issue at https://github.com/partykit/partykit if you're still having trouble.
`);
var Ru = class extends Event {
    message;
    error;
    constructor(t, e) {
      (super("error", e), (this.message = t.message), (this.error = t));
    }
  },
  ju = class extends Event {
    code;
    reason;
    wasClean = !0;
    constructor(t = 1e3, e = "", n) {
      (super("close", n), (this.code = t), (this.reason = e));
    }
  };
const Kr = { Event, ErrorEvent: Ru, CloseEvent: ju };
function $m(t, e) {
  if (!t) throw new Error(e);
}
function Dm(t) {
  return new t.constructor(t.type, t);
}
function Lm(t) {
  return "data" in t
    ? new MessageEvent(t.type, t)
    : "code" in t || "reason" in t
      ? new ju(t.code || 1999, t.reason || "unknown reason", t)
      : "error" in t
        ? new Ru(t.error, t)
        : new Event(t.type, t);
}
const Mm = typeof process < "u" && typeof process.versions?.node < "u",
  Tm = typeof navigator < "u" && navigator.product === "ReactNative",
  hs = Mm || Tm ? Lm : Dm,
  ut = {
    maxReconnectionDelay: 1e4,
    minReconnectionDelay: 3e3,
    minUptime: 5e3,
    reconnectionDelayGrowFactor: 1.3,
    connectionTimeout: 4e3,
    maxRetries: Number.POSITIVE_INFINITY,
    maxEnqueuedMessages: Number.POSITIVE_INFINITY,
  };
let Ja = !1;
function Pm() {}
var Om = class Je extends EventTarget {
  _ws;
  _retryCount = -1;
  _uptimeTimeout;
  _connectTimeout;
  _shouldReconnect = !0;
  _connectLock = !1;
  _binaryType = "blob";
  _closeCalled = !1;
  _didWarnAboutClosedSend = !1;
  _messageQueue = [];
  _debugLogger = console.log.bind(console);
  _url;
  _protocols;
  _options;
  constructor(e, n, s = {}) {
    (super(),
      (this._url = e),
      (this._protocols = n),
      (this._options = s),
      this._options.startClosed && (this._shouldReconnect = !1),
      this._options.debugLogger &&
        (this._debugLogger = this._options.debugLogger),
      this._connect());
  }
  static get CONNECTING() {
    return 0;
  }
  static get OPEN() {
    return 1;
  }
  static get CLOSING() {
    return 2;
  }
  static get CLOSED() {
    return 3;
  }
  get CONNECTING() {
    return Je.CONNECTING;
  }
  get OPEN() {
    return Je.OPEN;
  }
  get CLOSING() {
    return Je.CLOSING;
  }
  get CLOSED() {
    return Je.CLOSED;
  }
  get binaryType() {
    return this._ws ? this._ws.binaryType : this._binaryType;
  }
  set binaryType(e) {
    ((this._binaryType = e), this._ws && (this._ws.binaryType = e));
  }
  get retryCount() {
    return Math.max(this._retryCount, 0);
  }
  get bufferedAmount() {
    return (
      this._messageQueue.reduce(
        (e, n) => (
          typeof n == "string"
            ? (e += n.length)
            : n instanceof Blob
              ? (e += n.size)
              : (e += n.byteLength),
          e
        ),
        0,
      ) + (this._ws ? this._ws.bufferedAmount : 0)
    );
  }
  get extensions() {
    return this._ws ? this._ws.extensions : "";
  }
  get protocol() {
    return this._ws ? this._ws.protocol : "";
  }
  get readyState() {
    return this._closeCalled
      ? Je.CLOSED
      : this._ws
        ? this._ws.readyState
        : this._options.startClosed
          ? Je.CLOSED
          : Je.CONNECTING;
  }
  get url() {
    return this._ws ? this._ws.url : "";
  }
  get shouldReconnect() {
    return this._shouldReconnect;
  }
  onclose = null;
  onerror = null;
  onmessage = null;
  onopen = null;
  close(e = 1e3, n) {
    if (
      ((this._closeCalled = !0),
      (this._shouldReconnect = !1),
      this._clearTimeouts(),
      !this._ws)
    ) {
      this._debug("close enqueued: no ws instance");
      return;
    }
    if (
      this._ws.readyState === this.CLOSED ||
      this._ws.readyState === this.CLOSING
    ) {
      this._debug("close: already closing or closed");
      return;
    }
    this._disconnect(e, n);
  }
  reconnect(e, n) {
    ((this._shouldReconnect = !0),
      (this._closeCalled = !1),
      (this._didWarnAboutClosedSend = !1),
      (this._retryCount = -1),
      !this._ws ||
      this._ws.readyState === this.CLOSED ||
      this._ws.readyState === this.CLOSING
        ? this._connect()
        : (this._disconnect(e, n), this._connect()));
  }
  send(e) {
    if (this._ws && this._ws.readyState === this.OPEN)
      return (this._debug("send", e), this._ws.send(e), !0);
    this._closeCalled &&
      !this._didWarnAboutClosedSend &&
      ((this._didWarnAboutClosedSend = !0),
      console.warn(
        "ReconnectingWebSocket: send() was called after close(). The message has been buffered, but it will only be delivered if reconnect() is called on this socket. If this socket has been discarded, the message is lost — this usually means a stale socket reference is being used.",
      ));
    const { maxEnqueuedMessages: n = ut.maxEnqueuedMessages } = this._options;
    return (
      this._messageQueue.length < n &&
        (this._debug("enqueue", e), this._messageQueue.push(e)),
      !1
    );
  }
  drainQueuedMessages() {
    const e = this._messageQueue;
    return ((this._messageQueue = []), e);
  }
  _debug(...e) {
    this._options.debug && this._debugLogger("RWS>", ...e);
  }
  _getNextDelay() {
    const {
      reconnectionDelayGrowFactor: e = ut.reconnectionDelayGrowFactor,
      minReconnectionDelay: n = ut.minReconnectionDelay,
      maxReconnectionDelay: s = ut.maxReconnectionDelay,
    } = this._options;
    let r = 0;
    return (
      this._retryCount > 0 &&
        ((r = n * e ** (this._retryCount - 1)), r > s && (r = s)),
      this._debug("next delay", r),
      r
    );
  }
  _wait() {
    return new Promise((e) => {
      setTimeout(e, this._getNextDelay());
    });
  }
  _getNextProtocols(e) {
    if (!e) return Promise.resolve(null);
    if (typeof e == "string" || Array.isArray(e)) return Promise.resolve(e);
    if (typeof e == "function") {
      const n = e();
      if (!n) return Promise.resolve(null);
      if (typeof n == "string" || Array.isArray(n)) return Promise.resolve(n);
      if (n.then) return n;
    }
    throw Error("Invalid protocols");
  }
  _getNextUrl(e) {
    if (typeof e == "string") return Promise.resolve(e);
    if (typeof e == "function") {
      const n = e();
      if (typeof n == "string") return Promise.resolve(n);
      if (n.then) return n;
    }
    throw Error("Invalid URL");
  }
  _connect() {
    if (this._connectLock || !this._shouldReconnect) return;
    this._connectLock = !0;
    const {
      maxRetries: e = ut.maxRetries,
      connectionTimeout: n = ut.connectionTimeout,
    } = this._options;
    if (this._retryCount >= e) {
      (this._debug("max retries reached", this._retryCount, ">=", e),
        (this._connectLock = !1));
      return;
    }
    (this._retryCount++,
      this._debug("connect", this._retryCount),
      this._removeListeners(),
      this._wait()
        .then(() =>
          Promise.all([
            this._getNextUrl(this._url),
            this._getNextProtocols(this._protocols || null),
          ]),
        )
        .then(([s, r]) => {
          if (this._closeCalled) {
            this._connectLock = !1;
            return;
          }
          !this._options.WebSocket &&
            typeof WebSocket > "u" &&
            !Ja &&
            (console.error(`‼️ No WebSocket implementation available. You should define options.WebSocket. 

For example, if you're using node.js, run \`npm install ws\`, and then in your code:

import PartySocket from 'partysocket';
import WS from 'ws';

const partysocket = new PartySocket({
  host: "127.0.0.1:1999",
  room: "test-room",
  WebSocket: WS
});

`),
            (Ja = !0));
          const i = this._options.WebSocket || WebSocket;
          (this._debug("connect", { url: s, protocols: r }),
            (this._ws = r ? new i(s, r) : new i(s)),
            (this._ws.binaryType = this._binaryType),
            (this._connectLock = !1),
            this._addListeners(),
            (this._connectTimeout = setTimeout(
              () => this._handleTimeout(),
              n,
            )));
        })
        .catch((s) => {
          ((this._connectLock = !1),
            this._handleError(new Kr.ErrorEvent(Error(s.message), this)));
        }));
  }
  _handleTimeout() {
    (this._debug("timeout event"),
      this._handleError(new Kr.ErrorEvent(Error("TIMEOUT"), this)));
  }
  _disconnect(e = 1e3, n) {
    if ((this._clearTimeouts(), !!this._ws)) {
      this._removeListeners();
      try {
        ((this._ws.readyState === this.OPEN ||
          this._ws.readyState === this.CONNECTING) &&
          this._ws.close(e, n),
          this._handleClose(new Kr.CloseEvent(e, n, this)));
      } catch {}
    }
  }
  _acceptOpen() {
    (this._debug("accept open"), (this._retryCount = 0));
  }
  _handleOpen = (e) => {
    this._debug("open event");
    const { minUptime: n = ut.minUptime } = this._options;
    (clearTimeout(this._connectTimeout),
      (this._uptimeTimeout = setTimeout(() => this._acceptOpen(), n)),
      $m(this._ws, "WebSocket is not defined"),
      (this._ws.binaryType = this._binaryType),
      this._messageQueue.forEach((s) => {
        this._ws?.send(s);
      }),
      (this._messageQueue = []),
      this.onopen && this.onopen(e),
      this.dispatchEvent(hs(e)));
  };
  _handleMessage = (e) => {
    (this._debug("message event"),
      this.onmessage && this.onmessage(e),
      this.dispatchEvent(hs(e)));
  };
  _handleError = (e) => {
    (this._debug("error event", e.message),
      this._disconnect(void 0, e.message === "TIMEOUT" ? "timeout" : void 0),
      this.onerror && this.onerror(e),
      this._debug("exec error listeners"),
      this.dispatchEvent(hs(e)),
      this._connect());
  };
  _handleClose = (e) => {
    (this._debug("close event"),
      this._clearTimeouts(),
      this._shouldReconnect && this._connect(),
      this.onclose && this.onclose(e),
      this.dispatchEvent(hs(e)));
  };
  _removeListeners() {
    this._ws &&
      (this._debug("removeListeners"),
      this._ws.removeEventListener("open", this._handleOpen),
      this._ws.removeEventListener("close", this._handleClose),
      this._ws.removeEventListener("message", this._handleMessage),
      this._ws.removeEventListener("error", this._handleError),
      this._ws.addEventListener("error", Pm));
  }
  _addListeners() {
    this._ws &&
      (this._debug("addListeners"),
      this._ws.addEventListener("open", this._handleOpen),
      this._ws.addEventListener("close", this._handleClose),
      this._ws.addEventListener("message", this._handleMessage),
      this._ws.addEventListener("error", this._handleError));
  }
  _clearTimeouts() {
    (clearTimeout(this._connectTimeout), clearTimeout(this._uptimeTimeout));
  }
};
const Nm = (t) => t[1] !== null && t[1] !== void 0;
function Rm() {
  if (crypto?.randomUUID) return crypto.randomUUID();
  let t = Date.now(),
    e = (performance?.now && performance.now() * 1e3) || 0;
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (n) {
    let s = Math.random() * 16;
    return (
      t > 0
        ? ((s = (t + s) % 16 | 0), (t = Math.floor(t / 16)))
        : ((s = (e + s) % 16 | 0), (e = Math.floor(e / 16))),
      (n === "x" ? s : (s & 3) | 8).toString(16)
    );
  });
}
function Uu(t, e, n = {}) {
  const {
    host: s,
    path: r,
    protocol: i,
    room: o,
    party: a,
    basePath: c,
    prefix: l,
    query: u,
  } = t;
  let h = s.replace(/^(http|https|ws|wss):\/\//, "");
  if ((h.endsWith("/") && (h = h.slice(0, -1)), r?.startsWith("/")))
    throw new Error("path must not start with a slash");
  const d = a ?? "main",
    f = r ? `/${r}` : "",
    p =
      i ||
      (h.startsWith("localhost:") ||
      h.startsWith("127.0.0.1:") ||
      h.startsWith("192.168.") ||
      h.startsWith("10.") ||
      (h.startsWith("172.") &&
        h.split(".")[1] >= "16" &&
        h.split(".")[1] <= "31") ||
      h.startsWith("[::ffff:7f00:1]:")
        ? e
        : `${e}s`),
    g = `${p}://${h}/${c || `${l || "parties"}/${d}/${o}`}${f}`,
    b = (C = {}) =>
      `${g}?${new URLSearchParams([...Object.entries(n), ...Object.entries(C).filter(Nm)])}`,
    m = typeof u == "function" ? async () => b(await u()) : b(u);
  return {
    host: h,
    path: f,
    room: o,
    name: d,
    protocol: p,
    partyUrl: g,
    urlProvider: m,
  };
}
var jm = class extends Om {
  _pk;
  _pkurl;
  name;
  room;
  host;
  path;
  basePath;
  constructor(t) {
    const e = Xa(t);
    if (
      (super(e.urlProvider, e.protocols, e.socketOptions),
      (this.partySocketOptions = t),
      this.setWSProperties(e),
      !t.startClosed && !this.room && !this.basePath)
    )
      throw (
        this.close(),
        new Error(
          "Either room or basePath must be provided to connect. Use startClosed: true to create a socket and set them via updateProperties before calling reconnect().",
        )
      );
    t.disableNameValidation ||
      (t.party?.includes("/") &&
        console.warn(
          `PartySocket: party name "${t.party}" contains forward slash which may cause routing issues. Consider using a name without forward slashes or set disableNameValidation: true to bypass this warning.`,
        ),
      t.room?.includes("/") &&
        console.warn(
          `PartySocket: room name "${t.room}" contains forward slash which may cause routing issues. Consider using a name without forward slashes or set disableNameValidation: true to bypass this warning.`,
        ));
  }
  updateProperties(t) {
    const e = Xa({
      ...this.partySocketOptions,
      ...t,
      host: t.host ?? this.host,
      room: t.room ?? this.room,
      path: t.path ?? this.path,
      basePath: t.basePath ?? this.basePath,
    });
    ((this._url = e.urlProvider),
      (this._protocols = e.protocols),
      (this._options = e.socketOptions),
      this.setWSProperties(e));
  }
  setWSProperties(t) {
    const {
      _pk: e,
      _pkurl: n,
      name: s,
      room: r,
      host: i,
      path: o,
      basePath: a,
    } = t;
    ((this._pk = e),
      (this._pkurl = n),
      (this.name = s),
      (this.room = r),
      (this.host = i),
      (this.path = o),
      (this.basePath = a));
  }
  reconnect(t, e) {
    if (!this.host)
      throw new Error(
        "The host must be set before connecting, use `updateProperties` method to set it or pass it to the constructor.",
      );
    if (!this.room && !this.basePath)
      throw new Error(
        "The room (or basePath) must be set before connecting, use `updateProperties` method to set it or pass it to the constructor.",
      );
    super.reconnect(t, e);
  }
  get id() {
    return this._pk;
  }
  get roomUrl() {
    return this._pkurl;
  }
  static async fetch(t, e) {
    const n = Uu(t, "http"),
      s =
        typeof n.urlProvider == "string"
          ? n.urlProvider
          : await n.urlProvider();
    return (t.fetch ?? fetch)(s, e);
  }
};
function Xa(t) {
  const {
      id: e,
      host: n,
      path: s,
      party: r,
      room: i,
      protocol: o,
      query: a,
      protocols: c,
      ...l
    } = t,
    u = e || Rm(),
    h = Uu(t, "ws", { _pk: u });
  return {
    _pk: u,
    _pkurl: h.partyUrl,
    name: h.name,
    room: h.room,
    host: h.host,
    path: h.path,
    basePath: t.basePath,
    protocols: c,
    socketOptions: l,
    urlProvider: h.urlProvider,
  };
}
const Um = 1e3;
function Br(t) {
  return t === vu
    ? "identity"
    : Cu(t)
      ? "element"
      : Su(t)
        ? "presence"
        : "cursor";
}
class Hm {
  peers = new Map();
  listeners = {
    cursor: new Set(),
    element: new Set(),
    presence: new Set(),
    identity: new Set(),
  };
  unsubscribe;
  sweepTimer = null;
  constructor(e) {
    ((this.unsubscribe = e.subscribe((n) => this.handleMessage(n))),
      (this.sweepTimer = setInterval(() => {
        this.sweepExpired(Date.now());
      }, Um)));
  }
  getPeers() {
    return this.peers;
  }
  subscribe(e, n) {
    return (
      this.listeners[e].add(n),
      Me(n, "peer store namespace"),
      () => {
        this.listeners[e].delete(n);
      }
    );
  }
  destroy() {
    (this.sweepTimer !== null &&
      (clearInterval(this.sweepTimer), (this.sweepTimer = null)),
      this.unsubscribe());
    for (const e of Object.values(this.listeners)) e.clear();
  }
  handleMessage(e) {
    if (e.type === "presence-sync") {
      (this.applySync(e.peers),
        this.pruneExpired(Date.now()),
        this.notify(new Set(["cursor", "element", "presence", "identity"])));
      return;
    }
    if (e.type === "presence-changes") {
      const n = this.applyChanges(e);
      (this.pruneExpired(Date.now(), n), n.size > 0 && this.notify(n));
    }
  }
  applySync(e) {
    this.peers.clear();
    for (const [n, s] of Object.entries(e)) this.peers.set(n, { ...s });
  }
  applyChanges(e) {
    const n = new Set();
    for (const [s, r] of Object.entries(e.updates)) {
      const i = this.peers.get(s) ?? {};
      this.peers.set(s, i);
      for (const [o, a] of Object.entries(r)) ((i[o] = a), n.add(Br(o)));
    }
    for (const [s, r] of Object.entries(e.removes)) {
      const i = this.peers.get(s);
      if (i) {
        for (const o of r) o in i && (delete i[o], n.add(Br(o)));
        Object.keys(i).length === 0 && this.peers.delete(s);
      }
    }
    return n;
  }
  notify(e) {
    const n = new Set();
    for (const s of e)
      for (const r of this.listeners[s])
        n.has(r) || (n.add(r), Me(r, "peer store namespace"));
  }
  sweepExpired(e) {
    const n = new Set();
    (this.pruneExpired(e, n), n.size > 0 && this.notify(n));
  }
  pruneExpired(e, n = new Set()) {
    for (const [s, r] of this.peers) {
      for (const [i, o] of Object.entries(r))
        im(o, e, yr) || (delete r[i], n.add(Br(i)));
      Object.keys(r).length === 0 && this.peers.delete(s);
    }
    return n;
  }
}
const Fm = 1,
  zm = 3,
  Wm = 15e3,
  Km = 5e3;
class Hu {
  socket;
  room;
  listeners = new Set();
  latestJoin = null;
  channelValues = new Map();
  peers;
  _connectionState = "connecting";
  hasEverOpened = !1;
  failedReconnects = 0;
  unreachableLogged = !1;
  unreachableTimer = null;
  lastControlLogAt = new Map();
  usesHandlerProperties = !1;
  onMessage = (e) => {
    const n = Bm(e.data);
    if (n) {
      this.handleControlMessage(n);
      for (const s of this.listeners)
        Me(() => s(n), "presence transport listener");
    }
  };
  onOpen = () => {
    ((this._connectionState = "open"),
      (this.hasEverOpened = !0),
      (this.failedReconnects = 0),
      (this.unreachableLogged = !1),
      this.unreachableTimer !== null &&
        (clearTimeout(this.unreachableTimer), (this.unreachableTimer = null)),
      this.flushCurrentState());
  };
  onCloseOrError = () => {
    (this._connectionState !== "open" && (this.failedReconnects += 1),
      this._connectionState !== "unreachable" &&
        (this._connectionState = "connecting"),
      this.failedReconnects >= zm && this.markUnreachable());
  };
  constructor(e) {
    this.room = e.room;
    const n = e.socketFactory ?? ((s) => new jm(s));
    ((this.socket = n({
      host: e.host,
      room: e.room,
      party: "presence",
      maxEnqueuedMessages: 0,
    })),
      Za(this.socket)
        ? ((this.socket.onmessage = this.onMessage),
          (this.socket.onopen = this.onOpen),
          (this.socket.onclose = this.onCloseOrError),
          (this.socket.onerror = this.onCloseOrError),
          (this.usesHandlerProperties = !0))
        : (this.socket.addEventListener("message", this.onMessage),
          this.socket.addEventListener("open", this.onOpen),
          this.socket.addEventListener("close", this.onCloseOrError),
          this.socket.addEventListener("error", this.onCloseOrError)),
      (this.unreachableTimer = setTimeout(() => {
        ((this.unreachableTimer = null),
          this.hasEverOpened || this.markUnreachable());
      }, Wm)),
      (this.peers = new Hm(this)));
  }
  get connectionState() {
    return this._connectionState;
  }
  markUnreachable() {
    this.unreachableLogged ||
      ((this.unreachableLogged = !0),
      (this._connectionState = "unreachable"),
      console.error(
        `[playhtml] presence transport unreachable — realtime presence degraded (room ${this.room}). Cursors, element awareness, and custom presence will not sync until the connection recovers.`,
      ));
  }
  handleControlMessage(e) {
    e.type === "presence-error"
      ? this.logControl("presence-error", () =>
          console.warn(
            `[playhtml] presence server rejected a message (room ${this.room}):`,
            e.message,
          ),
        )
      : e.type === "presence-rate" &&
        this.logControl("presence-rate", () =>
          console.warn(
            `[playhtml] presence channel "${e.channel}" is rate-limited to ${e.hz}Hz (room ${this.room}).`,
          ),
        );
  }
  logControl(e, n) {
    const s = Date.now(),
      r = this.lastControlLogAt.get(e) ?? 0;
    s - r < Km || (this.lastControlLogAt.set(e, s), n());
  }
  join(e) {
    const n = ot(e),
      s = { type: "presence-join", identity: n.identity, page: n.page };
    (Pr(s), (this.latestJoin = n), this.sendIfOpen(s));
  }
  update(e, n) {
    const s = ot(n),
      r = { type: "presence-update", channel: e, value: s };
    (Pr(r), this.channelValues.set(e, s), this.sendIfOpen(r));
  }
  clear(e) {
    (this.channelValues.delete(e),
      this.sendIfOpen({ type: "presence-clear", channel: e }));
  }
  subscribe(e) {
    return (
      this.listeners.add(e),
      () => {
        this.listeners.delete(e);
      }
    );
  }
  destroy() {
    (this.unreachableTimer !== null &&
      (clearTimeout(this.unreachableTimer), (this.unreachableTimer = null)),
      this.peers.destroy(),
      this.usesHandlerProperties && Za(this.socket)
        ? (this.socket.onmessage === this.onMessage &&
            (this.socket.onmessage = null),
          this.socket.onopen === this.onOpen && (this.socket.onopen = null),
          this.socket.onclose === this.onCloseOrError &&
            (this.socket.onclose = null),
          this.socket.onerror === this.onCloseOrError &&
            (this.socket.onerror = null))
        : (this.socket.removeEventListener("message", this.onMessage),
          this.socket.removeEventListener("open", this.onOpen),
          this.socket.removeEventListener("close", this.onCloseOrError),
          this.socket.removeEventListener("error", this.onCloseOrError)),
      this.socket.close(),
      this.listeners.clear());
  }
  flushCurrentState() {
    this.latestJoin &&
      this.sendIfOpen({
        type: "presence-join",
        identity: this.latestJoin.identity,
        page: this.latestJoin.page,
      });
    for (const [e, n] of this.channelValues)
      this.sendIfOpen({ type: "presence-update", channel: e, value: n });
  }
  sendIfOpen(e) {
    (Pr(e), this.isSocketOpen() && this.socket.send(JSON.stringify(e)));
  }
  isSocketOpen() {
    return this.socket.readyState === void 0 || this.socket.readyState === Fm;
  }
}
function Fu() {
  return typeof WebSocket < "u";
}
function Za(t) {
  return "onmessage" in t && "onopen" in t && "onclose" in t && "onerror" in t;
}
function Bm(t) {
  if (typeof t != "string") return null;
  let e;
  try {
    e = JSON.parse(t);
  } catch {
    return null;
  }
  if (!K(e)) return null;
  switch (e.type) {
    case "presence-sync":
      return Wa(e.peers) ? e : null;
    case "presence-changes":
      return Wa(e.updates) && cm(e.removes) ? e : null;
    case "presence-rate":
      return typeof e.channel == "string" && typeof e.hz == "number" ? e : null;
    case "presence-error":
      return typeof e.message == "string" ? e : null;
    default:
      return null;
  }
}
const Qa = `${wo}shard:`,
  zu = 1,
  an = 8,
  qm = 1100;
class Vm {
  transport;
  getIdentity;
  getPage;
  onAwareness;
  localTags = new Map();
  publishedChannels = new Set();
  pendingClears = new Set();
  unsubscribe;
  stopKeepalive;
  publishScheduled = !1;
  republishTimer = null;
  destroyed = !1;
  lastAwarenessFingerprint = "";
  constructor(e) {
    ((this.transport = e.transport),
      (this.getIdentity = e.getIdentity),
      (this.getPage = e.getPage),
      (this.onAwareness = e.onAwareness));
    const n = () => this.emit(),
      s = this.transport.peers.subscribe("element", n),
      r = this.transport.peers.subscribe("identity", n);
    ((this.unsubscribe = () => {
      (s(), r());
    }),
      (this.stopKeepalive = _u(() => {
        this.destroyed ||
          this.localTags.size === 0 ||
          this.publishLocalAwareness();
      })),
      this.join());
  }
  setLocalAwareness(e, n, s) {
    this.stageLocalAwareness(e, n, s) && (this.schedulePublish(), this.emit());
  }
  setLocalAwarenessBatch(e) {
    let n = !1;
    for (const [s, r, i] of e) this.stageLocalAwareness(s, r, i) && (n = !0);
    n && (this.schedulePublish(), this.emit());
  }
  stageLocalAwareness(e, n, s) {
    const r = this.localTags.get(e) ?? {};
    return r[n] === s ? !1 : (this.localTags.set(e, { ...r, [n]: s }), !0);
  }
  removeLocalAwareness(e, n) {
    const s = this.localTags.get(e);
    if (!s || !(n in s)) return;
    const r = { ...s };
    (delete r[n],
      Object.keys(r).length === 0
        ? this.localTags.delete(e)
        : this.localTags.set(e, r),
      this.schedulePublish(),
      this.emit());
  }
  getLocalAwareness(e, n) {
    return this.localTags.get(e)?.[n];
  }
  refresh() {
    this.emit();
  }
  destroy() {
    ((this.destroyed = !0),
      this.republishTimer !== null &&
        (clearTimeout(this.republishTimer), (this.republishTimer = null)),
      this.stopKeepalive(),
      this.unsubscribe());
  }
  schedulePublish() {
    this.publishScheduled ||
      this.destroyed ||
      ((this.publishScheduled = !0),
      queueMicrotask(() => {
        ((this.publishScheduled = !1),
          !this.destroyed &&
            (this.publishLocalAwareness(), this.scheduleRepublish()));
      }));
  }
  scheduleRepublish() {
    this.destroyed ||
      (this.republishTimer !== null && clearTimeout(this.republishTimer),
      (this.republishTimer = setTimeout(() => {
        if (((this.republishTimer = null), !this.destroyed)) {
          for (const e of this.pendingClears)
            Ws(this.transport, e, "element awareness");
          (this.pendingClears.clear(), this.publishLocalAwareness());
        }
      }, qm)));
  }
  join() {
    try {
      this.transport.join({
        identity: this.getIdentity(),
        page: this.getPage(),
      });
    } catch (e) {
      console.warn("[playhtml] Failed to join element awareness room:", e);
    }
  }
  publishLocalAwareness() {
    const e = new Set(),
      n = Gm(this.localTags),
      s = n.slice(0, an);
    if (n.length > an) {
      const r = Xm(n.slice(an));
      console.error(
        `[playhtml] Element awareness exceeded ${an} shards (~${an * js} bytes); dropping overflow so under-budget elements keep syncing. Affected tags: ${r.join(", ")}.`,
      );
    }
    for (let r = 0; r < s.length; r += 1) {
      const i = `${Qa}${r}`;
      (Au(this.transport, i, s[r], "element awareness") && e.add(i),
        this.pendingClears.delete(i));
    }
    for (const r of this.publishedChannels)
      e.has(r) ||
        (this.pendingClears.add(r), Ws(this.transport, r, "element awareness"));
    this.publishedChannels = e;
  }
  emit() {
    const e = this.buildElementAwareness(),
      n = Ym(e);
    n !== this.lastAwarenessFingerprint &&
      ((this.lastAwarenessFingerprint = n), this.onAwareness(e));
  }
  buildElementAwareness() {
    const e = new Map(),
      n = this.getIdentity().publicKey;
    for (const [r, i] of this.localTags)
      for (const [o, a] of Object.entries(i)) vi(e, r, o, a, n);
    const s = this.transport.peers.getPeers();
    for (const r of Array.from(s.keys()).sort()) {
      const i = s.get(r),
        o = ku(i);
      if (o === n) continue;
      const a = o ?? r;
      for (const [c, l] of Object.entries(i))
        if (Cu(c)) {
          if (c.startsWith(Qa)) Zm(e, l, a);
          else if (K(l)) {
            const u = c.slice(wo.length);
            for (const [h, d] of Object.entries(l)) vi(e, u, h, d, a);
          }
        }
    }
    return e;
  }
}
function Ym(t) {
  const e = [];
  for (const n of Array.from(t.keys()).sort()) {
    const s = t.get(n);
    for (const r of Array.from(s.byStableId.keys()).sort()) {
      let i;
      try {
        i = JSON.stringify(s.byStableId.get(r)) ?? "null";
      } catch {
        i = "null";
      }
      e.push(`${n}:${r}:${i}`);
    }
  }
  return e.join("|");
}
function vi(t, e, n, s, r) {
  const i = `${e}:${n}`;
  let o = t.get(i);
  (o || ((o = { array: [], byStableId: new Map() }), t.set(i, o)),
    o.array.push(s),
    o.byStableId.set(r, s));
}
function Gm(t) {
  const e = [];
  let n = [];
  for (const s of Jm(t)) {
    const r = [...n, s];
    n.length > 0 && Eu(qr(r)) > js ? (e.push(qr(n)), (n = [s])) : (n = r);
  }
  return (n.length > 0 && e.push(qr(n)), e);
}
function Jm(t) {
  const e = [];
  for (const n of Array.from(t.keys()).sort()) {
    const s = t.get(n);
    for (const r of Object.keys(s).sort()) e.push([n, r, s[r]]);
  }
  return e;
}
function qr(t) {
  return { v: zu, at: Date.now(), entries: t };
}
function Xm(t) {
  const e = new Set();
  for (const n of t) for (const [s] of n.entries) e.add(s);
  return Array.from(e).sort();
}
function Zm(t, e, n) {
  if (Qm(e))
    for (const s of e.entries) {
      const [r, i, o] = s;
      vi(t, r, i, o, n);
    }
}
function Qm(t) {
  return !K(t) || t.v !== zu || !Array.isArray(t.entries)
    ? !1
    : t.entries.every(
        (e) =>
          Array.isArray(e) &&
          e.length === 3 &&
          typeof e[0] == "string" &&
          typeof e[1] == "string",
      );
}
const e0 = 1100;
class Wu {
  transport;
  getIdentity;
  getPage;
  getCursorPresences;
  onCursorPresencesChange;
  localChannels = new Map();
  pendingClears = new Set();
  listeners = new Map();
  nextListenerId = 0;
  unsubscribe;
  stopKeepalive;
  republishTimer = null;
  destroyed = !1;
  constructor(e) {
    ((this.transport = e.transport),
      (this.getIdentity = e.getIdentity),
      (this.getPage = e.getPage),
      (this.getCursorPresences = e.getCursorPresences),
      (this.onCursorPresencesChange = e.onCursorPresencesChange));
    const n = () => this.emit(),
      s = this.transport.peers.subscribe("presence", n),
      r = this.transport.peers.subscribe("identity", n);
    ((this.unsubscribe = () => {
      (s(), r());
    }),
      (this.stopKeepalive = _u(() => {
        this.destroyed ||
          this.localChannels.size === 0 ||
          this.republishLiveChannels();
      })),
      this.join());
  }
  setMyPresence(e, n) {
    if (Ur(e))
      throw new Error(
        `[playhtml] "${e}" is a reserved presence field and cannot be used as a channel name. playerIdentity, cursor, and isMe are populated by playhtml; choose a different channel name.`,
      );
    const s = Hr(e);
    if (n == null) {
      if (!this.localChannels.has(e) && this.pendingClears.has(s)) return;
      (this.localChannels.delete(e),
        this.pendingClears.add(s),
        Ws(this.transport, s, "presence"));
    } else
      (this.localChannels.set(e, n),
        this.pendingClears.delete(s),
        this.publishChannel(e, n));
    (this.scheduleRepublish(), this.emit());
  }
  publishChannel(e, n) {
    Au(this.transport, Hr(e), om(n), "presence");
  }
  getPresences() {
    return this.buildPresences();
  }
  onPresenceChange(e, n) {
    if (e === "cursor" && this.onCursorPresencesChange) {
      const r = this.onCursorPresencesChange(() => {
        n(this.buildPresences());
      });
      return (
        Me(() => n(this.buildPresences()), "presence subscriber"),
        r ?? (() => {})
      );
    }
    const s = String(this.nextListenerId++);
    return (
      this.listeners.set(s, {
        channel: e,
        callback: n,
        lastFingerprint: this.channelFingerprint(e),
      }),
      Me(() => n(this.buildPresences()), "presence subscriber"),
      () => {
        this.listeners.delete(s);
      }
    );
  }
  getMyIdentity() {
    return this.getIdentity();
  }
  destroy() {
    ((this.destroyed = !0),
      this.republishTimer !== null &&
        (clearTimeout(this.republishTimer), (this.republishTimer = null)),
      this.stopKeepalive(),
      this.unsubscribe());
  }
  scheduleRepublish() {
    this.destroyed ||
      (this.republishTimer !== null && clearTimeout(this.republishTimer),
      (this.republishTimer = setTimeout(() => {
        if (((this.republishTimer = null), !this.destroyed)) {
          this.republishLiveChannels();
          for (const e of this.pendingClears) Ws(this.transport, e, "presence");
          this.pendingClears.clear();
        }
      }, e0)));
  }
  republishLiveChannels() {
    for (const [e, n] of this.localChannels) this.publishChannel(e, n);
  }
  join() {
    try {
      this.transport.join({
        identity: this.getIdentity(),
        page: this.getPage(),
      });
    } catch (e) {
      console.warn("[playhtml] Failed to join presence room:", e);
    }
  }
  get peers() {
    return this.transport.peers.getPeers();
  }
  emit() {
    if (this.listeners.size === 0) return;
    let e = null;
    const n = () => (e || (e = this.buildPresences()), e);
    for (const s of this.listeners.values()) {
      const r = this.channelFingerprint(s.channel);
      r !== s.lastFingerprint &&
        Me(() => s.callback(n()), "presence subscriber") &&
        (s.lastFingerprint = r);
    }
  }
  channelFingerprint(e) {
    const n = [];
    this.localChannels.has(e) &&
      n.push(`self:${ec(this.localChannels.get(e))}`);
    const s = Hr(e);
    for (const r of Array.from(this.peers.keys()).sort()) {
      const i = this.peers.get(r)?.[s];
      i !== void 0 && n.push(`${r}:${ec(za(i))}`);
    }
    return n.join("|");
  }
  buildPresences() {
    const e = new Map(),
      n = this.getIdentity().publicKey;
    e.set(n, this.buildSelfView());
    for (const s of Array.from(this.peers.keys()).sort()) {
      const r = this.peers.get(s),
        i = r.identity,
        o = ku(r);
      if (o === n) continue;
      const a = o ?? s,
        c = e.get(a) ?? {
          playerIdentity: K(i) ? i : void 0,
          cursor: null,
          isMe: !1,
        };
      !c.playerIdentity && K(i) && (c.playerIdentity = i);
      for (const [l, u] of Object.entries(r)) {
        if (!Su(l)) continue;
        const h = nm(l);
        Ur(h) || (c[h] = za(u));
      }
      e.set(a, c);
    }
    return (this.mergeCursorPresences(e, n), e);
  }
  buildSelfView() {
    const e = { playerIdentity: this.getIdentity(), cursor: null, isMe: !0 };
    for (const [n, s] of this.localChannels) Ur(n) || (e[n] = s);
    return e;
  }
  mergeCursorPresences(e, n) {
    const s = this.getCursorPresences?.();
    if (s)
      for (const [r, i] of s) {
        const o = e.get(r);
        e.set(r, {
          ...o,
          playerIdentity: i.playerIdentity ?? o?.playerIdentity,
          cursor: i.cursor ?? null,
          isMe: r === n,
        });
      }
  }
}
function ec(t) {
  try {
    return JSON.stringify(t ?? null);
  } catch {
    return "null";
  }
}
class t0 {
  inner;
  subscriptions = new Map();
  nextSubscriptionId = 0;
  constructor(e) {
    this.inner = e;
  }
  setInner(e) {
    if (e !== this.inner) {
      this.inner = e;
      for (const n of this.subscriptions.values()) {
        try {
          n.innerUnsub();
        } catch {}
        let s = () => {};
        (Me(() => {
          s = e.onPresenceChange(n.channel, n.callback);
        }, "presence facade re-attach"),
          (n.innerUnsub = s));
      }
    }
  }
  setMyPresence(e, n) {
    this.inner.setMyPresence(e, n);
  }
  getPresences() {
    return this.inner.getPresences();
  }
  onPresenceChange(e, n) {
    const s = this.nextSubscriptionId++,
      r = this.inner.onPresenceChange(e, n);
    return (
      this.subscriptions.set(s, { channel: e, callback: n, innerUnsub: r }),
      () => {
        const i = this.subscriptions.get(s);
        if (i) {
          this.subscriptions.delete(s);
          try {
            i.innerUnsub();
          } catch {}
        }
      }
    );
  }
  getMyIdentity() {
    return this.inner.getMyIdentity();
  }
}
class n0 {
  pendingChanges = [];
  cancelFlush = null;
  getDoc;
  constructor(e) {
    this.getDoc = e;
  }
  queue(e) {
    (this.pendingChanges.push({ targetDoc: this.getDoc(), apply: e }),
      this.requestFlush());
  }
  clear() {
    (this.cancelFlush && (this.cancelFlush(), (this.cancelFlush = null)),
      (this.pendingChanges = []));
  }
  flush() {
    this.cancelFlush = null;
    const e = this.pendingChanges;
    if (((this.pendingChanges = []), !e.length)) return;
    const n = new Map();
    for (const s of e) {
      const r = n.get(s.targetDoc) ?? [];
      (r.push(s.apply), n.set(s.targetDoc, r));
    }
    for (const [s, r] of n)
      s.transact(() => {
        for (const i of r) i();
      });
  }
  requestFlush() {
    if (this.cancelFlush) return;
    const e = () => this.flush();
    if (typeof window.requestAnimationFrame == "function") {
      const s = window.requestAnimationFrame(e);
      this.cancelFlush = () => window.cancelAnimationFrame(s);
      return;
    }
    const n = window.setTimeout(e, 0);
    this.cancelFlush = () => window.clearTimeout(n);
  }
}
const s0 = "api.playhtml.fun",
  r0 = "api-staging.playhtml.fun";
function i0(t) {
  if (t) return t;
  const e = window.location.hostname;
  return e.includes("staging") || e.includes("ngrok-free") ? r0 : s0;
}
let ie = pu({ play: {} }),
  At = fu(ie),
  Ku = Nu(ie.play),
  tc = null;
function Bu({ includeSearch: t }) {
  const e = window.location.pathname.replace(/\.[^/.]+$/, "");
  return t ? e + window.location.search : e;
}
function ds(t) {
  return t.replace(/\.[^/.]+$/, "");
}
function qu(t) {
  const e = {
    domain: window.location.host,
    pathname: window.location.pathname,
    search: window.location.search,
  };
  if (typeof t == "function") {
    const n = t(e);
    return n && n.startsWith("/") ? ds(n) : n;
  }
  switch (t) {
    case "page":
      return ds(e.pathname);
    case "domain":
      return "";
    case "section":
      return `/${ds(e.pathname).split("/").filter(Boolean)[0] || ""}`;
    default:
      return ds(e.pathname);
  }
}
function Pn(t, e) {
  const n = Yg(t),
    s = e === "" ? n : `${n}-${e}`;
  return encodeURIComponent(s);
}
let z,
  Ft = null,
  oe = null,
  ht = "",
  Ks = null,
  ue = null;
const Nt = {
  subscribers: new Set(),
  feedUnsub: null,
  getPresences() {
    return oe?.getCursorPresences() ?? new Map();
  },
  subscribe(t) {
    return (
      this.subscribers.add(t),
      () => {
        this.subscribers.delete(t);
      }
    );
  },
  notify(t) {
    for (const e of this.subscribers)
      Me(() => e(t), "cursor presence subscriber");
  },
  connect(t) {
    (this.feedUnsub?.(),
      (this.feedUnsub = t.onCursorPresencesChange((e) => {
        this.notify(e);
      })));
  },
  disconnect() {
    (this.feedUnsub?.(), (this.feedUnsub = null));
  },
};
function We() {
  return ue?.getIdentity() ?? Vy();
}
const nt = new Map(),
  at = new Map(),
  o0 = new Map(),
  a0 = new Map(),
  Bs = new Set(),
  wt = new Map(),
  Ci = new Set();
function c0(t) {
  const e = t.getAttribute("data-source");
  if (!e) return;
  let n, s, r;
  try {
    ({ domain: n, path: s, elementId: r } = Ql(e));
  } catch {
    return;
  }
  const i = `${n}${s}#${r}`;
  if (!Ci.has(i) && (Ci.add(i), z?.wsconnected))
    try {
      const o = { domain: n, path: s, elementId: r };
      (z.sendMessage(
        JSON.stringify({ type: "add-shared-reference", reference: o }),
      ),
        z.sendMessage(
          JSON.stringify({ type: "export-permissions", elementIds: [r] }),
        ));
    } catch (o) {
      console.warn(
        "[PLAYHTML] Failed to notify server of new shared reference:",
        o,
      );
    }
}
function l0(t) {
  if (!t.id) return;
  const e = t.id,
    n = t.getAttribute("shared");
  let s = "read-write";
  if (n && n !== "") {
    const r = n.toLowerCase();
    (r.includes("read-only") || r === "ro") && (s = "read-only");
  }
  if ((Mu(e, s), z?.wsconnected))
    try {
      const r = {
        elementId: e,
        permissions: s,
        path: window.location.pathname,
      };
      z.sendMessage(
        JSON.stringify({ type: "register-shared-element", element: r }),
      );
    } catch (r) {
      console.warn(
        "[PLAYHTML] Failed to notify server of new shared element:",
        r,
      );
    }
}
function Vu(t, e, n) {
  nt.has(t) || nt.set(t, new Map());
  const s = nt.get(t);
  if (!s.has(e)) {
    ie.play[t] ??= {};
    const r = ie.play[t];
    if (r[e] === void 0) {
      const i = ot(n);
      r[e] = i;
    }
    s.set(e, r[e]);
  }
  return s.get(e);
}
const W = new Map(),
  nc = new WeakMap();
let Gt = new Map();
const sc = new Set(),
  Yu = new n0(() => At),
  rc = new Map();
let u0 = 0,
  Yn = tu;
function xt() {
  return [Q.CanPlay, ...Object.keys(Yn)];
}
function h0(t) {
  z.sendMessage(JSON.stringify(t));
}
function vo(t) {
  let e;
  try {
    e = JSON.parse(t);
  } catch {
    return;
  }
  if (e.type === "room-reset") {
    const i = Number(e.resetEpoch);
    if (!Number.isFinite(i)) {
      (console.error("[PLAYHTML] Received room-reset without a resetEpoch"),
        window.location.reload());
      return;
    }
    _0(i);
    return;
  }
  const { type: n, eventPayload: s } = e,
    r = Gt.get(n);
  if (!r) {
    if (e.permissions)
      try {
        const i = e.permissions;
        Object.entries(i).forEach(([o, a]) => {
          if ((Mu(o, a), a === "read-only")) {
            const c = document.querySelector(
              `[data-source$="#${CSS.escape(o)}"]`,
            );
            c && c.setAttribute("data-source-read-only", "");
          }
        });
      } catch {}
    return;
  }
  for (const i of r) i.onEvent(s);
}
let ee = !1,
  Si = !0,
  Co = !0,
  fs = !1,
  Gu = () => {},
  _i = () => {};
function d0() {
  const t = new Promise((e, n) => {
    ((Gu = e), (_i = n));
  });
  return (t.catch(() => {}), t);
}
let Ot = d0();
function f0(t) {
  return (
    typeof t == "object" &&
    t !== null &&
    "then" in t &&
    typeof t.then == "function"
  );
}
let qs = null,
  Vs = new Set(),
  se = "",
  Te = "",
  Ys = null,
  Vr = null,
  ps = null,
  gs = null;
function Ju() {
  const t = D?.room;
  return typeof t == "function" ? t() : t;
}
const Gs = new Map();
let ks = null,
  X = null,
  gn = null,
  yn = null,
  mn = null;
function So(t) {
  if (!Fu()) return null;
  const e = Gs.get(t);
  if (e) return (e.refCount++, e.transport);
  const n = new Hu({ host: Te, room: t }),
    s =
      ue?.onSelfChange(() => {
        try {
          n.join({ identity: We(), page: tt() });
        } catch (r) {
          console.warn("[playhtml] Failed to republish identity on change:", r);
        }
      }) ?? null;
  return (Gs.set(t, { transport: n, refCount: 1, selfChangeUnsub: s }), n);
}
function Gn(t) {
  const e = Gs.get(t);
  if (e && (e.refCount--, !(e.refCount > 0))) {
    Gs.delete(t);
    try {
      e.selfChangeUnsub?.();
    } catch {}
    try {
      e.transport.destroy();
    } catch {}
  }
}
let Yr = null,
  pt = null;
const p0 = 5e3,
  Js = new Set();
let D = null,
  Xu = !1;
function On(t) {
  if (typeof t != "function") {
    if (Array.isArray(t)) {
      const e = t.map(On);
      return e.length === 0 ? void 0 : e;
    }
    if (t && typeof t == "object") {
      const e = {};
      for (const n of Object.keys(t).sort()) {
        const s = On(t[n]);
        s !== void 0 && (e[n] = s);
      }
      return Object.keys(e).length === 0 ? void 0 : e;
    }
    return t;
  }
}
function Ei(t) {
  return typeof t == "function"
    ? !0
    : Array.isArray(t)
      ? t.some(Ei)
      : t && typeof t == "object"
        ? Object.values(t).some(Ei)
        : !1;
}
function g0(t, e) {
  for (const r of Object.keys(e)) {
    const i = typeof e[r] == "function",
      o = typeof t[r] == "function",
      a = t[r] !== void 0;
    if ((i && a && !o) || (o && e[r] !== void 0 && !i)) return !0;
  }
  const n = On(t) ?? {},
    s = On(e) ?? {};
  for (const r of Object.keys(s))
    if (r in n && JSON.stringify(s[r]) !== JSON.stringify(n[r])) return !0;
  return !1;
}
function y0(t) {
  return On(t) === void 0 && !Ei(t);
}
function ki(t) {
  if (D) {
    g0(D, t) &&
      console.warn(
        "[playhtml] Ignoring conflicting config passed after playhtml was already configured. Config is locked to the first declaration. Declare it once up front with playhtml.configure(...) (or matching options at every call site).",
      );
    return;
  }
  if (!y0(t)) {
    if (Xu) {
      console.warn(
        "[playhtml] Ignoring config passed after playhtml already connected. Declare it before init() — e.g. with playhtml.configure(...) in a script that runs before any component mounts.",
      );
      return;
    }
    if (
      ((D = {
        ...t,
        ...(t.defaultRoomOptions
          ? { defaultRoomOptions: { ...t.defaultRoomOptions } }
          : {}),
        ...(t.cursors ? { cursors: { ...t.cursors } } : {}),
      }),
      t.extraCapabilities)
    )
      for (const [e, n] of Object.entries(t.extraCapabilities)) Yn[e] = n;
    if (t.events) for (const [e, n] of Object.entries(t.events)) fh(e, n);
  }
}
function m0() {
  Xu = !0;
}
function _o(t) {
  const { room: e, partykitHost: n, onError: s, onMessage: r } = t,
    i = Sm(),
    o = _m();
  o.forEach((u) => {
    const h = `${u.domain}${u.path}#${u.elementId}`;
    Ci.add(h);
  });
  const a = `playhtml_resetEpoch_${e}`,
    c = localStorage.getItem(a),
    l = c ? parseInt(c, 10) : null;
  return (
    (z = new so(n, e, At, {
      params: {
        sharedElements: JSON.stringify(i),
        sharedReferences: JSON.stringify(o),
        clientResetEpoch: l !== null ? String(l) : null,
      },
    })),
    z.on("error", () => {
      s?.();
    }),
    z.on("sync", S0),
    z.on("custom-message", r),
    { sharedReferences: o }
  );
}
function Zu() {
  Nt.disconnect();
  try {
    oe?.destroy?.();
  } catch {}
  ((oe = null), ks !== null && (Gn(ks), (ks = null)));
  try {
    Ft?.disconnect?.();
  } catch {}
  try {
    Ft?.destroy?.();
  } catch {}
  Ft = null;
}
function Qu() {
  try {
    z?.disconnect?.();
  } catch {}
  try {
    z?.destroy?.();
  } catch {}
}
function eh() {
  Yu.clear();
  const t = At;
  ((ie = pu({ play: {} })),
    (At = fu(ie)),
    (Ku = Nu(ie.play)),
    nt.clear(),
    at.clear());
  try {
    t.destroy();
  } catch {}
}
function th() {
  const t = So(se);
  if (!t) return;
  const e = se;
  gn = e;
  try {
    X = new Vm({ transport: t, getIdentity: We, getPage: tt, onAwareness: ah });
  } catch (n) {
    ((gn = null),
      Gn(e),
      console.error("[playhtml] Failed to build element awareness client:", n));
    return;
  }
}
function w0() {
  if (X) {
    try {
      X.destroy();
    } catch {}
    ((X = null), gn !== null && (Gn(gn), (gn = null)));
  }
}
function b0() {
  if (!X) return;
  const t = [];
  for (const [e, n] of W)
    for (const [s, r] of n)
      r.selfAwareness !== void 0 && t.push([e, s, r.selfAwareness]);
  t.length !== 0 && X.setLocalAwarenessBatch(t);
}
function nh() {
  const t = So(se);
  if (t) {
    const e = se;
    mn = e;
    try {
      return (
        (yn = new Wu({
          transport: t,
          getIdentity: We,
          getPage: tt,
          getCursorPresences: () => Nt.getPresences(),
          onCursorPresencesChange: (n) => Nt.subscribe(n),
        })),
        yn
      );
    } catch (n) {
      ((mn = null),
        Gn(e),
        console.error("[playhtml] Failed to build presence client:", n));
    }
  }
  return Du({
    getAwareness: () => (oe?.getProvider() ?? z).awareness,
    getPlayerIdentity: We,
    publishIdentity: !1,
    getCursorPresences: () => Nt.getPresences(),
    onCursorPresencesChange: (e) => Nt.subscribe(e),
  });
}
function v0() {
  if (yn) {
    try {
      yn.destroy();
    } catch {}
    ((yn = null), mn !== null && (Gn(mn), (mn = null)));
  }
}
function Eo() {
  if (X) return;
  if (gs && ps)
    try {
      gs.awareness.off("change", ps);
    } catch {}
  ((gs = null), (ps = null));
  const t = mr();
  if (!t) return;
  const e = () => Do();
  (t.awareness.on("change", e), (gs = t), (ps = e));
}
function ko(t) {
  const { cursors: e, mainRoom: n, partykitHost: s, onError: r } = t;
  if (!e.enabled) {
    ht = "";
    return;
  }
  if (!ue)
    throw new Error(
      "[playhtml] buildCursors requires the users module to exist first.",
    );
  const i = { ...e };
  let o = z;
  if (i.room) {
    const c = qu(i.room),
      l = Pn(window.location.host, c);
    if (l !== n) {
      const u = new Ae();
      ((Ft = new so(s, l, u)),
        Ft.on("error", () => {
          r?.();
        }),
        (o = Ft),
        (ht = l));
    } else ht = n;
  } else ht = n;
  const a = So(ht) ?? void 0;
  ((ks = a ? ht : null), (oe = new bm(o, i, a, ue)), Nt.connect(oe));
}
function C0(t, e) {
  const n = `playhtml_resetEpoch_${t}`;
  (localStorage.setItem(n, String(e)),
    console.log(`[PLAYHTML] Stored resetEpoch=${e} in localStorage key=${n}`));
}
function Ao(t) {
  return new Promise((e, n) => {
    if (ee) {
      e();
      return;
    }
    let s = !1,
      r = null;
    const i = (o) => {
      s ||
        ((s = !0), r !== null && clearTimeout(r), Js.delete(i), o ? n(o) : e());
    };
    (Js.add(i),
      t !== void 0 &&
        (r = setTimeout(() => {
          i(new Error("Timed out waiting for playhtml room reset sync"));
        }, t)));
  });
}
function S0(t) {
  if ((t || console.error("Issue connecting to yjs..."), ee)) return;
  ee = !0;
  const e = [...Js];
  (Js.clear(), e.forEach((n) => n()));
}
function _0(t) {
  if ((C0(se, t), Yr)) {
    pt = Math.max(pt ?? 0, t);
    return;
  }
  Yr = E0(t)
    .catch((e) => {
      (console.error("[PLAYHTML] Failed to reconnect after room-reset:", e),
        window.location.reload());
    })
    .finally(() => {
      ((Yr = null), (pt = null));
    });
}
async function E0(t) {
  let e = t;
  for (;;) {
    const n = e;
    if (((pt = null), await k0(), pt === null || pt <= n)) return;
    e = pt;
  }
}
async function k0() {
  if (!se || !Te) throw new Error("playhtml cannot reset before init()");
  (Qu(),
    Zu(),
    (ee = !1),
    (qs = null),
    Vs.clear(),
    eh(),
    _o({ room: se, partykitHost: Te, onError: D?.onError, onMessage: vo }));
  const t = D?.cursors;
  (t?.enabled &&
    ko({ cursors: t, mainRoom: se, partykitHost: Te, onError: D?.onError }),
    ue?.getAll(),
    Eo(),
    xo(),
    await Ao(p0),
    Ou(Lo()),
    wr(),
    Io(),
    oe?.refreshContainer?.(),
    oe?.refreshCursorStyles?.(),
    nu(se));
}
function A0() {
  Vr ||
    ((Vr = (t) => {
      const e = ql(t.detail?.playerIdentity);
      if (!e?.playerStyle.colorPalette[0] || !ue) return;
      const n = We(),
        s = { ...e, ...(typeof n.name == "string" ? { name: n.name } : {}) };
      (ue.adoptIdentity(s),
        console.log("[playhtml] Merged extension identity via CustomEvent"));
    }),
    document.addEventListener("playhtml:configure-identity", Vr),
    document.dispatchEvent(new CustomEvent("playhtml:ready")));
}
async function x0() {
  if (Si) return;
  const t = Ju() ?? Bu(D?.defaultRoomOptions ?? { includeSearch: !1 }),
    e = Pn(window.location.host, t),
    n = e !== se,
    s = D?.cursors,
    r = !!s?.enabled,
    i = r !== (oe !== null);
  let o = !1;
  if (s?.enabled)
    if (s.room) {
      const a = qu(s.room);
      o = Pn(window.location.host, a) !== ht;
    } else o = n;
  for (const [a, c] of W)
    for (const [l, u] of [...c.entries()]) {
      const h = u.element;
      (!h || !h.isConnected) &&
        (u.destroy?.(), c.delete(l), X?.removeLocalAwareness(a, l));
    }
  (n &&
    (Qu(),
    w0(),
    v0(),
    (ee = !1),
    (qs = null),
    Vs.clear(),
    eh(),
    _o({ room: e, partykitHost: Te, onError: D?.onError, onMessage: vo }),
    (se = e),
    th(),
    b0(),
    Ks?.setInner(nh())),
    (i || (o && s)) &&
      (Zu(),
      r &&
        s &&
        ko({ cursors: s, mainRoom: e, partykitHost: Te, onError: D?.onError })),
    (n || i || o) && ue?.getAll(),
    n && Eo(),
    xo(),
    n && (await Ao(), Ou(Lo())),
    wr(),
    Io(),
    oe?.refreshContainer?.(),
    oe?.refreshCursorStyles?.(),
    nu(se));
}
function I0(t = {}) {
  ki(t);
}
function $0(t = {}) {
  if (fs) return (ki(t), Ot);
  const e = window.playhtml;
  if (e) {
    if (f0(e.ready))
      return (
        (Ot = e.ready),
        Ot.then(
          () => {
            Co = !1;
          },
          () => {},
        ),
        (fs = !0),
        Ot
      );
    const s = new Error(
      "playhtml is already set up by an incompatible instance. Make sure @playhtml/react and playhtml use matching versions.",
    );
    return (_i(s), (fs = !0), Ot);
  }
  ((fs = !0), ki(t));
  const n = D0();
  return (
    n.catch((s) => {
      _i(s);
    }),
    n
  );
}
async function D0() {
  m0();
  const t = D?.host,
    e = D?.cursors ?? {},
    n = Ju() ?? Bu(D?.defaultRoomOptions ?? { includeSearch: !1 }),
    s = D?.onError;
  ((window.playhtml = $e),
    (document.documentElement.dataset.playhtml = "true"));
  const r = Pn(window.location.host, n),
    i = i0(t);
  ((se = r),
    (Te = i),
    console.log(`࿂࿂࿂࿂࿂࿂࿂࿂࿂࿂࿂࿂࿂࿂࿂࿂࿂࿂࿂࿂࿂࿂࿂࿂࿂࿂࿂࿂࿂࿂࿂࿂࿂࿂࿂࿂࿂࿂
࿂࿂࿂࿂  ࿂    ࿂    ࿂    ࿂    ࿂  ࿂࿂࿂࿂
࿂࿂࿂࿂ booting up playhtml... ࿂࿂࿂࿂
࿂࿂࿂࿂  https://playhtml.fun  ࿂࿂࿂࿂
࿂࿂࿂࿂   ࿂     ࿂     ࿂     ࿂   ࿂࿂࿂࿂
࿂࿂࿂࿂࿂࿂࿂࿂࿂࿂࿂࿂࿂࿂࿂࿂࿂࿂࿂࿂࿂࿂࿂࿂࿂࿂࿂࿂࿂࿂࿂࿂࿂࿂࿂࿂࿂࿂`));
  const { sharedReferences: o } = _o({
      room: r,
      partykitHost: i,
      onError: s,
      onMessage: vo,
    }),
    a = e.playerIdentity ?? D?.playerIdentity ?? We();
  ((ue = bu(a, {
    getAwareness: () => z.awareness,
    getCursorPresences: () => oe?.getCursorPresences() ?? new Map(),
    onCursorPresencesChange: (l) => oe?.onCursorPresencesChange(l),
  })),
    ko({ cursors: e, mainRoom: r, partykitHost: i, onError: s }),
    ue.getAll(),
    th(),
    A0(),
    (Ks = new t0(nh())));
  const c = document.createElement("link");
  if (
    ((c.rel = "stylesheet"),
    (c.href = "https://unpkg.com/playhtml@latest/dist/style.css"),
    document.head.appendChild(c),
    D?.developmentMode &&
      ((tc = await Ih(() => import("./development-DUJpN9V9-Bko7-D02.js"), [])),
      tc.setupDevUI($e, W)),
    xo(),
    await Ao(),
    console.log("[PLAYHTML]: Setting up elements... Time to have some fun 🛝"),
    wr(),
    Io(),
    (Co = !1),
    Gu(),
    o.length > 0)
  )
    try {
      const l = o.map((u) => u.elementId);
      z.sendMessage(
        JSON.stringify({ type: "export-permissions", elementIds: l }),
      );
    } catch (l) {
      console.error("[PLAYHTML] Error during post-sync setup:", l);
    }
  return z;
}
function L0(t, e) {
  return X
    ? X.getLocalAwareness(t, e)
    : (mr().awareness.getLocalState()?.[t] ?? {})[e];
}
function mr() {
  return z;
}
function Ue(t) {
  return t instanceof HTMLElement;
}
function sh(t) {
  return t.hasAttribute("can-play") ? "none" : "animate";
}
function rh(t) {
  if ((t.getAttribute("loading-behavior") || sh(t)) === "none") return;
  t.classList.add("playhtml-loading");
  const e = t.getAttribute("loading-class");
  (e && t.classList.add(e),
    t.setAttribute("aria-busy", "true"),
    t.setAttribute("aria-live", "polite"));
}
function ih(t) {
  if ((t.getAttribute("loading-behavior") || sh(t)) === "none") return;
  t.classList.remove("playhtml-loading");
  const e = t.getAttribute("loading-class");
  (e && t.classList.remove(e),
    t.removeAttribute("aria-busy"),
    t.removeAttribute("aria-live"));
}
function xo() {
  for (const t of xt())
    Array.from(document.querySelectorAll(`[${t}]`))
      .filter(Ue)
      .forEach((e) => {
        rh(e);
      });
}
function Io() {
  for (const t of xt())
    Array.from(document.querySelectorAll(`[${t}]`))
      .filter(Ue)
      .forEach((e) => {
        ih(e);
      });
}
function M0(t, e, n) {
  if (typeof n == "function") {
    const s = n(e);
    D?.developmentMode &&
      s !== void 0 &&
      typeof s == "object" &&
      console.warn(
        `[playhtml] A setData() mutator for "${t}" returned an object. Mutators must mutate the draft in place (e.g. \`d => { d.count++ }\`); the return value is ignored. To replace the whole snapshot, pass a value instead of a function.`,
      );
    return;
  }
  Hs(e, n);
}
function T0(t) {
  const e = Bn(t);
  return !Em(t, e);
}
function P0(t, e, n, s) {
  const r =
      n.defaultData instanceof Function ? n.defaultData(t) : n.defaultData,
    i = n.defaultData === void 0 ? void 0 : Vu(e, s, r),
    o = L0(e, s);
  return {
    ...n,
    myDefaultAwareness: o !== void 0 ? o : n.myDefaultAwareness,
    devMode: D?.developmentMode ?? !1,
    data: ot(i),
    awareness:
      o !== void 0
        ? [o]
        : n.myDefaultAwareness !== void 0
          ? [n.myDefaultAwareness]
          : void 0,
    element: t,
    onChange: (a) => {
      if (i === void 0) {
        console.error(
          `[playhtml] setData() was called for "${s}", but its initializer does not define \`defaultData\`.`,
        );
        return;
      }
      T0(t) &&
        At.transact(() => {
          M0(s, i, a);
        });
    },
    onAwarenessChange: (a) => {
      if (X) {
        X.setLocalAwareness(e, s, a);
        return;
      }
      const c = mr(),
        l = c.awareness.getLocalState()?.[e] || {};
      if (l[s] === a) return;
      const u = { ...l, [s]: a };
      c.awareness.setLocalStateField(e, u);
    },
    triggerAwarenessUpdate: () => {
      X || Do();
    },
  };
}
function O0(t) {
  return $o(t).length === 0;
}
function $o(t) {
  if (t == null) return ["initializer"];
  const e = [],
    n = t.defaultData !== void 0,
    s =
      n &&
      t.defaultData !== null &&
      (typeof t.defaultData == "object" || typeof t.defaultData == "function"),
    r = typeof t.updateElement == "function",
    i = typeof t.view == "function",
    o = r || i,
    a = t.myDefaultAwareness !== void 0,
    c = typeof t.updateElementAwareness == "function",
    l = o || c;
  return (
    n && !s && e.push("defaultData must be an object or function"),
    n && !o
      ? e.push("defaultData requires updateElement or view")
      : !n && o && e.push("updateElement or view requires defaultData"),
    a && !c && e.push("myDefaultAwareness requires updateElementAwareness"),
    e.length === 0 &&
      !l &&
      e.push("updateElement, view, or updateElementAwareness"),
    e
  );
}
function ic(t) {
  const e = t,
    n = {},
    s = [
      "defaultData",
      "defaultLocalData",
      "myDefaultAwareness",
      "updateElement",
      "view",
      "updateElementAwareness",
      "onDrag",
      "onDragStart",
      "onClick",
      "onMount",
      "resetShortcut",
      "debounceMs",
      "isValidElementForTag",
    ];
  for (const r of s) e[r] !== void 0 && (n[r] = e[r]);
  return n;
}
function oh(t, e) {
  return t === Q.CanPlay || !e.hasAttribute(Q.CanPlay);
}
function N0(t, e) {
  if (t === Q.CanPlay) return ic(e);
  const n = Yn[t];
  if (!n) return;
  if (!oh(t, e)) return n;
  const s = ic(e);
  return { ...n, ...s };
}
function Do() {
  const t = mr().awareness.getStates(),
    e = By(t);
  if (e === qs) return;
  qs = e;
  const n = new Map();
  (t.forEach((s, r) => {
    const i = kt(s, r);
    Object.keys(s).forEach((o) => {
      if (o.startsWith("__")) return;
      const a = s[o];
      !a ||
        typeof a != "object" ||
        Object.keys(a).forEach((c) => {
          const l = a[c],
            u = `${o}:${c}`;
          n.has(u) || n.set(u, { array: [], byStableId: new Map() });
          const h = n.get(u);
          (h.array.push(l), h.byStableId.set(i, l));
        });
    });
  }),
    ah(n));
}
function ah(t) {
  t.forEach(({ array: e, byStableId: n }, s) => {
    Me(() => oc(s, e, n), "element awareness handler");
  });
  for (const e of Vs)
    t.has(e) || Me(() => oc(e, [], new Map()), "element awareness handler");
  Vs = new Set(t.keys());
}
function oc(t, e, n) {
  const s = t.indexOf(":"),
    r = t.slice(0, s),
    i = t.slice(s + 1),
    o = W.get(r);
  if (!o) return;
  const a = o.get(i);
  a && a.updateAwareness(e, n);
}
function wr() {
  if (ee) {
    for (const [t, e] of It) {
      const n = document.getElementById(t);
      n && Ue(n) && br(n, e);
    }
    for (const t of xt()) {
      const e = Array.from(document.querySelectorAll(`[${t}]`)).filter(Ue);
      e.length && Promise.all(e.map((n) => tn(n, t)));
    }
    Si &&
      (X ? X.refresh() : (Eo(), Do()),
      (Ys = oy(async () => {
        await x0();
      })),
      ay(Ys),
      (Si = !1));
  }
}
function Lo() {
  return {
    ensureProxy: Vu,
    getProxy: (t, e) => nt.get(t)?.get(e),
    getDoc: () => At,
    getStorePlay: () => ie.play,
    proxyByTagAndId: nt,
    yObserverByKey: at,
    channelRefCounts: o0,
    channelListeners: a0,
  };
}
function R0(t, e) {
  if (!ee)
    throw new Error("playhtml.createPageData is not available before init()");
  return km(t, e, Lo());
}
function j0(t) {
  if (!ee)
    throw new Error(
      "playhtml.createPresenceRoom is not available before init()",
    );
  const e = Pn(window.location.host, t),
    n = Fu() ? new Hu({ host: Te, room: e }) : null;
  if (n) {
    const a =
        ue?.onSelfChange(() => {
          try {
            n.join({ identity: We(), page: tt() });
          } catch (u) {
            console.warn(
              "[playhtml] Failed to republish identity on change:",
              u,
            );
          }
        }) ?? null,
      c = new Wu({ transport: n, getIdentity: We, getPage: tt });
    let l = !1;
    return {
      presence: c,
      destroy: () => {
        if (!l) {
          l = !0;
          try {
            a?.();
          } catch {}
          try {
            c.destroy();
          } catch {}
          try {
            n.destroy();
          } catch {}
        }
      },
    };
  }
  const s = new Ae(),
    r = new so(Te, e, s),
    i = Du({
      getAwareness: () => r.awareness,
      getPlayerIdentity: We,
      publishIdentity: !0,
    });
  let o = !1;
  return {
    presence: i,
    destroy: () => {
      o || ((o = !0), r.destroy(), s.destroy());
    },
  };
}
const $e = {
  init: $0,
  configure: I0,
  get isLoading() {
    return Co;
  },
  get ready() {
    return Ot;
  },
  handleNavigation: async function () {
    Ys && (await Ys.trigger());
  },
  setupPlayElements: wr,
  setupPlayElement: lh,
  removePlayElement: Jn,
  deleteElementData: V0,
  setupPlayElementForTag: tn,
  register: K0,
  define: B0,
  getHandle: dh,
  get syncedStore() {
    return Ku;
  },
  elementHandlers: W,
  dispatchPlayEvent: Y0,
  registerPlayEventListener: fh,
  removePlayEventListener: G0,
  get cursorClient() {
    return oe;
  },
  get presence() {
    if (!Ks)
      throw new Error("playhtml.presence is not available before init()");
    return Ks;
  },
  get users() {
    if (!ue) throw new Error("playhtml.users is not available before init()");
    return ue;
  },
  get roomId() {
    return se;
  },
  get host() {
    return Te;
  },
  createPageData: R0,
  createPresenceRoom: j0,
  listSharedElements: iy,
};
function U0(t) {
  if (t === Z)
    throw new Error(`"${Z}" is a reserved tag name for page-level data`);
  W.has(t) || (ee && (W.has(t) || W.set(t, new Map()), (ie.play[t] ??= {})));
}
function H0(t, e) {
  const n = oh(e, t) ? t.isValidElementForTag : void 0;
  return typeof n == "function"
    ? n(t)
    : (Yn[e]?.isValidElementForTag?.(t) ?? !0);
}
function ac(t) {
  const e = t.tagName.toLowerCase(),
    n = t.id ? `#${t.id}` : "",
    s = Array.from(t.classList)
      .map((r) => `.${r}`)
      .join("");
  return `<${e}${n}${s}>`;
}
function F0(t, e, n, s) {
  console.error(
    `[playhtml] Duplicate element id "${e}" for ${t}. Element IDs must be unique per capability tag because playhtml stores shared data by tag and ID. Keeping ${ac(n)} and ignoring ${ac(s)}.`,
    { existingElement: n, duplicateElement: s },
  );
}
function z0(t, e, n) {
  const s = W.get(t)?.get(e);
  !s || s.element === n || s.element.isConnected || Jn(s.element);
}
async function tn(t, e) {
  if (!H0(t, e) || !ee) return;
  if (!t.id) {
    const a = t.getAttribute("selector-id");
    if (a) {
      const c = rc.get(a) ?? 0;
      ((t.id = btoa(`${e}-${a}-${c}`)), rc.set(a, c + 1));
    } else t.id = await Ky(e, t);
  }
  const n = Bn(t);
  if (!n) {
    console.error(
      `Element ${t} does not have an acceptable ID. Please add an ID to the element to register it as a playhtml element.`,
    );
    return;
  }
  U0(e);
  const s = W.get(e);
  z0(e, n, t);
  const r = N0(e, t);
  if (!O0(r)) {
    const a = $o(r);
    console.error(
      `Element ${n} does not have proper info to initialize a playhtml element. Missing or invalid initializer properties: ${a.join(", ")}. Please refer to https://github.com/spencerc99/playhtml#can-play for troubleshooting help.`,
    );
    return;
  }
  const i = P0(t, e, r, n),
    o = s.get(n);
  if (o) {
    if (o.element !== t) {
      F0(e, n, o.element, t);
      return;
    }
    (o.reinitializeElementData(i), ch(e, n, o), cc(e, n));
    return;
  } else {
    const a = new Wy(
      i,
      e === Q.CanMirror
        ? { scheduleSetupDataWrite: (c) => Yu.queue(c) }
        : void 0,
    );
    (s.set(n, a),
      r.view && ((a.onAfterRender = q0), a.observeDescendants()),
      e === Q.CanMirror && uh(t));
  }
  (i.triggerAwarenessUpdate?.(),
    t.classList.add("__playhtml-element"),
    t.style.setProperty("--jiggle-delay", `${Math.random() * 1}s;}`),
    cc(e, n));
}
function ch(t, e, n) {
  const s = ie.play[t]?.[e];
  if (s === void 0) return !1;
  const r = `${t}:${e}`;
  sc.add(r);
  try {
    ((n.__data = ot(s)), t === Q.CanMirror && uh(n.element));
  } finally {
    sc.delete(r);
  }
  return !0;
}
function cc(t, e) {
  const n = `${t}:${e}`,
    s = W.get(t);
  if (!s) return;
  const r = s.get(e);
  if (!r) return;
  const i = ke(ie.play[t]?.[e]);
  if (!i || typeof i.observeDeep != "function") return;
  const o = at.get(n);
  o && i.unobserveDeep(o);
  let a = !1;
  const c = () => {
    a ||
      ((a = !0),
      queueMicrotask(() => {
        ((a = !1), ch(t, e, r) && Bs.add(n));
      }));
  };
  if ((i.observeDeep(c), at.set(n, c), D?.developmentMode)) {
    const l = r.element;
    if (l && l.hasAttribute && l.hasAttribute("data-source") && !wt.has(n)) {
      const u = window.setTimeout(() => {
        (Bs.has(n) ||
          console.warn(
            `[playhtml] Shared reference ${t}:${e} has not received data. Check data-source and source availability.`,
          ),
          wt.delete(n));
      }, 3e3);
      wt.set(n, u);
    }
  }
}
function lh(t, { ignoreIfAlreadySetup: e } = {}) {
  if (t.hasAttribute?.("data-source") && t.hasAttribute?.("shared")) {
    const n = t.id || "<no-id>";
    console.error(
      `[playhtml] Element ${n} has both 'data-source' and 'shared'. Ignoring. A single element cannot be both a consumer and a source.`,
    );
    return;
  }
  if (!(e && Array.from(W.values()).some((n) => n.has(t.id)))) {
    if (!Ue(t)) {
      console.log(`Element ${t.id} not an HTML element. Ignoring.`);
      return;
    }
    (t.id && It.has(t.id) && br(t, It.get(t.id)),
      t.hasAttribute("data-source") && c0(t),
      t.hasAttribute("shared") && l0(t),
      xt().some((n) => t.hasAttribute(n)) && (ee ? ih(t) : rh(t)),
      Promise.all(
        xt()
          .filter((n) => t.hasAttribute(n))
          .map((n) => tn(t, n)),
      ));
  }
}
function uh(t) {
  const e = new Set(),
    n = new Map();
  for (const s of xt())
    t.querySelectorAll(`[${s}]`).forEach((r) => {
      if (Ue(r)) {
        e.add(r);
        const i = Bn(r);
        i && n.set(`${s}:${i}`, r);
      }
    });
  (nc.get(t)?.forEach((s, r) => {
    n.get(r) !== s && Jn(s);
  }),
    e.forEach((s) => {
      lh(s);
    }),
    nc.set(t, n));
}
function Jn(t) {
  if (!t || !t.id) return;
  const e = Bn(t);
  if (e)
    for (const [n, s] of W) {
      const r = s.get(e);
      if (!r || r.element !== t) continue;
      const i = `${n}:${e}`,
        o = ke(ie.play[n]?.[e]),
        a = at.get(i);
      (o && a && typeof o.unobserveDeep == "function" && o.unobserveDeep(a),
        at.delete(i),
        Bs.delete(i));
      const c = wt.get(i);
      (c !== void 0 && (clearTimeout(c), wt.delete(i)),
        r.destroy?.(),
        X?.removeLocalAwareness(n, e),
        s.delete(e));
    }
}
const It = new Map();
function hh(t, e) {
  if (e.view && e.updateElement)
    throw new Error(
      `[playhtml] "${t}" defines both \`view\` and \`updateElement\`. They are mutually exclusive — pick one.`,
    );
  if (e.view && (e.onClick || e.onDrag || e.onDragStart))
    throw new Error(
      `[playhtml] "${t}" defines \`view\` alongside an element event handler (onClick/onDrag/onDragStart). In view mode, attach events inside the template (e.g. \`@click=\${...}\`) instead.`,
    );
  if (
    e.defaultData !== void 0 &&
    typeof e.defaultData != "function" &&
    (typeof e.defaultData != "object" || e.defaultData === null)
  )
    throw new Error(
      `[playhtml] "${t}" has a non-object \`defaultData\`. Use an object (e.g. \`{ count: 0 }\`) so the shape can grow without a data migration.`,
    );
  const n = $o(e);
  if (n.length > 0)
    throw new Error(
      `[playhtml] "${t}" has an invalid initializer: ${n.join(", ")}.`,
    );
}
function br(t, e) {
  (Object.assign(t, e),
    t.hasAttribute(Q.CanPlay) || t.setAttribute(Q.CanPlay, ""));
}
function W0(t) {
  if (!ee) return;
  const e = It.get(t);
  if (!e) return;
  const n = document.getElementById(t);
  !n || !Ue(n) || (br(n, e), tn(n, Q.CanPlay));
}
function cn(t, e) {
  if (e !== void 0) return W.get(e)?.get(t);
  const n = W.get(Q.CanPlay)?.get(t);
  if (n) return n;
  for (const [, s] of W) {
    const r = s.get(t);
    if (r) return r;
  }
}
function ys(t, e) {
  D?.developmentMode &&
    console.warn(
      `[playhtml] ${t}("${e}") — no bound element with that id yet; the write was dropped. Register/add the element first, or check the id.`,
    );
}
function dh(t, e) {
  return {
    id: t,
    getElement: () => document.getElementById(t),
    getData: () => cn(t, e)?.data,
    setData: (n) => {
      const s = cn(t, e);
      if (!s) return ys("setData", t);
      s.setData(n);
    },
    setLocalData: (n) => {
      const s = cn(t, e);
      if (!s) return ys("setLocalData", t);
      s.setLocalData(n);
    },
    setMyAwareness: (n) => {
      const s = cn(t, e);
      if (!s) return ys("setMyAwareness", t);
      s.setMyAwareness(n);
    },
    requestUpdate: () => {
      const n = cn(t, e);
      if (!n) return ys("requestUpdate", t);
      n.requestUpdate();
    },
    unregister: () => {
      It.delete(t);
      const n = document.getElementById(t);
      n && Jn(n);
    },
  };
}
function K0(t, e) {
  return (
    hh(t, e),
    It.set(t, e),
    W0(t),
    D?.developmentMode &&
      ee &&
      !document.getElementById(t) &&
      console.warn(
        `[playhtml] register("${t}") — no element with that id is in the DOM yet. It will bind automatically when the element appears.`,
      ),
    dh(t, Q.CanPlay)
  );
}
function B0(t, e) {
  if (t === Z)
    throw new Error(`"${Z}" is a reserved tag name for page-level data`);
  if (t === Q.CanPlay)
    throw new Error(
      `[playhtml] "${Q.CanPlay}" is reserved — use register(id, init) for single elements.`,
    );
  if (Object.prototype.hasOwnProperty.call(tu, t))
    throw new Error(
      `[playhtml] "${t}" is a built-in capability and cannot be redefined.`,
    );
  if ((hh(t, e), (Yn[t] = e), ee)) {
    const n = Array.from(document.querySelectorAll(`[${t}]`)).filter(Ue);
    Promise.all(n.map((s) => tn(s, t)));
  }
}
const lc = new WeakMap();
function q0(t) {
  for (const [s, r] of It) {
    if (s === t.id) continue;
    const i = document.getElementById(s);
    i && t.contains(i) && Ue(i) && br(i, r);
  }
  const e = new Map();
  for (const s of xt()) {
    const r = Array.from(t.querySelectorAll(`[${s}]`)).filter(Ue);
    for (const i of r) {
      if (i === t) continue;
      if (!i.id) {
        D?.developmentMode &&
          console.warn(
            `[playhtml] a view rendered a "${s}" element with no id; it won't bind. Give capability children a stable, unique id (key keyed lists by it).`,
          );
        continue;
      }
      e.set(`${s}:${i.id}`, i);
      const o = W.get(s)?.get(i.id);
      (o && o.element === i) || tn(i, s);
    }
  }
  const n = lc.get(t);
  if (n) for (const [s, r] of n) e.has(s) || Jn(r);
  lc.set(t, e);
}
function V0(t, e) {
  if (!ee) {
    console.warn(
      `[PLAYHTML] Cannot remove element data before sync: ${t}:${e}`,
    );
    return;
  }
  const n = `${t}:${e}`,
    s = ke(ie.play[t]?.[e]);
  if (s && typeof s.observeDeep == "function") {
    const c = at.get(n);
    if (c) {
      try {
        s.unobserveDeep(c);
      } catch (l) {
        console.warn(`[PLAYHTML] Failed to remove observer for ${n}:`, l);
      }
      at.delete(n);
    }
  }
  const r = ie.play[t];
  if (r && e in r)
    try {
      At.transact(() => {
        delete r[e];
      });
    } catch (c) {
      console.warn(`[PLAYHTML] Failed to remove SyncedStore data for ${n}:`, c);
    }
  const i = nt.get(t);
  i && (i.delete(e), i.size === 0 && nt.delete(t));
  const o = W.get(t);
  (o && o.delete(e), Bs.delete(n));
  const a = wt.get(n);
  a !== void 0 && (clearTimeout(a), wt.delete(n));
}
function Y0(t) {
  const { type: e } = t;
  if (!Gt.has(e)) {
    console.error(`[playhtml] event "${e}" not registered.`);
    return;
  }
  h0(t);
}
function fh(t, e) {
  const n = String(u0++);
  return (Gt.set(t, [...(Gt.get(t) ?? []), { type: t, ...e, id: n }]), n);
}
function G0(t, e) {
  const n = Gt.get(t);
  if (!n) return;
  const s = n.findIndex((r) => r.id === e);
  s !== -1 && (n.splice(s, 1), n.length === 0 && Gt.delete(t));
}
function J0(t, e) {
  return `ottv2-${t}-${e}`;
}
const X0 = (t) => t.trim().toUpperCase(),
  uc = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789",
  hc = () =>
    Array.from(
      crypto.getRandomValues(new Uint8Array(6)),
      (t) => uc[t % uc.length],
    ).join("");
function dc(t, e) {
  const n = [t.player1, t.player2].filter((s) => !!s);
  return (
    n.length === 0 ||
    (t.status === "FINISHED" && n.filter((s) => e.has(s)).length < 2)
  );
}
async function Z0(t) {
  await $e.init({ room: J0("LOBBY", "ott-local-session") });
  const e = $e.createPageData("rooms", { rooms: {} }),
    n = $e.presence.getMyIdentity().publicKey,
    s = () =>
      new Set(
        [...$e.presence.getPresences().values()]
          .map((l) => l.playerIdentity?.publicKey)
          .filter((l) => !!l),
      ),
    r = new Set();
  r.add(t);
  let i;
  const o = () => r.forEach((l) => l());
  (e.onUpdate(() => {
    (o(), c());
  }),
    $e.presence.onPresenceChange("ott", () => {
      (o(), c());
    }),
    $e.presence.setMyPresence("ott", { roomCode: null }));
  const a = () => {
    const l = s(),
      u = Object.values(e.getData().rooms)
        .filter((h) => dc(h, l))
        .map((h) => h.code);
    u.length &&
      e.setData((h) => {
        for (const d of u) h.rooms[d] && dc(h.rooms[d], l) && delete h.rooms[d];
      });
  };
  function c() {
    (i && clearTimeout(i), (i = setTimeout(a, 1800)));
  }
  return (
    c(),
    {
      identity: n,
      list: () =>
        Object.values(e.getData().rooms).sort(
          (l, u) => u.createdAt - l.createdAt,
        ),
      online: s,
      subscribe: (l) => (r.add(l), () => r.delete(l)),
      has: (l, u) => e.getData().rooms[l]?.gameId === u,
      add: (l) =>
        e.setData((u) => {
          u.rooms[l.code] = l;
        }),
      update: (l, u) =>
        e.setData((h) => {
          const d = h.rooms[l];
          !d ||
            d.gameId !== u.gameId ||
            ((d.status = u.status),
            (d.player1 = u.seats[0]?.id ?? null),
            (d.player2 = u.seats[1]?.id ?? null),
            (d.name1 = u.seats[0]?.name ?? ""),
            (d.name2 = u.seats[1]?.name ?? ""));
        }),
      remove: (l, u) =>
        e.setData((h) => {
          h.rooms[l]?.gameId === u && delete h.rooms[l];
        }),
      channel: (l) => $e.createPageData(`game-${l.gameId}`, wh(l.gameId)),
      setPresence: (l) => $e.presence.setMyPresence("ott", { roomCode: l }),
      cleanup: a,
    }
  );
}
function Q0(t, e, n) {
  t.update(e, n);
}
function ew(t, e, n) {
  let s = hc();
  for (; t.list().some((a) => a.code === s); ) s = hc();
  const r = Nn(),
    i = {
      code: s,
      gameId: r,
      createdAt: Date.now(),
      status: "WAITING",
      player1: t.identity,
      player2: null,
      name1: e,
      name2: "",
    },
    o = t.channel(i);
  return (
    o.setData((a) => {
      a.seats.splice(0, 1, { id: t.identity, name: e, ready: !1, rematch: !1 });
    }),
    t.add(i),
    ph(t, i, o, n)
  );
}
function tw(t, e, n, s) {
  const r = X0(e),
    i = t.list().find((a) => a.code === r);
  if (!i) throw new Error("Không tìm thấy phòng với mã này");
  const o = t.channel(i);
  return (
    o.setData((a) => {
      if (a.seats.some((l) => l?.id === t.identity)) return;
      const c = a.seats.findIndex((l) => l === null);
      c >= 0 &&
        a.seats.splice(c, 1, {
          id: t.identity,
          name: n,
          ready: !1,
          rematch: !1,
        });
    }),
    ph(t, i, o, s)
  );
}
function ph(t, e, n, s) {
  const r = () => {
      (Q0(t, e.code, n.getData()), s());
    },
    i = n.onUpdate(r);
  return (
    t.setPresence(e.code),
    r(),
    {
      code: e.code,
      identity: t.identity,
      read: () => n.getData(),
      online: t.online,
      listed: () => t.has(e.code, e.gameId),
      change: (o) => {
        (n.setData(o), r());
      },
      close: () => {
        (i(), n.destroy(), t.setPresence(null), t.cleanup());
      },
    }
  );
}
function nw(t) {
  t.change((e) => {
    const n = e.seats.findIndex((s) => s?.id === t.identity);
    n < 0 ||
      (e.seats.splice(n, 1, null),
      e.status !== "FINISHED" &&
        ((e.status = "WAITING"),
        e.pieces.splice(0, e.pieces.length),
        e.history.splice(0, e.history.length),
        (e.winner = null),
        (e.reason = ""),
        (e.lastMove = null),
        e.seats.forEach((s) => {
          s && ((s.ready = !1), (s.rematch = !1));
        }),
        (e.matchId = Nn()),
        e.version++));
  });
}
function sw(t, e) {
  t.change((n) => {
    const s = vh(n, e);
    if (s === n) return;
    const r = n.pieces.findIndex(
      (o) =>
        o.id !== e.pieceId &&
        o.position.row === e.to.row &&
        o.position.col === e.to.col,
    );
    r >= 0 && n.pieces.splice(r, 1);
    const i = n.pieces.find((o) => o.id === e.pieceId);
    i &&
      ((i.position.row = e.to.row),
      (i.position.col = e.to.col),
      n.history.push(s.history[s.history.length - 1]),
      (n.turn = s.turn),
      (n.version = s.version),
      (n.status = s.status),
      (n.winner = s.winner),
      (n.reason = s.reason),
      (n.lastMove = s.lastMove));
  });
}
function rw(t) {
  t.change((e) => {
    const n = e.seats.find((r) => r?.id === t.identity);
    if (!n || e.status !== "WAITING") return;
    n.ready = !n.ready;
    const s = Ch(e);
    s !== e &&
      (e.pieces.push(...Xt()),
      (e.turn = s.turn),
      (e.version = s.version),
      (e.status = "PLAYING"),
      (e.lastMove = null));
  });
}
function fc(t) {
  t.change((e) => {
    const n = e.seats.find((r) => r?.id === t.identity);
    if (!n || e.status !== "FINISHED") return;
    n.rematch = !0;
    const s = Sh(e);
    s !== e &&
      ((e.match = s.match),
      (e.matchId = s.matchId),
      e.pieces.splice(0, e.pieces.length),
      e.pieces.push(...Xt()),
      e.history.splice(0, e.history.length),
      (e.turn = s.turn),
      (e.winner = null),
      (e.reason = ""),
      (e.status = "PLAYING"),
      (e.version = s.version),
      (e.lastMove = null),
      e.seats.forEach((r) => {
        r && (r.rematch = !1);
      }));
  });
}
function iw(t) {
  t.change((e) => {
    const n = e.seats.findIndex((s) => s?.id === t.identity);
    n >= 0 &&
      e.status === "PLAYING" &&
      ((e.status = "FINISHED"),
      (e.winner = n === 0 ? 2 : 1),
      (e.reason = "Đối phương đầu hàng"),
      e.version++);
  });
}
const T = document.querySelector("#app");
let Mo = !1;
window.addEventListener("ott-bot-home", () => {
  ((Mo = !1), Pe());
});
let st = null,
  A = null,
  bt = null,
  As = localStorage.getItem("ott-name") || "",
  Jt = "",
  gh = new URLSearchParams(location.search).get("room")?.toUpperCase() || "";
const ne = (t) =>
    t.replace(
      /[&<>"']/g,
      (e) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[e],
    ),
  pc = (t) => {
    navigator.clipboard.writeText(t);
  };
function Pe() {
  if (!Mo) {
    if (!st) {
      T.innerHTML = '<div class="loading">Đang kết nối danh sách phòng…</div>';
      return;
    }
    (A &&
      !A.listed() &&
      (A.close(),
      (A = null),
      (Jt = "Phòng đã đóng vì trận kết thúc và không còn đủ hai người chơi."),
      history.replaceState(null, "", location.pathname)),
      A ? aw() : vr());
  }
}
function ow() {
  const e = T.querySelector("#name")?.value.trim().slice(0, 24) || "";
  return e
    ? ((As = e), localStorage.setItem("ott-name", As), As)
    : ((Jt = "Vui lòng nhập tên của bạn"), vr(), null);
}
function Gr(t) {
  if (!st) return;
  const e = ow();
  if (e)
    try {
      ((A = t ? tw(st, t, e, Pe) : ew(st, e, Pe)),
        (bt = null),
        (Jt = ""),
        history.replaceState(null, "", `?room=${A.code}`),
        Pe());
    } catch (n) {
      ((Jt = n instanceof Error ? n.message : String(n)), vr());
    }
}
function vr() {
  if (!st) return;
  const t = st
    .list()
    .map((e) => {
      const n = +!!e.player1 + +!!e.player2;
      return `<div class="room-row"><div><b>${ne(e.code)}</b><small>${ne(e.name1 || "Trống")} · ${ne(e.name2 || "Trống")} · ${n}/2 · ${e.status === "WAITING" ? "Đang chờ" : e.status === "PLAYING" ? "Đang chơi" : "Đã xong"}</small></div><button data-room="${ne(e.code)}">Vào phòng</button></div>`;
    })
    .join("");
  ((T.innerHTML = `<main class="home"><div class="brand">OTT<span>v2</span></div><p class="eyebrow">OẲN TÙ TÌ · CHIẾN THUẬT 9×9</p><h1>Chọn phòng.<br><em>Bắt đầu ván đấu.</em></h1><p class="intro">Tạo phòng mới, gửi mã cho bạn bè hoặc tham gia một phòng đang có.</p><button id="bot-arena" class="primary" style="margin:16px 0">BOT ARENA · Đấu bot ↗</button><div class="home-card"><label>TÊN CỦA BẠN<input id="name" maxlength="24" placeholder="Nhập tên hiển thị" value="${ne(As)}"></label><button id="create" class="primary">Tạo phòng mới <span>↗</span></button><div class="divider">HOẶC THAM GIA BẰNG MÃ</div><div class="join-row"><input id="code" maxlength="12" placeholder="Mã phòng" value="${ne(gh)}"><button id="join">Tham gia</button></div><p class="error">${ne(Jt)}</p></div><section class="room-list"><p class="eyebrow">PHÒNG HIỆN CÓ · ${st.list().length}</p>${t || '<p class="empty-rooms">Chưa có phòng nào. Hãy tạo phòng đầu tiên.</p>'}</section><div class="how"><b>LUẬT CHƠI</b><div><span>✊ thắng ✌️</span><span>✌️ thắng ✋</span><span>✋ thắng ✊</span></div><p>Mỗi lượt đi một ô theo tám hướng. Cùng loại không thể ăn nhau.</p></div></main>`),
    T.querySelector("#bot-arena").addEventListener("click", () => {
      ((Mo = !0), kh());
    }),
    T.querySelector("#create").addEventListener("click", () => Gr()),
    T.querySelector("#join").addEventListener("click", () => {
      const e = T.querySelector("#code").value.trim().toUpperCase();
      if (!e) {
        ((Jt = "Vui lòng nhập mã phòng"), vr());
        return;
      }
      Gr(e);
    }),
    T.querySelectorAll("[data-room]").forEach((e) =>
      e.addEventListener("click", () => Gr(e.dataset.room)),
    ));
}
function aw() {
  if (!A) return;
  const t = A.read(),
    e = t.seats.findIndex((u) => u?.id === A.identity),
    n = A.online(),
    s = e >= 0 && t.status === "PLAYING" && t.turn === e + 1,
    r = t.status === "WAITING" ? Xt() : t.pieces,
    i = t.pieces.find((u) => u.id === bt && u.owner === e + 1),
    o = s && i ? xi(t.pieces, i) : [],
    a = (u) => {
      const h = t.seats[u - 1],
        d = Ai.map(
          (f) =>
            `<span>${Rt[f]} ${r.filter((p) => p.owner === u && p.type === f).length}</span>`,
        ).join("");
      return `<div class="player p${u} ${t.turn === u && t.status === "PLAYING" ? "turn" : ""}"><div class="avatar">${u === 1 ? "01" : "02"}</div><div><small>PLAYER ${u} ${h?.id === A.identity ? "· BẠN" : ""}</small><strong>${ne(h?.name || "Đang chờ người chơi")}</strong>${t.status === "WAITING" && h ? `<small>${h.ready ? "Đã sẵn sàng" : "Chưa sẵn sàng"}</small>` : ""}<div class="pieces">${d}</div></div><span class="dot ${h && n.has(h.id) ? "on" : ""}"></span></div>`;
    };
  let c =
    '<div class="coordinates"><span></span>' +
    [..."abcdefghi"].map((u) => `<span>${u}</span>`).join("") +
    '</div><div class="board">';
  for (let u = 0; u < 9; u++) {
    c += `<span class="row-num">${u + 1}</span>`;
    for (let h = 0; h < 9; h++) {
      const d = { row: u, col: h },
        f = Rn(r, d),
        p = o.some((m) => m.row === u && m.col === h),
        g = (u === 0 && h === 0) || (u === 8 && h === 8),
        b =
          t.lastMove &&
          ((t.lastMove.from.row === u && t.lastMove.from.col === h) ||
            (t.lastMove.to.row === u && t.lastMove.to.col === h));
      c += `<button class="cell ${(u + h) % 2 ? "dark" : "light"} ${f ? "occupied" : ""} ${f?.owner === 1 ? "blue" : f?.owner === 2 ? "orange" : ""} ${f?.id === bt ? "selected" : ""} ${p ? (f ? "capture" : "possible") : ""} ${g ? "goal" : ""} ${b ? "recent" : ""}" data-r="${u}" data-c="${h}" aria-label="${ws(d)} ${f ? Rt[f.type] : ""}">${g ? '<span class="goal-mark">◆</span>' : ""}${f ? `<span class="token">${Rt[f.type]}</span>` : ""}</button>`;
    }
  }
  c += "</div>";
  const l =
    t.status === "WAITING"
      ? "CHỜ BẮT ĐẦU"
      : t.status === "FINISHED"
        ? "TRẬN ĐẤU KẾT THÚC"
        : `LƯỢT PLAYER ${t.turn}`;
  ((T.innerHTML = `<div class="shell"><header><div class="brand small">OTT<span>v2</span></div><div class="room-code">PHÒNG <b>${ne(A.code)}</b></div><div class="connection"><i></i> Đã kết nối</div><button id="copy-link">Sao chép link ↗</button></header><main class="layout"><section class="game-area"><div class="game-title"><div><p class="eyebrow">TRẬN ${t.match} · ${t.history.length} NƯỚC ĐI</p><h1>${l}</h1></div><span class="badge">${e < 0 ? "KHÁN GIẢ" : `PLAYER ${e + 1}`}</span></div>${a(2)}<div class="board-wrap">${c}</div>${a(1)}<p class="hint">${t.status === "PLAYING" ? (e < 0 ? "Bạn đang xem với vai trò khán giả." : s ? "Đến lượt bạn: chọn quân rồi chọn ô được đánh dấu." : "Đang chờ Player " + t.turn + " đi quân.") : t.status === "FINISHED" ? "Trận đã kết thúc. Phòng sẽ đóng nếu còn dưới hai người chơi online." : "Đây là đội hình xem trước. Cả hai người chơi cần bấm Sẵn sàng."}</p></section><aside><div class="side-card"><p class="eyebrow">MÃ PHÒNG</p><div class="code-large">${ne(A.code)}</div><button id="copy-code">Sao chép mã</button>${t.status === "WAITING" && e >= 0 ? `<button id="ready" class="primary">${t.seats[e]?.ready ? "Hủy sẵn sàng" : "Tôi đã sẵn sàng"}</button>` : ""}${t.status === "PLAYING" && e >= 0 ? '<button id="surrender" class="danger">Đầu hàng</button>' : ""}${t.status === "FINISHED" && e >= 0 ? `<button id="rematch" class="primary">${t.seats[e]?.rematch ? "Đang chờ đối thủ…" : "Chơi lại"}</button>` : ""}<button id="leave">Rời phòng</button></div><div class="side-card"><p class="eyebrow">CÁCH CHƠI</p><p>Đi một ô theo tám hướng. ✊ ăn ✌️ · ✌️ ăn ✋ · ✋ ăn ✊. Loại hết một loại quân đối phương hoặc tới góc đích để thắng.</p></div><div class="side-card history"><p class="eyebrow">LỊCH SỬ NƯỚC ĐI</p>${
    t.history.length
      ? t.history
          .slice()
          .reverse()
          .map(
            (u, h) =>
              `<div><span>${t.history.length - h}.</span> ${ne(u.text)}</div>`,
          )
          .join("")
      : "<p>Chưa có nước đi nào.</p>"
  }</div></aside></main>${t.status === "FINISHED" && e >= 0 ? `<div class="modal-back"><div class="modal"><p class="eyebrow">KẾT QUẢ TRẬN ${t.match}</p><div class="trophy">${t.winner ? "✦" : "◇"}</div><h2>${t.winner ? `${ne(t.seats[t.winner - 1]?.name || "Người chơi")} chiến thắng!` : "Trận đấu hòa"}</h2><p>${ne(t.reason)}</p><p>${t.history.length} nước đi</p><button id="modal-rematch" class="primary">Chơi lại</button><button id="home">Về danh sách phòng</button></div></div>` : ""}</div>`),
    T.querySelectorAll(".cell").forEach(
      (u) =>
        (u.onclick = () =>
          cw(t, { row: Number(u.dataset.r), col: Number(u.dataset.c) }, s)),
    ),
    T.querySelector("#copy-link")?.addEventListener("click", () =>
      pc(location.href),
    ),
    T.querySelector("#copy-code")?.addEventListener("click", () => pc(A.code)),
    T.querySelector("#ready")?.addEventListener("click", () => rw(A)),
    T.querySelector("#rematch")?.addEventListener("click", () => fc(A)),
    T.querySelector("#modal-rematch")?.addEventListener("click", () => fc(A)),
    T.querySelector("#surrender")?.addEventListener("click", () => iw(A)),
    T.querySelector("#leave")?.addEventListener("click", gc),
    T.querySelector("#home")?.addEventListener("click", gc));
}
function gc() {
  (A && (nw(A), A.close(), (A = null)),
    (bt = null),
    (gh = ""),
    history.replaceState(null, "", location.pathname),
    Pe());
}
function cw(t, e, n) {
  if (!n || !A) return;
  const s = t.seats.findIndex((o) => o?.id === A.identity) + 1,
    r = Rn(t.pieces, e);
  if (r?.owner === s) {
    ((bt = r.id), Pe());
    return;
  }
  const i = t.pieces.find((o) => o.id === bt);
  i &&
    xi(t.pieces, i).some((o) => o.row === e.row && o.col === e.col) &&
    (sw(A, {
      gameId: t.gameId,
      matchId: t.matchId,
      moveId: Nn(),
      playerId: A.identity,
      pieceId: i.id,
      from: i.position,
      to: e,
      expectedVersion: t.version,
    }),
    (bt = null),
    Pe());
}
location.protocol === "file:"
  ? (T.innerHTML =
      '<div class="loading">Hãy chạy npm run dev và mở địa chỉ HTTP do Vite cung cấp.</div>')
  : (Pe(),
    Z0(Pe)
      .then((t) => {
        ((st = t), Pe());
      })
      .catch((t) => {
        T.innerHTML = `<div class="loading">Không kết nối được danh sách phòng: ${ne(String(t))}</div>`;
      }));
export { iy as S };
