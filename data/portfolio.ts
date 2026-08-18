import publicationFeed from "./publications.json";
import {
  Education,
  Experience,
  ExpertiseItem,
  Profile,
  Project,
  Publication,
  PublicationSource,
  TechnologyGroup,
  Tutorial,
  WorkingMethodItem
} from "@/types/portfolio";

const basePath = process.env.GITHUB_ACTIONS === "true" ? "/myPortflio" : "";
const asset = (pathname: string): string => `${basePath}${pathname}`;

export const profile: Profile = {
  name: "Ahmed Asl",
  role: "IoT & Embedded Systems Engineer",
  label: "LIFELONG LEARNER / PROBLEM SOLVER",
  headline:
    "I turn rough hardware and IoT ideas into working prototypes and usable products.",
  summary:
    "I work from problem to proof, using electronics, connectivity, software, robotics, and interface design wherever the system needs them.",
  location: "Egypt, based between Al Mahala Al Kobra and Alexandria; available for remote collaboration.",
  availability: "Open to selected embedded systems, IoT, and robotics collaborations",
  portrait: asset("/media/optimized/profile-ahmed.webp"),
  portraits: [
    { src: asset("/images/profilePicture/profile1.jpg"), alt: "Portrait of Ahmed Asl in a dark jacket" },
    { src: asset("/images/profilePicture/profile2.jpg"), alt: "Portrait of Ahmed Asl outdoors" },
    { src: asset("/images/profilePicture/profile3.png"), alt: "Professional portrait of Ahmed Asl" }
  ],
  cv: "https://drive.google.com/file/d/1G9lNDitCXg250JGz8vRperY6zMPoT9gs/view?usp=sharing",
  scholar: "https://scholar.google.com/citations?user=o72gFwkAAAAJ&hl=en",
  scholarId: "o72gFwkAAAAJ",
  email: "aassal950@gmail.com",
  phone: "+20 106 816 3322",
  whatsapp: "https://wa.me/201068163322",
  socials: [
    { label: "GitHub", href: "https://github.com/ahmed-ibrahim-asl" },
    {
      label: "LinkedIn",
      href: "https://www.linkedin.com/in/ahmed-ibrahim-asl/"
    },
    {
      label: "Google Scholar",
      href: "https://scholar.google.com/citations?user=o72gFwkAAAAJ&hl=en"
    },
    { label: "TryHackMe", href: "https://tryhackme.com/p/MRH0N3Y" },
    { label: "Behance", href: "https://www.behance.net/ahmedassal3" },
    { label: "YouTube", href: "https://www.youtube.com/@ahmedassal8710" }
  ]
};

export const education: Education[] = [
  {
    credential: "Postgraduate Qualifying Studies in Mechatronics, Mansoura University, February 2025 to Present",
    institution: "Mansoura University",
    period: "February 2025 to Present"
  }
];

export const expertise: ExpertiseItem[] = [
  {
    index: "01",
    title: "IoT System Architecture",
    description:
      "Sensor networks and device-to-cloud data paths using ESP32, Python, and PlatformIO."
  },
  {
    index: "02",
    title: "Electronics & Hardware Design",
    description:
      "Schematics, PCB layout, component selection, hardware bring-up, and board-level debugging in KiCad."
  },
  {
    index: "03",
    title: "Embedded Firmware",
    description:
      "C and C++ firmware for Arduino, ESP32, ESP8266, and AVR-based devices."
  },
  {
    index: "04",
    title: "Image Processing, ML & AI",
    description:
      "Computer vision pipelines, leaf-disease detection, and sensor-fusion systems using Python and Jetson hardware."
  },
  {
    index: "05",
    title: "Security & Information Security",
    description:
      "Network and physical attack-surface analysis for hardware and software interfaces, and legal cybersecurity challenge labs."
  },
  {
    index: "06",
    title: "Cross-Platform Development",
    description:
      "Flutter applications that turn device state into clear controls and feedback."
  },
  {
    index: "07",
    title: "UI/UX & Graphic Design",
    description:
      "Interface and visual systems for engineering tools, mobile products, and technical content."
  },
  {
    index: "08",
    title: "Video Editing",
    description:
      "Technical lessons and event stories edited in Premiere Pro and DaVinci Resolve."
  }
];

