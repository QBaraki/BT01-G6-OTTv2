import { classicVariant } from "./classic";
import { largeBoardVariant } from "./large-board";
import type { VariantConfig } from "./types";

const variants = new Map<string, VariantConfig>([
  [classicVariant.id, classicVariant],
  [largeBoardVariant.id, largeBoardVariant],
]);

export { classicVariant, largeBoardVariant };
export type { VariantConfig } from "./types";

export function listVariants(): VariantConfig[] {
  return [...variants.values()];
}

export function getVariant(id: string = classicVariant.id): VariantConfig {
  const variant = variants.get(id);
  if (!variant) throw new Error(`Unknown game variant: ${id}`);
  return variant;
}
