import { describe, expect, it } from "vitest";
import { loginInput, passwordSchema, registerInput, usernameSchema } from "./auth-validation";

describe("credential validation", () => {
  it("normalizes a valid username", () => {
    expect(usernameSchema.parse("  Student.10_А".replace("А", "a"))).toBe("student.10_a");
  });

  it.each(["admin", "root", "support", "ab", "оқушы", "name with space"])(
    "rejects unsafe username %s",
    (username) => expect(usernameSchema.safeParse(username).success).toBe(false),
  );

  it("requires a strong-enough password", () => {
    expect(passwordSchema.safeParse("onlyletters").success).toBe(false);
    expect(passwordSchema.safeParse("SecureChem10").success).toBe(true);
  });

  it("rejects mismatched registration passwords", () => {
    expect(registerInput.safeParse({
      name: "Айару Қасымова",
      username: "aiyaru_10",
      password: "SecureChem10",
      passwordConfirm: "SecureChem11",
      level: "10-сынып",
      email: "",
      acceptedTerms: true,
    }).success).toBe(false);
  });

  it("never accepts a role in login input", () => {
    const result = loginInput.parse({ username: "student10", password: "SecureChem10", role: "admin" });
    expect("role" in result).toBe(false);
  });
});
