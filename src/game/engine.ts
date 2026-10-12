import { newId } from "../utils/id";
import { classicVariant, getVariant } from "./variants";
import type { Kind, Player, Pos, VariantConfig } from "./variants/types";
export type { Kind, Player, Pos, VariantConfig } from "./variants/types";
export type Piece = { id: string; owner: Player; type: Kind; position: Pos };
export type Move = {
  gameId: string;
  matchId: string;
  moveId: string;
  playerId: string;
  pieceId: string;
  from: Pos;
  to: Pos;
  expectedVersion: number;
};
export type Seat = {
  id: string;
  name: string;
  ready: boolean;
  rematch: boolean;
} | null;
export type LastMove = { pieceId: string; player: Player; from: Pos; to: Pos };
export type Game = {
  gameId: string;
  variantId: string;
  variantVersion: number;
  matchId: string;
  match: number;
  version: number;
  status: "WAITING" | "PLAYING" | "FINISHED";
  seats: [Seat, Seat];
  pieces: Piece[];
  turn: Player;
  winner: Player | null;
  reason: string;
  history: { moveId: string; text: string }[];
  lastMove: LastMove | null;
};
export const kinds: Kind[] = Object.keys(classicVariant.pieces) as Kind[];
export const icons: Record<Kind, string> = Object.fromEntries(
  Object.entries(classicVariant.pieces).map(([kind, piece]) => [
    kind,
    piece.icon,
  ]),
) as Record<Kind, string>;
export const inside = (p: Pos, variant: VariantConfig = classicVariant) =>
  p.row >= 0 &&
  p.row < variant.board.rows &&
  p.col >= 0 &&
  p.col < variant.board.cols;
export const same = (a: Pos, b: Pos) => a.row === b.row && a.col === b.col;
export function columnLabel(col: number): string {
  let value = col + 1;
  let label = "";
  while (value > 0) {
    value--;
    label = String.fromCharCode(97 + (value % 26)) + label;
    value = Math.floor(value / 26);
  }
  return label;
}
export const label = (p: Pos) => `${columnLabel(p.col)}${p.row + 1}`;
export const at = (pieces: Piece[], p: Pos) =>
  pieces.find((x) => same(x.position, p));
