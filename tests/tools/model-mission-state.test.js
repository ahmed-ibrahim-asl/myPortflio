import test from "node:test";
import assert from "node:assert/strict";

import {
  createModelMissionState,
  createProjectForTask,
  modelMissionReducer,
} from "../../lib/tools/ml-generator/model-mission/state.js";
import {
  generateSynchronousMissionResult,
} from "../../lib/tools/ml-generator/model-mission/adapters.js";
import {
  generateNeuralScript,
  getNeuralControlOptions,
} from "../../lib/tools/ml-generator/workbench/neural-generator.js";

test("initial state starts with the simplest guided task", () => {
  const state = createModelMissionState();

  assert.equal(state.project.taskId, "classification");
  assert.equal(state.project.learningLevel, "guided");
  assert.equal(state.stepId, "goal");
  assert.equal(state.workspaceTab, "configure");
  assert.equal(state.project.data.dataset, "breast-cancer");
  assert.equal(state.project.model.model, "logistic-regression");
});

test("task change keeps one project and resets incompatible sections", () => {
  const initial = createModelMissionState();
  const configured = modelMissionReducer(initial, {
    type: "patch-section",
    section: "model",
    patch: { maxDepth: 18 },
  });
  const regression = modelMissionReducer(configured, {
    type: "choose-task",
    taskId: "regression",
  });

  assert.equal(regression.project.taskId, "regression");
  assert.equal(regression.stepId, "goal");
  assert.equal(regression.workspaceTab, "configure");
  assert.equal(regression.project.data.dataset, "diabetes");
  assert.equal(regression.project.model.model, "ridge");
  assert.equal("maxDepth" in regression.project.model, false);
});

test("learning disclosure does not erase advanced values", () => {
  let state = createModelMissionState();
  state = modelMissionReducer(state, {
    type: "patch-section",
    section: "model",
    patch: { maxDepth: 12 },
  });
  state = modelMissionReducer(state, {
    type: "set-learning-level",
    level: "advanced",
  });
  state = modelMissionReducer(state, {
    type: "set-learning-level",
    level: "guided",
  });

  assert.equal(state.project.model.maxDepth, 12);
  assert.equal(state.project.learningLevel, "guided");
});

test("workspace tabs preserve the exact project object", () => {
  const state = createModelMissionState();
  const next = modelMissionReducer(state, {
    type: "set-workspace-tab",
    tab: "code",
  });

  assert.equal(next.project, state.project);
  assert.equal(next.workspaceTab, "code");
});

test("workflow navigation follows the shared ordered steps", () => {
  let state = createModelMissionState();
  state = modelMissionReducer(state, { type: "next-step" });
  assert.equal(state.stepId, "data");
  state = modelMissionReducer(state, {
    type: "go-to-step",
    stepId: "evaluate",
  });
  state = modelMissionReducer(state, { type: "next-step" });
  assert.equal(state.stepId, "generate");
  state = modelMissionReducer(state, { type: "next-step" });
  assert.equal(state.stepId, "generate");
  state = modelMissionReducer(state, { type: "previous-step" });
  assert.equal(state.stepId, "evaluate");
});

test("neural defaults are stored in normal project sections", () => {
  const project = createProjectForTask("neural-network");

  assert.equal(project.taskId, "neural-network");
  assert.equal(project.model.framework, "keras");
  assert.equal(project.model.preset, "tabular-mlp");
  assert.equal(project.model.task, "tabular-classification");
  assert.equal(project.model.numClasses, 2);
  assert.equal(project.training.epochs, 20);
  assert.equal(project.training.batchSize, 32);
});

test("neural preset and built-in data changes keep class counts canonical", () => {
  let state = {
    ...createModelMissionState(),
    project: createProjectForTask("neural-network"),
  };
  state = modelMissionReducer(state, {
    type: "patch-section",
    section: "data",
    patch: { dataSource: "wine" },
  });
  assert.equal(state.project.model.numClasses, 3);

  state = modelMissionReducer(state, {
    type: "patch-section",
    section: "model",
    patch: { preset: "tabular-regression-mlp" },
  });
  assert.equal(state.project.model.task, "tabular-regression");
  assert.equal(state.project.model.numClasses, 1);
  assert.equal(state.project.data.dataSource, "diabetes");
});

test("neural primary-control changes refresh dependent data and framework paths", () => {
  let state = {
    ...createModelMissionState(),
    project: createProjectForTask("neural-network"),
  };
  state = modelMissionReducer(state, {
    type: "patch-section",
    section: "model",
    patch: { framework: "pytorch" },
  });

  assert.equal(state.project.output.checkpointPath, "artifacts/best_neural_network.pt");
  assert.equal(state.project.output.artifactPath, "artifacts/neural_network.pt");
  assert.deepEqual(
    generateSynchronousMissionResult(state.project).validationErrors,
    {},
  );

  state = modelMissionReducer(state, {
    type: "patch-section",
    section: "model",
    patch: { preset: "image-cnn" },
  });
  assert.equal(state.project.data.dataSource, "image-folder");
  assert.equal(state.project.data.dataPath, "data/images");
  assert.deepEqual(
    generateSynchronousMissionResult(state.project).validationErrors,
    {},
  );

  state = modelMissionReducer(state, {
    type: "patch-section",
    section: "output",
    patch: { artifactPath: "artifacts/custom_image.pt" },
  });
  state = modelMissionReducer(state, {
    type: "patch-section",
    section: "model",
    patch: { framework: "keras" },
  });

  assert.equal(state.project.output.artifactPath, "artifacts/neural_network.keras");
  assert.equal(state.project.output.checkpointPath, "artifacts/best_neural_network.keras");
  assert.deepEqual(
    generateSynchronousMissionResult(state.project).validationErrors,
    {},
  );
});

