import { ModelMissionShell } from "@/components/tools/model-mission/ModelMissionShell";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Model Mission: Guided AI and Computer Vision Builder",
  description:
    "Generate complete Python workflows for YOLO26, YOLOE open-vocabulary detection, monocular depth, U-Net segmentation, sensor AI, image classification, and classical machine learning.",
  pathname: "/tools/ai-script-generator/",
});

export default function AIScriptGeneratorPage() {
  return <ModelMissionShell />;
}
