import Metadata from "next";
import { SecurityMissionShell } from "@/components/tools/security-mission/SecurityMissionShell";

export const metadata = {
  title: "Security Mission - Security Command Builder",
  description: "Build, validate, and learn security-tool commands for authorized labs without memorizing every flag.",
};

export default function SecurityCommandBuilderPage() {
  return <SecurityMissionShell />;
}
