import { describe, expect, it } from "vitest";
import { firstMoveBot, randomBot } from "../src/game/engine";
import {
  runBotMatch,
  trustedBot,
  type BotExecutor,
} from "../src/bot/botRunner";

describe("bot runner", () => {
  it("plays a bounded match with legal moves and event log", async () => {
    const result = await runBotMatch(
      [trustedBot(firstMoveBot), trustedBot(randomBot(() => 0.5))],
      { maxTurns: 8, gameId: "test", moveTimeoutMs: 1000 },
    );
    expect(result.game.status).toBe("FINISHED");
    expect(result.events.length).toBeGreaterThan(0);
    expect(result.events.every((e) => e.accepted)).toBe(true);
    expect(result.game.history.length).toBe(result.events.length);
  });

  it("rejects illegal decisions", async () => {
    const bad: BotExecutor = {
      name: "Bad",
      decide: async () => ({ pieceId: "missing", to: { row: 0, col: 0 } }),
    };
    const result = await runBotMatch([bad, trustedBot(firstMoveBot)]);
    expect(result.outcome).toBe("FORFEIT");
    expect(result.game.winner).toBe(2);
    expect(result.events[0].accepted).toBe(false);
  });

  it("times out an unresponsive executor", async () => {
    const stalled: BotExecutor = {
      name: "Stalled",
      decide: async () => new Promise(() => {}),
    };
    const result = await runBotMatch([stalled, trustedBot(firstMoveBot)], {
      moveTimeoutMs: 10,
    });
    expect(result.outcome).toBe("FORFEIT");
    expect(result.events[0].detail).toMatch(/timeout/i);
  });
});
