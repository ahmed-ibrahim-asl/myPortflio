export type ProjectLearningLevel =
  | "guided"
  | "customize"
  | "advanced";

export type ProjectConfigScalar =
  | string
  | number
  | boolean
  | null;

export type ProjectConfigValue =
  | ProjectConfigScalar
  | ProjectConfigValue[]
  | { [key: string]: ProjectConfigValue };

export type ProjectConfigSection = Record<string, ProjectConfigValue>;

export type ProjectConfig = {
  schemaVersion: number;
  taskId: string;
  learningLevel: ProjectLearningLevel;
  data: ProjectConfigSection;
  inspection: ProjectConfigSection;
  split: ProjectConfigSection;
  preparation: ProjectConfigSection;
  model: ProjectConfigSection;
  training: ProjectConfigSection;
  evaluation: ProjectConfigSection;
  output: ProjectConfigSection;
};

export type MissionControlExplanation = {
  what: string;
  why: string;
  useWhen: string;
  codeEffect: string;
  avoidWhen?: string;
  tradeoff?: string;
};

export type MissionControlRule = {
  path?: string;
  equals?: ProjectConfigValue;
  in?: ProjectConfigValue[];
  includes?: string;
  truthy?: boolean;
  reason?: string;
  all?: MissionControlRule[];
  any?: MissionControlRule[];
  not?: MissionControlRule;
};

export type MissionControl = {
  id: string;
  taskIds: readonly string[];
  section: keyof Omit<ProjectConfig, "schemaVersion" | "taskId" | "learningLevel">;
  step: string;
  level: ProjectLearningLevel;
  label: string;
  controlType: string;
  defaultValue: ProjectConfigValue;
  shortHelp: string;
  explanation: MissionControlExplanation;
  visibleWhen?: MissionControlRule;
  enabledWhen?: MissionControlRule;
};

export type MissionControlState = MissionControl & {
  disabledReason: string;
};
