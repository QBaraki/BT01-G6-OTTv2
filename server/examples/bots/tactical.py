def get_move(state):
    goal = state.get("goal")
    target = (
        (goal["row"], goal["col"])
        if goal
        else ((8, 8) if state["player"] == 1 else (0, 0))
    )
    enemies = {
        (piece["position"]["row"], piece["position"]["col"])
        for piece in state["pieces"]
        if piece["owner"] != state["player"]
    }

    def score(move):
        start = move["from"]
        end = move["to"]
        before = abs(start["row"] - target[0]) + abs(start["col"] - target[1])
        after = abs(end["row"] - target[0]) + abs(end["col"] - target[1])
        capture = (end["row"], end["col"]) in enemies
        return (100 if capture else 0) + (before - after) * 10

    return max(state["legalMoves"], key=score, default=None)
