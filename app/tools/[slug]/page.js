import { notFound } from "next/navigation";
import { CalculatorShell } from "@/components/tools/CalculatorShell";
import { CALCULATOR_COMPONENTS } from "@/components/tools/calculators";
import { getAllTools, getTool } from "@/lib/tools";
import { absoluteUrl } from "@/lib/site";

export function generateStaticParams() {
  return getAllTools().map((tool) => ({ slug: tool.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const tool = getTool(slug);
  if (!tool) return {};

  return {
    title: tool.title,
    description: tool.summary,
    alternates: {
      canonical: absoluteUrl(`/tools/${tool.slug}/`)
    },
    openGraph: {
      type: "article",
      title: tool.title,
      description: tool.summary,
      tags: tool.tags
    }
  };
}

export default async function ToolPage({ params }) {
  const { slug } = await params;
  const tool = getTool(slug);
  if (!tool) notFound();

  const Calculator = CALCULATOR_COMPONENTS[tool.slug];
  if (!Calculator) notFound();

  return (
    <CalculatorShell tool={tool}>
      <Calculator />
    </CalculatorShell>
  );
}