export const beats = (
  a: Kind,
  b: Kind,
  variant: VariantConfig = classicVariant,
) => variant.pieces[a]?.beats.includes(b) ?? false;
export function initialPieces(
  variant: VariantConfig = classicVariant,
): Piece[] {
  return ([1, 2] as Player[]).flatMap((owner) =>
    variant.startingPieces[owner].map((piece, index) => ({
      id: `p${owner}-${index}`,
      owner,
      type: piece.type,
      position: { ...piece.position },
    })),
  );
}
export const fresh = (
  gameId: string,
  variantId: string = classicVariant.id,
): Game => {
  const variant = getVariant(variantId);
  return {
    gameId,
    variantId,
    variantVersion: variant.version,
    matchId: newId(),
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
  };
};
export function legal(
  pieces: Piece[],
  piece: Piece,
  to: Pos,
  variant: VariantConfig = classicVariant,
): boolean {
  if (
    !inside(to, variant) ||
    variant.board.blocked.some((blocked) => same(blocked, to)) ||
    !variant.movement.offsets.some(
      (offset) =>
        piece.position.row + offset.row === to.row &&
        piece.position.col + offset.col === to.col,
    )
  )
    return false;
  const target = at(pieces, to);
  return (
    !target ||
    (target.owner !== piece.owner &&
      variant.pieces[piece.type].beats.includes(target.type))
  );
}
export function legalMoves(
  pieces: Piece[],
  piece: Piece,
  variant: VariantConfig = classicVariant,
): Pos[] {
  const result: Pos[] = [];
  for (const offset of variant.movement.offsets) {
    const to = {
      row: piece.position.row + offset.row,
      col: piece.position.col + offset.col,
    };
    if (legal(pieces, piece, to, variant)) result.push(to);
  }
  return result;
}
export function hasMove(g: Game, owner: Player) {
  const variant = getVariant(g.variantId);
  return g.pieces.some(
    (p) => p.owner === owner && legalMoves(g.pieces, p, variant).length > 0,
  );
}
export function applyMove(g: Game, m: Move): Game {
  const variant = getVariant(g.variantId);
  if (
    g.status !== "PLAYING" ||
    g.gameId !== m.gameId ||
    g.matchId !== m.matchId ||
    g.version !== m.expectedVersion ||
    g.history.some((h) => h.moveId === m.moveId)
  )
    return g;
  const seat = g.seats[g.turn - 1],
    piece = g.pieces.find((p) => p.id === m.pieceId);
  if (
    !seat ||
    seat.id !== m.playerId ||
    !piece ||
    piece.owner !== g.turn ||
    !same(piece.position, m.from) ||
    !legal(g.pieces, piece, m.to, variant)
  )
    return g;
  const victim = at(g.pieces, m.to);
  const pieces = g.pieces
    .filter((p) => p.id !== victim?.id)
    .map((p) => (p.id === piece.id ? { ...p, position: { ...m.to } } : p));
  const other = (g.turn === 1 ? 2 : 1) as Player;
  let reason = "";
  let winner: Player | null = null;
  if (
    variant.victory.goals[g.turn] &&
    same(m.to, variant.victory.goals[g.turn]!)
  ) {
    winner = g.turn;
    reason = `Đưa quân vào ${label(m.to)}`;
  } else if (
    variant.victory.eliminateKinds.some(
      (kind) => !pieces.some((p) => p.owner === other && p.type === kind),
    )
  ) {
    winner = g.turn;
    reason = "Loại hết một loại quân đối phương";
  }
  const next: {
    turn: Player;
    status: Game["status"];
    winner: Player | null;
    reason: string;
  } = { turn: other, status: winner ? "FINISHED" : "PLAYING", winner, reason };
  const lastMove: LastMove = {
    pieceId: piece.id,
    player: g.turn,
    from: { ...m.from },
    to: { ...m.to },
  };
  const updated: Game = {
    ...g,
    ...next,
    pieces,
    version: g.version + 1,
    lastMove,
    history: [
      ...g.history,
      {
        moveId: m.moveId,
        text: `${seat.name}: ${variant.pieces[piece.type].icon} ${label(m.from)} → ${label(m.to)}${victim ? " × " + variant.pieces[victim.type].icon : ""}`,
      },
    ],
  };
  if (!winner && !hasMove(updated, other)) {
    if (variant.victory.noMoves === "LAST_MOVER_WINS")
      return {
        ...updated,
        status: "FINISHED",
        winner: g.turn,
        reason: "Đối phương hết nước đi",
        lastMove,
      };
    return {
      ...updated,
      status: "FINISHED",
      reason: "Hòa do hết nước đi",
      lastMove,
    };
  }
  return updated;
}
export function start(g: Game): Game {
  if (g.status !== "WAITING" || !g.seats[0]?.ready || !g.seats[1]?.ready)
    return g;
  const variant = getVariant(g.variantId);
  return {
    ...g,
    status: "PLAYING",
    pieces: initialPieces(variant),
    turn: g.match % 2 === 1 ? 1 : 2,
    version: g.version + 1,
    lastMove: null,
  };
}
export function rematch(g: Game): Game {
  if (g.status !== "FINISHED" || !g.seats[0]?.rematch || !g.seats[1]?.rematch)
    return g;
  const variant = getVariant(g.variantId);
  return {
    ...g,
    match: g.match + 1,
    matchId: newId(),
    pieces: initialPieces(variant),
    turn: g.match % 2 === 1 ? 2 : 1,
    winner: null,
    reason: "",
    history: [],
    status: "PLAYING",
    version: g.version + 1,
    lastMove: null,
    seats: g.seats.map((s) => (s ? { ...s, rematch: false } : null)) as [
      Seat,
      Seat,
    ],
  };
}

