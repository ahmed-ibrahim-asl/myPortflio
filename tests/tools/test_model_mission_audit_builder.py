from __future__ import annotations

import copy
import importlib.util
import json
import os
import re
import subprocess
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch


REPO_ROOT = Path(__file__).resolve().parents[2]
BUILDER_PATH = REPO_ROOT / "scripts" / "build_model_mission_audit_artifacts.py"
SPEC = importlib.util.spec_from_file_location(
    "model_mission_audit_builder",
    BUILDER_PATH,
)
assert SPEC and SPEC.loader
audit = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(audit)


class CommandNormalizationTests(unittest.TestCase):
    def test_next_build_uses_final_progress_and_keeps_every_warning(self) -> None:
        completed = subprocess.CompletedProcess(
            args="npm run build",
            returncode=0,
            stdout=(
                "Generating static pages using 17 workers (0/16)\n"
                "Generating static pages using 17 workers (8/16)\n"
                "Generating static pages using 17 workers (16/16)\n"
                "(node:54321) stable diagnostic (14.82ms)\n"
                "duration_ms 4821.193\n"
            ),
            stderr=(
                "warning: in the working copy of 'README.md', "
                "LF will be replaced by CRLF\n"
                "Warning: adapter emitted a bounded diagnostic\n"
            ),
        )

        result = audit.normalize_command_result(
            {
                "id": "production-build",
                "command": "npm run build",
                "kind": "next-build",
            },
            completed,
        )

        self.assertEqual(
            result["staticPages"],
            {"generated": 16, "total": 16},
        )
        self.assertEqual(
            result["warnings"],
            [
                {
                    "kind": "command-warning",
                    "classification": "unclassified command warning",
                    "message": (
                        "Warning: adapter emitted a bounded diagnostic"
                    ),
                },
                {
                    "kind": "git-line-ending",
                    "classification": "non-failing tooling warning",
                    "message": (
                        "warning: in the working copy of 'README.md', "
                        "LF will be replaced by CRLF"
                    ),
                },
            ],
        )
        self.assertLessEqual(len(result["outputTail"]), 20)
        self.assertIn(
            "Warning: adapter emitted a bounded diagnostic",
            result["outputTail"],
        )
        self.assertIn(
            "(node:<pid>) stable diagnostic (<duration>)",
            result["outputTail"],
        )
        self.assertIn(
            "duration_ms <normalized>",
            result["outputTail"],
        )

    def test_responsive_result_requires_and_parses_structured_evidence(
        self,
    ) -> None:
        payload = {
            "schemaVersion": 1,
            "widths": [
                {
                    "width": 320,
                    "height": 700,
                    "layout": {"passed": True},
                    "neuralEditor": {"passed": True},
                }
            ],
            "contracts": {"hiddenValuesPreserved": True},
        }
        spec = {
            "id": "responsive-browser",
            "command": "npm run test:ml:responsive",
            "kind": "node-test",
        }

        missing = audit.normalize_command_result(
            spec,
            subprocess.CompletedProcess(
                args=spec["command"],
                returncode=0,
                stdout="tests 2\npass 2\nfail 0\n",
                stderr="",
            ),
        )
        parsed = audit.normalize_command_result(
            spec,
            subprocess.CompletedProcess(
                args=spec["command"],
                returncode=0,
                stdout=(
                    "MODEL_MISSION_AUDIT_EVIDENCE="
                    + json.dumps(payload, separators=(",", ":"))
                    + "\ntests 2\npass 2\nfail 0\n"
                ),
                stderr="",
            ),
        )

        self.assertEqual(missing["status"], "failed")
        self.assertIsNone(missing["structuredEvidence"])
        self.assertEqual(parsed["status"], "passed")
        self.assertEqual(parsed["structuredEvidence"], payload)

    def test_warnings_are_normalized_aggregated_and_bounded(self) -> None:
        warning_lines = [
            (
                f"(node:{1000 + index}) Warning: diagnostic-{index} "
                f"({index + 1}.5ms) {REPO_ROOT}"
            )
            for index in range(24, -1, -1)
        ]
        warning_lines.append(
            f"(node:99999) Warning: diagnostic-0 (99.9ms) {REPO_ROOT}"
        )
        completed = subprocess.CompletedProcess(
            args="audit",
            returncode=0,
            stdout="\n".join(warning_lines),
            stderr="",
        )

        result = audit.normalize_command_result(
            {
                "id": "audit",
                "command": "audit",
                "kind": "plain",
            },
            completed,
        )

        self.assertEqual(len(result["warnings"]), 20)
        self.assertEqual(result["warningsOmitted"], 5)
        self.assertEqual(
            result["warnings"][0]["message"],
            "(node:<pid>) Warning: diagnostic-0 (<duration>) <repo>",
        )
        self.assertEqual(result["warnings"][0]["count"], 2)
        self.assertTrue(
            all(
                str(REPO_ROOT) not in warning["message"]
                and not re.search(r"node:\d+", warning["message"])
                for warning in result["warnings"]
            )
        )


