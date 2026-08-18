function searchableText(tool) {
  return [tool.title, tool.summary, tool.category, ...(tool.tags ?? [])]
    .join(" ")
    .toLowerCase();
}

export function filterCalculators(calculators, { query = "", category = "All" } = {}) {
  const needle = query.trim().toLowerCase();

  return calculators.filter((tool) => {
    const matchesCategory = category === "All" || tool.category === category;
    return matchesCategory && (!needle || searchableText(tool).includes(needle));
  });
}

export function getRelatedCalculators(calculators, activeSlug, limit = 6) {
  const active = calculators.find(({ slug }) => slug === activeSlug);
  const candidates = calculators.filter(({ slug }) => slug !== activeSlug);

  return candidates
    .sort((left, right) => {
      const leftSameCategory = left.category === active?.category ? 0 : 1;
      const rightSameCategory = right.category === active?.category ? 0 : 1;
      return leftSameCategory - rightSameCategory;
    })
    .slice(0, limit);
}