// -----------------------------------------------------------------------------
// Bot-vs-Bot support. This engine accepts bot DECISIONS (data), never script text.
// Untrusted submitted scripts must be scanned and executed in an isolated runtime
// outside this module. Only validated decisions are passed to applyMove().
// -----------------------------------------------------------------------------

export type BotMove = { pieceId: string; to: Pos };
export type BotSnapshot = {
  variantId: string;
  variantVersion: number;
  player: Player;
  turn: Player;
  version: number;
  pieces: Piece[];
  legalMoves: Array<{ pieceId: string; from: Pos; to: Pos }>;
};
export type Bot = {
  name: string;
  getMove: (snapshot: BotSnapshot) => BotMove | null;
};
export type BotMatchEvent = {
  turn: number;
  player: Player;
  bot: string;
  move: BotMove | null;
  accepted: boolean;
  detail: string;
};
export type BotMatchResult = {
  game: Game;
  events: BotMatchEvent[];
  outcome: "WIN" | "DRAW" | "FORFEIT" | "TURN_LIMIT";
};

/** Calculate all valid moves. Returned objects are copies, not mutable engine state. */
export function allLegalMoves(
  g: Game,
  owner: Player = g.turn,
): BotSnapshot["legalMoves"] {
  if (g.status !== "PLAYING" || owner !== g.turn) return [];
  const variant = getVariant(g.variantId);
  return g.pieces
    .filter((p) => p.owner === owner)
    .flatMap((piece) =>
      legalMoves(g.pieces, piece, variant).map((to) => ({
        pieceId: piece.id,
        from: { ...piece.position },
        to: { ...to },
      })),
    );
}

/** Only share public board data with a bot, never player identities / room secrets. */
export function botSnapshot(g: Game): BotSnapshot {
  return {
    variantId: g.variantId,
    variantVersion: g.variantVersion,
    player: g.turn,
    turn: g.turn,
    version: g.version,
    pieces: g.pieces.map((p) => ({ ...p, position: { ...p.position } })),
    legalMoves: allLegalMoves(g),
  };
}

/** Convert an untrusted bot decision into a canonical Move validated by applyMove. */
export function botDecisionToMove(
  g: Game,
  decision: unknown,
  moveId: string,
): Move | null {
  if (
    g.status !== "PLAYING" ||
    typeof moveId !== "string" ||
    moveId.length === 0 ||
    !decision ||
    typeof decision !== "object"
  )
    return null;
  const candidate = decision as Partial<BotMove>;
  if (
    typeof candidate.pieceId !== "string" ||
    !candidate.to ||
    !Number.isInteger(candidate.to.row) ||
    !Number.isInteger(candidate.to.col)
  )
    return null;
  const chosen = allLegalMoves(g).find(
    (m) => m.pieceId === candidate.pieceId && same(m.to, candidate.to!),
  );
  const seat = g.seats[g.turn - 1];
  if (!chosen || !seat) return null;
  return {
    gameId: g.gameId,
    matchId: g.matchId,
    moveId,
    playerId: seat.id,
    pieceId: chosen.pieceId,
    from: chosen.from,
    to: chosen.to,
    expectedVersion: g.version,
  };
}

/** Create a standalone match without the multiplayer transport. */
export function createBotGame(
  names: [string, string],
  gameId: string = newId(),
  variantId: string = classicVariant.id,
): Game {
  if (names.some((name) => !name.trim()))
    throw new Error("Each bot must have a name");
  const waiting: Game = {
    ...fresh(gameId, variantId),
    seats: [
      { id: `${gameId}-bot-1`, name: names[0], ready: true, rematch: false },
      { id: `${gameId}-bot-2`, name: names[1], ready: true, rematch: false },
    ],
  };
  return start(waiting);
}