class BundlePathTests(unittest.TestCase):
    def test_bundle_keys_reject_absolute_traversal_backslash_and_controls(
        self,
    ) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            for key in [
                "/absolute.py",
                "C:/absolute.py",
                "../escape.py",
                "nested/../../escape.py",
                r"nested\escape.py",
                "nested/\x00escape.py",
                "safe.py:stream",
                "CON",
                "aux.txt",
                "nested/trailing.",
                "nested/trailing ",
            ]:
                with self.subTest(key=key):
                    with self.assertRaises(ValueError):
                        audit.validate_bundle_key(root, key)

    def test_bundle_validates_all_keys_before_writing_any_file(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary) / "project"
            escape = root.parent / "escape.py"
            try:
                with self.assertRaises(ValueError):
                    audit.write_bundle(
                        root,
                        {
                            "safe.py": "safe",
                            "../escape.py": "escape",
                        },
                    )
                self.assertFalse((root / "safe.py").exists())
                self.assertFalse(escape.exists())
            finally:
                escape.unlink(missing_ok=True)


class AuditCommandScopeTests(unittest.TestCase):
    def test_diff_check_is_scoped_and_final_artifacts_are_postvalidated(
        self,
    ) -> None:
        diff_spec = next(
            spec
            for spec in audit.VERIFICATION_COMMANDS
            if spec["id"] == "diff-check"
        )
        self.assertIn("git diff --check -- ", diff_spec["command"])
        self.assertNotIn(".gitignore", diff_spec["command"])
        self.assertNotIn(
            "model-mission-learning-engine-evidence.json",
            diff_spec["command"],
        )

        passed = subprocess.CompletedProcess(
            args="git diff --check",
            returncode=0,
            stdout="",
            stderr="",
        )
        with patch.object(audit, "run_process", return_value=passed) as run:
            result = audit.validate_final_artifacts()
        self.assertEqual(result["status"], "passed")
        final_command = run.call_args.args[0]
        self.assertIn(
            "model-mission-learning-engine-evidence.json",
            final_command,
        )
        self.assertIn(
            "model-mission-learning-engine-audit.md",
            final_command,
        )

        failed = subprocess.CompletedProcess(
            args="git diff --check",
            returncode=1,
            stdout="bad whitespace",
            stderr="",
        )
        with patch.object(audit, "run_process", return_value=failed):
            with self.assertRaises(RuntimeError):
                audit.validate_final_artifacts()

    def test_repository_identifier_is_checkout_independent(self) -> None:
        self.assertEqual(audit.repository_identifier(), ".")


class SemanticContractTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.projects = {
            payload["id"]: payload
            for payload in audit.run_node_probe()["projects"]
        }

    def test_generated_projects_expose_explicit_truthfulness_contracts(
        self,
    ) -> None:
        expected = {
            "guided-logistic-standard": {
                "trainingOnlyPreprocessing",
                "finalTestSeparated",
            },
            "advanced-regression-group-power": {
                "trainingOnlyPreprocessing",
                "finalTestSeparated",
            },
            "customized-yolo-detection-adamw": {
                "optimizerLearningRateTruthful",
                "validationConfidenceRouted",
                "predictionConfidenceRouted",
            },
            "advanced-yolo-segmentation-confidence": {
                "optimizerLearningRateTruthful",
                "validationConfidenceRouted",
                "predictionConfidenceRouted",
            },
            "guided-keras-tabular": {
                "activeTrainingLifecycle",
                "trainingOnlyPreprocessing",
                "finalTestSeparated",
            },
            "advanced-keras-image": {
                "activeTrainingLifecycle",
                "finalTestSeparated",
            },
            "customized-pytorch-sequence-lstm": {
                "activeTrainingLifecycle",
                "trainingOnlyPreprocessing",
                "finalTestSeparated",
            },
            "advanced-pytorch-tabular": {
                "activeTrainingLifecycle",
                "trainingOnlyPreprocessing",
                "finalTestSeparated",
            },
        }

        for project_id, contract_names in expected.items():
            with self.subTest(project_id=project_id):
                contracts = audit.evaluate_static_contracts(
                    self.projects[project_id]
                )
                self.assertEqual(
                    set(contracts),
                    contract_names,
                )
                self.assertTrue(
                    all(
                        contract["passed"]
                        and contract["evidence"]
                        for contract in contracts.values()
                    )
                )


