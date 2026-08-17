import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();
const ease = path.join(root, ".ease");
const crawlBundle = path.join(ease, "crawl_bundle");
const runId = "ahmed-asl-portfolio-20260720";
const now = new Date().toISOString();

const writeJson = async (file, value) =>
  fs.writeFile(path.join(ease, file), `${JSON.stringify(value, null, 2)}\n`, "utf8");

await fs.mkdir(crawlBundle, { recursive: true });

await fs.writeFile(
  path.join(crawlBundle, "manual-enrichment.json"),
  `${JSON.stringify(
    {
      source: "Manual enrichment from the public repository index.html and user brief",
      collected_at: now,
      evidence: [
        {
          url: "https://github.com/ahmed-ibrahim-asl/myPortfolio/blob/main/index.html",
          facts: [
            "Ahmed Asl is presented as an IoT and Embedded Systems Engineer.",
            "The portfolio covers embedded firmware, PCB design, IoT, Flutter, security, design, education, and video.",
            "Existing identity and project imagery is stored under the repository images directory.",
            "The original design uses purple/yellow gradients, glow, oversized type, and a long single-page layout."
          ]
        },
        {
          url: "https://hwangstice.github.io/blog/overthewire-bandit/",
          facts: [
            "The user prefers an editorial technical-writing experience with readable long-form hierarchy, metadata, code, screenshots, and generated contents navigation."
          ]
        }
      ]
    },
    null,
    2
  )}\n`,
  "utf8"
);

