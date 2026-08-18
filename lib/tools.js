import { calculators } from "@/data/calculators";

export function getAllTools() {
  return calculators;
}

export function getTool(slug) {
  return calculators.find((tool) => tool.slug === slug) ?? null;
}
