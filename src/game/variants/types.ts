export type Player = 1 | 2;
export type Kind = "rock" | "paper" | "scissors";
export type Pos = { row: number; col: number };

export type VariantConfig = {
  id: string;
  name: string;
  version: number;
  board: {
    rows: number;
    cols: number;
    blocked: readonly Pos[];
  };
  movement: {
    offsets: readonly Pos[];
  };
  pieces: Record<Kind, { icon: string; beats: readonly Kind[] }>;
  startingPieces: Record<Player, readonly { type: Kind; position: Pos }[]>;
  victory: {
    goals: Partial<Record<Player, Pos>>;
    eliminateKinds: readonly Kind[];
    noMoves: "DRAW" | "LAST_MOVER_WINS";
  };
};
