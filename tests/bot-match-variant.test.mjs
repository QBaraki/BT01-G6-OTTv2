import test from "node:test";
import assert from "node:assert/strict";
import { matchEngine } from "../server/match.mjs";

test("backend creates 10x10 bot games and exposes their dimensions and goal", () => {
  const game = matchEngine.createBotGame(
    ["Bot A", "Bot B"],
    "bot-10x10",
    "classic-10x10",
  );
  const snapshot = matchEngine.botSnapshot(game);

  assert.equal(game.pieces.length, 18);
  assert.equal(game.pieces.find((piece) => piece.owner === 2).position.row, 8);
  assert.deepEqual(snapshot.board, { rows: 10, cols: 10 });
  assert.deepEqual(snapshot.goal, { row: 9, col: 9 });
  assert.equal(snapshot.variantId, "classic-10x10");
});

test("backend accepts a 10x10 goal move and preserves 9x9 by default", () => {
  let game = matchEngine.createBotGame(
    ["Bot A", "Bot B"],
    "bot-10x10",
    "classic-10x10",
  );
  game = {
    ...game,
    pieces: [
      {
        id: "runner",
        owner: 1,
        type: "rock",
        position: { row: 8, col: 8 },
      },
      {
        id: "opponent",
        owner: 2,
        type: "paper",
        position: { row: 0, col: 1 },
      },
    ],
  };
  const move = matchEngine.botDecisionToMove(
    game,
    { pieceId: "runner", to: { row: 9, col: 9 } },
    "goal",
  );

  assert.ok(move);
  assert.equal(matchEngine.applyMove(game, move).winner, 1);

  const classic = matchEngine.createBotGame(["Bot A", "Bot B"], "bot-9x9");
  assert.equal(classic.variantId, "classic-9x9");
  assert.deepEqual(matchEngine.botSnapshot(classic).board, {
    rows: 9,
    cols: 9,
  });
});
