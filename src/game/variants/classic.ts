import type { Kind, Player, VariantConfig } from "./types";

export const kinds: Kind[] = ["rock", "paper", "scissors"];
const diagonalMoves = [-1, 0, 1].flatMap((row) =>
  [-1, 0, 1]
    .filter((col) => row !== 0 || col !== 0)
    .map((col) => ({ row, col })),
);

const startingPieces: VariantConfig["startingPieces"] = {
  1: Array.from({ length: 9 }, (_, index) => ({
    type: kinds[index % kinds.length],
    position: { row: 1 + Math.floor(index / 3), col: index % 3 },
  })),
  2: Array.from({ length: 9 }, (_, index) => ({
    type: kinds[index % kinds.length],
    position: { row: 7 - Math.floor(index / 3), col: 8 - (index % 3) },
  })),
};

export const classicVariant: VariantConfig = {
  id: "classic-9x9",
  name: "Cổ điển 9×9",
  version: 1,
  board: {
    rows: 9,
    cols: 9,
    blocked: [],
  },
  movement: {
    offsets: diagonalMoves,
  },
  pieces: {
    rock: { icon: "✊", beats: ["scissors"] },
    paper: { icon: "✋", beats: ["rock"] },
    scissors: { icon: "✌️", beats: ["paper"] },
  },
  startingPieces,
  victory: {
    goals: {
      1: { row: 8, col: 8 },
      2: { row: 0, col: 0 },
    },
    eliminateKinds: kinds,
    noMoves: "DRAW",
  },
};