export const technologies: string[] = [
  "IoT",
  "Flutter",
  "ESP32 & ESP8266",
  "C / C++",
  "KiCad",
  "Python",
  "HTML & CSS",
  "Arduino",
  "Square Line Studio",
  "PlatformIO",
  "Linux",
  "Networking"
];

export const toolkitHeading: string = "Tools collected along the way";
export const toolkitIntro: string =
  "I did not learn these tools to complete a checklist. Each one entered my toolkit because a project, failure, or unanswered question required it.";

export const technologyGroups: TechnologyGroup[] = [
  {
    index: "01",
    title: "Embedded & Hardware",
    description:
      "Firmware, board-level development, hardware bring-up, and PCB workflows.",
    tools: ["ESP32 & ESP8266", "C / C++", "Arduino", "PlatformIO", "KiCad"]
  },
  {
    index: "02",
    title: "Connected Systems",
    description:
      "Device connectivity, networked infrastructure, automation, and technical computing.",
    tools: ["IoT", "Networking", "Linux", "Python"]
  },
  {
    index: "03",
    title: "Interfaces & Applications",
    description:
      "Cross-platform control surfaces and interfaces for connected engineering systems.",
    tools: ["Flutter", "HTML & CSS", "Square Line Studio"]
  },
  {
    index: "04",
    title: "Vision, ML & Security",
    description:
      "Image processing, machine learning experiments, and hardware and software security analysis.",
    tools: ["Python", "OpenCV", "Jetson Nano", "TryHackMe", "Kali Linux"]
  }
];

export const workingMethod: WorkingMethodItem[] = [
  {
    step: "01",
    label: "Question",
    description:
      "I start by asking what the system needs to do, what already exists, and where the constraint actually lives."
  },
  {
    step: "02",
    label: "Learn",
    description:
      "I find the gap between what I know and what the problem needs, then close it through documentation, experimentation, or teaching myself the missing piece."
  },
  {
    step: "03",
    label: "Build",
    description:
      "I build the smallest version that proves the idea works, keep notes on what breaks, and iterate until the system behaves consistently."
  },
  {
    step: "04",
    label: "Test",
    description:
      "I verify the result against the original goal, document failure modes, and check whether someone else can understand and use what I made."
  }
];

export const coursesTaught: string[] = [
  "Satellite Communication",
  "Acoustics",
  "Digital and Logic Circuits",
  "Measurement and Sensors"
];

