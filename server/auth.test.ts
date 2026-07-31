import { describe, expect, it } from "vitest";
import { canAccess } from "./permissions";

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
});
