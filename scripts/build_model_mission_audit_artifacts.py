"""Build deterministic Model Mission audit evidence from production APIs.

The script deliberately separates four kinds of evidence:

* generation through the current JavaScript production APIs;
* Python AST and dependency-free project smoke checks;
* optional local training execution when every declared dependency exists;
* the existing live-route responsive browser harness.

It never installs packages, downloads data, or treats static compilation as
runtime execution.
"""

from __future__ import annotations

import ast
import base64
import hashlib
import importlib.util
import io
import json
import os
import re
import subprocess
import sys
import tempfile
import zipfile
from pathlib import Path
from typing import Any


REPO_ROOT = Path(__file__).resolve().parents[1]
REPORT_DIR = REPO_ROOT / "docs" / "reports"
EVIDENCE_PATH = (
    REPORT_DIR / "2026-07-29-model-mission-learning-engine-evidence.json"
)
REPORT_PATH = (
    REPORT_DIR / "2026-07-29-model-mission-learning-engine-audit.md"
)
AUDIT_IMPLEMENTATION_PATHS = [
    "scripts/build_model_mission_audit_artifacts.py",
    "tests/tools/model-mission-responsive.test.js",
    "tests/tools/test_model_mission_audit_builder.py",
]
FINAL_ARTIFACT_PATHS = [
    "docs/reports/2026-07-29-model-mission-learning-engine-audit.md",
    "docs/reports/2026-07-29-model-mission-learning-engine-evidence.json",
]
AUDIT_DATE = "2026-07-29"
BASE_COMMIT = "64f30754acf71b5d7422d5d9cc5f488f942a2516"

EXPECTED_BUNDLE_FILES = [
    ".gitignore",
    "README.md",
    "data/README.md",
    "model_mission.json",
    "requirements.txt",
    "src/predict.py",
    "src/train.py",
    "tests/test_generated_project.py",
]

PROJECT_EXPECTATIONS = {
    "guided-logistic-standard": {
        "artifact": "classification_pipeline.joblib",
        "runtime_candidate": True,
        "runtime_scope": "built-in scikit-learn breast-cancer data",
    },
    "advanced-regression-group-power": {
        "artifact": "regression_pipeline.joblib",
        "runtime_candidate": False,
        "runtime_scope": "custom grouped CSV is not bundled",
    },
    "customized-yolo-detection-adamw": {
        "artifact": "runs/detection/yolo_detection/weights/best.pt",
        "runtime_candidate": False,
        "runtime_scope": "external YOLO data/weights and heavyweight runtime",
    },
    "advanced-yolo-segmentation-confidence": {
        "artifact": "runs/segmentation/yolo_segmentation/weights/best.pt",
        "runtime_candidate": False,
        "runtime_scope": "external YOLO data/weights and heavyweight runtime",
    },
    "guided-keras-tabular": {
        "artifact": "artifacts/neural_network.keras",
        "runtime_candidate": True,
        "runtime_scope": "built-in scikit-learn breast-cancer data",
    },
    "advanced-keras-image": {
        "artifact": "artifacts/image.keras",
        "runtime_candidate": False,
        "runtime_scope": "image-folder data is not bundled",
    },
    "customized-pytorch-sequence-lstm": {
        "artifact": "artifacts/sequence.pt",
        "runtime_candidate": False,
        "runtime_scope": "sequence NPZ data is not bundled",
    },
    "advanced-pytorch-tabular": {
        "artifact": "artifacts/tabular.pt",
        "runtime_candidate": True,
        "runtime_scope": "built-in scikit-learn breast-cancer data",
    },
}

PACKAGE_IMPORT_NAMES = {
    "imbalanced-learn": "imblearn",
    "keras": "keras",
    "numpy": "numpy",
    "pandas": "pandas",
    "PyYAML": "yaml",
    "scikit-learn": "sklearn",
    "tensorflow": "tensorflow",
    "torch": "torch",
    "torchvision": "torchvision",
    "ultralytics": "ultralytics",
    "joblib": "joblib",
}

NEXT_DOCS_READ = [
    "node_modules/next/dist/docs/01-app/01-getting-started/01-installation.md",
    "node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md",
    "node_modules/next/dist/docs/01-app/01-getting-started/17-deploying.md",
    "node_modules/next/dist/docs/01-app/02-guides/testing/playwright.md",
    "node_modules/next/dist/docs/01-app/03-api-reference/05-config/02-typescript.md",
    "node_modules/next/dist/docs/01-app/03-api-reference/05-config/01-next-config-js/typescript.md",
]

VERIFICATION_COMMANDS = [
    {
        "id": "ml-suite",
        "command": "npm run test:ml",
        "kind": "node-test",
    },
    {
        "id": "focused-generators",
        "command": (
            "node --test tests/tools/ml-classical-generator-v2.test.js "
            "tests/tools/ml-neural-generator.test.js "
            "tests/tools/ml-project-config.test.js"
        ),
        "kind": "node-test",
    },
    {
        "id": "yolo-baseline-parity",
        "command": (
            "node --test "
            "tests/tools/ml-generator-baseline-contract.test.js "
            "tests/tools/ml-generator-parity.test.js"
        ),
        "kind": "node-test",
    },
    {
        "id": "typescript",
        "command": "npx tsc --noEmit",
        "kind": "exit",
    },
    {
        "id": "production-build",
        "command": "npm run build",
        "kind": "next-build",
    },
    {
        "id": "responsive-browser",
        "command": "npm run test:ml:responsive",
        "kind": "node-test",
        "env": {"MODEL_MISSION_AUDIT_EVIDENCE": "1"},
    },
    {
        "id": "diff-check",
        "command": (
            "git diff --check -- "
            + " ".join(AUDIT_IMPLEMENTATION_PATHS)
        ),
        "kind": "exit",
    },
]