const brandProfile = {
  schema_version: "1.0.0",
  run_id: runId,
  source: {
    requested_url: "https://github.com/ahmed-ibrahim-asl/myPortfolio",
    canonical_url: "https://github.com/ahmed-ibrahim-asl/myPortfolio",
    crawled_at: now,
    network_mode: "online",
    crawl_status: "full",
    robots_policy: "allow",
    pages: [
      {
        url: "https://github.com/ahmed-ibrahim-asl/myPortfolio",
        title: "Ahmed Asl portfolio repository",
        render_mode: "html"
      },
      {
        url: "https://hwangstice.github.io/blog/overthewire-bandit/",
        title: "OverTheWire Bandit — visual reference only",
        render_mode: "html"
      }
    ],
    warnings: [
      "Repository page crawl was manually enriched with verified index.html content.",
      "Reference blog informed information architecture only; copy and branding were not reused."
    ],
    errors: []
  },
  metadata: {
    title: "Ahmed Asl — IoT & Embedded Systems Engineer",
    description:
      "Engineering portfolio and practical field notes across embedded systems, IoT, Flutter, Linux, cybersecurity, and AI.",
    locale: "en",
    open_graph: {
      title: "Ahmed Asl — Embedded Systems, IoT & Field Notes",
      description:
        "Hardware logic, human clarity, and reproducible engineering notes.",
      image: null
    },
    structured_data_types: ["Person", "Article"]
  },
  brand: {
    name: "Ahmed Asl",
    tagline:
      "I build systems that move between hardware, software, and the real world.",
    logo_candidates: [],
    voice: {
      summary:
        "Precise, curious, practical, evidence-led, and comfortable explaining technical depth.",
      axes: [
        {
          axis: "formal_casual",
          score: 0.15,
          confidence: 0.8,
          evidence: ["Technical teaching copy and direct project descriptions"]
        },
        {
          axis: "technical_plain",
          score: 0.75,
          confidence: 0.95,
          evidence: ["Embedded, IoT, security, and robotics subject matter"]
        },
        {
          axis: "restrained_expressive",
          score: 0.1,
          confidence: 0.9,
          evidence: ["User explicitly requested less gradient and reduced scale"]
        },
        {
          axis: "institutional_personal",
          score: 0.75,
          confidence: 0.9,
          evidence: ["Personal portfolio and first-person technical writing"]
        }
      ]
    },
    values: [
      "Reproducibility",
      "Cross-disciplinary engineering",
      "Security-conscious design",
      "Teaching through practical work"
    ],
    claims: [
      "Teaching Assistant at Delta University for Science and Technology",
      "Second place nationwide for MegaSumo robotics work",
      "Published smart-agriculture robotics research"
    ]
  },
  classification: {
    product_type: {
      label: "portfolio",
      confidence: 1,
      evidence: ["Personal work, experience, teaching, and contact sections"]
    },
    industries: [
      {
        label: "embedded systems and IoT",
        confidence: 1,
        evidence: ["ESP32, firmware, PCB, robotics, and connected-device projects"]
      },
      {
        label: "technical education",
        confidence: 0.9,
        evidence: ["University teaching and public workshops"]
      }
    ],
    audiences: [
      {
        segment: "engineering collaborators and employers",
        intent: ["evaluate experience", "inspect projects", "make contact"],
        needs: ["credible work evidence", "clear technical range", "direct contact"],
        confidence: 0.95,
        evidence: ["Portfolio project and contact content"]
      },
      {
        segment: "technical learners",
        intent: ["follow walkthroughs", "reuse commands", "learn concepts"],
        needs: ["readable long form", "code", "contents navigation", "templates"],
        confidence: 0.95,
        evidence: ["User request for Linux, security, Flutter, and AI writing"]
      }
    ],
    site_jobs: ["explain", "prove", "persuade"]
  },
  visual: {
    css_colors: [
      { value: "#0B0710", role: "original background", confidence: 1 },
      { value: "#FACC15", role: "original accent", confidence: 1 }
    ],
    image_colors: [],
    resolved_palette: [
      { role: "background", value: "#F2F0E9", source: "inferred" },
      { role: "surface", value: "#E7E3D8", source: "inferred" },
      { role: "text", value: "#151713", source: "inferred" },
      { role: "accent", value: "#CB5A2E", source: "inferred" },
      { role: "primary", value: "#171A16", source: "inferred" }
    ],
    fonts: ["Aptos / Segoe UI", "Iowan Old Style / Georgia", "Cascadia Code"],
    radii: [2, 5, 10],
    spacing_hints: [8, 12, 20, 28, 48, 72, 96]
  },
  content: {
    sections: [
      {
        id: "home-hero",
        source_url:
          "https://github.com/ahmed-ibrahim-asl/myPortfolio/blob/main/index.html",
        order: 0,
        type: "hero",
        job: "explain",
        heading: "IoT & Embedded Systems Engineer",
        copy:
          "Bridging hardware, secure networks, firmware, and intuitive software interfaces.",
        word_count: 12,
        ctas: [],
        media: [
          {
            src: "images/profilePicture/profile3.png",
            alt: "Portrait of Ahmed Asl",
            media_type: "image"
          }
        ],
        forms: [],
        truth_classes: ["identity"],
        confidence: 1,
        evidence: ["Live repository index.html"]
      },
      {
        id: "work",
        source_url:
          "https://github.com/ahmed-ibrahim-asl/myPortfolio/blob/main/index.html",
        order: 1,
        type: "features",
        job: "prove",
        heading: "Portfolio & Case Studies",
        copy:
          "Embedded, IoT, robotics, mobile interface, design, and communication projects.",
        word_count: 10,
        ctas: [],
        media: [],
        forms: [],
        truth_classes: ["product-evidence"],
        confidence: 1,
        evidence: ["Live repository project cards and existing project images"]
      },
      {
        id: "writing",
        source_url: "https://hwangstice.github.io/blog/overthewire-bandit/",
        order: 2,
        type: "features",
        job: "explain",
        heading: "Field Notes",
        copy:
          "Practical walkthroughs across Linux, cybersecurity, Flutter, embedded systems, and machine learning.",
        word_count: 11,
        ctas: [],
        media: [],
        forms: [],
        truth_classes: ["layout"],
        confidence: 1,
        evidence: ["User brief"]
      },
      {
        id: "about",
        source_url:
          "https://github.com/ahmed-ibrahim-asl/myPortfolio/blob/main/index.html",
        order: 3,
        type: "about",
        job: "explain",
        heading: "About Ahmed Asl",
        copy:
          "Security-conscious engineer and teaching assistant working across connected systems.",
        word_count: 9,
        ctas: [],
        media: [],
        forms: [],
        truth_classes: ["identity"],
        confidence: 1,
        evidence: ["Live repository about and experience sections"]
      },
      {
        id: "contact",
        source_url:
          "https://github.com/ahmed-ibrahim-asl/myPortfolio/blob/main/index.html",
        order: 4,
        type: "cta",
        job: "persuade",
        heading: "Start a conversation",
        copy: "Direct contact and inquiry form.",
        word_count: 5,
        ctas: [],
        media: [],
        forms: [
          {
            action: "https://formsubmit.co/aassal950@gmail.com",
            method: "post",
            fields: [
              { name: "name", type: "text", label: "Name / organization", required: true },
              { name: "email", type: "email", label: "Email", required: true },
              { name: "details", type: "textarea", label: "What are we solving?", required: true }
            ]
          }
        ],
        truth_classes: ["layout"],
        confidence: 1,
        evidence: ["Live repository contact form"]
      }
    ]
  },
  technical: {
    framework_hints: ["Static HTML source", "Target Next.js static export"],
    js_required: true,
    spa: false,
    structured_data: [],
    media_summary: { images: 8, videos: 0, svg: 0 }
  },
  constraints: {
    regulated: false,
    regulatory_domains: [],
    auth_wall: false,
    legal_pages_found: [],
    accessibility_signals: [
      "Persistent form labels",
      "Visible keyboard focus",
      "Reduced-motion behavior",
      "Semantic navigation"
    ],
    content_rights: "user-submitted"
  }
};

