import { describe, expect, it } from "vitest";
import * as fs from "fs";
import * as path from "path";

// Regression test: The debug sentry endpoint was removed to prevent
// attackers from spamming Sentry errors and exhausting quotas.
describe("GET /api/debug/sentry (security regression test)", () => {
  it("should not exist - endpoint removed to prevent Sentry quota exhaustion attacks", () => {
    // The route file should have been deleted from the sentry subdirectory
    const sentryDir = path.join(__dirname, "..", "sentry");
    const routePath = path.join(sentryDir, "route.ts");
    const routeFileExists = fs.existsSync(routePath);
    
    expect(routeFileExists).toBe(false);
  });

  it("should have no sentry subfolder or it should not contain route.ts", () => {
    const sentryDir = path.join(__dirname, "..", "sentry");
    
    // If the sentry directory exists, it should not contain route.ts
    if (fs.existsSync(sentryDir)) {
      const files = fs.readdirSync(sentryDir);
      expect(files).not.toContain("route.ts");
    }
  });
});
