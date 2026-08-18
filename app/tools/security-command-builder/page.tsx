import { SecurityMissionShell } from "@/components/tools/security-mission/SecurityMissionShell";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Security Mission - Security Command Builder",
  description: "Build, validate, and learn security-tool commands for authorized labs without memorizing every flag.",
  pathname: "/tools/security-command-builder/",
});

export default function SecurityCommandBuilderPage() {
  return <SecurityMissionShell />;
}
