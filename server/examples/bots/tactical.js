export function getMove(state) {
  const target = state.goal ??
    (state.player === 1 ? { row: 8, col: 8 } : { row: 0, col: 0 });
  const enemyAt = new Map(
    state.pieces
      .filter((piece) => piece.owner !== state.player)
      .map((piece) => [`${piece.position.row},${piece.position.col}`, piece]),
  );

  let bestMove = null;
  let bestScore = Number.NEGATIVE_INFINITY;
  for (const move of state.legalMoves) {
    const enemy = enemyAt.get(`${move.to.row},${move.to.col}`);
    const distanceBefore =
      Math.abs(move.from.row - target.row) +
      Math.abs(move.from.col - target.col);
    const distanceAfter =
      Math.abs(move.to.row - target.row) +
      Math.abs(move.to.col - target.col);
    const score =
      (enemy ? 100 : 0) + (distanceBefore - distanceAfter) * 10;
    if (score > bestScore) {
      bestMove = move;
      bestScore = score;
    }
  }

  return bestMove;
}
