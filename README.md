# Ahmed Asl — Portfolio & Field Notes

A compact, content-first engineering portfolio and technical writing platform.
The public website is a statically exported Next.js app. Blog posts are ordinary
Markdown files, managed through the included local Portfolio Studio.

## Run the website

```bash
npm ci
npm run dev
```

Open `http://localhost:3000`.

## Update the blog with Portfolio Studio

```bash
npm run studio
```

Open `http://localhost:4173`, then:

1. Select **Create article** and choose a reusable template.
2. Write in Markdown, use **Split preview**, and upload article images if needed.
3. Select **Save draft** to write the post to your computer only.
4. Select **Publish to GitHub** when it is ready for the public website.

There is no database and no hosted admin panel. The repository is the content
system:

- **Save draft** writes `content/writing/<slug>.md`.
- **Upload image** writes `public/blog/<slug>/<image>` and inserts its Markdown.
- **Publish to GitHub** changes `draft` to `false`, commits that article and its
  image folder, then runs `git push`.
- The workflow in `.github/workflows/deploy-pages.yml` builds the updated static
  site and GitHub Pages replaces the live version.

Before using the Publish button for the first time, commit and push this site
redesign once so the remote `main` branch contains the new application. Git must
also already be authenticated on the computer running Studio.

## Add a post from the terminal

```bash
npm run new:post -- --type=cybersecurity --title="OverTheWire Bandit"
```

Available templates: `cybersecurity`, `linux`, `flutter`, `embedded`, `model`,
`case-study`, and `note`.

## Content map

- `content/writing/*.md` — published articles and drafts
- `content/templates/*.md` — reusable writing structures
- `public/blog/<slug>/` — article images
- `data/portfolio.js` — projects, experience, tutorials, and contact data
- `studio/` and `scripts/studio.mjs` — the local editor

## Verify a change

```bash
npm run validate:content
npm run build
```

The static output is written to `out/`.
## Refresh Google Scholar publications

The public website reads `data/publications.json`, so it never exposes an API
key and remains compatible with static GitHub Pages hosting. The sync command
uses the SerpApi Google Scholar Author adapter instead of scraping Scholar in a
visitor's browser.

```powershell
Copy-Item .env.example .env
npm run sync:scholar
```

Set `SERPAPI_KEY` in `.env` before running the command. Without it, the command
keeps the verified local cache unchanged. For automatic weekly updates, add the
same value as the repository secret `SERPAPI_KEY`; the local workflow
`.github/workflows/sync-scholar.yml` refreshes the cache and only commits when
the publication records change.