export const projects: Project[] = [
  {
    slug: "agribot-architecture",
    title: "AgriBot Architecture",
    category: "Engineering & IoT",
    year: "2024",
    description:
      "An agricultural robot that combines crop selection, fertilizer recommendations, leaf-disease diagnosis, and remote device management through Firewire OTA.",
    outcome: "Agriculture workflow integration",
    tags: ["Jetson Nano", "AI/ML", "IoT"],
    image: asset("/media/optimized/project-agribot.webp"),
    featured: true
  },
  {
    slug: "wireless-rov-control",
    title: "Wireless ROV Control System",
    category: "Engineering & IoT",
    year: "2024",
    description:
      "An ESP32 control system with NRF24L01+ radios for bidirectional telemetry and commands between an operator and a remotely operated vehicle.",
    outcome: "Bidirectional telemetry and control",
    tags: ["ESP32", "NRF24L01+", "ROV"],
    image: asset("/media/optimized/project-rov.webp"),
    featured: true
  },
  {
    slug: "multi-mcu-security-lock",
    title: "Multi-MCU Security Lock",
    category: "Engineering & IoT",
    year: "2023",
    description:
      "An access-control prototype that separates the human-machine interface from the electronic control unit to limit the effect of physical tampering.",
    outcome: "Separated control and interface logic",
    tags: ["AVR", "Security", "Embedded C"],
    image: asset("/media/optimized/project-lock-primary.webp"),
    gallery: [
      { src: asset("/media/optimized/project-lock-hardware.webp"), alt: "Multi-MCU security lock hardware" },
      { src: asset("/media/optimized/project-lock-diagram.webp"), alt: "Multi-MCU security lock system diagram" }
    ],
    featured: true
  },
  {
    slug: "megasumo-autonomous-robot",
    title: "MegaSumo Autonomous Robot",
    category: "Robotics",
    year: "2023",
    description:
      "Competition firmware and sensor logic for an autonomous sumo robot, built around fast control loops and arena-tuned behavior.",
    outcome: "2nd place nationwide",
    tags: ["Arduino", "Robotics", "Control"],
    image: asset("/media/optimized/project-megasumo.webp"),
    featured: true
  },
  {
    slug: "firewire-enterprise-ota",
    title: "Firewire Enterprise OTA",
    category: "Engineering & IoT",
    year: "2024",
    description:
      "A remote firmware and hardware management platform for edge devices, with version tracking, device assignment, and health telemetry.",
    outcome: "Remote fleet management",
    tags: ["OTA", "Raspberry Pi", "IoT"],
    image: asset("/media/generated/placeholders/firewire-enterprise-ota.svg"),
    featured: false
  },
  {
    slug: "plant-care-ai",
    title: "Plant Care AI",
    category: "AI & Mobile",
    year: "2024",
    description:
      "A plant-monitoring system that combines soil and temperature sensing, leaf-disease detection, and a Flutter app.",
    outcome: "Sensor and vision data in one app",
    tags: ["Flutter", "AI Vision", "Sensors"],
    image: asset("/media/generated/placeholders/plant-care-ai.svg"),
    featured: false
  },
  {
    slug: "rocket-league-esp32",
    title: "Rocket League ESP32 Car",
    category: "Robotics",
    year: "2023",
    description:
      "A wireless ESP32 vehicle controlled with synchronized PS4 controller input over Bluetooth.",
    outcome: "Bluetooth vehicle control",
    tags: ["ESP32", "Bluetooth", "PS4"],
    image: asset("/media/optimized/project-rocket-league.webp"),
    featured: false
  },
  {
    slug: "human-follower-car",
    title: "Human Follower Car",
    category: "Robotics",
    year: "2023",
    description:
      "A mobile robot that combines ultrasonic and vision sensing to detect and follow a moving person.",
    outcome: "Person-following control",
    tags: ["Vision", "Ultrasonic", "Motor control"],
    image: asset("/media/optimized/project-human-follower.webp"),
    featured: false
  },
  {
    slug: "autonomous-navigation-car",
    title: "Autonomous Navigation Car",
    category: "Robotics",
    year: "2022",
    description:
      "An indoor mobile robot with deterministic path logic and obstacle avoidance using IR and ultrasonic sensors.",
    outcome: "Indoor obstacle avoidance",
    tags: ["IR sensors", "Ultrasonic", "MCU"],
    image: asset("/media/generated/placeholders/autonomous-navigation-car.svg"),
    featured: false
  },
  {
    slug: "agribot-mobile-ui",
    title: "AgriBot Mobile App UI",
    category: "UI/UX & Design",
    year: "2024",
    description:
      "A mobile interface for monitoring AgriBot sensor data and controlling the graduation-project robot.",
    outcome: "Remote hardware control",
    tags: ["Figma", "Mobile UI", "IoT"],
    image: asset("/media/generated/placeholders/agribot-mobile-ui.svg"),
    featured: false
  },
  {
    slug: "dad4hire-mobile-ui",
    title: "Dad4Hire Mobile App UI",
    category: "UI/UX & Design",
    year: "2023",
    description:
      "Task flows and mobile interface design for the Dad4Hire concept developed with Google DSC at EELU.",
    outcome: "Mobile task flows",
    tags: ["Figma", "UX", "Mobile"],
    image: asset("/media/generated/placeholders/dad4hire-mobile-ui.svg"),
    featured: false
  },
  {
    slug: "dragons-battle-promo",
    title: "Dragons Battle Final Call",
    category: "Video",
    year: "2024",
    description:
      "A short competition-registration video edited with rapid cuts and typographic overlays.",
    outcome: "Event campaign asset",
    tags: ["Premiere Pro", "Motion", "Campaign"],
    image: asset("/media/generated/placeholders/dragons-battle-promo.svg"),
    featured: false
  }
];

