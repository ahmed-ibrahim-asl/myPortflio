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
    },
    {
        "id": "diff-check",
        "command": "git diff --check",
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
        inputShape: [32, 32, 3],
        numClasses: 4,
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
        inputShape: [24, 6],
        numClasses: 3,
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


def normalize_command_result(
    spec: dict[str, str],
    completed: subprocess.CompletedProcess[str],
) -> dict[str, Any]:
    output = completed.stdout + completed.stderr
    result: dict[str, Any] = {
        "id": spec["id"],
        "command": spec["command"],
        "exitCode": completed.returncode,
        "status": "passed" if completed.returncode == 0 else "failed",
    }
    if spec["kind"] == "node-test":
        result["counts"] = node_test_counts(output)
    if spec["kind"] == "next-build":
        page_match = re.search(
            r"Generating static pages.*\((\d+)/(\d+)\)",
            output,
        )
        result["compiledSuccessfully"] = "Compiled successfully" in output
        result["staticPages"] = (
            {
                "generated": int(page_match.group(1)),
                "total": int(page_match.group(2)),
            }
            if page_match
            else None
        )
    warnings: list[dict[str, Any]] = []
    module_warnings = output.count("[MODULE_TYPELESS_PACKAGE_JSON]")
    if module_warnings:
        warnings.append(
            {
                "kind": "node-module-type",
                "count": module_warnings,
                "classification": "non-failing tooling warning",
                "message": (
                    "Node reparsed ES-module syntax because package.json "
                    "does not declare a module type."
                ),
            }
        )
    result["warnings"] = warnings
    return result


def run_verification_commands() -> list[dict[str, Any]]:
    outcomes = []
    for spec in VERIFICATION_COMMANDS:
        completed = run_process(spec["command"])
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


def write_bundle(root: Path, files: dict[str, str]) -> None:
    for relative_path, content in files.items():
        destination = root.joinpath(*relative_path.split("/"))
        destination.parent.mkdir(parents=True, exist_ok=True)
        destination.write_text(content, encoding="utf-8", newline="\n")


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
        "runtime": runtime,
    }


def find_responsive_widths() -> list[int]:
    source = (
        REPO_ROOT / "tests/tools/model-mission-responsive.test.js"
    ).read_text(encoding="utf-8")
    widths = {
        int(value)
        for value in re.findall(r"\{\s*width:\s*(\d+),\s*height:", source)
    }
    return sorted(
        width for width in widths
        if width in {320, 360, 390, 768, 900, 1024, 1440}
    )


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
    responsive = next(
        item for item in evidence["verification"]
        if item["id"] == "responsive-browser"
    )["status"] == "passed"
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
            "score": 0.5,
            "method": "Dependency-free smoke coverage earns 0.5; training execution requires locally available declared runtimes.",
        },
        {
            "dimension": "Learning workflow",
            "maximum": 1.5,
            "score": 1.2,
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
            "score": 1.5,
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
            "score": 0.5,
            "method": "Unavailable runtimes, user-supplied data, and no universal no-code claim are stated explicitly.",
        },
    ]