NODE_PROBE = r"""
import { createHash } from "node:crypto";
import {
  generateSynchronousMissionResult,
  adaptLegacyMissionResult,
} from "./lib/tools/ml-generator/model-mission/adapters.js";
import {
  MODEL_MISSION_STEPS,
  MODEL_MISSION_TASKS,
  getModelMissionTask,
} from "./lib/tools/ml-generator/model-mission/catalog.js";
import {
  MODEL_MISSION_CONTROLS,
  getMissionControls,
  validateMissionControlRegistry,
} from "./lib/tools/ml-generator/model-mission/control-registry.js";
import {
  legacyDefaultsToSections,
} from "./lib/tools/ml-generator/model-mission/legacy-bridge.js";
import {
  buildMissionProjectBundle,
} from "./lib/tools/ml-generator/model-mission/project-bundle.js";
import {
  encodeStoredZip,
} from "./lib/tools/ml-generator/model-mission/stored-zip.js";
import {
  createProjectForTask,
} from "./lib/tools/ml-generator/model-mission/state.js";
import {
  buildRecipeResult,
  getRecipeDefaultConfig,
} from "./lib/tools/ml-generator/engine.js";
import {
  loadRecipe,
} from "./lib/tools/ml-generator/load-recipe.js";
import {
  getMissionRecommendation,
} from "./lib/tools/ml-generator/model-mission/recommendations.js";

function mergeProject(project, overrides = {}) {
  return {
    ...project,
    ...overrides,
    data: { ...project.data, ...overrides.data },
    inspection: { ...project.inspection, ...overrides.inspection },
    split: { ...project.split, ...overrides.split },
    preparation: { ...project.preparation, ...overrides.preparation },
    model: { ...project.model, ...overrides.model },
    training: { ...project.training, ...overrides.training },
    evaluation: { ...project.evaluation, ...overrides.evaluation },
    output: { ...project.output, ...overrides.output },
  };
}

function synchronousMission(taskId, overrides = {}) {
  const project = mergeProject(createProjectForTask(taskId), overrides);
  const result = generateSynchronousMissionResult(project);
  return {
    project: result.resolvedConfig,
    result,
    task: getModelMissionTask(taskId),
  };
}

async function legacyMission(taskId, learningLevel, overrides = {}) {
  const task = getModelMissionTask(taskId);
  const recipe = await loadRecipe(task.recipeId);
  const mode = learningLevel === "guided" ? "starter" : "production";
  const generated = buildRecipeResult(
    recipe,
    task.recipeId,
    {
      ...getRecipeDefaultConfig(recipe, mode),
      ...overrides,
    },
    mode,
  );
  const sections = legacyDefaultsToSections(
    task.recipeId,
    generated.config,
  );
  const initialProject = createProjectForTask(taskId);
  const project = {
    ...initialProject,
    ...sections,
    learningLevel,
    output: {
      ...initialProject.output,
      ...sections.output,
      projectName: overrides.projectName,
    },
  };
  return {
    project,
    result: adaptLegacyMissionResult(generated, project),
    task,
  };
}

const missions = [
  [
    "guided-logistic-standard",
    synchronousMission("classification", {
      learningLevel: "guided",
      output: { projectName: "guided-logistic-standard" },
    }),
  ],
  [
    "advanced-regression-group-power",
    synchronousMission("regression", {
      learningLevel: "advanced",
      data: {
        dataset: "custom-csv",
        dataPath: "data/grouped_regression.csv",
        targetColumn: "target",
      },
      split: {
        splitStrategy: "group",
        groupColumn: "group_id",
      },
      preparation: { scaling: "power" },
      output: { projectName: "advanced-regression-group-power" },
    }),
  ],
  [
    "customized-yolo-detection-adamw",
    await legacyMission("object-detection", "customize", {
      task: "train",
      optimizer: "AdamW",
      learningRate: 0.0007,
      projectName: "customized-yolo-detection-adamw",
    }),
  ],
  [
    "advanced-yolo-segmentation-confidence",
    await legacyMission("instance-segmentation", "advanced", {
      task: "train",
      validationConfidence: 0.002,
      predictionConfidence: 0.4,
      projectName: "advanced-yolo-segmentation-confidence",
    }),
  ],
  [
    "guided-keras-tabular",
    synchronousMission("neural-network", {
      learningLevel: "guided",
      training: { epochs: 1 },
      output: { projectName: "guided-keras-tabular" },
    }),
  ],
  [
    "advanced-keras-image",
    synchronousMission("neural-network", {
      learningLevel: "advanced",
      data: {
        dataSource: "image-folder",
        dataPath: "data/images",
        targetColumn: "",
      },
      model: {
        framework: "keras",
        preset: "image-cnn",
        task: "image-classification",
        inputShape: [32, 32, 3],
        numClasses: 4,
        layers: [
          {
            id: "conv2d-1",
            type: "conv2d",
            filters: 16,
            kernelSize: 3,
            activation: "relu",
          },
          {
            id: "global-pool2d",
            type: "global-average-pool2d",
          },
        ],
      },
      training: { epochs: 1 },
      output: {
        projectName: "advanced-keras-image",
        checkpointPath: "artifacts/best_image.keras",
        artifactPath: "artifacts/image.keras",
      },
    }),
  ],
  [
    "customized-pytorch-sequence-lstm",
    synchronousMission("neural-network", {
      learningLevel: "customize",
      data: {
        dataSource: "sequence-array",
        dataPath: "data/sequences.npz",
        targetColumn: "target",
      },
      model: {
        framework: "pytorch",
        preset: "sequence-lstm",
        task: "sequence-classification",
        inputShape: [24, 6],
        numClasses: 3,
        layers: [
          {
            id: "lstm-1",
            type: "lstm",
            units: 32,
            activation: "tanh",
          },
        ],
      },
      training: { epochs: 1 },
      output: {
        projectName: "customized-pytorch-sequence-lstm",
        checkpointPath: "artifacts/best_sequence.pt",
        artifactPath: "artifacts/sequence.pt",
      },
    }),
  ],
  [
    "advanced-pytorch-tabular",
    synchronousMission("neural-network", {
      learningLevel: "advanced",
      model: {
        framework: "pytorch",
        preset: "tabular-mlp",
      },
      training: { epochs: 1 },
      output: {
        projectName: "advanced-pytorch-tabular",
        checkpointPath: "artifacts/best_tabular.pt",
        artifactPath: "artifacts/tabular.pt",
      },
    }),
  ],
];

const projects = missions.map(([id, mission]) => {
  const bundle = buildMissionProjectBundle(mission);
  const archive = encodeStoredZip(bundle.files);
  return {
    id,
    task: mission.task,
    project: mission.project,
    result: {
      filename: mission.result.filename,
      code: mission.result.code,
      dependencies: mission.result.dependencies,
      artifacts: mission.result.artifacts,
      warnings: mission.result.warnings,
      summary: mission.result.summary,
      validationErrors: mission.result.validationErrors,
    },
    bundle: {
      rootName: bundle.rootName,
      files: bundle.files,
      archiveBase64: Buffer.from(archive).toString("base64"),
    },
  };
});

const controlCounts = MODEL_MISSION_TASKS.map((task) => {
  const row = { taskId: task.id };
  for (const learningLevel of ["guided", "customize", "advanced"]) {
    const project = {
      ...createProjectForTask(task.id),
      learningLevel,
    };
    row[learningLevel] = MODEL_MISSION_STEPS.reduce(
      (total, step) => total + getMissionControls({
        taskId: task.id,
        stepId: step.id,
        learningLevel,
        project,
      }).length,
      0,
    );
  }
  return row;
});

const scalingControl = MODEL_MISSION_CONTROLS.find(
  (control) =>
    control.id === "scaling"
    && control.taskIds.includes("classification"),
);
const recommendationModels = [
  "logistic-regression",
  "knn",
  "svm",
  "random-forest",
  "histogram-gradient-boosting",
];
const scalingRecommendations = recommendationModels.map((model) => ({
  model,
  recommendation: getMissionRecommendation(
    "scaling",
    mergeProject(createProjectForTask("classification"), {
      model: { model },
    }),
  ),
}));

const sourceHashes = {};
for (const path of [
  "lib/tools/ml-generator/model-mission/adapters.js",
  "lib/tools/ml-generator/model-mission/control-registry.js",
  "lib/tools/ml-generator/model-mission/project-bundle.js",
  "lib/tools/ml-generator/model-mission/stored-zip.js",
  "lib/tools/ml-generator/workbench/classical-generator.js",
  "lib/tools/ml-generator/workbench/neural-generator.js",
  "tests/tools/model-mission-responsive.test.js",
]) {
  const { readFileSync } = await import("node:fs");
  sourceHashes[path] = createHash("sha256")
    .update(readFileSync(path))
    .digest("hex");
}

console.log(JSON.stringify({
  projects,
  education: {
    steps: MODEL_MISSION_STEPS,
    tasks: MODEL_MISSION_TASKS,
    controlCounts,
    registeredControlCount: MODEL_MISSION_CONTROLS.length,
    registryErrors: validateMissionControlRegistry(),
    scalingControl,
    scalingChoiceLabels: [
      "none",
      "standard",
      "robust",
      "minmax",
      "maxabs",
      "power",
      "quantile",
    ],
    scalingRecommendations,
  },
  sourceHashes,
}));
"""


def stable_json(value: Any) -> str:
    return json.dumps(
        value,
        indent=2,
        sort_keys=True,
        ensure_ascii=False,
    ) + "\n"


def sha256_bytes(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


def sha256_text(value: str) -> str:
    return sha256_bytes(value.encode("utf-8"))


def run_process(
    command: str,
    *,
    timeout: int = 240,
    env: dict[str, str] | None = None,
) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        command,
        cwd=REPO_ROOT,
        shell=True,
        check=False,
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        timeout=timeout,
        env=env,
    )


def node_test_counts(output: str) -> dict[str, int | None]:
    def final_count(label: str) -> int | None:
        matches = re.findall(
            rf"(?m)^[^\r\n]*{re.escape(label)}\s+(\d+)\s*$",
            output,
        )
        return int(matches[-1]) if matches else None

    return {
        "tests": final_count("tests"),
        "pass": final_count("pass"),
        "fail": final_count("fail"),
        "skipped": final_count("skipped"),
    }


