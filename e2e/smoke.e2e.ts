import fs from "node:fs";
import path from "node:path";
import { expect, test, type Page } from "@playwright/test";

const authStatePath =
  process.env.PLAYWRIGHT_AUTH_STATE ?? "playwright/.auth/user.json";
const hasAuthState = fs.existsSync(path.resolve(authStatePath));
const requiresAuthState = process.env.PLAYWRIGHT_REQUIRE_AUTH === "1";

const ONE_PIXEL_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO7pN2wAAAAASUVORK5CYII=",
  "base64",
);

async function openFeedForm(page: Page) {
  await page.getByTestId("fab-open").click();
  await page.getByTestId("fab-option-feed").click();
  await expect(page.getByTestId("feed-save")).toBeVisible();
}

if (requiresAuthState && !hasAuthState) {
  test("smoke QA requires authenticated Playwright state", () => {
    expect(
      false,
      `Missing auth state: ${authStatePath}. Create one and rerun with PLAYWRIGHT_REQUIRE_AUTH=1 unset or remove that flag.`,
    ).toBeTruthy();
  });
} else {
  test.describe("Smoke QA", () => {
    test.describe.configure({ mode: "serial" });
    test.skip(
      !hasAuthState,
      `Missing auth state: ${authStatePath}. Create one and rerun smoke tests.`,
    );

    test("feed log save", async ({ page }) => {
      await page.goto("/en/dashboard");

      const logResponse = page.waitForResponse(
        (response) =>
          response.url().includes("/api/events/log") &&
          response.request().method() === "POST",
      );

      await openFeedForm(page);
      await page.getByTestId("feed-save").click();

      const response = await logResponse;
      expect(response.ok()).toBeTruthy();
    });

    test("timer start/stop update", async ({ page }) => {
      await page.goto("/en/dashboard");
      await page.getByTestId("fab-open").click();
      await page.getByTestId("fab-option-sleep").click();

      await expect(page.getByTestId("sleep-start-timer")).toBeVisible();
      await page.getByTestId("sleep-start-timer").click();
      await expect(page.getByTestId("active-timer-chip-sleep")).toBeVisible();

      await page.getByTestId("active-timer-chip-sleep").first().click();
      const stopResponse = page.waitForResponse(
        (response) =>
          response.url().includes("/api/events/log") &&
          response.request().method() === "POST",
      );
      await page.getByTestId("active-timer-stop-sleep").first().click();

      const response = await stopResponse;
      expect(response.ok()).toBeTruthy();
    });

    test("photo upload", async ({ page }) => {
      await page.goto("/en/baby");

      const uploadResponse = page.waitForResponse(
        (response) =>
          response.url().includes("/api/baby/photo") &&
          response.request().method() === "POST",
      );

      await page.getByTestId("baby-photo-input").setInputFiles({
        name: "smoke-photo.png",
        mimeType: "image/png",
        buffer: ONE_PIXEL_PNG,
      });

      const response = await uploadResponse;
      expect(response.ok()).toBeTruthy();
      await expect(
        page.locator('[data-testid="baby-photo-trigger"] img').first(),
      ).toBeVisible();
    });

    test("offline sync replay", async ({ page, context }) => {
      await page.goto("/en/dashboard");

      await context.setOffline(true);
      try {
        await openFeedForm(page);
        await page.getByTestId("feed-save").click();
        await expect(page.getByTestId("pending-sync-badge")).toBeVisible();
      } finally {
        const replayResponsePromise = page.waitForResponse(
          (response) =>
            response.url().includes("/api/events/log") &&
            response.request().method() === "POST",
          { timeout: 30_000 },
        );
        await context.setOffline(false);
        const replayResponse = await replayResponsePromise;
        expect(replayResponse.ok()).toBeTruthy();
      }
    });

    test("invite acceptance flow", async ({ page }) => {
      const inviteToken = process.env.PLAYWRIGHT_INVITE_TOKEN;
      test.skip(
        !inviteToken,
        "Set PLAYWRIGHT_INVITE_TOKEN to run invite acceptance smoke coverage.",
      );

      await page.goto(`/en/invite/${inviteToken}`);

      const acceptButton = page.getByTestId("invite-accept");
      if (await acceptButton.isVisible({ timeout: 3_000 })) {
        await acceptButton.click();
        await expect(page).toHaveURL(/\/en\/dashboard\?invite=accepted/);
        return;
      }

      await expect(
        page.getByText("This invitation was already accepted."),
      ).toBeVisible();
    });
  });
}
