import { expect, test } from "@playwright/test";

test("admin: create a published course", async ({ page }) => {
  await page.route("**/api/learning-content", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true, data: { lessons: [], blocks: [], questions: [] } }) }));
  await page.route("**/api/public-content", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true, data: { pages: [], sections: [], texts: [], navigation: [], elements: [], reactions: [], laboratories: [], achievements: [] } }) }));
  await page.route("**/api/session", (route) => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({ ok: true, data: { id: "e2e-admin", username: "owner", name: "Owner Admin", role: "admin", status: "active", level: "Студент", xp: 0 } }),
  }));

  let created = false;
  await page.route("**/api/admin/content/courses**", async (route) => {
    if (route.request().method() === "POST") {
      const body = route.request().postDataJSON();
      expect(body.values).toMatchObject({
        title: "Физикалық химия",
        slug: "fizikalyk-himiya",
        status: "published",
      });
      created = true;
      await route.fulfill({ status: 201, contentType: "application/json", body: JSON.stringify({ ok: true, data: { id: "course:e2e" } }) });
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        data: {
          items: created ? [{ id: "course:e2e", title: "Физикалық химия", status: "published" }] : [],
          options: { courses: [], modules: [], lessons: [], quizzes: [] },
        },
      }),
    });
  });

  await page.goto("/", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Әкімшілік", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Әкімші панелі" })).toBeVisible();

  await page.locator(".admin-tabs").getByRole("button", { name: "Курстар" }).click();
  await page.getByRole("button", { name: "Жаңа контент" }).click();
  await page.getByLabel("Курс атауы").fill("Физикалық химия");
  await page.getByLabel("URL атауы").fill("fizikalyk-himiya");
  await page.getByLabel("Сипаттамасы").fill("Термодинамика мен кинетиканың негізгі ұғымдары");
  await page.getByLabel("Күйі").selectOption("published");
  await page.getByRole("button", { name: "Контентті қосу" }).click();

  await expect(page.getByText("Жаңа контент сәтті қосылды")).toBeVisible();
  await expect(page.getByText("Физикалық химия")).toBeVisible();
});