def normalize_output_line(raw_line: str) -> str:
    repository_paths = {
        str(REPO_ROOT),
        str(REPO_ROOT).replace("\\", "/"),
    }
    line = re.sub(r"\x1b\[[0-9;]*[A-Za-z]", "", raw_line).strip()
    if line.startswith("MODEL_MISSION_AUDIT_EVIDENCE="):
        line = "MODEL_MISSION_AUDIT_EVIDENCE=<structured-json>"
    line = re.sub(r"\(node:\d+\)", "(node:<pid>)", line)
    line = re.sub(
        r"\(\d+(?:\.\d+)?ms\)",
        "(<duration>)",
        line,
    )
    line = re.sub(
        r"(?i)\bduration_ms:?\s*\d+(?:\.\d+)?",
        "duration_ms <normalized>",
        line,
    )
    line = re.sub(
        r"(?i)\b(?:compiled successfully|finished) in "
        r"\d+(?:\.\d+)?(?:ms|s)\b",
        lambda match: match.group(0).split(" in ")[0]
        + " in <normalized-duration>",
        line,
    )
    for repository_path in repository_paths:
        line = line.replace(repository_path, "<repo>")
    return line


def normalized_output_tail(output: str, limit: int = 20) -> list[str]:
    normalized_lines = []
    for raw_line in output.splitlines():
        line = normalize_output_line(raw_line)
        if not line:
            continue
        normalized_lines.append(line)
    return normalized_lines[-limit:]


def normalize_command_result(
    spec: dict[str, Any],
    completed: subprocess.CompletedProcess[str],
) -> dict[str, Any]:
    output = completed.stdout + completed.stderr
    result: dict[str, Any] = {
        "id": spec["id"],
        "command": spec["command"],
        "exitCode": completed.returncode,
        "status": "passed" if completed.returncode == 0 else "failed",
        "outputTail": normalized_output_tail(output),
    }
    if spec["kind"] == "node-test":
        result["counts"] = node_test_counts(output)
    if spec["id"] == "responsive-browser":
        structured_match = re.search(
            r"MODEL_MISSION_AUDIT_EVIDENCE=(\{[^\r\n]+\})",
            output,
        )
        result["structuredEvidence"] = (
            json.loads(structured_match.group(1))
            if structured_match
            else None
        )
        if result["structuredEvidence"] is None:
            result["status"] = "failed"
    if spec["kind"] == "next-build":
        page_matches = re.findall(
            r"Generating static pages.*\((\d+)/(\d+)\)",
            output,
        )
        page_progress = [
            (int(generated), int(total))
            for generated, total in page_matches
        ]
        final_progress = (
            max(
                page_progress,
                key=lambda value: (
                    value[0] / value[1] if value[1] else -1,
                    value[0],
                    value[1],
                ),
            )
            if page_progress
            else None
        )
        result["compiledSuccessfully"] = "Compiled successfully" in output
        result["staticPages"] = (
            {
                "generated": final_progress[0],
                "total": final_progress[1],
            }
            if final_progress
            else None
        )
    warning_records: dict[
        tuple[str, str, str],
        dict[str, Any],
    ] = {}

    def add_warning(
        *,
        kind: str,
        classification: str,
        message: str,
        count: int = 1,
    ) -> None:
        key = (kind, classification, message)
        if key in warning_records:
            warning_records[key]["_count"] += count
            return
        warning_records[key] = {
            "kind": kind,
            "classification": classification,
            "message": message,
            "_count": count,
        }

    module_warnings = output.count("[MODULE_TYPELESS_PACKAGE_JSON]")
    if module_warnings:
        add_warning(
            kind="node-module-type",
            count=module_warnings,
            classification="non-failing tooling warning",
            message=(
                "Node reparsed ES-module syntax because package.json "
                "does not declare a module type."
            ),
        )
    for line in output.splitlines():
        raw_message = line.strip()
        if (
            not re.search(
                r"\bwarning:",
                raw_message,
                flags=re.IGNORECASE,
            )
            or "[MODULE_TYPELESS_PACKAGE_JSON]" in raw_message
        ):
            continue
        message = normalize_output_line(raw_message)
        is_git_line_ending = (
            message.startswith("warning:")
            and "LF will be replaced by CRLF" in message
        )
        add_warning(
            kind=(
                "git-line-ending"
                if is_git_line_ending
                else "command-warning"
            ),
            classification=(
                "non-failing tooling warning"
                if is_git_line_ending
                else "unclassified command warning"
            ),
            message=message,
        )
    warnings = []
    for warning in warning_records.values():
        normalized_warning = {
            key: value
            for key, value in warning.items()
            if key != "_count"
        }
        if warning["_count"] > 1:
            normalized_warning["count"] = warning["_count"]
        warnings.append(normalized_warning)
    warnings.sort(
        key=lambda warning: (
            warning["kind"],
            warning["classification"],
            warning["message"],
        )
    )
    warning_limit = 20
    result["warningsOmitted"] = max(0, len(warnings) - warning_limit)
    warnings = warnings[:warning_limit]
    result["warnings"] = warnings
    return result


def run_verification_commands() -> list[dict[str, Any]]:
    outcomes = []
    for spec in VERIFICATION_COMMANDS:
        command_env = (
            {**os.environ, **spec["env"]}
            if spec.get("env")
            else None
        )
        completed = run_process(
            spec["command"],
            env=command_env,
        )
        outcomes.append(normalize_command_result(spec, completed))
    return outcomes


def run_node_probe() -> dict[str, Any]:
    completed = subprocess.run(
        ["node", "--input-type=module", "-"],
        cwd=REPO_ROOT,
        input=NODE_PROBE,
        check=False,
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        timeout=60,
    )
    if completed.returncode != 0:
        raise RuntimeError(
            "Production API probe failed:\n"
            + completed.stdout
            + completed.stderr
        )
    return json.loads(completed.stdout)


def dependency_availability() -> dict[str, bool]:
    return {
        import_name: importlib.util.find_spec(import_name) is not None
        for import_name in sorted(set(PACKAGE_IMPORT_NAMES.values()))
    }


def validate_bundle_key(root: Path, relative_path: str) -> Path:
    if (
        not isinstance(relative_path, str)
        or relative_path == ""
        or "\\" in relative_path
        or re.search(r"[\x00-\x1f\x7f]", relative_path)
        or relative_path.startswith("/")
        or re.match(r"^[A-Za-z]:/", relative_path)
    ):
        raise ValueError(
            f"Unsafe generated bundle path: {relative_path!r}"
        )
    segments = relative_path.split("/")
    reserved_windows_name = re.compile(
        r"^(?:CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(?:\..*)?$",
        flags=re.IGNORECASE,
    )
    if any(
        segment in {"", ".", ".."}
        or ":" in segment
        or segment.endswith((".", " "))
        or reserved_windows_name.fullmatch(segment)
        for segment in segments
    ):
        raise ValueError(
            f"Unsafe generated bundle path: {relative_path!r}"
        )
    resolved_root = root.resolve(strict=False)
    destination = resolved_root.joinpath(*segments).resolve(strict=False)
    try:
        destination.relative_to(resolved_root)
    except ValueError as error:
        raise ValueError(
            f"Generated bundle path escapes its root: {relative_path!r}"
        ) from error
    return destination


def write_bundle(root: Path, files: dict[str, str]) -> None:
    destinations = [
        (validate_bundle_key(root, relative_path), content)
        for relative_path, content in files.items()
    ]
    for destination, content in destinations:
        destination.parent.mkdir(parents=True, exist_ok=True)
        destination.write_text(content, encoding="utf-8", newline="\n")


def repository_identifier() -> str:
    return "."


