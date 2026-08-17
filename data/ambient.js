const basePath = process.env.GITHUB_ACTIONS === "true" ? "/myPortfolio" : "";

export const ambientWorlds = [
  {
    id: "linux-security",
    title: "Terminal district",
    label: "Linux & Security",
    description: "Shell use, permissions, processes, and cybersecurity challenges.",
    filterTerm: "linux",
    image: "https://hwangstice.github.io/image/blog-cover/bandit.gif",
    source: "https://hwangstice.github.io/blog/overthewire-bandit/",
    credit: "Hwangstice blog cover",
    license: "Source-provided embed; reuse license not found",
    featured: true
  },
  {
    id: "electronics",
    title: "Circuit lab",
    label: "Electronics",
    description: "Electronics design, digital logic, PCB work, and hardware experimentation.",
    filterTerm: "electronics",
    image: `${basePath}/media/ambient/cc0-cityscape.gif`,
    source: "https://opengameart.org/content/animated-cityscape-backgroundwallpaper",
    credit: "Animated Cityscape Background / Wallpaper on OpenGameArt",
    license: "CC0 1.0"
  },
  {
    id: "embedded",
    title: "Reverse-engineering lab",
    label: "Embedded Systems",
    description: "Firmware, microcontrollers, RTOS, and low-level system architecture.",
    filterTerm: "embedded",
    image: "https://hwangstice.github.io/image/blog-cover/reversing.kr-record-2.gif",
    source: "https://hwangstice.github.io/image/blog-cover/reversing.kr-record-2.gif",
    credit: "Hwangstice blog cover",
    license: "Source-provided embed; reuse license not found"
  },
  {
    id: "ml-ai",
    title: "Signal intelligence",
    label: "ML & AI",
    description: "Image processing, machine learning experiments, and AI-assisted hardware systems.",
    filterTerm: "ai",
    image: "https://hwangstice.github.io/image/blog-cover/net.gif",
    source: "https://hwangstice.github.io/image/blog-cover/net.gif",
    credit: "Hwangstice blog cover",
    license: "Source-provided embed; reuse license not found"
  },
  {
    id: "cybersecurity",
    title: "Challenge checkpoint",
    label: "Cyber Security",
    description: "Cybersecurity walkthroughs, information security labs, and legal challenge environments.",
    filterTerm: "cybersecurity",
    image: "https://hwangstice.github.io/image/blog-cover/final.gif",
    source: "https://hwangstice.github.io/image/blog-cover/final.gif",
    credit: "Hwangstice blog cover",
    license: "Source-provided embed; reuse license not found"
  },
  {
    id: "networks",
    title: "Network operations",
    label: "Networking",
    description: "Network design, infrastructure, protocols, and connected-system architecture.",
    filterTerm: "networking",
    image: "https://hwangstice.github.io/image/blog-cover/tokyo-girl.gif",
    source: "https://hwangstice.github.io/image/blog-cover/tokyo-girl.gif",
    credit: "Hwangstice blog cover",
    license: "Source-provided embed; reuse license not found"
  }
];