/** Pure sample bot: always chooses the first available move. */
export const firstMoveBot: Bot = {
  name: "First Move Bot",
  getMove: (state) =>
    state.legalMoves.length
      ? {
          pieceId: state.legalMoves[0].pieceId,
          to: { ...state.legalMoves[0].to },
        }
      : null,
};

/** Produce a sample bot with an injectable RNG for repeatable tests. */
export function randomBot(random: () => number = Math.random): Bot {
  return {
    name: "Random Bot",
    getMove: (state) => {
      const moves = state.legalMoves;
      if (!moves.length) return null;
      const sample = random();
      const index = Number.isFinite(sample)
        ? Math.min(
            moves.length - 1,
            Math.max(0, Math.floor(sample * moves.length)),
          )
        : 0;
      return { pieceId: moves[index].pieceId, to: { ...moves[index].to } };
    },
  };
}

/**
 * Run two trusted in-process bot functions. For user-uploaded code, DO NOT call
 * this directly with evaluated functions: run code in a sandbox and pass its
 * resulting decisions through botDecisionToMove()/applyMove() instead.
 *
 * Bots returning malformed or illegal decisions forfeit. Exceptions also forfeit.
 * maxTurns prevents endless games but is not a CPU/time execution limit.
 */
export function playBotMatch(
  bots: [Bot, Bot],
  options: { maxTurns?: number; gameId?: string; variantId?: string } = {},
): BotMatchResult {
  const maxTurns = options.maxTurns ?? 500;
  if (!Number.isSafeInteger(maxTurns) || maxTurns < 1 || maxTurns > 100000)
    throw new Error("maxTurns must be an integer between 1 and 100000");
  let game = createBotGame(
    [bots[0].name, bots[1].name],
    options.gameId,
    options.variantId,
  );
  const events: BotMatchEvent[] = [];
  for (let turn = 1; turn <= maxTurns && game.status === "PLAYING"; turn++) {
    const player = game.turn;
    const bot = bots[player - 1];
    const state = botSnapshot(game);
    let decision: BotMove | null = null;
    let error = "";
    try {
      decision = bot.getMove(state);
    } catch (e) {
      error = e instanceof Error ? e.message : "Bot threw an error";
    }
    const move = error
      ? ""
      : botDecisionToMove(game, decision, `bot-turn-${turn}`);
    if (!move) {
      events.push({
        turn,
        player,
        bot: bot.name,
        move: decision,
        accepted: false,
        detail: error || "Invalid or missing move",
      });
      game = {
        ...game,
        status: "FINISHED",
        winner: player === 1 ? 2 : 1,
        reason: `Bot ${bot.name} forfeited: ${error || "invalid move"}`,
        version: game.version + 1,
      };
      return { game, events, outcome: "FORFEIT" };
    }
    const next = applyMove(game, move);
    if (next === game) {
      events.push({
        turn,
        player,
        bot: bot.name,
        move: decision,
        accepted: false,
        detail: "Engine rejected move",
      });
      game = {
        ...game,
        status: "FINISHED",
        winner: player === 1 ? 2 : 1,
        reason: `Bot ${bot.name} forfeited: move rejected`,
        version: game.version + 1,
      };
      return { game, events, outcome: "FORFEIT" };
    }
    events.push({
      turn,
      player,
      bot: bot.name,
      move: decision,
      accepted: true,
      detail: next.history[next.history.length - 1]?.text ?? "Move accepted",
    });
    game = next;
  }
  if (game.status === "PLAYING") {
    game = {
      ...game,
      status: "FINISHED",
      winner: null,
      reason: `Draw: ${maxTurns}-turn limit reached`,
      version: game.version + 1,
    };
    return { game, events, outcome: "TURN_LIMIT" };
  }
  return { game, events, outcome: game.winner ? "WIN" : "DRAW" };
}