export const tutorials: Tutorial[] = [
  {
    title: "ROS Requirements Crash Course",
    description:
      "A sequence of short lessons covering the Python, Linux, and tooling foundations used with Robot Operating System.",
    tags: ["Python", "Linux", "ROS"],
    image: asset("/media/optimized/tutorial-ros.webp"),
    href: "https://www.youtube.com/playlist?list=PLMSkmiBu0cz6m-LOsum_j4yto_h9PMG70"
  },
  {
    title: "Intro to Embedded Systems World",
    description:
      "A recorded introduction to embedded software architecture, microcontrollers, and IoT design.",
    tags: ["Arduino", "AVR", "IoT"],
    image: asset("/media/optimized/tutorial-intro-embedded.webp"),
    href: "https://web.facebook.com/watch/live/?ref=watch_permalink&v=1456207331975013"
  },
  {
    title: "Embedded System Workshop L1",
    description:
      "A workshop on embedded hardware, digital logic, and C/C++ fundamentals.",
    tags: ["C/C++", "Digital Logic", "Architecture"],
    image: asset("/media/optimized/tutorial-embedded-workshop.webp"),
    href: "https://youtube.com/playlist?list=PLzFyd8nPA2MyZav2MILCrSjpu92iy4PC4&si=twUFB8WvJpBhWeN2"
  },
  {
    title: "Digital and Logic Laboratory",
    description:
      "Laboratory sessions on digital electronics, logic gates, and circuit implementation.",
    tags: ["Electronics", "Digital Logic"],
    image: "https://img.youtube.com/vi/B80aGV47fhw/maxresdefault.jpg",
    href: "https://www.youtube.com/playlist?list=PLYt83m8l2mixN3QzpHG2rQrzKVBPwN4i4"
  },
  {
    title: "Matlab Basics",
    description:
      "Lessons on Matlab programming for engineering calculations, data visualization, and algorithms.",
    tags: ["Matlab", "Engineering"],
    image: "https://img.youtube.com/vi/hD-5lLwu4TM/maxresdefault.jpg",
    href: "https://www.youtube.com/playlist?list=PLYt83m8l2mixe_1k4BWNVCg0HXdYx6BPw"
  },
  {
    title: "Learn Cisco Packet Tracer",
    description:
      "Network design, configuration, and troubleshooting exercises in Cisco Packet Tracer.",
    tags: ["Networking", "Cisco Packet Tracer"],
    image: "https://i.ytimg.com/vi/3AnSQQCfKXU/maxresdefault.jpg",
    href: "https://www.youtube.com/playlist?list=PLYt83m8l2miz9kJS0g82ghh3ffdRYjfZ1"
  }
];

export const experience: Experience[] = [
  {
    role: "Teaching Assistant",
    organization: "Delta University for Science and Technology",
    type: "Full-time",
    period: "Sep 2025 - Present",
    location: "Gamasa, Ad Daqahliyah, Egypt / On-site",
    description:
      "Teach undergraduate lectures and labs in Satellite Communication, Acoustics, Digital and Logic Circuits, and Measurement and Sensors.",
    tags: ["Satellite Communication", "Acoustics", "Digital & Logic", "Sensors"]
  },
  {
    role: "Video Editor",
    organization: "Dragons",
    type: "Part-time",
    period: "Sep 2023 - Mar 2024",
    location: "Egypt / Remote",
    description:
      "Edited short videos covering team sessions and hackathons in Adobe Premiere Pro and DaVinci Resolve.",
    tags: ["Adobe Premiere Pro", "DaVinci Resolve", "Motion"]
  }
];

export const publicationSource: PublicationSource = {
  profileId: publicationFeed.profileId,
  profileUrl: publicationFeed.profileUrl,
  source: publicationFeed.source,
  lastSyncedAt: publicationFeed.lastSyncedAt
};

export const publications: Publication[] = publicationFeed.publications as Publication[];

export const publication: Publication & { description: string } = {
  ...publications[0],
  description: publications[0].venue
};