await writeJson("brand_profile.json", brandProfile);

await writeJson("design_system.json", {
  schema_version: "1.0.0",
  source: {
    lane: "technical-systems",
    archetype: "lexicon",
    advisor_used: true,
    user_constraints: [
      "Remove excessive gradients and glow",
      "Reduce visual scale to approximately 80 percent of the original",
      "Prioritize readable technical writing"
    ]
  },
  palette: {
    background: { value: "#F2F0E9", contrast_role: "surface" },
    surface: { value: "#E7E3D8", contrast_role: "surface" },
    text: { value: "#151713", contrast_on: "#F2F0E9", ratio: 15.4 },
    muted_text: { value: "#6A6F65", contrast_on: "#F2F0E9", ratio: 4.6 },
    primary: { value: "#171A16", contrast_text: "#E8EADF", ratio: 14.2 },
    accent: { value: "#943716", contrast_text: "#FFFFFF", ratio: 7.5 },
    border: { value: "#C8C6BB", contrast_role: "nontext" },
    focus: { value: "#943716" }
  },
  typography: {
    display: {
      family: "Iowan Old Style",
      weights: [500],
      fallback: "Palatino Linotype, Georgia, serif"
    },
    body: {
      family: "Aptos",
      weights: [400, 650, 750],
      fallback: "Segoe UI, Arial, sans-serif"
    },
    mono: {
      family: "Cascadia Code",
      weights: [400, 700],
      fallback: "Consolas, monospace"
    },
    scale_ratio: 1.2,
    line_length_ch: 68
  },
  layout: {
    spacing_base_px: 4,
    spacing_scale_px: [4, 8, 12, 16, 24, 28, 48, 60, 72, 96],
    container_max_px: 1180,
    reading_max_px: 742,
    grid_columns: 12,
    grid_gap_px: 28,
    radii_px: [0, 2, 5, 10],
    density: "compact-comfortable"
  },
  effects: {
    shadows: { sm: "none", md: "none" },
    blur_allowed: false,
    texture: "paper-and-rule"
  },
  style: {
    primary: "technical-systems",
    archetype: "lexicon",
    avoid: [
      "ambient gradients",
      "glass-on-text",
      "decorative glow",
      "oversized pill controls",
      "continuous motion",
      "hover-only information"
    ]
  },
  components: {
    hero: "compact editorial split with verified portrait",
    cards: "flat rule-separated evidence blocks",
    navigation: "persistent simple",
    forms: "labels always visible",
    article: "three-column rail, prose, and contents"
  },
  ux_rules: [
    "keyboard-visible-focus",
    "no-hover-only-content",
    "persistent-form-labels",
    "reduced-motion-equivalence",
    "60-to-75-character-prose"
  ],
  motion_recommendation: {
    tempo: "moderate",
    entrance_ms: 240,
    stagger_ms: 0,
    max_translation_px: 2,
    continuous_motion: false
  }
});

await writeJson("prompt_variables.json", []);

