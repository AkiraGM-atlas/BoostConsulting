import { expect, test } from "@playwright/test";

test("workspace landing page renders without overflow or browser errors", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });

  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle("BoostConsulting");
  await expect(
    page.getByRole("heading", { name: "BoostConsulting", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "ワークスペースを開く" }),
  ).toHaveAttribute("href", "/dashboard");
  await page.evaluate(() => document.fonts.ready);
  await page.waitForLoadState("networkidle");

  const overflows = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(overflows).toBe(false);
  expect(errors).toEqual([]);
});

test("health endpoint returns success without credentials", async ({
  request,
}) => {
  const response = await request.get("/api/health");
  expect(response.status()).toBe(200);
  expect(response.headers()["cache-control"]).toBe("no-store");
  expect(await response.json()).toEqual({ status: "ok" });
});

for (const path of ["/dashboard", "/api/private", "/sign-in", "/sign-up"]) {
  test(`unconfigured authentication blocks ${path}`, async ({ request }) => {
    const response = await request.get(path, { maxRedirects: 0 });
    expect(response.status()).toBe(503);
    expect(response.headers()["cache-control"]).toBe("no-store");
    expect(await response.text()).toContain("認証環境を準備中です");
  });
}