test("neural preset switches keep controlled selections and generated scaling canonical", () => {
  let state = {
    ...createModelMissionState(),
    project: createProjectForTask("neural-network"),
  };
  state = modelMissionReducer(state, {
    type: "patch-section",
    section: "output",
    patch: {
      projectName: "canonical-neural-lab",
      artifactDirectory: "build/models",
    },
  });
  state = modelMissionReducer(state, {
    type: "patch-section",
    section: "training",
    patch: {
      optimizer: "adamw",
      weightDecay: 0.02,
    },
  });

  const assertCanonicalSelections = (expectedScaling) => {
    const controlledSelections = [
      ["framework", state.project.model.framework],
      ["preset", state.project.model.preset],
      ["dataSource", state.project.data.dataSource],
      ["splitStrategy", state.project.split.splitStrategy],
      ["scaling", state.project.preparation.scaling],
      ["optimizer", state.project.training.optimizer],
      ["scheduler", state.project.training.scheduler],
      ["device", state.project.training.device],
    ];
    for (const [controlId, value] of controlledSelections) {
      assert.ok(
        getNeuralControlOptions(controlId, state.project)
          .some((option) => option.value === value),
        `${controlId} keeps ${value} in its rendered options`,
      );
    }

    const result = generateSynchronousMissionResult(state.project);
    assert.deepEqual(result.validationErrors, {});
    assert.equal(
      result.resolvedConfig.preparation.scaling,
      expectedScaling,
    );
    const generated = generateNeuralScript({
      ...state.project.data,
      ...state.project.split,
      ...state.project.preparation,
      ...state.project.model,
      ...state.project.training,
      ...state.project.output,
    });
    assert.equal(generated.config.scaling, expectedScaling);
    assert.equal(state.project.preparation.scaling, expectedScaling);
    assert.equal(state.project.output.projectName, "canonical-neural-lab");
    assert.equal(state.project.output.artifactDirectory, "build/models");
    assert.equal(state.project.training.optimizer, "adamw");
    assert.equal(state.project.training.weightDecay, 0.02);
  };

  state = modelMissionReducer(state, {
    type: "patch-section",
    section: "model",
    patch: { preset: "image-cnn" },
  });
  assertCanonicalSelections("none");

  state = modelMissionReducer(state, {
    type: "patch-section",
    section: "model",
    patch: { framework: "pytorch" },
  });
  assertCanonicalSelections("none");

  state = modelMissionReducer(state, {
    type: "patch-section",
    section: "model",
    patch: { preset: "sequence-lstm" },
  });
  state = modelMissionReducer(state, {
    type: "patch-section",
    section: "preparation",
    patch: { scaling: "robust" },
  });
  state = modelMissionReducer(state, {
    type: "patch-section",
    section: "data",
    patch: { dataSource: "custom-npz" },
  });
  assertCanonicalSelections("robust");

  state = modelMissionReducer(state, {
    type: "patch-section",
    section: "model",
    patch: {
      framework: "keras",
      preset: "tabular-mlp",
    },
  });
  assertCanonicalSelections("robust");
});

test("task changes preserve only task-independent output preferences", () => {
  let state = {
    ...createModelMissionState(),
    project: createProjectForTask("neural-network"),
  };
  state = modelMissionReducer(state, {
    type: "patch-section",
    section: "output",
    patch: {
      projectName: "vision-lab",
      artifactDirectory: "build/artifacts",
      checkpointPath: "artifacts/custom_best.keras",
      artifactPath: "artifacts/custom.keras",
    },
  });
  state = modelMissionReducer(state, {
    type: "choose-task",
    taskId: "classification",
  });

  assert.deepEqual(state.project.output, {
    artifactDirectory: "build/artifacts",
    projectName: "vision-lab",
  });

  state = modelMissionReducer(state, {
    type: "choose-task",
    taskId: "neural-network",
  });
  assert.deepEqual(state.project.output, {
    artifactDirectory: "build/artifacts",
    artifactPath: "artifacts/neural_network.keras",
    checkpointPath: "artifacts/best_neural_network.keras",
    projectName: "vision-lab",
  });
});

test("retry increments a token without changing the project", () => {
  const state = createModelMissionState();
  const next = modelMissionReducer(state, { type: "retry-generator" });

  assert.equal(next.reloadToken, 1);
  assert.equal(next.project, state.project);
});