class ScoreConditioningTests(unittest.TestCase):
    def test_truthfulness_and_browser_scores_require_passing_evidence(
        self,
    ) -> None:
        evidence = {
            "projects": [
                {
                    "generation": {"astParse": "passed"},
                    "zip": {
                        "exactBaseContract": True,
                        "crcCheck": "passed",
                    },
                    "requirements": {
                        "matchesStructuredDependencies": True,
                    },
                    "configRoundTrip": True,
                    "structuralSmoke": {"status": "passed"},
                    "artifact": {
                        "declaredInPredictionAndReadme": True,
                    },
                    "staticContracts": {
                        "activeTrainingLifecycle": {
                            "passed": False,
                            "evidence": [],
                        }
                    },
                }
            ],
            "education": {
                "steps": [{}] * 9,
                "registryErrors": [],
                "controlCounts": [
                    {
                        "guided": 1,
                        "customize": 2,
                        "advanced": 3,
                    }
                ],
            },
            "verification": [
                {
                    "id": "responsive-browser",
                    "status": "passed",
                }
            ],
            "task4Parity": {"passed": False},
            "liveBrowserAudit": {"passed": False},
            "limitations": {
                "universalNoCodeCoverageClaimed": False,
                "staticCompileIsRuntime": False,
            },
        }

        dimensions = {
            row["dimension"]: row
            for row in audit.scorecard(evidence)
        }

        self.assertEqual(
            dimensions["Generated behavior truthfulness"]["score"],
            0.0,
        )
        self.assertEqual(
            dimensions["Responsive live-route usability"]["score"],
            0.0,
        )


