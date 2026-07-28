import test from "node:test";
import assert from "node:assert/strict";

import {
  getMissionControls,
  validateMissionControlRegistry,
} from "../../lib/tools/ml-generator/model-mission/control-registry.js";
import {
  createProjectForTask,
} from "../../lib/tools/ml-generator/model-mission/state.js";

test("control registry is valid and levels are cumulative", () => {
  assert.deepEqual(validateMissionControlRegistry(), []);

  const project = createProjectForTask("classification");
  const guided = getMissionControls({
    taskId: "classification",
    stepId: "prepare",
    learningLevel: "guided",
    project,
  });
  const customize = getMissionControls({
    taskId: "classification",
    stepId: "prepare",
    learningLevel: "customize",
    project,
  });
  const advanced = getMissionControls({
    taskId: "classification",
    stepId: "prepare",
    learningLevel: "advanced",
    project,
  });

  assert.ok(guided.some(({ id }) => id === "scaling"));
  assert.ok(customize.length > guided.length);
  assert.ok(advanced.length > customize.length);
  assert.ok(guided.every(({ id }) =>
    customize.some((item) => item.id === id)
  ));
  assert.ok(customize.every(({ id }) =>
    advanced.some((item) => item.id === id)
  ));
});
