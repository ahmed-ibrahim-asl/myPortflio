import { readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const publicationPath = path.join(projectRoot, "data", "publications.json");
const temporaryPath = `${publicationPath}.tmp`;
const authorId = process.env.SCHOLAR_AUTHOR_ID || "o72gFwkAAAAJ";
const apiKey = process.env.SERPAPI_KEY;
const profileUrl = `https://scholar.google.com/citations?user=${authorId}&hl=en`;

function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function titleKey(value) {
  return normalizeText(value).toLocaleLowerCase("en");
}

async function readCurrentFeed() {
  return JSON.parse(await readFile(publicationPath, "utf8"));
}

function normalizeArticles(articles, currentFeed) {
  const existingById = new Map(
    currentFeed.publications.map((item) => [item.id, item])
  );
  const existingByTitle = new Map(
    currentFeed.publications.map((item) => [titleKey(item.title), item])
  );

  return articles
    .map((article) => {
      const title = normalizeText(article.title);
      const id = normalizeText(article.citation_id) || `${authorId}:${titleKey(title)}`;
      const previous = existingById.get(id) || existingByTitle.get(titleKey(title));

      return {
        id,
        title,
        authors: normalizeText(article.authors),
        venue: normalizeText(article.publication),
        year: String(article.year || ""),
        citedBy: Number(article.cited_by?.value || 0),
        href: normalizeText(article.link) || profileUrl,
        citesHref: normalizeText(article.cited_by?.link) || null,
        publicationType: previous?.publicationType || "Publication",
        ranking: previous?.ranking || null,
        tags: previous?.tags?.length
          ? previous.tags
          : ["Google Scholar", "Research"]
      };
    })
    .filter((article) => article.title && article.year)
    .sort((left, right) => {
      const yearDifference = Number(right.year) - Number(left.year);
      return yearDifference || left.title.localeCompare(right.title);
    });
}

async function main() {
  const currentFeed = await readCurrentFeed();

  if (!apiKey) {
    console.log(
      "Scholar sync skipped: SERPAPI_KEY is not configured. The verified local cache remains active."
    );
    return;
  }

  const query = new URLSearchParams({
    engine: "google_scholar_author",
    author_id: authorId,
    hl: "en",
    num: "100",
    sort: "pubdate",
    api_key: apiKey
  });
  const response = await fetch(`https://serpapi.com/search.json?${query}`, {
    headers: {
      "User-Agent": "ahmed-asl-portfolio-publication-sync/1.0"
    },
    signal: AbortSignal.timeout(30000)
  });

  if (!response.ok) {
    throw new Error(`Scholar provider returned HTTP ${response.status}.`);
  }

  const payload = await response.json();
  if (payload.error) {
    throw new Error(`Scholar provider error: ${payload.error}`);
  }

  const publications = normalizeArticles(payload.articles || [], currentFeed);
  if (!publications.length) {
    throw new Error("Scholar provider returned no valid publications; cache was not changed.");
  }
  if (publications.length < currentFeed.publications.length) {
    throw new Error(
      "Scholar provider returned fewer publications than the local cache; cache was not changed."
    );
  }

  const currentRecords = JSON.stringify(currentFeed.publications);
  const nextRecords = JSON.stringify(publications);
  if (currentRecords === nextRecords) {
    console.log(`Scholar sync complete: ${publications.length} publications, no changes.`);
    return;
  }

  const nextFeed = {
    schemaVersion: 1,
    profileId: authorId,
    profileUrl,
    source: "serpapi-google-scholar-author",
    lastSyncedAt: new Date().toISOString(),
    publications
  };
  await writeFile(temporaryPath, `${JSON.stringify(nextFeed, null, 2)}\n`, "utf8");
  await rename(temporaryPath, publicationPath);
  console.log(`Scholar sync updated ${publications.length} publications.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