class NarrativeDerivationTests(unittest.TestCase):
    def test_runtime_and_warning_prose_comes_from_current_evidence(
        self,
    ) -> None:
        runtime_text = audit.runtime_narrative(
            [
                {
                    "runtime": {
                        "status": "unavailable",
                        "missingModules": ["alpha_runtime"],
                    }
                },
                {
                    "runtime": {
                        "status": "not-applicable",
                        "reason": "User data is required.",
                    }
                },
            ],
            {
                "availablePythonModules": {
                    "alpha_runtime": False,
                    "beta_runtime": True,
                }
            },
        )
        warning_text = audit.warning_narrative(
            [
                {
                    "id": "diff-check",
                    "warnings": [
                        {
                            "kind": "git-line-ending",
                            "classification": (
                                "non-failing tooling warning"
                            ),
                            "message": "warning: alpha line ending",
                        }
                    ],
                },
                {
                    "id": "build",
                    "warnings": [],
                },
            ]
        )

        self.assertIn("alpha_runtime", runtime_text)
        self.assertNotIn("scikit-learn", runtime_text)
        self.assertIn("1 unavailable", runtime_text)
        self.assertIn("1 not-applicable", runtime_text)
        self.assertIn("diff-check", warning_text)
        self.assertIn("warning: alpha line ending", warning_text)
        self.assertNotIn("MODULE_TYPELESS_PACKAGE_JSON", warning_text)

    def test_complete_report_derives_all_runtime_and_warning_claims(
        self,
    ) -> None:
        source_evidence = json.loads(
            (
                REPO_ROOT
                / "docs/reports/"
                "2026-07-29-model-mission-learning-engine-evidence.json"
            ).read_text(encoding="utf-8")
        )

        unavailable = copy.deepcopy(source_evidence)
        unavailable["environment"]["availablePythonModules"] = {
            "alpha_runtime": False,
        }
        unavailable["projects"][0]["runtime"] = {
            "attempted": False,
            "status": "unavailable",
            "scope": "built-in training data",
            "reason": "Required local Python modules are unavailable.",
            "missingModules": ["alpha_runtime"],
            "artifactCreated": False,
        }
        for project in unavailable["projects"][1:]:
            project["runtime"] = {
                "attempted": False,
                "status": "not-applicable",
                "scope": "user-supplied training data",
                "reason": "User-supplied data is required.",
                "artifactCreated": False,
            }
        for command in unavailable["verification"]:
            command["warnings"] = []
        unavailable["verification"][0]["warnings"] = [
            {
                "kind": "node-module-type",
                "classification": "non-failing tooling warning",
                "message": (
                    "Node reparsed ES-module syntax because package.json "
                    "does not declare a module type."
                ),
            }
        ]
        unavailable_dimensions = audit.scorecard(unavailable)
        unavailable["score"] = {
            "scale": 10,
            "overall": sum(
                row["score"] for row in unavailable_dimensions
            ),
            "dimensions": unavailable_dimensions,
        }

        installed = copy.deepcopy(source_evidence)
        installed["environment"]["availablePythonModules"] = {
            name: True
            for name in installed["environment"][
                "availablePythonModules"
            ]
        }
        installed["projects"][0]["runtime"] = {
            "attempted": True,
            "status": "passed",
            "scope": "built-in training data",
            "command": "python src/train.py",
            "returnCode": 0,
            "artifactCreated": True,
            "outputTail": ["Training complete."],
        }
        for project in installed["projects"][1:]:
            project["runtime"] = {
                "attempted": False,
                "status": "not-applicable",
                "scope": "user-supplied training data",
                "reason": "User-supplied data is required.",
                "artifactCreated": False,
            }
        for command in installed["verification"]:
            command["warnings"] = []
        installed_dimensions = audit.scorecard(installed)
        installed["score"] = {
            "scale": 10,
            "overall": sum(row["score"] for row in installed_dimensions),
            "dimensions": installed_dimensions,
        }

        unavailable_runtime_score = next(
            row["score"]
            for row in unavailable_dimensions
            if row["dimension"] == "Local runtime assurance"
        )
        installed_runtime_score = next(
            row["score"]
            for row in installed_dimensions
            if row["dimension"] == "Local runtime assurance"
        )
        self.assertEqual(unavailable_runtime_score, 0.5)
        self.assertEqual(installed_runtime_score, 1.5)
        self.assertEqual(installed["score"]["overall"], 9.7)
        runtime_method = next(
            row["method"]
            for row in installed_dimensions
            if row["dimension"] == "Local runtime assurance"
        )
        self.assertIn("multiplied", runtime_method)
        self.assertNotIn("add up", runtime_method)

        unavailable_report = audit.build_report(unavailable)
        installed_report = audit.build_report(installed)

        self.assertIn(
            "1 unavailable, 7 not-applicable",
            unavailable_report,
        )
        self.assertIn("alpha_runtime", unavailable_report)
        self.assertIn(
            "No reviewed training execution passed",
            unavailable_report,
        )
        self.assertIn(
            "Node reparsed ES-module syntax",
            unavailable_report,
        )

        self.assertIn("1 passed, 7 not-applicable", installed_report)
        self.assertIn(
            "Training execution passed for 1 reviewed project",
            installed_report,
        )
        self.assertIn(
            "User-supplied data is required. (7) "
            "Training execution passed",
            installed_report,
        )
        self.assertIn(
            "No verification command emitted a normalized warning.",
            installed_report,
        )
        self.assertIn(
            "1/1 eligible workflows passed after 1 execution(s) "
            "(0 failed, 0 unavailable, 7 not-applicable)",
            installed_report,
        )
        for stale_text in [
            "Local training runtimes were unavailable",
            "main evidence gap is runtime breadth",
            "Missing local modules",
            "Node reparsed ES-module syntax",
            "- `unavailable`:",
            "Unavailable runtimes, user-supplied data",
            "No LLM or server-side execution was added",
            "Generated output remains deterministic and local.",
            "Custom CSV time splitting sorts before datetime parsing",
            "Unknown neural presets currently fall back",
            "accessible-explanation source test relies on comment stripping",
            "Install-text test coverage is spacing-sensitive",
            "lack a concrete cross-platform ambiguous-name example matrix",
        ]:
            with self.subTest(stale_text=stale_text):
                self.assertNotIn(stale_text, installed_report)

    def test_report_rows_are_sorted_independently_of_evidence_order(
        self,
    ) -> None:
        evidence = json.loads(
            (
                REPO_ROOT
                / "docs/reports/"
                "2026-07-29-model-mission-learning-engine-evidence.json"
            ).read_text(encoding="utf-8")
        )
        shuffled = copy.deepcopy(evidence)
        shuffled["projects"].reverse()
        for project in shuffled["projects"]:
            project["staticContracts"] = dict(
                reversed(list(project["staticContracts"].items()))
            )
        fixture_hashes = shuffled["task4Parity"]["fixtureHashes"]
        shuffled["task4Parity"]["fixtureHashes"] = dict(
            reversed(list(fixture_hashes.items()))
        )

        self.assertEqual(
            audit.build_report(shuffled),
            audit.build_report(evidence),
        )