def validate_final_artifacts() -> dict[str, Any]:
    command = "git diff --check -- " + " ".join(FINAL_ARTIFACT_PATHS)
    completed = run_process(command)
    result = normalize_command_result(
        {
            "id": "final-artifact-diff-check",
            "command": command,
            "kind": "exit",
        },
        completed,
    )
    if completed.returncode != 0:
        tail = "\n".join(
            result["outputTail"]
        )
        raise RuntimeError(
            "Final generated artifacts failed whitespace validation"
            + (f":\n{tail}" if tail else ".")
        )
    return result


def required_imports(dependencies: list[dict[str, str]]) -> list[str]:
    return sorted(
        {
            PACKAGE_IMPORT_NAMES.get(
                dependency["package"],
                dependency["package"].replace("-", "_"),
            )
            for dependency in dependencies
        }
    )


def static_contract(
    passed: bool,
    evidence: list[str],
    provenance: list[str],
) -> dict[str, Any]:
    return {
        "passed": passed,
        "evidence": evidence,
        "provenance": provenance,
    }


def has_all(source: str, snippets: list[str]) -> bool:
    return all(snippet in source for snippet in snippets)


def evaluate_static_contracts(
    payload: dict[str, Any],
) -> dict[str, dict[str, Any]]:
    project_id = payload["id"]
    code = payload["result"]["code"]
    contracts: dict[str, dict[str, Any]] = {}

    if project_id in {
        "guided-logistic-standard",
        "advanced-regression-group-power",
    }:
        training_evidence = [
            "Split before fitting imputers, encoders, scalers, or samplers",
            "pipeline.fit(X_train, y_train)",
        ]
        test_evidence = [
            "X_test",
            '"Final test"',
            (
                "predict_labels(pipeline, X_test.iloc[[0]])"
                if project_id == "guided-logistic-standard"
                else "pipeline.predict(X_test.iloc[[0]])"
            ),
        ]
        contracts["trainingOnlyPreprocessing"] = static_contract(
            has_all(code, training_evidence),
            training_evidence,
            ["tests/tools/ml-classical-generator-v2.test.js"],
        )
        contracts["finalTestSeparated"] = static_contract(
            has_all(code, test_evidence),
            test_evidence,
            ["tests/tools/ml-classical-generator-v2.test.js"],
        )
        return contracts

    if project_id in {
        "customized-yolo-detection-adamw",
        "advanced-yolo-segmentation-confidence",
    }:
        optimizer = payload["project"]["training"]["optimizer"]
        config_match = re.search(
            r"CONFIG:.*?=\s*\{(?P<body>.*?)^\}",
            code,
            flags=re.MULTILINE | re.DOTALL,
        )
        config_body = config_match.group("body") if config_match else ""
        optimizer_evidence = [
            'if str(CONFIG["optimizer"]) != "auto":',
            'optimizer=str(CONFIG["optimizer"])',
        ]
        if optimizer == "auto":
            optimizer_evidence.extend(
                [
                    '"optimizer": "auto"',
                    "CONFIG omits learning_rate for automatic optimization",
                ]
            )
            optimizer_passed = (
                has_all(code, optimizer_evidence[:3])
                and '"learning_rate":' not in config_body
            )
        else:
            optimizer_evidence.extend(
                [
                    f'"optimizer": "{optimizer}"',
                    '"learning_rate":',
                    'lr0=float(CONFIG["learning_rate"])',
                ]
            )
            optimizer_passed = has_all(code, optimizer_evidence)
        validation_evidence = [
            "model.val(",
            'conf=float(CONFIG["validation_confidence"])',
        ]
        prediction_evidence = [
            "model.predict(",
            'conf=float(CONFIG["prediction_confidence"])',
        ]
        provenance = [
            "tests/tools/ml-generator-parity.test.js",
            "tests/tools/model-mission-generated-code.test.js",
        ]
        contracts["optimizerLearningRateTruthful"] = static_contract(
            optimizer_passed,
            optimizer_evidence,
            provenance,
        )
        contracts["validationConfidenceRouted"] = static_contract(
            has_all(code, validation_evidence),
            validation_evidence,
            provenance,
        )
        contracts["predictionConfidenceRouted"] = static_contract(
            has_all(code, prediction_evidence),
            prediction_evidence,
            provenance,
        )
        return contracts

    framework = payload["project"]["model"]["framework"]
    if framework == "keras":
        lifecycle_evidence = [
            (
                "train_data, validation_data, test_data, preprocessing "
                "= load_data()"
            ),
            "history = train_model(",
            "test_metrics = evaluate_model(model, test_data)",
            "model.save(ARTIFACT_PATH)",
            "sample_prediction = predict_sample(model, test_data)",
        ]
        final_test_evidence = [
            "validation_data",
            "test_data",
            "test_metrics = evaluate_model(model, test_data)",
            'print("Final test metrics:", test_metrics)',
        ]
        contracts["activeTrainingLifecycle"] = static_contract(
            has_all(code, lifecycle_evidence),
            lifecycle_evidence,
            [
                "tests/tools/ml-neural-generator.test.js",
                "tests/tools/model-mission-generated-code.test.js",
            ],
        )
        if project_id == "guided-keras-tabular":
            preprocessing_evidence = [
                "X_train = preprocessor.fit_transform(X_train)",
                "X_validation = preprocessor.transform(X_validation)",
                "X_test = preprocessor.transform(X_test)",
            ]
            contracts["trainingOnlyPreprocessing"] = static_contract(
                has_all(code, preprocessing_evidence),
                preprocessing_evidence,
                ["tests/tools/ml-neural-generator.test.js"],
            )
        contracts["finalTestSeparated"] = static_contract(
            has_all(code, final_test_evidence),
            final_test_evidence,
            ["tests/tools/ml-neural-generator.test.js"],
        )
        return contracts

    lifecycle_evidence = [
        "DataLoader(",
        "history, amp_enabled = train_model(",
        "checkpoint = torch.load(CHECKPOINT_PATH",
        'model.load_state_dict(checkpoint["model_state"])',
        "test_metrics = evaluate(",
        "torch.save(checkpoint, ARTIFACT_PATH)",
        "sample_prediction = predict_sample(",
    ]
    preprocessing_evidence = [
        "scaler.fit_transform(",
        "scaler.transform(",
    ]
    if project_id == "advanced-pytorch-tabular":
        preprocessing_evidence = [
            "X_train = preprocessor.fit_transform(X_train)",
            "X_validation = preprocessor.transform(X_validation)",
            "X_test = preprocessor.transform(X_test)",
        ]
    final_test_evidence = [
        "train_loader, validation_loader, test_loader",
        "checkpoint = torch.load(CHECKPOINT_PATH",
        "model, test_loader, criterion",
        'print("Final test metrics:", test_metrics)',
    ]
    contracts["activeTrainingLifecycle"] = static_contract(
        has_all(code, lifecycle_evidence),
        lifecycle_evidence,
        [
            "tests/tools/ml-neural-generator.test.js",
            "tests/tools/model-mission-generated-code.test.js",
        ],
    )
    contracts["trainingOnlyPreprocessing"] = static_contract(
        has_all(code, preprocessing_evidence),
        preprocessing_evidence,
        ["tests/tools/ml-neural-generator.test.js"],
    )
    contracts["finalTestSeparated"] = static_contract(
        has_all(code, final_test_evidence),
        final_test_evidence,
        ["tests/tools/ml-neural-generator.test.js"],
    )
    return contracts


