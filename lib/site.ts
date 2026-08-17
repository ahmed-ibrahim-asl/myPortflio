export interface SiteConfig {
  name: string;
  title: string;
  description: string;
  url: string;
}

export const siteConfig: SiteConfig = {
  name: "Ahmed Asl",
  title: "Ahmed Asl | Hardware Prototypes & IoT Products",
  description:
    "Ahmed Asl turns rough hardware and IoT ideas into working prototypes and usable products. He works across electronics, embedded systems, robotics, connected products, mechatronics, and technical teaching.",
  url: "https://ahmed-ibrahim-asl.github.io/myPortfolio"
};

export function absoluteUrl(pathname: string = ""): string {
  return `${siteConfig.url}${pathname}`;
}
