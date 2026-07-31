import { expect, test } from "@playwright/test";

test("student: register → lesson → quiz → XP", async ({ page }) => {
  page.on("pageerror", (error) => console.error("PAGE ERROR:", error.message));
  await page.route("**/api/learning-content", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true, data: { lessons: [], blocks: [], questions: [] } }) }));
  await page.route("**/api/public-content", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true, data: { pages: [], sections: [], texts: [], navigation: [], elements: [], reactions: [], laboratories: [], achievements: [] } }) }));
  await page.route("**/api/session", (route) => route.fulfill({
    status: 401,
    contentType: "application/json",
    body: JSON.stringify({ ok: false, error: { code: "UNAUTHORIZED", message: "Кіру қажет" } }),
  }));
  await page.route("**/api/auth/register", (route) => route.fulfill({
    status: 201,
    contentType: "application/json",
    body: JSON.stringify({
      ok: true,
      data: { user: { id: "e2e-student", username: "aibek_qali", name: "Айбек Қали", role: "student", status: "active", level: "10-сынып", xp: 0 } },
    }),
  }));
  await page.route("**/api/progress", (route) => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({ ok: true, data: { percent: 100, xp: 50 } }),
  }));
  await page.route("**/api/quizzes/attempts", (route) => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({ ok: true, data: { score: 100, xp: 80 } }),
  }));
  await page.goto("/", { waitUntil: "networkidle" });
  await page.locator("header").getByRole("button", { name: "Кіру", exact: true }).click();
  await page.locator(".auth-form").getByRole("button", { name: "Тіркелу", exact: true }).click();
  await page.getByLabel("Аты-жөні").fill("Айбек Қали");
  await page.getByLabel(/Email/).fill("aibek@example.com");
  await page.getByLabel("Логин").fill("aibek_qali");
  await page.getByLabel("Құпиясөз", { exact: true }).fill("SecureChem10");
  await page.getByLabel("Құпиясөзді қайталау").fill("SecureChem10");
  await page.getByLabel("Қолдану шарттарымен келісемін").check();
  await page.locator(".auth-form").getByRole("button", { name: "Тіркелу", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Қайырлы күн, Айбек!" })).toBeVisible();

  await page.getByRole("button", { name: "Ұсынылған сабақты ашу" }).click();
  const lessonCheck = page.locator(".lesson-question");
  await lessonCheck.getByRole("button", { name: "моль", exact: true }).click();
  await lessonCheck.getByRole("button", { name: "m/M", exact: true }).click();
  await lessonCheck.getByRole("button", { name: "1", exact: true }).click();
  await page.getByRole("button", { name: "Сабақты аяқтау" }).click();
  await expect(page.getByText("Сабақ аяқталды · +50 XP")).toBeVisible();

  await page.getByRole("button", { name: "Осы деңгейдің 3 сұрақтық тестіне өту" }).click();
  await expect(page.getByRole("heading", { name: "Қысқа білім тексеру" })).toBeVisible();
  await page.locator(".quiz-card").getByRole("button", { name: /моль/ }).click();
  await page.getByRole("button", { name: "Келесі" }).click();
  await page.locator(".quiz-card").getByRole("button", { name: /m\/M/ }).click();
  await page.getByRole("button", { name: "Келесі" }).click();
  await page.locator(".quiz-card").getByRole("button", { name: /^B 1$/ }).click();
  await page.getByRole("button", { name: "Тестті аяқтау" }).click();
  await expect(page.getByRole("heading", { name: "Керемет нәтиже!" })).toBeVisible();
  await expect(page.getByText(/\+\d+ XP/)).toBeVisible();
});
