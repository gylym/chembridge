import { expect, test } from "@playwright/test";

const cms = { pages: [], sections: [], texts: [], navigation: [], elements: [], reactions: [], laboratories: [], laboratorySteps: [], achievements: [], videos: [], syllabuses: [] };

test("logout stays logged out after refresh", async ({ page }) => {
  let authenticated = true;
  await page.route("**/api/public-content", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true, data: cms }) }));
  await page.route("**/api/learning-content", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true, data: { lessons: [], blocks: [], questions: [] } }) }));
  await page.route("**/api/progress", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true, data: { progress: [] } }) }));
  await page.route("**/api/session", (route) => route.fulfill({ status: authenticated ? 200 : 401, contentType: "application/json", body: JSON.stringify(authenticated ? { ok: true, data: { id: "a", username: "aibek", name: "Айбек Қали", role: "school_student", status: "active", level: "10-сынып", xp: 0 } } : { ok: false, error: { code: "UNAUTHORIZED", message: "Жүйеге кіру қажет" } }) }));
  await page.route("**/api/auth/logout", (route) => { authenticated = false; return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true, data: { signedOut: true } }) }); });
  await page.goto("/dashboard");
  await expect(page.getByRole("heading", { name: /Қайырлы күн, Айбек/ })).toBeVisible();
  await page.getByRole("button", { name: "Жүйеден шығу" }).click();
  await expect(page.getByRole("heading", { name: "Аккаунтқа кіру" })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("heading", { name: "Аккаунтқа кіру" })).toBeVisible();
});

test("student sends private feedback", async ({ page }) => {
  let submitted = false;
  await page.route("**/api/public-content", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true, data: cms }) }));
  await page.route("**/api/learning-content", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true, data: { lessons: [], blocks: [], questions: [] } }) }));
  await page.route("**/api/session", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true, data: { id: "s", username: "student", name: "Айару", role: "school_student", status: "active", level: "9-сынып", xp: 0 } }) }));
  await page.route("**/api/feedback", async (route) => { submitted = true; await route.fulfill({ status: 201, contentType: "application/json", body: JSON.stringify({ ok: true, data: { received: true } }) }); });
  await page.goto("/feedback");
  await page.getByRole("textbox", { name: "Тақырып", exact: true }).fill("Сабақтағы формула");
  await page.getByLabel("Хабарлама").fill("Формула түсіндірмесін кеңейтіп беруіңізді сұраймын.");
  await page.getByRole("button", { name: /Әкімшіге жіберу/ }).click();
  await expect(page.getByText(/әкімшіге жіберілді/)).toBeVisible();
  expect(submitted).toBe(true);
});