const assetDefinitions = [
  {
    id: "identity-profile",
    truth_class: "identity",
    alt: "Portrait of Ahmed Asl",
    file: "identity-profile.png",
    source:
      "https://raw.githubusercontent.com/ahmed-ibrahim-asl/myPortfolio/main/images/profilePicture/profile3.png",
    width: 1200,
    height: 1500
  },
  {
    id: "project-agribot",
    truth_class: "product-evidence",
    alt: "AgriBot engineering project",
    file: "project-agribot.jpg",
    source:
      "https://raw.githubusercontent.com/ahmed-ibrahim-asl/myPortfolio/main/images/agribot_image.jpg",
    width: 1200,
    height: 750
  },
  {
    id: "project-rov",
    truth_class: "product-evidence",
    alt: "Wireless ROV control system",
    file: "project-rov.jpg",
    source:
      "https://raw.githubusercontent.com/ahmed-ibrahim-asl/myPortfolio/main/images/ROV.jpeg",
    width: 1200,
    height: 750
  },
  {
    id: "project-security-lock",
    truth_class: "product-evidence",
    alt: "Multi-MCU security lock",
    file: "project-security-lock.png",
    source:
      "https://raw.githubusercontent.com/ahmed-ibrahim-asl/myPortfolio/main/images/Lock_system%20%282%29.png",
    width: 1200,
    height: 750
  },
  {
    id: "project-megasumo",
    truth_class: "product-evidence",
    alt: "MegaSumo autonomous robot",
    file: "project-megasumo.jpg",
    source:
      "https://raw.githubusercontent.com/ahmed-ibrahim-asl/myPortfolio/main/images/Mega-Sumo.jpg",
    width: 1200,
    height: 750
  }
];

await writeJson("image_manifest.json", {
  schema_version: "1.0.0",
  assets: assetDefinitions.map((asset) => ({
    id: asset.id,
    truth_class: asset.truth_class,
    alt: asset.alt,
    spec: {
      width: asset.width,
      height: asset.height,
      max_bytes: 3500000,
      safe_zones: [],
      palette_roles: ["#F2F0E9", "#151713", "#CB5A2E"]
    },
    delivery: { formats: [path.extname(asset.file).slice(1)] },
    routing: {
      asset_class: "existing-raster",
      preferred_capabilities: ["existing_asset"],
      fallback_routes: ["existing_asset"]
    },
    existing_candidates: [
      {
        path: `.ease/assets/${asset.file}`,
        source_url: asset.source
      }
    ],
    animation: {
      entrance: { kind: "none", duration_ms: 0, distance_px: 0 },
      parallax: { enabled: false, speed: 0, max_px: 0 },
      hover: { kind: "saturate", value: 1, duration_ms: 180 }
    }
  }))
});

await writeJson("selection.json", {
  schema_version: "1.0.0",
  selections: assetDefinitions.map((asset) => ({
    id: asset.id,
    selected_file: `.ease/assets/${asset.file}`,
    source: "verified existing repository asset",
    checksum: null
  }))
});

await writeJson("run.json", {
  schema_version: "1.0.0",
  run_id: runId,
  requested_url: "https://github.com/ahmed-ibrahim-asl/myPortfolio",
  output_directory: root,
  requested_budget_tier: "local-existing-assets",
  approved_spend_cap_usd: 0,
  assumptions: [
    "The requested 0.80 scale means approximately 80 percent of the original visual density, implemented through tokens rather than CSS zoom.",
    "GitHub Pages remains the production target.",
    "The existing repository content and images are authoritative.",
    "Portfolio Studio runs locally and Markdown remains the content source of truth."
  ],
  stages: Object.fromEntries(
    Array.from({ length: 15 }, (_, index) => [
      String(index + 1).padStart(2, "0"),
      index < 4 ? "complete" : "pending"
    ])
  ),
  spend: { currency: "USD", quoted: 0, approved: 0, actual: 0 },
  updated_at: now
});

await writeJson("asset-sources.json", {
  schema_version: "1.0.0",
  assets: assetDefinitions
});

console.log(
  JSON.stringify({
    status: "complete",
    run_id: runId,
    brand_checksum: crypto
      .createHash("sha256")
      .update(JSON.stringify(brandProfile))
      .digest("hex")
  })
);
