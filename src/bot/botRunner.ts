import {
  applyMove, botDecisionToMove, botSnapshot, createBotGame,
  type Bot, type BotSnapshot, type Game, type Player,
  type BotMatchEvent, type BotMatchResult,
} from '../game/engine';

/** A backend executor must isolate untrusted code OUTSIDE the game process. */
export interface BotExecutor {
  readonly name: string;
  decide(snapshot: BotSnapshot, signal: AbortSignal): Promise<unknown>;
}

export type RunOptions = {
  maxTurns?: number;
  /** Per-move deadline. This is a response deadline, NOT CPU isolation. */
  moveTimeoutMs?: number;
  gameId?: string;
  onEvent?: (event: BotMatchEvent) => void;
};

/** Only use for locally authored, trusted code bundled with the application. */
export function trustedBot(bot: Bot): BotExecutor {
  return {
    name: bot.name,
    async decide(snapshot: BotSnapshot): Promise<unknown> {
      return bot.getMove(snapshot);
    },
  };
}

/**
 * Coordinates decisions, not source code. Never import, eval, or execute uploaded
 * scripts here. Supply an executor backed by a separately isolated service.
 */
export async function runBotMatch(
  bots: readonly [BotExecutor, BotExecutor],
  options: RunOptions = {},
): Promise<BotMatchResult> {
  const maxTurns = options.maxTurns ?? 500;
  const timeoutMs = options.moveTimeoutMs ?? 2000;
  if (!Number.isSafeInteger(maxTurns) || maxTurns < 1 || maxTurns > 100000)
    throw new RangeError('maxTurns must be 1..100000');
  if (!Number.isSafeInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 60000)
    throw new RangeError('moveTimeoutMs must be 1..60000');

  let game = createBotGame([bots[0].name, bots[1].name], options.gameId);
  const events: BotMatchEvent[] = [];
  function log(event: BotMatchEvent): void {
    events.push(event);
    options.onEvent?.(event);
  }
  function forfeit(player: Player, reason: string): BotMatchResult {
    game = {
      ...game, status: 'FINISHED', winner: player === 1 ? 2 : 1,
      reason, version: game.version + 1,
    };
    return {game, events, outcome: 'FORFEIT'};
  }

  for (let turn = 1; turn <= maxTurns && game.status === 'PLAYING'; turn++) {
    const player = game.turn;
    const bot = bots[player - 1];
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout> | undefined;
    let decision: unknown;
    let error = '';
    try {
      decision = await Promise.race([
        Promise.resolve().then(() => bot.decide(botSnapshot(game), controller.signal)),
        new Promise<never>((_, reject) => {
          timer = setTimeout(() => reject(new Error('Move timeout')), timeoutMs);
        }),
      ]);
    } catch (e) {
      error = e instanceof Error ? e.message : 'Executor failure';
    } finally {
      if (timer !== undefined) clearTimeout(timer);
      controller.abort();
    }

    const canonical = error ? null : botDecisionToMove(game, decision, `turn-${turn}`);
    if (!canonical) {
      const detail = error || 'Invalid or missing move';
      log({turn, player, bot: bot.name, move: null, accepted: false, detail});
      return forfeit(player, `${bot.name} forfeited: ${detail}`);
    }
    const next = applyMove(game, canonical);
    if (next === game) {
      log({turn, player, bot: bot.name, move: null, accepted: false, detail: 'Engine rejected move'});
      return forfeit(player, `${bot.name} forfeited: engine rejected move`);
    }
    log({
      turn, player, bot: bot.name,
      move: {pieceId: canonical.pieceId, to: canonical.to}, accepted: true,
      detail: next.history.at(-1)?.text ?? 'Move accepted',
    });
    game = next;
  }
  if (game.status === 'PLAYING') {
    game = {
      ...game, status: 'FINISHED', winner: null,
      reason: `Draw: ${maxTurns}-turn limit reached`, version: game.version + 1,
    };
    return {game, events, outcome: 'TURN_LIMIT'};
  }
  return {game, events, outcome: game.winner ? 'WIN' : 'DRAW'};
}