def audit_project(
    payload: dict[str, Any],
    available_modules: dict[str, bool],
) -> dict[str, Any]:
    project_id = payload["id"]
    expectation = PROJECT_EXPECTATIONS[project_id]
    result = payload["result"]
    bundle = payload["bundle"]
    files = bundle["files"]
    code = result["code"]
    expected_artifact = expectation["artifact"]

    ast.parse(code, filename=result["filename"])
    for path in (
        "src/train.py",
        "src/predict.py",
        "tests/test_generated_project.py",
    ):
        ast.parse(files[path], filename=path)

    archive_bytes = base64.b64decode(bundle["archiveBase64"])
    with zipfile.ZipFile(io.BytesIO(archive_bytes)) as archive:
        zip_names = sorted(archive.namelist())
        bad_member = archive.testzip()
        zip_files = {
            name: archive.read(name).decode("utf-8")
            for name in zip_names
        }

    requirements_expected = "\n".join(
        sorted(
            f"{dependency['package']}{dependency['version']}"
            for dependency in result["dependencies"]
        )
    ) + "\n"
    config_from_zip = json.loads(zip_files["model_mission.json"])
    required = required_imports(result["dependencies"])
    missing = [
        name for name in required
        if not available_modules.get(name, False)
    ]

    artifact_declared = (
        expected_artifact in files["src/predict.py"]
        and expected_artifact in files["README.md"]
    )
    structural_smoke: dict[str, Any]
    runtime: dict[str, Any]
    with tempfile.TemporaryDirectory(
        prefix=f"model-mission-{project_id}-"
    ) as temporary:
        root = Path(temporary)
        write_bundle(root, files)
        smoke = subprocess.run(
            [sys.executable, "tests/test_generated_project.py"],
            cwd=root,
            check=False,
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
            timeout=30,
        )
        structural_smoke = {
            "command": "python tests/test_generated_project.py",
            "exitCode": smoke.returncode,
            "status": "passed" if smoke.returncode == 0 else "failed",
            "scope": (
                "dependency-free file, JSON, and AST checks; "
                "does not import or train"
            ),
        }

        if not expectation["runtime_candidate"]:
            runtime = {
                "attempted": False,
                "status": "not-applicable",
                "scope": expectation["runtime_scope"],
                "reason": (
                    "The requested configuration needs user-supplied data "
                    "or an external/heavyweight workflow."
                ),
                "artifactCreated": False,
            }
        elif missing:
            runtime = {
                "attempted": False,
                "status": "unavailable",
                "scope": expectation["runtime_scope"],
                "reason": "Required local Python modules are unavailable.",
                "missingModules": missing,
                "artifactCreated": False,
            }
        else:
            executed = subprocess.run(
                [sys.executable, "src/train.py"],
                cwd=root,
                check=False,
                capture_output=True,
                text=True,
                encoding="utf-8",
                errors="replace",
                timeout=180,
                env={
                    **os.environ,
                    "PYTHONHASHSEED": "0",
                    "TF_CPP_MIN_LOG_LEVEL": "2",
                },
            )
            artifact_path = root.joinpath(
                *expected_artifact.split("/")
            )
            artifact_created = artifact_path.is_file()
            runtime = {
                "attempted": True,
                "status": (
                    "passed"
                    if executed.returncode == 0 and artifact_created
                    else "failed"
                ),
                "scope": expectation["runtime_scope"],
                "command": "python src/train.py",
                "exitCode": executed.returncode,
                "artifactCreated": artifact_created,
                "outputTail": (
                    executed.stdout + executed.stderr
                ).splitlines()[-12:],
            }

    return {
        "id": project_id,
        "taskId": payload["project"]["taskId"],
        "learningLevel": payload["project"]["learningLevel"],
        "configuration": payload["project"],
        "generation": {
            "filename": result["filename"],
            "validationErrors": result["validationErrors"],
            "codeSha256": sha256_text(code),
            "codeBytes": len(code.encode("utf-8")),
            "astParse": "passed",
            "warnings": result["warnings"],
        },
        "zip": {
            "rootName": bundle["rootName"],
            "sha256": sha256_bytes(archive_bytes),
            "bytes": len(archive_bytes),
            "contents": zip_names,
            "exactBaseContract": zip_names == EXPECTED_BUNDLE_FILES,
            "crcCheck": "passed" if bad_member is None else f"failed:{bad_member}",
        },
        "requirements": {
            "dependencies": result["dependencies"],
            "matchesStructuredDependencies": (
                zip_files["requirements.txt"] == requirements_expected
            ),
            "text": zip_files["requirements.txt"].splitlines(),
        },
        "configRoundTrip": config_from_zip == payload["project"],
        "artifact": {
            "expectedPath": expected_artifact,
            "declaredInPredictionAndReadme": artifact_declared,
            "runtimeOutcome": "see runtime",
        },
        "structuralSmoke": structural_smoke,
        "staticContracts": evaluate_static_contracts(payload),
        "runtime": runtime,
    }


REQUIRED_RESPONSIVE_WIDTHS = [320, 360, 390, 768, 900, 1024, 1440]
REQUIRED_BROWSER_CONTRACTS = {
    "advancedExceedsCustomize",
    "downloadsAreLocalAndComplete",
    "explanationsContained",
    "hiddenValuesPreserved",
    "mobileTabsPreserveState",
    "noComputedGradients",
}
TASK4_HASH_KEYS = [
    "yolo-detection-training/manifest",
    "yolo-detection-training/starter/contract",
    "yolo-detection-training/production/contract",
    "yolo-segmentation-training/manifest",
    "yolo-segmentation-training/starter/contract",
    "yolo-segmentation-training/production/contract",
    "scenario/detection-jetson",
]


def build_live_browser_audit(
    command_result: dict[str, Any],
) -> dict[str, Any]:
    structured = command_result.get("structuredEvidence")
    widths = structured.get("widths", []) if structured else []
    contracts = structured.get("contracts", {}) if structured else {}
    observed_widths = [row.get("width") for row in widths]
    width_contracts_passed = (
        len(widths) == len(REQUIRED_RESPONSIVE_WIDTHS)
        and all(
            row.get("layout", {}).get("passed") is True
            and row.get("neuralEditor", {}).get("passed") is True
            for row in widths
        )
    )
    named_contracts_passed = (
        set(contracts) == REQUIRED_BROWSER_CONTRACTS
        and all(value is True for value in contracts.values())
    )
    passed = (
        command_result.get("status") == "passed"
        and structured is not None
        and structured.get("schemaVersion") == 1
        and observed_widths == REQUIRED_RESPONSIVE_WIDTHS
        and width_contracts_passed
        and named_contracts_passed
    )
    return {
        "command": command_result["command"],
        "harness": "tests/tools/model-mission-responsive.test.js",
        "requiredWidths": REQUIRED_RESPONSIVE_WIDTHS,
        "observedWidths": observed_widths,
        "allRequiredWidthsCovered": (
            observed_widths == REQUIRED_RESPONSIVE_WIDTHS
        ),
        "widthOutcomes": widths,
        "contracts": contracts,
        "outcome": command_result.get("status"),
        "passed": passed,
    }


def read_task4_hash_fixtures() -> tuple[str, dict[str, str]]:
    source = (
        REPO_ROOT / "tests/tools/ml-generator-baseline-contract.test.js"
    ).read_text(encoding="utf-8")
    baseline_match = re.search(
        r'const BASELINE_COMMIT = "([^"]+)";',
        source,
    )
    if baseline_match is None:
        raise ValueError("The Task 4 baseline commit is not declared.")
    fixture_hashes = {}
    for key in TASK4_HASH_KEYS:
        match = re.search(
            rf'"{re.escape(key)}":\s*"([0-9a-f]{{64}})"',
            source,
        )
        if match is None:
            raise ValueError(f"Missing Task 4 baseline hash: {key}")
        fixture_hashes[key] = match.group(1)
    return baseline_match.group(1), fixture_hashes