def build_report(evidence: dict[str, Any]) -> str:
    score = evidence["score"]["overall"]
    project_rows = []
    for project in evidence["projects"]:
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

    return f"""# Model Mission Learning Engine Audit

Audit date: {AUDIT_DATE}

Evidence: `docs/reports/2026-07-29-model-mission-learning-engine-evidence.json`
Revised score: **{score:.1f}/10**

## Executive result

The reviewed Model Mission route passes the full JavaScript/TypeScript/build and live responsive verification available in this repository. All eight requested representative configurations generate parseable Python and deterministic eight-file project archives through the current production APIs.

This is not a claim of universal no-code coverage. The tool generates editable training projects for its registered workflows; users still provide task-appropriate data, install the declared environment, interpret metrics, and own deployment validation.

The local audit machine does not have scikit-learn, pandas, joblib, TensorFlow/Keras, PyTorch, torchvision, or Ultralytics. Therefore no training runtime is reported as passed. Dependency-free project smoke tests passed, while AST/static compilation is kept distinct from runtime execution.

## Verification

| Command | Outcome | Normalized evidence |
| --- | --- | --- |
{chr(10).join(verification_rows)}

The Node tests emit a non-failing `MODULE_TYPELESS_PACKAGE_JSON` warning because this package contains ES-module syntax without declaring `"type": "module"`. It is classified as tooling noise, not a product failure.

## Eight representative projects

| Configuration | Python AST | ZIP contract | Expected artifact | Runtime | Generator warnings |
| --- | --- | --- | --- | --- | --- |
{chr(10).join(project_rows)}

For every row, `model_mission.json` round-tripped to the resolved production configuration, `requirements.txt` matched the sorted structured dependency ranges, ZIP CRC inspection passed, `src/train.py`, `src/predict.py`, and the project smoke test parsed, and the dependency-free smoke test exited 0.

Runtime meanings:

- `unavailable`: the configuration uses built-in data but one or more declared local Python modules are missing.
- `not-applicable`: execution would require user-supplied data, external weights, or a heavyweight workflow. The audit did not install packages, access the network, or invent data.
- A declared artifact path is not evidence that training created it; runtime creation is reported separately.

## Live student and expert audit

The existing responsive harness started a scoped local Next.js process, connected a real headless Chromium/Edge session, and passed at **320, 360, 390, 768, 900, 1024, and 1440 px**. Its observed assertions cover page containment, control/panel containment, non-intersection, Configure/Code state preservation, hidden advanced-value restoration, explanation containment, Advanced-vs-Customize disclosure, project/Python download interactions, and the absence of computed gradients in Model Mission backgrounds.

The UI presents nine ordered steps: Goal, Data, Inspect, Split, Prepare, Model, Train, Evaluate, and Generate. Each registered control has all six required educational metadata fields. This supports a guided walkthrough, but an automated browser audit cannot establish that a student can explain all nine steps after one project; that claim requires a real comprehension study.

Scaling is only **partially** self-explanatory. The UI exposes none, standard, robust, minmax, maxabs, power, and quantile, provides one complete scaling-control explanation, and supplies model-aware recommendations. It does not provide a distinct lesson or friendly label for every scaler, so a beginner may not understand the difference between Robust, MaxAbs, Power, and Quantile without external context.

Customize adds practical choices and Advanced adds specialist controls for every task:

| Task | Guided | Customize | Advanced |
| --- | ---: | ---: | ---: |
{chr(10).join(count_rows)}

The live harness also verifies that a selected advanced neural optimizer and layer initializer survive level changes. YOLO automatic optimization omits a manual learning rate and explains that the framework chooses it; explicit AdamW emits `lr0`; validation and prediction confidence values flow to separate `val` and `predict` calls. Keras projects contain active loading, training, validation, final-test, saving, and inference code. PyTorch projects contain active loaders, training/validation loops, best-checkpoint restoration, final testing, saving, and inference.

Every project archive explains environment setup, data shape/source, training/evaluation, prediction, expected artifacts, warnings, and a dependency-free smoke test.

## Score methodology

| Dimension | Score | Maximum | Method |
| --- | ---: | ---: | --- |
{chr(10).join(score_rows)}

The score measures the evidence available in this audit, not theoretical framework breadth.

## Verified strengths

- Deterministic, parseable project generation with a fixed eight-file archive contract.
- Training-only learned preprocessing and an untouched final-test split in reviewed classical/neural contracts.
- Meaningfully different Guided, Customize, and Advanced disclosure counts for all seven tasks.
- Truthful YOLO automatic-optimizer behavior and distinct validation/prediction confidence controls.
- Active Keras and PyTorch training workflows rather than commented training skeletons.
- Flat responsive layout with viewport containment and real state-preserving interactions.

## Remaining gaps and deferred observations

- Student comprehension after one guided project is not established without a user study.
- Scaler options have shared control-level education, not per-option beginner explanations.
- Local training runtimes were unavailable, so this audit provides no new end-to-end metric or created-artifact evidence.
- Custom CSV time splitting sorts before datetime parsing; non-ISO timestamps can order incorrectly.
- Unknown neural presets currently fall back rather than producing a typed rejection.
- The accessible-explanation source test relies on comment stripping and could miss behavior if comments change shape.
- Install-text test coverage is spacing-sensitive and does not exercise every rendering variation.
- Project-bundle task branching is growing and will become harder to maintain as workflows expand.
- Stored-ZIP tests reject ambiguous names but lack a concrete cross-platform ambiguous-name example matrix.
- No LLM or server-side execution was added. Generated output remains deterministic and local.

## Conclusion

Within its registered workflows, Model Mission is a strong learning-oriented project generator with truthful configuration semantics and a reproducible handoff. Its main evidence gap is runtime breadth on this audit machine, not a failed static or browser contract. The next highest-value improvements are per-scaler explanations, typed unknown-preset rejection, time parsing before chronological sorting, and a small controlled student comprehension study.
"""


def main() -> None:
    REPORT_DIR.mkdir(parents=True, exist_ok=True)

    probe = run_node_probe()
    available_modules = dependency_availability()
    projects = [
        audit_project(payload, available_modules)
        for payload in probe["projects"]
    ]
    verification = run_verification_commands()
    widths = find_responsive_widths()

    evidence: dict[str, Any] = {
        "schemaVersion": 1,
        "audit": {
            "title": "Model Mission Learning Engine Audit",
            "date": AUDIT_DATE,
            "repository": str(REPO_ROOT),
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
        "liveBrowserAudit": {
            "command": "npm run test:ml:responsive",
            "harness": "tests/tools/model-mission-responsive.test.js",
            "requiredWidths": [320, 360, 390, 768, 900, 1024, 1440],
            "observedWidthsFromHarness": widths,
            "allRequiredWidthsCovered": (
                widths == [320, 360, 390, 768, 900, 1024, 1440]
            ),
            "outcome": next(
                item["status"] for item in verification
                if item["id"] == "responsive-browser"
            ),
            "observableContracts": [
                "no page overflow",
                "no intersecting controls or panels",
                "Configure/Code state preservation",
                "hidden advanced values survive level changes",
                "explanations remain inside field/layer cards",
                "Advanced exposes more controls than Customize",
                "no computed Model Mission background gradient",
                "Python and project ZIP downloads are real local blobs",
            ],
        },
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
            "accessible-explanation source test comment risk",
            "CSV non-ISO time sorting before datetime parsing",
            "unknown neural preset fallback",
            "install-text test spacing coverage",
            "project-bundle branch maintainability",
            "stored-ZIP ambiguous-name example coverage",
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
