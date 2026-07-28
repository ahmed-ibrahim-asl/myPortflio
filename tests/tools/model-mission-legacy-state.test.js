import { test } from "node:test";
import assert from "node:assert/strict";

import {
  createModelMissionState,
  modelMissionReducer,
} from "../../lib/tools/ml-generator/model-mission/state.js";

test("one reducer initializes all legacy recipe sections atomically", () => {
  const chosen = modelMissionReducer(
    createModelMissionState(),
    {
      type: "choose-task",
      taskId: "object-detection",
    },
  );
  const initialized = modelMissionReducer(chosen, {
    type: "replace-sections",
    sections: {
      data: { datasetYaml: "data.yaml" },
      model: { modelSize: "n" },
      training: { epochs: 50 },
    },
  });

  assert.equal(initialized.project.taskId, "object-detection");
  assert.deepEqual(initialized.project.data, {
    datasetYaml: "data.yaml",
  });
  assert.deepEqual(initialized.project.model, {
    modelSize: "n",
  });
  assert.deepEqual(initialized.project.training, {
    epochs: 50,
  });
});
