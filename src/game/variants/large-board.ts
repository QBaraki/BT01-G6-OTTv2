import { classicVariant, kinds } from "./classic";
import type { VariantConfig } from "./types";

export const largeBoardVariant: VariantConfig = {
  ...classicVariant,
  id: "classic-10x10",
  name: "Cổ điển 10×10",
  board: {
    ...classicVariant.board,
    rows: 10,
    cols: 10,
  },
  startingPieces: {
    1: Array.from({ length: 9 }, (_, index) => ({
      type: kinds[index % kinds.length],
      position: { row: 1 + Math.floor(index / 3), col: index % 3 },
    })),
    2: Array.from({ length: 9 }, (_, index) => ({
      type: kinds[index % kinds.length],
      position: { row: 8 - Math.floor(index / 3), col: 9 - (index % 3) },
    })),
  },
  victory: {
    ...classicVariant.victory,
    goals: {
      1: { row: 9, col: 9 },
      2: { row: 0, col: 0 },
    },
  },
};
