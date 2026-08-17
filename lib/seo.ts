import type { Metadata } from "next";
import { profile } from "@/data/portfolio";
import { absoluteUrl, siteConfig } from "@/lib/site";
import { Post } from "@/types/content";
import { PageMetadataOptions, JsonLdData } from "@/types/seo";

export const personId: string = `${absoluteUrl("/")}#ahmed-asl`;
export const websiteId: string = `${absoluteUrl("/")}#website`;
export const socialImage: string = absoluteUrl("/opengraph-image.png");
export const twitterImage: string = absoluteUrl("/twitter-image.png");

export function createPageMetadata({ title, description, pathname = "" }: PageMetadataOptions): Metadata {
  const url = absoluteUrl(pathname);
  const socialTitle = `${title} | ${siteConfig.name}`;

  return {
    title,
    description,
    alternates: {
      canonical: url
    },
    authors: [
      {
        name: profile.name,
        url: absoluteUrl("/about/")
      }
    ],
    creator: profile.name,
    openGraph: {
      type: "website",
      locale: "en_US",
      url,
      siteName: siteConfig.name,
      title: socialTitle,
      description,
      images: [
        {
          url: socialImage,
          width: 1200,
          height: 630,
          alt: `${profile.name}, ${profile.role}`
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: [twitterImage]
    }
  };
}

export function createSiteJsonLd(): JsonLdData {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": personId,
        name: profile.name,
        url: absoluteUrl("/about/"),
        image: absoluteUrl("/media/optimized/profile-ahmed.webp"),
        jobTitle: profile.role,
        description: siteConfig.description,
        email: `mailto:${profile.email}`,
        sameAs: profile.socials.map((social) => social.href),
        knowsAbout: [
          "Hardware prototypes",
          "IoT products",
          "Embedded systems",
          "Electronics design",
          "Embedded firmware",
          "Robotics",
          "Connected products",
          "Mechatronics",
          "Image processing",
          "Machine learning",
          "Cybersecurity",
          "Information security",
          "ESP32",
          "Flutter",
          "Linux",
          "Engineering education"
        ]
      },
      {
        "@type": "WebSite",
        "@id": websiteId,
        url: absoluteUrl("/"),
        name: siteConfig.name,
        description: siteConfig.description,
        inLanguage: "en",
        publisher: {
          "@id": personId
        }
      }
    ]
  };
}

export function createProfilePageJsonLd(): JsonLdData {
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "@id": `${absoluteUrl("/about/")}#profile-page`,
    url: absoluteUrl("/about/"),
    name: `About ${profile.name}`,
    dateModified: "2026-07-25",
    mainEntity: {
      "@type": "Person",
      "@id": personId,
      name: profile.name,
      image: absoluteUrl("/media/optimized/profile-ahmed.webp"),
      description: siteConfig.description,
      sameAs: profile.socials.map((social) => social.href)
    }
  };
}

export function createArticleJsonLd(post: Post): JsonLdData {
  const url = absoluteUrl(`/writing/${post.slug}/`);

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    url,
    mainEntityOfPage: url,
    headline: post.title,
    description: post.summary,
    image: socialImage,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt || post.publishedAt,
    inLanguage: "en",
    articleSection: post.category,
    keywords: post.tags.join(", "),
    author: {
      "@type": "Person",
      "@id": personId,
      name: profile.name,
      url: absoluteUrl("/about/")
    },
    publisher: {
      "@id": personId
    },
    isPartOf: {
      "@id": websiteId
    }
  };
}