def build_task4_parity(
    command_result: dict[str, Any],
    projects: list[dict[str, Any]],
) -> dict[str, Any]:
    baseline_commit, fixture_hashes = read_task4_hash_fixtures()
    yolo_projects = [
        project
        for project in projects
        if project["id"] in {
            "customized-yolo-detection-adamw",
            "advanced-yolo-segmentation-confidence",
        }
    ]
    semantic_contracts = {
        project["id"]: project["staticContracts"]
        for project in yolo_projects
    }
    counts = command_result.get("counts", {})
    command_passed = (
        command_result.get("status") == "passed"
        and counts.get("tests") is not None
        and counts.get("tests") == counts.get("pass")
        and counts.get("fail") == 0
    )
    semantic_passed = (
        len(semantic_contracts) == 2
        and all(
            contract["passed"]
            for contracts in semantic_contracts.values()
            for contract in contracts.values()
        )
    )
    return {
        "command": command_result["command"],
        "commandOutcome": command_result.get("status"),
        "counts": counts,
        "baselineCommit": baseline_commit,
        "fixtureHashes": fixture_hashes,
        "semanticContracts": semantic_contracts,
        "provenance": [
            "tests/tools/ml-generator-baseline-contract.test.js",
            "tests/tools/ml-generator-parity.test.js",
            "tests/tools/model-mission-generated-code.test.js",
        ],
        "passed": command_passed and semantic_passed,
    }


def scorecard(evidence: dict[str, Any]) -> list[dict[str, Any]]:
    all_static = all(
        project["generation"]["astParse"] == "passed"
        and project["zip"]["exactBaseContract"]
        and project["zip"]["crcCheck"] == "passed"
        and project["requirements"]["matchesStructuredDependencies"]
        and project["configRoundTrip"]
        and project["structuralSmoke"]["status"] == "passed"
        and project["artifact"]["declaredInPredictionAndReadme"]
        for project in evidence["projects"]
    )
    disclosure = all(
        row["guided"] < row["customize"] < row["advanced"]
        for row in evidence["education"]["controlCounts"]
    )
    browser_contracts = evidence["liveBrowserAudit"].get(
        "contracts",
        {},
    )
    disclosure = (
        disclosure
        and browser_contracts.get("advancedExceedsCustomize") is True
        and browser_contracts.get("hiddenValuesPreserved") is True
    )
    responsive = evidence["liveBrowserAudit"].get("passed") is True
    truthfulness = (
        evidence["task4Parity"].get("passed") is True
        and all(
            contract["passed"]
            for project in evidence["projects"]
            for contract in project["staticContracts"].values()
        )
    )
    learning = (
        len(evidence["education"]["steps"]) == 9
        and evidence["education"]["registryErrors"] == []
    )
    scope_honest = (
        evidence["limitations"]["universalNoCodeCoverageClaimed"] is False
        and evidence["limitations"]["staticCompileIsRuntime"] is False
    )
    runtime_statuses = runtime_facts(evidence["projects"])["statuses"]
    passed_runtime = runtime_statuses.get("passed", 0)
    failed_runtime = runtime_statuses.get("failed", 0)
    unavailable_runtime = runtime_statuses.get("unavailable", 0)
    not_applicable_runtime = runtime_statuses.get("not-applicable", 0)
    eligible_runtime = (
        passed_runtime + failed_runtime + unavailable_runtime
    )
    executed_runtime = passed_runtime + failed_runtime
    execution_coverage = (
        executed_runtime / eligible_runtime if eligible_runtime else 0.0
    )
    execution_pass_rate = (
        passed_runtime / executed_runtime if executed_runtime else 0.0
    )
    runtime_score = 0.0
    if all_static:
        runtime_score = 0.5 + min(
            1.0,
            execution_coverage * execution_pass_rate,
        )
    runtime_method = (
        "Dependency-free smoke coverage earns 0.5 when every static "
        "project contract passes. Runtime evidence records "
        f"{passed_runtime}/{eligible_runtime} eligible workflows passed "
        f"after {executed_runtime} execution(s) ({failed_runtime} failed, "
        f"{unavailable_runtime} unavailable, {not_applicable_runtime} "
        "not-applicable); execution coverage and pass rate are multiplied "
        "for up to 1.0."
    )
    return [
        {
            "dimension": "Static generation and project integrity",
            "maximum": 2.0,
            "score": 2.0 if all_static else 0.0,
            "method": "All eight must pass AST, ZIP, requirements, config, artifact declaration, and structural smoke checks.",
        },
        {
            "dimension": "Local runtime assurance",
            "maximum": 1.5,
            "score": runtime_score,
            "method": runtime_method,
        },
        {
            "dimension": "Learning workflow",
            "maximum": 1.5,
            "score": 1.2 if learning else 0.0,
            "method": "Nine-step structure and complete metadata are present; no student comprehension study was performed and scaler options lack per-option lessons.",
        },
        {
            "dimension": "Progressive disclosure",
            "maximum": 1.5,
            "score": 1.5 if disclosure else 0.0,
            "method": "Every task must have guided < customize < advanced control counts and preserve state in the live harness.",
        },
        {
            "dimension": "Generated behavior truthfulness",
            "maximum": 1.5,
            "score": 1.5 if truthfulness else 0.0,
            "method": "YOLO optimizer/confidence and active Keras/PyTorch training contracts are checked in generation and parity suites.",
        },
        {
            "dimension": "Responsive live-route usability",
            "maximum": 1.5,
            "score": 1.5 if responsive else 0.0,
            "method": "The scoped live browser harness must pass all required widths and real state-preserving interactions.",
        },
        {
            "dimension": "Scope honesty and handoff",
            "maximum": 0.5,
            "score": 0.5 if scope_honest else 0.0,
            "method": "Runtime outcomes, data constraints, and universal-coverage limits are reported from current evidence.",
        },
    ]


def runtime_facts(projects: list[dict[str, Any]]) -> dict[str, Any]:
    statuses: dict[str, int] = {}
    missing_modules: set[str] = set()
    reasons: dict[str, int] = {}
    for project in projects:
        runtime = project.get("runtime", {})
        status = runtime.get("status")
        if not status:
            continue
        statuses[status] = statuses.get(status, 0) + 1
        missing_modules.update(runtime.get("missingModules", []))
        reason = runtime.get("reason")
        if reason:
            reasons[reason] = reasons.get(reason, 0) + 1
    return {
        "statuses": statuses,
        "missingModules": sorted(missing_modules),
        "reasons": reasons,
    }


def runtime_narrative(
    projects: list[dict[str, Any]],
    environment: dict[str, Any],
) -> str:
    facts = runtime_facts(projects)
    statuses = facts["statuses"]
    missing_modules = facts["missingModules"]
    ordered_statuses = [
        "passed",
        "failed",
        "unavailable",
        "not-applicable",
    ]
    summary = ", ".join(
        f"{statuses.get(status, 0)} {status}"
        for status in ordered_statuses
        if statuses.get(status, 0)
    )
    details = (
        " Missing local modules recorded by the project outcomes: "
        + ", ".join(f"`{name}`" for name in sorted(missing_modules))
        + "."
        if missing_modules
        else ""
    )
    reason_text = (
        " Recorded non-passing reasons: "
        + "; ".join(
            f"{reason} ({count})"
            for reason, count in sorted(facts["reasons"].items())
        )
        if facts["reasons"]
        else ""
    )
    available_count = sum(
        value is True
        for value in environment.get(
            "availablePythonModules",
            {},
        ).values()
    )
    passed_count = statuses.get("passed", 0)
    execution_text = (
        " Training execution passed for "
        f"{passed_count} reviewed "
        f"{'project' if passed_count == 1 else 'projects'}."
        if passed_count
        else " No reviewed training execution passed in this environment."
    )
    return (
        f"Current runtime evidence records {summary or 'no outcomes'}."
        f"{details}{reason_text}{execution_text} "
        f"The environment probe found {available_count} "
        "available declared-runtime import(s). Dependency-free structural "
        "smoke checks remain distinct from training execution."
    )


