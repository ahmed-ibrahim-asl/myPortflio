import test from "node:test";
import assert from "node:assert/strict";
import { sanitizeImportedProject, sanitizeProjectForExport, SECRET_PLACEHOLDERS } from "../../lib/tools/security-mission/sensitive-values.js";

test("sensitive values test", () => {
  assert.ok(SECRET_PLACEHOLDERS);
});

test("sanitizeImportedProject redacts secrets recursively without mutating input", () => {
  const original = {
    options: {
      user: "admin",
      password: "SuperSecretPassword123!",
      nested: {
        api_token: "secret_token_abc123",
        safe: "normal_value",
      },
    },
    workflow: {
      steps: [
        {
          options: {
            ntlmHash: "aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0",
          },
        },
      ],
    },
  };

  const snapshot = JSON.stringify(original);
  const sanitized = sanitizeImportedProject(original);

  // Assert non-mutation of input
  assert.equal(JSON.stringify(original), snapshot);

  // Assert recursive redaction
  assert.equal(sanitized.options.user, "admin");
  assert.equal(sanitized.options.password, "<REDACTED>");
  assert.equal(sanitized.options.nested.api_token, "<REDACTED>");
  assert.equal(sanitized.options.nested.safe, "normal_value");
  assert.equal(sanitized.workflow.steps[0].options.ntlmHash, "<REDACTED>");
});

