def get_move(state):
    legal_moves = state.get("legalMoves", [])
    return legal_moves[0] if legal_moves else None
