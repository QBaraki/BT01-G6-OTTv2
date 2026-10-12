export function getMove(state) {
  return state.legalMoves[0] ?? null;
}
