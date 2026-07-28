import { test } from "node:test";
import assert from "node:assert/strict";

test("the public AI generator route renders one Model Mission builder", async (t) => {
  const routeUrl =
    process.env.AI_GENERATOR_TEST_URL
    ?? "http://127.0.0.1:3000/tools/ai-script-generator/";
  let response;
  try {
    response = await fetch(routeUrl);
  } catch {
    t.skip("Run the portfolio server to exercise the live route contract.");
    return;
  }

  assert.equal(response.ok, true);
  const html = await response.text();
  assert.match(html, /data-model-mission/);
  assert.match(html, /Model Mission/);
  assert.match(
    html,
    /From problem to Python, one decision at a time\./,
  );
  assert.match(html, /Predict a category/);
  assert.match(html, /Predict a number/);
  assert.doesNotMatch(html, /AI \/ ML Learning Workbench/);
  assert.doesNotMatch(
    html,
    /Sequential Neural Network Designer/,
  );
});
