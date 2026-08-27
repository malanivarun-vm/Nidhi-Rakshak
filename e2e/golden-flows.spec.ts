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
  test("front door reaches diagnosis, evidence confirmation, and family checks", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.getByText("Your rejected claims")).toBeVisible();
    await page
      .getByRole("button", { name: /Name differs across records/ })
      .click();
    await page
      .getByRole("button", { name: /Understand this rejection/ })
      .click();
    await expect(
      page.getByText("RAJESH BADIGER", { exact: true }),
    ).toBeVisible();
    await expect(page.getByText("EPFO’s message")).toBeVisible();
    await page.getByRole("button", { name: /Back/ }).click();
    await page
      .getByRole("button", { name: /Rejection needs more evidence/ })
      .click();
    await page
      .getByRole("button", { name: /Understand this rejection/ })
      .click();
    await page.getByRole("button", { name: /Take a photo/ }).click();
    await expect(page.getByText("What we found")).toBeVisible();
    await page.getByRole("button", { name: /Yes, this is correct/ }).click();
    await expect(page.getByText("Your rejected claims")).toBeVisible();
    await page.getByRole("button", { name: /Service history/ }).click();
    await expect(page.getByText("Service history")).toBeVisible();
    await page.getByRole("button", { name: /Back/ }).click();
    await page.getByRole("button", { name: /Eligibility rules/ }).click();
    await expect(page.getByText("Your details are okay.")).toBeVisible();
    await page.getByRole("button", { name: /Back/ }).click();
    await page.getByRole("button", { name: /Link old PF record/ }).click();
    await expect(page.getByText("Two PF records need linking")).toBeVisible();
    await page.getByRole("button", { name: /Back/ }).click();
    await page
      .getByRole("button", { name: /Check an existing process/ })
      .click();
    await expect(
      page.getByText("Doing nothing is the right move."),
    ).toBeVisible();
    await page.getByRole("button", { name: /Back/ }).click();
    await page
      .getByRole("button", { name: /Check my claim before filing/ })
      .click();
    await page.getByRole("button", { name: /Run claim check/ }).click();
    await expect(
      page.getByText(/pre-flight result is simulated/),
    ).toBeVisible();
  });

  test("Fight creates a simulated EPFO package and restores it after reload", async ({
    page,
  }) => {
    await openCase(page, cases.fight);
    await page.getByRole("button", { name: /Preview this change/ }).click();
    await expect(page.getByText("2").first()).toBeVisible();
    await page.getByRole("button", { name: /Keep my current details/ }).click();
    await page.getByRole("checkbox").check();
    await page
      .getByRole("button", { name: /Approve simulated action/ })
      .click();
    await expect(page.getByText("Case summary", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: /View tracking/ }).click();
    await expect(
      page.getByText("Waiting for review", { exact: true }),
    ).toBeVisible();
    await page.reload();
    await expect(
      page.getByText("We are tracking this for you.", { exact: true }),
    ).toBeVisible();
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
    await expect(
      page.getByText("Waiting for review", { exact: true }),
    ).toBeVisible();
  });

  test("Fix runs simulation, consent, correction, and resolved re-check", async ({
    page,
  }) => {
    await openCase(page, cases.fix);
    await page.getByRole("button", { name: /Run safe simulation/ }).click();
    await expect(page.getByText("blocker now")).toBeVisible();
    await expect(page.getByText("blockers after correction")).toBeVisible();
    await page
      .getByRole("button", { name: /Continue to the correction route/ })
      .click();
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

  for (const width of [375, 1440]) {
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