class StructuredBrowserEvidenceTests(unittest.TestCase):
    def test_live_harness_emits_executed_widths_and_contract_outcomes(
        self,
    ) -> None:
        completed = subprocess.run(
            [
                "node",
                "--no-warnings",
                "--test",
                "tests/tools/model-mission-responsive.test.js",
            ],
            cwd=REPO_ROOT,
            check=False,
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
            timeout=120,
            env={
                **os.environ,
                "MODEL_MISSION_AUDIT_EVIDENCE": "1",
            },
        )
        self.assertEqual(
            completed.returncode,
            0,
            completed.stdout + completed.stderr,
        )
        match = re.search(
            r"MODEL_MISSION_AUDIT_EVIDENCE=(\{[^\r\n]+\})",
            completed.stdout + completed.stderr,
        )
        self.assertIsNotNone(
            match,
            completed.stdout + completed.stderr,
        )
        evidence = json.loads(match.group(1))
        self.assertEqual(
            [row["width"] for row in evidence["widths"]],
            [320, 360, 390, 768, 900, 1024, 1440],
        )
        self.assertTrue(
            all(
                row["layout"]["passed"]
                and row["neuralEditor"]["passed"]
                for row in evidence["widths"]
            )
        )
        self.assertEqual(
            evidence["contracts"],
            {
                "advancedExceedsCustomize": True,
                "downloadsAreLocalAndComplete": True,
                "explanationsContained": True,
                "hiddenValuesPreserved": True,
                "mobileTabsPreserveState": True,
                "noComputedGradients": True,
            },
        )

    def test_browser_summary_is_conditioned_on_executed_evidence(self) -> None:
        required_widths = [320, 360, 390, 768, 900, 1024, 1440]
        contracts = {
            "advancedExceedsCustomize": True,
            "downloadsAreLocalAndComplete": True,
            "explanationsContained": True,
            "hiddenValuesPreserved": True,
            "mobileTabsPreserveState": True,
            "noComputedGradients": True,
        }
        result = {
            "id": "responsive-browser",
            "command": "npm run test:ml:responsive",
            "status": "passed",
            "structuredEvidence": {
                "schemaVersion": 1,
                "widths": [
                    {
                        "width": width,
                        "height": 700,
                        "layout": {"passed": True},
                        "neuralEditor": {"passed": True},
                    }
                    for width in required_widths
                ],
                "contracts": contracts,
            },
        }

        summary = audit.build_live_browser_audit(result)

        self.assertTrue(summary["passed"])
        self.assertEqual(summary["observedWidths"], required_widths)
        self.assertEqual(summary["contracts"], contracts)

        result["structuredEvidence"]["widths"][0]["layout"]["passed"] = False
        self.assertFalse(audit.build_live_browser_audit(result)["passed"])


class Task4ParityEvidenceTests(unittest.TestCase):
    def test_seven_yolo_hashes_are_tied_to_passing_parity_command(self) -> None:
        projects = [
            {
                "id": "customized-yolo-detection-adamw",
                "staticContracts": {
                    "optimizerLearningRateTruthful": {"passed": True},
                    "validationConfidenceRouted": {"passed": True},
                    "predictionConfidenceRouted": {"passed": True},
                },
            },
            {
                "id": "advanced-yolo-segmentation-confidence",
                "staticContracts": {
                    "optimizerLearningRateTruthful": {"passed": True},
                    "validationConfidenceRouted": {"passed": True},
                    "predictionConfidenceRouted": {"passed": True},
                },
            },
        ]
        command = {
            "id": "yolo-baseline-parity",
            "command": "node --test baseline parity",
            "status": "passed",
            "counts": {"tests": 10, "pass": 10, "fail": 0},
        }

        evidence = audit.build_task4_parity(command, projects)

        self.assertTrue(evidence["passed"])
        self.assertEqual(evidence["baselineCommit"], "23ef28c")
        self.assertEqual(len(evidence["fixtureHashes"]), 7)
        self.assertEqual(
            set(evidence["fixtureHashes"]),
            {
                "yolo-detection-training/manifest",
                "yolo-detection-training/starter/contract",
                "yolo-detection-training/production/contract",
                "yolo-segmentation-training/manifest",
                "yolo-segmentation-training/starter/contract",
                "yolo-segmentation-training/production/contract",
                "scenario/detection-jetson",
            },
        )
        command["status"] = "failed"
        self.assertFalse(
            audit.build_task4_parity(command, projects)["passed"]
        )


if __name__ == "__main__":
    unittest.main()