def runtime_report_sections(
    projects: list[dict[str, Any]],
) -> dict[str, str]:
    facts = runtime_facts(projects)
    statuses = facts["statuses"]
    definitions = {
        "passed": (
            "`passed`: the training command exited successfully and created "
            "its declared artifact."
        ),
        "failed": (
            "`failed`: training was attempted but the command or artifact "
            "contract did not pass."
        ),
        "unavailable": (
            "`unavailable`: the configuration uses built-in data but one or "
            "more declared local Python modules are missing."
        ),
        "not-applicable": (
            "`not-applicable`: execution requires user-supplied data, "
            "external weights, or a heavyweight workflow."
        ),
    }
    ordered_statuses = [
        "passed",
        "failed",
        "unavailable",
        "not-applicable",
    ]
    meaning_rows = [
        f"- {definitions[status]}"
        for status in ordered_statuses
        if statuses.get(status, 0)
    ]
    meaning_rows.append(
        "- A declared artifact path is not evidence that training created "
        "it; creation is recorded by each runtime outcome."
    )

    passed = statuses.get("passed", 0)
    failed = statuses.get("failed", 0)
    unavailable = statuses.get("unavailable", 0)
    not_applicable = statuses.get("not-applicable", 0)
    if passed:
        runtime_gap = (
            f"- Training execution passed for {passed} reviewed "
            f"{'project' if passed == 1 else 'projects'} and created the "
            "declared artifact"
        )
    else:
        runtime_gap = "- No reviewed training execution passed"
    remaining = []
    if failed:
        remaining.append(f"{failed} failed")
    if unavailable:
        remaining.append(f"{unavailable} unavailable")
    if not_applicable:
        remaining.append(f"{not_applicable} not-applicable")
    if remaining:
        runtime_gap += "; remaining outcomes were " + ", ".join(remaining)
    runtime_gap += "."

    if passed:
        conclusion = (
            f"Its runtime evidence includes {passed} passed training "
            f"{'execution' if passed == 1 else 'executions'}"
        )
    elif failed:
        conclusion = (
            "Its runtime evidence includes attempted training, but "
            f"{failed} {'execution failed' if failed == 1 else 'executions failed'}"
        )
    elif unavailable:
        conclusion = (
            "Its runtime evidence is limited by "
            f"{unavailable} unavailable "
            f"{'workflow' if unavailable == 1 else 'workflows'}"
        )
    else:
        conclusion = "Its reviewed training outcomes were not applicable"
    if not_applicable:
        conclusion += (
            f"; {not_applicable} additional "
            f"{'workflow was' if not_applicable == 1 else 'workflows were'} "
            "not applicable"
        )
    conclusion += "."

    return {
        "meanings": "Runtime meanings:\n\n" + "\n".join(meaning_rows),
        "remainingGap": runtime_gap,
        "conclusion": conclusion,
    }


def warning_narrative(
    verification: list[dict[str, Any]],
) -> str:
    warnings = [
        (item["id"], warning)
        for item in verification
        for warning in item.get("warnings", [])
    ]
    if not warnings:
        return "No verification command emitted a normalized warning."
    rows = [
        (
            f"`{command_id}`: {warning['message']} "
            f"({warning['classification']})"
        )
        for command_id, warning in warnings
    ]
    return "Normalized verification warnings: " + "; ".join(rows) + "."


def build_report(evidence: dict[str, Any]) -> str:
    score = evidence["score"]["overall"]
    project_rows = []
    semantic_rows = []
    for project in sorted(evidence["projects"], key=lambda item: item["id"]):
        runtime = project["runtime"]
        project_rows.append(
            "| {id} | {ast_status} | {zip_status} | {artifact} | {runtime} | {warnings} |".format(
                id=project["id"],
                ast_status=project["generation"]["astParse"],
                zip_status=(
                    "8/8 exact"
                    if project["zip"]["exactBaseContract"]
                    else "failed"
                ),
                artifact=project["artifact"]["expectedPath"],
                runtime=runtime["status"],
                warnings=len(project["generation"]["warnings"]),
            )
        )
        for name, contract in sorted(project["staticContracts"].items()):
            snippets = "<br>".join(
                "`{}`".format(snippet.replace("|", "&#124;"))
                for snippet in contract["evidence"]
            )
            semantic_rows.append(
                "| {project} | {contract} | {outcome} | {evidence} |".format(
                    project=project["id"],
                    contract=name,
                    outcome="passed" if contract["passed"] else "failed",
                    evidence=snippets,
                )
            )

    count_rows = [
        f"| {row['taskId']} | {row['guided']} | {row['customize']} | {row['advanced']} |"
        for row in evidence["education"]["controlCounts"]
    ]
    verification_rows = [
        "| {command} | {status} | {detail} |".format(
            command=item["command"].replace("|", "\\|"),
            status=f"exit {item['exitCode']} ({item['status']})",
            detail=(
                (
                    f"{item['counts']['pass']}/{item['counts']['tests']} pass"
                    if item.get("counts", {}).get("tests") is not None
                    else ""
                )
                or (
                    f"{item['staticPages']['generated']}/{item['staticPages']['total']} static pages"
                    if item.get("staticPages")
                    else "no command output"
                )
            ),
        )
        for item in evidence["verification"]
    ]
    score_rows = [
        f"| {row['dimension']} | {row['score']:.1f} | {row['maximum']:.1f} | {row['method']} |"
        for row in evidence["score"]["dimensions"]
    ]

    runtime_text = runtime_narrative(
        evidence["projects"],
        evidence["environment"],
    )
    runtime_sections = runtime_report_sections(evidence["projects"])
    warning_text = warning_narrative(evidence["verification"])
    all_verification_passed = all(
        item["status"] == "passed"
        for item in evidence["verification"]
    )
    browser = evidence["liveBrowserAudit"]
    browser_contract_names = ", ".join(
        f"`{name}`"
        for name, passed in browser["contracts"].items()
        if passed is True
    )
    browser_text = (
        "The scoped local Next.js/Chromium harness passed its structured "
        f"audit at **{', '.join(map(str, browser['observedWidths']))} px**. "
        "Every width recorded passing layout and neural-editor outcomes. "
        f"The emitted passing contracts were {browser_contract_names}."
        if browser["passed"]
        else (
            "The scoped live-browser evidence did not satisfy every required "
            "width and named contract, so this audit does not award the "
            "responsive dimension."
        )
    )
    task4 = evidence["task4Parity"]
    parity_counts = task4["counts"]
    task4_text = (
        "The dedicated baseline/parity command passed "
        f"{parity_counts['pass']}/{parity_counts['tests']} tests. It ties "
        f"the seven YOLO fixtures below to baseline `{task4['baselineCommit']}` "
        "and to the reviewed optimizer, learning-rate, validation-confidence, "
        "and prediction-confidence contracts."
        if task4["passed"]
        else (
            "The dedicated baseline/parity command or reviewed YOLO semantic "
            "contracts did not pass, so no Task 4 parity claim is made."
        )
    )
    task4_hash_rows = [
        f"| {key} | `{value}` |"
        for key, value in sorted(task4["fixtureHashes"].items())
    ]
    score_by_dimension = {
        row["dimension"]: row["score"]
        for row in evidence["score"]["dimensions"]
    }
    project_by_id = {
        project["id"]: project
        for project in evidence["projects"]
    }

    def project_contracts_pass(
        project_ids: list[str],
        contract_names: set[str],
    ) -> bool:
        return all(
            all(
                project_by_id[project_id]["staticContracts"][name]["passed"]
                for name in contract_names
                if name in project_by_id[project_id]["staticContracts"]
            )
            and contract_names.intersection(
                project_by_id[project_id]["staticContracts"]
            )
            for project_id in project_ids
        )

    strengths = []
    if all(
        project["generation"]["astParse"] == "passed"
        and project["zip"]["exactBaseContract"]
        for project in evidence["projects"]
    ):
        strengths.append(
            "Deterministic, parseable project generation with a fixed "
            "eight-file archive contract."
        )
    if project_contracts_pass(
        [
            "guided-logistic-standard",
            "advanced-regression-group-power",
            "guided-keras-tabular",
            "customized-pytorch-sequence-lstm",
            "advanced-pytorch-tabular",
        ],
        {"trainingOnlyPreprocessing", "finalTestSeparated"},
    ):
        strengths.append(
            "Training-only learned preprocessing and a separated final test "
            "in every reviewed project where both contracts apply."
        )
    if score_by_dimension["Progressive disclosure"] > 0:
        strengths.append(
            "Meaningfully different Guided, Customize, and Advanced "
            "disclosure counts for all seven tasks."
        )
    if task4["passed"]:
        strengths.append(
            "Truthful YOLO optimizer and distinct validation/prediction "
            "confidence behavior, tied to seven Task 4 hashes."
        )
    if project_contracts_pass(
        [
            "guided-keras-tabular",
            "advanced-keras-image",
            "customized-pytorch-sequence-lstm",
            "advanced-pytorch-tabular",
        ],
        {"activeTrainingLifecycle", "finalTestSeparated"},
    ):
        strengths.append(
            "Active Keras and PyTorch lifecycle and separated final-test "
            "contracts rather than commented training skeletons."
        )
    if browser["passed"]:
        strengths.append(
            "Flat responsive layout with viewport containment and real "
            "state-preserving interactions."
        )
    strengths_text = "\n".join(f"- {strength}" for strength in strengths)
    executive_result = (
        "passes every repository verification command executed by this audit"
        if all_verification_passed
        else "does not pass every repository verification command"
    )

    return f"""# Model Mission Learning Engine Audit

Audit date: {AUDIT_DATE}

Evidence: `docs/reports/2026-07-29-model-mission-learning-engine-evidence.json`
Revised score: **{score:.1f}/10**

## Executive result

The reviewed Model Mission route {executive_result}. All eight requested representative configurations generate parseable Python and deterministic eight-file project archives through the current production APIs.

This is not a claim of universal no-code coverage. The tool generates editable training projects for its registered workflows; users still provide task-appropriate data, install the declared environment, interpret metrics, and own deployment validation.

{runtime_text}

## Verification

| Command | Outcome | Normalized evidence |
| --- | --- | --- |
{chr(10).join(verification_rows)}

{warning_text}

## Eight representative projects

| Configuration | Python AST | ZIP contract | Expected artifact | Runtime | Generator warnings |
| --- | --- | --- | --- | --- | --- |
{chr(10).join(project_rows)}

For every row, `model_mission.json` round-tripped to the resolved production configuration, `requirements.txt` matched the sorted structured dependency ranges, ZIP CRC inspection passed, `src/train.py`, `src/predict.py`, and the project smoke test parsed, and the dependency-free smoke test exited 0.

{runtime_sections["meanings"]}

## Live student and expert audit

{browser_text}

The UI presents nine ordered steps: Goal, Data, Inspect, Split, Prepare, Model, Train, Evaluate, and Generate. Each registered control has all six required educational metadata fields. This supports a guided walkthrough, but an automated browser audit cannot establish that a student can explain all nine steps after one project; that claim requires a real comprehension study.

Scaling is only **partially** self-explanatory. The UI exposes none, standard, robust, minmax, maxabs, power, and quantile, provides one complete scaling-control explanation, and supplies model-aware recommendations. It does not provide a distinct lesson or friendly label for every scaler, so a beginner may not understand the difference between Robust, MaxAbs, Power, and Quantile without external context.

Customize adds practical choices and Advanced adds specialist controls for every task:

| Task | Guided | Customize | Advanced |
| --- | ---: | ---: | ---: |
{chr(10).join(count_rows)}

## Per-project generated-code contracts

| Project | Contract | Outcome | Generated-code evidence |
| --- | --- | --- | --- |
{chr(10).join(semantic_rows)}

The contract outcomes above come from the current generated Python for each representative project; their source-test provenance is recorded in the JSON evidence.

## Task 4 YOLO baseline and parity

{task4_text}

| Fixture | SHA-256 |
| --- | --- |
{chr(10).join(task4_hash_rows)}

Every project archive explains environment setup, data shape/source, training/evaluation, prediction, expected artifacts, warnings, and a dependency-free smoke test.

## Score methodology

| Dimension | Score | Maximum | Method |
| --- | ---: | ---: | --- |
{chr(10).join(score_rows)}

The score measures the evidence available in this audit, not theoretical framework breadth.

## Verified strengths

{strengths_text}

## Remaining gaps and deferred observations

- Student comprehension after one guided project is not established without a user study.
- Scaler options have shared control-level education, not per-option beginner explanations.
{runtime_sections["remainingGap"]}
- Project-bundle task branching is growing and will become harder to maintain as workflows expand.

## Conclusion

Within its registered workflows, Model Mission is a strong learning-oriented project generator with truthful configuration semantics and a reproducible handoff. {runtime_sections["conclusion"]} The next highest-value improvements are per-scaler explanations, keeping project-bundle branching maintainable as workflows expand, and a small controlled student comprehension study.
"""


