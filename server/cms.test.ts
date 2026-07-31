import { describe, expect, it } from "vitest";
import { assertPublishable, sanitizeCmsText } from "./cms";
import { hasPermission } from "./permissions";

describe("CMS security and workflow", () => {
  it("removes executable markup and unsafe URL attributes", () => {
    const dirty = `<p onclick="steal()">Таза мәтін</p><script>alert(1)</script><a href="javascript:alert(1)">link</a>`;
    const clean = sanitizeCmsText(dirty);
    expect(clean).toContain("Таза мәтін");
    expect(clean).not.toMatch(/script|onclick|javascript/i);
  });

  it("blocks publishing an incomplete lesson", () => {
    expect(() => assertPublishable("lessons", { title: "Атом", slug: "", objective: "Мақсат" }))
      .toThrow(/slug/);
  });

  it("separates editor, publisher and super-admin permissions", () => {
    expect(hasPermission("teacher", "edit_content")).toBe(true);
    expect(hasPermission("teacher", "publish_content")).toBe(false);
    expect(hasPermission("content_admin", "publish_content")).toBe(true);
    expect(hasPermission("content_admin", "manage_users")).toBe(false);
    expect(hasPermission("admin", "manage_users")).toBe(true);
  });
});
