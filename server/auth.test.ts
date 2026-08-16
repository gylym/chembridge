import { describe, expect, it } from "vitest";
import { canAccess, cmsPermissionForEntity, hasPermission } from "./permissions";

describe("role permissions", () => {
  it("blocks a student from teacher and admin operations", () => {
    expect(canAccess("student", ["teacher", "admin"])).toBe(false);
    expect(canAccess("student", ["admin"])).toBe(false);
    expect(canAccess("school_student", ["admin"])).toBe(false);
    expect(canAccess("university_student", ["teacher", "admin"])).toBe(false);
  });

  it("allows administrators to manage teacher content", () => {
    expect(canAccess("admin", ["teacher", "admin"])).toBe(true);
  });

  it("keeps teachers out of the generic CMS", () => {
    expect(cmsPermissionForEntity("lessons")).toBe("publish_content");
    expect(hasPermission("teacher", cmsPermissionForEntity("lessons"))).toBe(false);
    expect(hasPermission("content_admin", cmsPermissionForEntity("lessons"))).toBe(true);
  });

  it("requires full site management permission for global pages and navigation", () => {
    expect(cmsPermissionForEntity("pages")).toBe("manage_site");
    expect(cmsPermissionForEntity("navigation")).toBe("manage_site");
    expect(hasPermission("content_admin", cmsPermissionForEntity("pages"))).toBe(false);
    expect(hasPermission("admin", cmsPermissionForEntity("pages"))).toBe(true);
  });
});