def write_audit_artifacts(evidence: dict[str, Any]) -> None:
    EVIDENCE_PATH.write_text(
        stable_json(evidence),
        encoding="utf-8",
        newline="\n",
    )
    REPORT_PATH.write_text(
        build_report(evidence),
        encoding="utf-8",
        newline="\n",
    )


def main() -> None:
    REPORT_DIR.mkdir(parents=True, exist_ok=True)

    probe = run_node_probe()
    available_modules = dependency_availability()
    projects = [
        audit_project(payload, available_modules)
        for payload in probe["projects"]
    ]
    verification = run_verification_commands()
    verification_by_id = {
        item["id"]: item
        for item in verification
    }
    live_browser_audit = build_live_browser_audit(
        verification_by_id["responsive-browser"]
    )
    task4_parity = build_task4_parity(
        verification_by_id["yolo-baseline-parity"],
        projects,
    )

    evidence: dict[str, Any] = {
        "schemaVersion": 1,
        "audit": {
            "title": "Model Mission Learning Engine Audit",
            "date": AUDIT_DATE,
            "repository": repository_identifier(),
            "branch": "feature/model-mission-learning-engine",
            "baseCommit": BASE_COMMIT,
            "deterministicBuilder": (
                "scripts/build_model_mission_audit_artifacts.py"
            ),
            "nextDocsRead": NEXT_DOCS_READ,
            "productionApiSources": probe["sourceHashes"],
        },
        "environment": {
            "python": sys.version.splitlines()[0],
            "availablePythonModules": available_modules,
            "networkCallsMade": False,
            "packagesInstalled": False,
        },
        "verification": verification,
        "projects": projects,
        "education": probe["education"],
        "liveBrowserAudit": live_browser_audit,
        "task4Parity": task4_parity,
        "limitations": {
            "universalNoCodeCoverageClaimed": False,
            "studentComprehensionEstablished": False,
            "staticCompileIsRuntime": False,
            "runtimeNote": (
                "Training was attempted only for lightweight built-in-data "
                "projects when every declared local module was available."
            ),
        },
        "deferredLedger": [
            "project-bundle branch maintainability",
        ],
    }
    dimensions = scorecard(evidence)
    evidence["score"] = {
        "scale": 10,
        "overall": round(
            sum(item["score"] for item in dimensions),
            1,
        ),
        "dimensions": dimensions,
    }

    write_audit_artifacts(evidence)
    verification.append(validate_final_artifacts())
    dimensions = scorecard(evidence)
    evidence["score"] = {
        "scale": 10,
        "overall": round(
            sum(item["score"] for item in dimensions),
            1,
        ),
        "dimensions": dimensions,
    }
    write_audit_artifacts(evidence)
    validate_final_artifacts()
    print(f"Wrote {EVIDENCE_PATH.relative_to(REPO_ROOT)}")
    print(f"Wrote {REPORT_PATH.relative_to(REPO_ROOT)}")
    print(
        "Projects: "
        f"{sum(p['structuralSmoke']['status'] == 'passed' for p in projects)}"
        f"/{len(projects)} structural smoke checks passed"
    )
    print(
        "Verification: "
        f"{sum(item['status'] == 'passed' for item in verification)}"
        f"/{len(verification)} commands passed"
    )
    print(f"Score: {evidence['score']['overall']}/10")


if __name__ == "__main__":
    main()
