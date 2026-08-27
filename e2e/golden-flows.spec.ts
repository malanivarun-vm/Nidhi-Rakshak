import { type Page, expect, test } from "@playwright/test";

const cases = {
  fight: "case-golden-fight-relation-name",
  forward: "case-golden-forward-exit-date",
  fix: "case-golden-fix-bank",
  unsupported: "case-golden-unsupported",
};

const openCase = async (page: Page, caseId: string) => {
  await page.goto(`/resolution/${caseId}`);
  await expect(page.getByText("SIMULATED PROTOTYPE")).toBeVisible();
};

test.describe("golden resolution journeys", () => {
  test("Fight creates a simulated EPFO package and restores it after reload", async ({
    page,
  }) => {
    await openCase(page, cases.fight);
    await page.getByRole("button", { name: /Resolve this with EPFO/ }).click();
    await page.getByRole("checkbox").check();
    await page
      .getByRole("button", { name: /Approve simulated action/ })
      .click();
    await expect(page.getByText("Case summary", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: /View tracking/ }).click();
    await expect(page.getByText("WAITING:")).toBeVisible();
    await page.reload();
    await expect(page.getByText("Case summary", { exact: true })).toBeVisible();
  });

  test("Forward creates an employer handoff and tracking", async ({ page }) => {
    await openCase(page, cases.forward);
    await page
      .getByRole("button", { name: /Send this to my employer/ })
      .click();
    await page.getByRole("checkbox").check();
    await page
      .getByRole("button", { name: /Approve simulated action/ })
      .click();
    await expect(page.getByText("Employer handoff")).toBeVisible();
    await page.getByRole("button", { name: /View tracking/ }).click();
    await expect(page.getByText("WAITING:")).toBeVisible();
  });

  test("Fix runs simulation, consent, correction, and resolved re-check", async ({
    page,
  }) => {
    await openCase(page, cases.fix);
    await page.getByRole("button", { name: /See the safe correction/ }).click();
    await page.getByRole("button", { name: /Run safe simulation/ }).click();
    await expect(page.getByText("Before:")).toBeVisible();
    await expect(page.getByText("After:")).toBeVisible();
    await page.getByRole("button", { name: /Continue to consent/ }).click();
    await page.getByRole("checkbox").check();
    await page
      .getByRole("button", { name: /Approve simulated action/ })
      .click();
    await page.getByRole("button", { name: /Check again/ }).click();
    await expect(page.getByText("Issue resolved")).toBeVisible();
  });

  test("Unsupported stays on refusal with no consequential action", async ({
    page,
  }) => {
    await openCase(page, cases.unsupported);
    await expect(page.getByText("Safe fallback")).toBeVisible();
    await page.getByRole("button", { name: /Get help through EPFO/ }).click();
    await expect(page.getByText(/not supported yet/)).toBeVisible();
    await expect(page.getByRole("checkbox")).toHaveCount(0);
  });

  for (const width of [390, 1280]) {
    test(`has no horizontal overflow at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await openCase(page, cases.fight);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
    });
  }
});
