import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "..", "public", "media", "generated", "placeholders");

const COLORS = {
  bg: "#0b0f21",
  bgDeep: "#050713",
  line: "#30395e",
  signal: "#55d5d8",
  text: "#eef1ff"
};

const ICONS = {
  network: `<g stroke="${COLORS.signal}" stroke-width="2" fill="none" opacity="0.9">
    <circle cx="0" cy="-34" r="7"/>
    <circle cx="-40" cy="20" r="7"/>
    <circle cx="40" cy="20" r="7"/>
    <circle cx="0" cy="8" r="9" fill="${COLORS.signal}" stroke="none"/>
    <path d="M0 -27 L0 -1"/>
    <path d="M-33 15 L-8 12"/>
    <path d="M33 15 L8 12"/>
  </g>`,
  leaf: `<g stroke="${COLORS.signal}" stroke-width="2" fill="none" opacity="0.9">
    <path d="M0 40 C-10 0 -40 -10 -40 -40 C-10 -40 0 -10 0 40 Z"/>
    <path d="M0 40 C10 0 40 -10 40 -40 C10 -40 0 -10 0 40 Z"/>
    <path d="M0 40 L0 -30"/>
  </g>`,
  car: `<g stroke="${COLORS.signal}" stroke-width="2" fill="none" opacity="0.9">
    <path d="M-48 10 L-38 -12 L38 -12 L48 10 Z"/>
    <path d="M-48 10 L48 10 L48 22 L-48 22 Z"/>
    <circle cx="-28" cy="24" r="9" fill="${COLORS.signal}" stroke="none"/>
    <circle cx="28" cy="24" r="9" fill="${COLORS.signal}" stroke="none"/>
  </g>`,
  mobile: `<g stroke="${COLORS.signal}" stroke-width="2" fill="none" opacity="0.9">
    <rect x="-26" y="-46" width="52" height="92" rx="10"/>
    <path d="M-12 38 L12 38"/>
    <path d="M-14 -26 L14 -26"/>
    <path d="M-14 -10 L14 -10"/>
    <path d="M-14 6 L6 6"/>
  </g>`,
  play: `<g stroke="${COLORS.signal}" stroke-width="2" fill="none" opacity="0.9">
    <rect x="-48" y="-34" width="96" height="68" rx="8"/>
    <path d="M-10 -14 L16 0 L-10 14 Z" fill="${COLORS.signal}" stroke="none"/>
  </g>`
};

const PROJECTS = [
  { slug: "firewire-enterprise-ota", title: "Firewire Enterprise OTA", category: "Engineering & IoT", icon: "network" },
  { slug: "plant-care-ai", title: "Plant Care AI", category: "AI & Mobile", icon: "leaf" },
  { slug: "autonomous-navigation-car", title: "Autonomous Navigation Car", category: "Robotics", icon: "car" },
  { slug: "agribot-mobile-ui", title: "AgriBot Mobile App UI", category: "UI/UX & Design", icon: "mobile" },
  { slug: "dad4hire-mobile-ui", title: "Dad4Hire Mobile App UI", category: "UI/UX & Design", icon: "mobile" },
  { slug: "dragons-battle-promo", title: "Dragons Battle Final Call", category: "Video", icon: "play" }
];

function buildSvg({ title, category, icon }) {
  const iconMarkup = ICONS[icon];
  return `<svg width="960" height="600" viewBox="0 0 960 600" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${title}">
  <defs>
    <linearGradient id="bgGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${COLORS.bgDeep}"/>
      <stop offset="1" stop-color="${COLORS.bg}"/>
    </linearGradient>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M40 0 L0 0 0 40" fill="none" stroke="${COLORS.line}" stroke-width="1" opacity="0.35"/>
    </pattern>
  </defs>
  <rect width="960" height="600" fill="url(#bgGrad)"/>
  <rect width="960" height="600" fill="url(#grid)"/>
  <rect x="0.5" y="0.5" width="959" height="599" fill="none" stroke="${COLORS.line}"/>
  <g transform="translate(480, 250)">${iconMarkup}</g>
  <text x="48" y="56" font-family="ui-monospace, 'JetBrains Mono', monospace" font-size="18" letter-spacing="1" fill="${COLORS.signal}" font-weight="700">${category.toUpperCase()}</text>
  <text x="48" y="552" font-family="ui-monospace, 'JetBrains Mono', monospace" font-size="30" fill="${COLORS.text}" font-weight="700">${title}</text>
  <text x="912" y="552" font-family="ui-monospace, 'JetBrains Mono', monospace" font-size="26" fill="${COLORS.signal}" text-anchor="end">&#8599;</text>
</svg>`;
}

async function main() {
  await mkdir(outDir, { recursive: true });
  for (const project of PROJECTS) {
    const svg = buildSvg(project);
    const filePath = path.join(outDir, `${project.slug}.svg`);
    await writeFile(filePath, svg, "utf8");
    console.log(`wrote ${filePath}`);
  }
}

main();
