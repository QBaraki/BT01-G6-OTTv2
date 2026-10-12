import json
import sys


def main():
    data = json.load(sys.stdin)
    source = data.get("source")
    snapshot = data.get("snapshot")
    if not isinstance(source, str) or not isinstance(snapshot, dict):
        raise ValueError("Invalid input")

    namespace = {}
    exec(compile(source, "<bot>", "exec"), namespace)
    get_move = namespace.get("get_move")
    if not callable(get_move):
        raise ValueError("Missing get_move function")
    decision = get_move(snapshot)
    sys.stdout.write(json.dumps({"ok": True, "decision": decision}) + "\n")


try:
    main()
except Exception as error:
    sys.stdout.write(
        json.dumps({"ok": False, "error": str(error)[:300]}) + "\n"
    )
    sys.exit(1)
