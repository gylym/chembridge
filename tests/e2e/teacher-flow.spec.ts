import { expect, test } from "@playwright/test";

test("teacher: create a lesson and submit it for review", async ({ page }) => {
  await page.route("**/api/learning-content", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true, data: { lessons: [], blocks: [], questions: [] } }) }));
  await page.route("**/api/public-content", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true, data: { pages: [], sections: [], texts: [], navigation: [], elements: [], reactions: [], laboratories: [], achievements: [] } }) }));
  page.on("pageerror", (error) => console.error("PAGE ERROR:", error.message));
  await page.route("**/api/session", (route) => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({ ok: true, data: { id: "e2e-teacher", username: "teacher", name: "Ерлан Мұрат", role: "teacher", status: "active", level: "Студент", xp: 0 } }),
  }));
  await page.route("**/api/teacher/lessons", async (route) => {
    if (route.request().method() === "POST") {
      await route.fulfill({ status: 201, contentType: "application/json", body: JSON.stringify({ ok: true, data: { id: "lesson:e2e" } }) });
    } else {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true, data: [] }) });
    }
  });
  await page.goto("/", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Мұғалімдерге" }).click();
  await expect(page.getByRole("heading", { name: "Контент студиясы" })).toBeVisible();

  await page.getByLabel("Сабақ атауы").fill("Химиялық тепе-теңдік");
  await page.getByLabel("Оқу мақсаты").fill("Оқушы Ле Шателье принципін мысалмен түсіндіреді");
  await page.getByLabel("Күйі").selectOption("in_review");
  await page.getByRole("button", { name: "Сабақты сақтау" }).click();

  await expect(page.getByText("Химиялық тепе-теңдік")).toBeVisible();
  await expect(page.getByText(/серверде сақталды/)).toBeVisible();
});
